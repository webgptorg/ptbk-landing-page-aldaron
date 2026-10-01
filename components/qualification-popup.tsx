'use client';

import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/**
 * Name of the browser event which opens the dialog
 *
 * Note: Every call to action of a page lives far away from the dialog in the tree, so they reach it through one
 *       event instead of each section threading a setter down to itself.
 */
export const OPEN_QUALIFICATION_POPUP_EVENT_NAME = 'open-qualification-popup';

/**
 * Opens the qualification dialog of the page the visitor is on
 */
export function openQualificationPopup(): void {
    window.dispatchEvent(new CustomEvent(OPEN_QUALIFICATION_POPUP_EVENT_NAME));
}

/**
 * One step of the qualification flow: either a question with prepared answers, or the contact fields closing it
 */
export type QualificationQuestion = {
    readonly id: string;
    readonly question: string;
    readonly subtitle?: string;
    readonly type: 'single' | 'contact';
    readonly options?: readonly string[];
    readonly fields?: readonly {
        readonly id: string;
        readonly label: string;
        readonly type: string;
        readonly placeholder: string;
        readonly inputMode?: string;
    }[];
};

/**
 * Every word of the qualification dialog, supplied by the landing page which opens it
 *
 * Note: The dialog owns the flow, the validation and the submission; it owns none of the copy, because the pages
 *       which open it make different propositions and may not borrow each other's words or each other's claims.
 */
export type QualificationPopupContent = {
    readonly dialogTitle: string;
    readonly intro: string;
    readonly questions: readonly QualificationQuestion[];

    /**
     * Shown under a contact field the visitor left empty
     */
    readonly requiredFieldError: string;

    /**
     * Shown under the e-mail field when what is in it cannot be an address
     */
    readonly invalidEmailError: string;

    readonly successTitle: (name: string) => string;
    readonly successDescription: ReactNode;
    readonly successEmailPrefix: string;
    readonly close: string;
    readonly stepLabel: (currentStep: number, totalSteps: number) => string;
    readonly submitting: string;
    readonly submit: string;
    readonly back: string;

    /**
     * Optional note about free capacity
     *
     * Note: It is deliberately optional. A page which cannot honestly count the places left simply leaves it out
     *       rather than inventing a number.
     */
    readonly remainingSpots?: string;
};

type QualificationPopupProps = {
    /**
     * Language of the shared legal note the dialog closes with
     */
    readonly language?: SupportedHomepageLanguage;

    /**
     * Words of this particular dialog
     */
    readonly content: QualificationPopupContent;

    /**
     * Contact source the lead is recorded under, so each proposition stays tellable apart in `/admin/contacts`
     */
    readonly placeName: string;
};

