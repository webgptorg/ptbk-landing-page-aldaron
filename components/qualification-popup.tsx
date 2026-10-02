'use client';

import { getProFirmyContent } from '@/businesses/pro-firmy/proFirmyContent';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useEffect, useRef, useState, type HTMLAttributes } from 'react';

/** Page-owned questions reuse one contact pipeline. The preserved page remains the default. */
export type QualificationPopupContent = Omit<
    ReturnType<typeof getProFirmyContent>['qualificationPopup'],
    'remainingSpots' | 'successTitle' | 'successDescription' | 'successEmailPrefix'
> & {
    remainingSpots?: string;
};

type QualificationPopupProps = {
    language?: SupportedHomepageLanguage;
    content?: QualificationPopupContent;
    confirmationContext?: 'agenda';
};

const QUALIFICATION_MESSAGES = {
    cs: {
        required: 'Toto pole je povinné.',
        email: 'Zadejte prosím platný e-mail.',
        error: 'Odeslání se nezdařilo. Vaše odpovědi zůstaly vyplněné. Zkuste to prosím znovu.',
    },
    en: {
        required: 'This field is required.',
        email: 'Please enter a valid email address.',
        error: 'We couldn’t send your request. Your answers are still here. Please try again.',
    },
};
const OPTION_TRANSITION_DELAY_MS = 300;

export function QualificationPopup({ language = 'cs', content, confirmationContext }: QualificationPopupProps) {
    const CONTENT = content ?? getProFirmyContent(language).qualificationPopup;
    const MESSAGES = QUALIFICATION_MESSAGES[language];
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStepChanging, setIsStepChanging] = useState(false);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isSubmissionPending = useRef(false);
    const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const questionHeading = useRef<HTMLHeadingElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const QUESTION = CONTENT.questions[currentStep];
    const PROGRESS = ((currentStep + 1) / CONTENT.questions.length) * 100;

    useEffect(() => {
        const handleOpen = () => {
            opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setIsOpen(true);
        };
        window.addEventListener('open-qualification-popup', handleOpen);
        return () => {
            window.removeEventListener('open-qualification-popup', handleOpen);
            if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
        };
    }, []);

    useEffect(() => {
        setIsValidationShown(false);
        if (isOpen && currentStep > 0) questionHeading.current?.focus();
    }, [currentStep, isOpen]);

    function getFieldError(fieldId: string): string | null {
        const VALUE = answers[fieldId]?.trim() ?? '';
        if (!VALUE) return MESSAGES.required;
        if (fieldId === 'email' && !isEmailAddressValid(VALUE)) return MESSAGES.email;
        return null;
    }

    function handleClose() {
        if (isSubmissionPending.current) return;
        if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
        setIsOpen(false);
        setCurrentStep(0);
        setAnswers({});
        setIsStepChanging(false);
        setIsValidationShown(false);
        setError(null);
    }

    function handleOptionSelect(option: string) {
        if (transitionTimer.current !== null || isSubmissionPending.current) return;
        setAnswers((previous) => ({ ...previous, [QUESTION.id]: option }));
        setIsStepChanging(true);
        transitionTimer.current = setTimeout(() => {
            setCurrentStep((previous) => Math.min(previous + 1, CONTENT.questions.length - 1));
            setIsStepChanging(false);
            transitionTimer.current = null;
        }, OPTION_TRANSITION_DELAY_MS);
    }

    async function handleSubmit() {
        if (isSubmissionPending.current) return;
        if (QUESTION.fields?.some((field) => getFieldError(field.id) !== null)) {
            setIsValidationShown(true);
            return;
        }
        isSubmissionPending.current = true;
        setIsSubmitting(true);
        setError(null);
        try {
            await subscribeToWaitlist({
                fullname: answers.name.trim(),
                email: answers.email.trim(),
                phone: answers.phone.trim(),
                placeName: 'qualification-popup',
                note: JSON.stringify(answers, null, 4),
            });
            const PARAMETERS = new URLSearchParams({ name: answers.name.trim(), email: answers.email.trim() });
            if (confirmationContext) {
                PARAMETERS.set('context', confirmationContext);
                PARAMETERS.set('lang', language);
            }
            window.location.href = `/dekujeme?${PARAMETERS.toString()}`;
        } catch {
            setError(MESSAGES.error);
            isSubmissionPending.current = false;
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                lang={language}
                closeLabel={CONTENT.close}
                aria-describedby={undefined}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    opener.current?.focus();
                }}
                className="flex h-[620px] max-h-[calc(100dvh-2rem)] max-w-lg flex-col overflow-hidden rounded-3xl border-0 p-0 shadow-2xl"
            >
                <DialogTitle className="sr-only">{CONTENT.dialogTitle}</DialogTitle>
                <div
                    className="h-1.5 shrink-0 bg-gray-100"
                    role="progressbar"
                    aria-label={CONTENT.stepLabel(currentStep, CONTENT.questions.length)}
                    aria-valuenow={PROGRESS}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="h-full bg-cyan-600 transition-all motion-reduce:transition-none"
                        style={{ width: `${PROGRESS}%` }}
                    />
                </div>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (QUESTION.type === 'contact') void handleSubmit();
                    }}
                    noValidate
                >
                    <div className="mb-5 pr-6">
                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-500">
                                {CONTENT.stepLabel(currentStep, CONTENT.questions.length)}
                            </span>
                            {CONTENT.remainingSpots && (
                                <span className="font-medium text-emerald-700">{CONTENT.remainingSpots}</span>
                            )}
                        </div>
                        {currentStep === 0 && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">{CONTENT.intro}</p>
                        )}
                    </div>
                    <h2
                        ref={questionHeading}
                        tabIndex={-1}
                        className="mb-5 text-xl font-bold text-slate-900 outline-none"
                    >
                        {QUESTION.question}
                    </h2>
                    <fieldset disabled={isSubmitting || isStepChanging} className="flex min-w-0 flex-1 flex-col">
                        <legend className="sr-only">{QUESTION.question}</legend>
                        {QUESTION.type === 'single' && (
                            <div className="space-y-2.5">
                                {QUESTION.options?.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleOptionSelect(option)}
                                        aria-pressed={answers[QUESTION.id] === option}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-left text-[15px] text-gray-700 transition-colors hover:bg-gray-50 aria-pressed:border-cyan-600 aria-pressed:bg-cyan-50 focus-visible:outline-cyan-700"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                        {QUESTION.type === 'contact' && (
                            <div>
                                {QUESTION.subtitle && (
                                    <p className="mb-4 text-sm leading-relaxed text-slate-500">{QUESTION.subtitle}</p>
                                )}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {QUESTION.fields?.map((field, index) => {
                                        const FIELD_ERROR = isValidationShown ? getFieldError(field.id) : null;
                                        const FIELD_ID = `qualification-${field.id}`;
                                        return (
                                            <div key={field.id} className={index > 1 ? 'sm:col-span-2' : undefined}>
                                                <label
                                                    htmlFor={FIELD_ID}
                                                    className="mb-1 block text-xs font-medium text-slate-600"
                                                >
                                                    {field.label}
                                                </label>
                                                <input
                                                    id={FIELD_ID}
                                                    type={field.type}
                                                    inputMode={
                                                        field.inputMode as HTMLAttributes<HTMLInputElement>['inputMode']
                                                    }
                                                    autoComplete={
                                                        field.id === 'company'
                                                            ? 'organization'
                                                            : field.id === 'phone'
                                                              ? 'tel'
                                                              : field.id
                                                    }
                                                    value={answers[field.id] || ''}
                                                    required
                                                    disabled={isSubmitting}
                                                    onChange={(event) =>
                                                        setAnswers((previous) => ({
                                                            ...previous,
                                                            [field.id]: event.target.value,
                                                        }))
                                                    }
                                                    placeholder={field.placeholder}
                                                    aria-invalid={!!FIELD_ERROR}
                                                    aria-describedby={FIELD_ERROR ? `${FIELD_ID}-error` : undefined}
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:opacity-60 aria-[invalid=true]:border-red-500"
                                                />
                                                {FIELD_ERROR && (
                                                    <p id={`${FIELD_ID}-error`} className="mt-1 text-xs text-red-700">
                                                        {FIELD_ERROR}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {error && (
                            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                                {error}
                            </p>
                        )}
                        <div className="mt-auto flex flex-col items-center gap-3 pt-6">
                            {QUESTION.type === 'contact' && (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-auto w-full whitespace-normal rounded-full bg-cyan-800 px-6 py-3 text-white hover:bg-cyan-900"
                                >
                                    {isSubmitting ? CONTENT.submitting : CONTENT.submit}
                                    <Calendar aria-hidden="true" className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep((previous) => Math.max(0, previous - 1))}
                                    className="flex min-h-10 items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
                                >
                                    <ArrowLeft aria-hidden="true" size={14} />
                                    {CONTENT.back}
                                </button>
                            )}
                        </div>
                    </fieldset>
                    {QUESTION.type === 'contact' && (
                        <PersonalDataConsentNote
                            language={language}
                            className="mt-2 text-center text-[11px] text-gray-500"
                            linkClassName="hover:text-gray-700"
                        />
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