export function QualificationPopup({
    language = 'cs',
    content: qualificationPopup,
    placeName,
}: QualificationPopupProps) {
    const questions = qualificationPopup.questions;
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener(OPEN_QUALIFICATION_POPUP_EVENT_NAME, handleOpen);
        return () => window.removeEventListener(OPEN_QUALIFICATION_POPUP_EVENT_NAME, handleOpen);
    }, []);

    useEffect(() => {
        setShowValidation(false);
    }, [currentStep, isOpen]);

    const currentQuestion = questions[currentStep];
    const totalSteps = questions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const canProceed = () => {
        if (currentQuestion.type === 'contact') {
            const name = answers['name'];
            const email = answers['email'];
            const phone = answers['phone'];
            const company = answers['company'];
            if (!name || !email || !phone || !company) return false;
            return isEmailAddressValid(email);
        }
        return !!answers[currentQuestion.id];
    };

    const getContactFieldError = (fieldId: string) => {
        const value = answers[fieldId]?.trim() ?? '';

        if (!value) {
            return qualificationPopup.requiredFieldError;
        }

        if (fieldId === 'email' && !isEmailAddressValid(value)) {
            return qualificationPopup.invalidEmailError;
        }

        return null;
    };

    const handleNext = () => {
        if (!canProceed()) {
            setShowValidation(true);
            return;
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleOptionSelect = (option: string) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
        setTimeout(() => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((s) => s + 1);
            }
        }, 450);
    };

    const handleSubmit = async () => {
        if (!canProceed()) {
            setShowValidation(true);
            return;
        }

        setIsSubmitting(true);

        const fullname = answers.name || '';
        const email = answers.email || '';
        const phone = answers.phone || '';
        const note = JSON.stringify(answers, null, 4);
        await subscribeToWaitlist({ fullname, email, placeName, phone, note });

        setIsSubmitting(false);
        // Redirect to thank you page with personalization
        const params = new URLSearchParams({
            name: answers.name || '',
            email: answers.email || '',
        });
        window.location.href = `/dekujeme?${params.toString()}`;
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setCurrentStep(0);
            setAnswers({});
            setIsSubmitted(false);
            setShowValidation(false);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-3xl shadow-2xl h-[600px] sm:h-[620px] flex flex-col">
                {/* Accessibility: hidden title for screen readers */}
                <VisuallyHidden>
                    <DialogTitle>{qualificationPopup.dialogTitle}</DialogTitle>
                </VisuallyHidden>

                {/* Progress bar */}
                {!isSubmitted && (
                    <div
                        className="h-1.5 bg-gray-100"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                {isSubmitted ? (
                    /* Success State */
                    <div className="px-8 py-14 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-cyan-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0f172a] mb-3">
                            {qualificationPopup.successTitle(answers.name || '')}
                        </h3>
                        <p className="text-[15px] text-gray-500 leading-relaxed mb-2">
                            {qualificationPopup.successDescription}
                        </p>
                        <p className="text-[13px] text-gray-400 leading-relaxed">
                            {qualificationPopup.successEmailPrefix}{' '}
                            <strong className="text-gray-500">{answers.email}</strong>.
                        </p>
                        <Button onClick={handleClose} variant="outline" className="mt-8 rounded-full px-6">
                            {qualificationPopup.close}
                        </Button>
                    </div>
                ) : (
                    /* Question Steps */
                    <div className="px-5 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col overflow-y-auto">
                        {/* Header: value prop + step */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                                    {qualificationPopup.stepLabel(currentStep, totalSteps)}
                                </span>
                                {qualificationPopup.remainingSpots && (
                                    <span className="text-[12px] text-emerald-600 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {qualificationPopup.remainingSpots}
                                    </span>
                                )}
                            </div>
                            {currentStep === 0 && (
                                <p className="text-[13px] text-gray-400 mt-2">{qualificationPopup.intro}</p>
                            )}
                        </div>

                        {/* Question */}
                        <h3 className="text-xl font-bold text-[#0f172a] mb-6">{currentQuestion.question}</h3>

                        {/* Single select options */}
                        {currentQuestion.type === 'single' && currentQuestion.options && (
                            <div className="space-y-2.5">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`w-full text-left px-5 py-3.5 rounded-xl border text-[15px] transition-all duration-200 ${
                                            answers[currentQuestion.id] === option
                                                ? 'border-[#0891b2] bg-cyan-50 text-[#0f172a] font-medium shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Contact fields */}
                        {currentQuestion.type === 'contact' && currentQuestion.fields && (
                            <div className="space-y-3">
                                {currentQuestion.subtitle && (
                                    <p className="text-[13px] text-gray-400 -mt-2 mb-3">{currentQuestion.subtitle}</p>
                                )}
                                {/* 2-column grid: Name + Company */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currentQuestion.fields.slice(0, 2).map((field) => (
                                        <div key={field.id}>
                                            {(() => {
                                                const fieldError = showValidation
                                                    ? getContactFieldError(field.id)
                                                    : null;

                                                return (
                                                    <>
                                                        <label
                                                            className={cn(
                                                                'mb-1 block text-[12px] font-medium text-gray-500',
                                                                fieldError && 'text-red-600',
                                                            )}
                                                        >
                                                            {field.label}
                                                        </label>
                                                        <input
                                                            type={field.type}
                                                            inputMode={
                                                                field.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']
                                                            }
                                                            value={answers[field.id] || ''}
                                                            onChange={(e) =>
                                                                setAnswers((prev) => ({
                                                                    ...prev,
                                                                    [field.id]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder={field.placeholder}
                                                            aria-invalid={!!fieldError}
                                                            className={cn(
                                                                'w-full rounded-xl border px-4 py-3 text-[14px] text-[#0f172a] placeholder:text-gray-300 transition-all duration-200 focus:outline-none',
                                                                fieldError
                                                                    ? 'border-red-300 bg-red-50/70 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                                    : 'border-gray-200 focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100',
                                                            )}
                                                            autoFocus={field.id === 'name'}
                                                        />
                                                        {fieldError && (
                                                            <p className="mt-1 text-[12px] text-red-600">
                                                                {fieldError}
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                                {/* Full-width: Email + Phone */}
                                {currentQuestion.fields.slice(2).map((field) => (
                                    <div key={field.id}>
                                        {(() => {
                                            const fieldError = showValidation ? getContactFieldError(field.id) : null;

                                            return (
                                                <>
                                                    <label
                                                        className={cn(
                                                            'mb-1 block text-[12px] font-medium text-gray-500',
                                                            fieldError && 'text-red-600',
                                                        )}
                                                    >
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        inputMode={
                                                            field.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']
                                                        }
                                                        value={answers[field.id] || ''}
                                                        onChange={(e) =>
                                                            setAnswers((prev) => ({
                                                                ...prev,
                                                                [field.id]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder={field.placeholder}
                                                        aria-invalid={!!fieldError}
                                                        className={cn(
                                                            'w-full rounded-xl border px-4 py-3 text-[14px] text-[#0f172a] placeholder:text-gray-300 transition-all duration-200 focus:outline-none',
                                                            fieldError
                                                                ? 'border-red-300 bg-red-50/70 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                                : 'border-gray-200 focus:border-[#0891b2] focus:ring-2 focus:ring-cyan-100',
                                                        )}
                                                    />
                                                    {fieldError && (
                                                        <p className="mt-1 text-[12px] text-red-600">{fieldError}</p>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigation */}
                        {currentQuestion.type === 'contact' ? (
                            /* Contact step: centered CTA + back + GDPR */
                            <div className="mt-auto pt-6 flex flex-col items-center gap-3">
                                <Button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white rounded-full px-8 py-5 text-[15px] font-semibold hover:shadow-lg hover:shadow-cyan-500/15 transition-all duration-300 disabled:opacity-40 w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        qualificationPopup.submitting
                                    ) : (
                                        <>
                                            {qualificationPopup.submit}
                                            <Calendar className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    {qualificationPopup.back}
                                </button>

                                <PersonalDataConsentNote
                                    language={language}
                                    className="mt-1 text-center text-[11px] text-gray-400"
                                    linkClassName="hover:text-gray-600"
                                />
                            </div>
                        ) : (
                            /* Single-select steps: just back button */
                            <div className="flex items-center justify-between mt-auto pt-6">
                                <button
                                    onClick={handleBack}
                                    className={`flex items-center gap-1.5 text-[14px] text-gray-400 hover:text-gray-600 transition-colors ${
                                        currentStep === 0 ? 'invisible' : ''
                                    }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {qualificationPopup.back}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
