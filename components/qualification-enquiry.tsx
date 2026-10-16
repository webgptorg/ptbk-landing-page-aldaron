'use client';

import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export type QualificationEnquiryPresentation = {
    readonly title: string;
    readonly description: string;
    readonly agendaLabel: string;
    readonly agendaPlaceholder: string;
    readonly agendaOptions: readonly string[];
    readonly messageLabel: string;
    readonly messagePlaceholder: string;
    readonly fields: readonly {
        readonly id: 'name' | 'company' | 'email' | 'phone';
        readonly label: string;
        readonly type: 'text' | 'email' | 'tel';
        readonly autoComplete: string;
        readonly isRequired: boolean;
    }[];
    readonly requiredError: string;
    readonly emailError: string;
    readonly sendingError: string;
    readonly submit: string;
    readonly submitting: string;
    readonly close: string;
    readonly consentPurpose: string;
    readonly successUrl: string;
    readonly enquiryKind: string;
};

/** Configured presentation of the existing qualification lead, with the same source and consent infrastructure. */
export function QualificationEnquiry({
    language,
    presentation,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly presentation: QualificationEnquiryPresentation;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isRequestPending = useRef(false);
    const openerReference = useRef<HTMLElement | null>(null);
    const formReference = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const open = (event: Event) => {
            event.preventDefault();
            if (document.activeElement instanceof HTMLElement) openerReference.current = document.activeElement;
            setIsOpen(true);
        };
        window.addEventListener('open-qualification-popup', open);
        return () => window.removeEventListener('open-qualification-popup', open);
    }, []);

    const fieldError = (field: string): string | undefined => {
        const value = answers[field]?.trim();
        const isRequired =
            field === 'agenda' ||
            field === 'message' ||
            presentation.fields.some((candidate) => candidate.id === field && candidate.isRequired);
        if (isRequired && !value) return presentation.requiredError;
        if (field === 'email' && value && !isEmailAddressValid(value)) return presentation.emailError;
    };
    const updateAnswer = (field: string, value: string) => setAnswers((previous) => ({ ...previous, [field]: value }));
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (isRequestPending.current) return;
        setIsValidationShown(true);
        if (['agenda', 'message', ...presentation.fields.map((field) => field.id)].some((field) => fieldError(field))) {
            // After React displays errors, move to the first invalid input only on an explicit submit.
            requestAnimationFrame(() =>
                formReference.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
            );
            return;
        }
        isRequestPending.current = true;
        setIsSubmitting(true);
        setError(null);
        try {
            await subscribeToWaitlist({
                fullname: answers.name.trim(),
                email: answers.email.trim(),
                phone: answers.phone?.trim(),
                placeName: 'qualification-popup',
                note: JSON.stringify({ ...answers, enquiryKind: presentation.enquiryKind, language }, null, 4),
            });
            // Keep the established full-load conversion destination, without contact identity in its URL.
            window.location.assign(presentation.successUrl);
        } catch {
            setError(presentation.sendingError);
            isRequestPending.current = false;
            setIsSubmitting(false);
        }
    };
    const errorAttributes = (field: string) => ({
        'aria-invalid': isValidationShown && !!fieldError(field),
        'aria-describedby': isValidationShown && fieldError(field) ? `qualification-${field}-error` : undefined,
    });
    const renderError = (field: string) =>
        isValidationShown && fieldError(field) ? (
            <span className="ah-field-error" id={`qualification-${field}-error`}>
                {fieldError(field)}
            </span>
        ) : null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="ah-enquiry"
                closeLabel={presentation.close}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    openerReference.current?.focus();
                }}
            >
                <DialogTitle>{presentation.title}</DialogTitle>
                <DialogDescription>{presentation.description}</DialogDescription>
                <form ref={formReference} onSubmit={submit} noValidate>
                    <fieldset disabled={isSubmitting}>
                        <label htmlFor="qualification-agenda">{presentation.agendaLabel}</label>
                        <select
                            id="qualification-agenda"
                            value={answers.agenda ?? ''}
                            onChange={(event) => updateAnswer('agenda', event.target.value)}
                            required
                            {...errorAttributes('agenda')}
                        >
                            <option value="">{presentation.agendaPlaceholder}</option>
                            {presentation.agendaOptions.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                        {renderError('agenda')}
                        <label htmlFor="qualification-message">{presentation.messageLabel}</label>
                        <textarea
                            id="qualification-message"
                            value={answers.message ?? ''}
                            onChange={(event) => updateAnswer('message', event.target.value)}
                            placeholder={presentation.messagePlaceholder}
                            rows={3}
                            maxLength={4000}
                            required
                            {...errorAttributes('message')}
                        />
                        {renderError('message')}
                        <div className="ah-enquiry-fields">
                            {presentation.fields.map((field) => (
                                <div key={field.id}>
                                    <label htmlFor={`qualification-${field.id}`}>{field.label}</label>
                                    <input
                                        id={`qualification-${field.id}`}
                                        type={field.type}
                                        autoComplete={field.autoComplete}
                                        value={answers[field.id] ?? ''}
                                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                                        required={field.isRequired}
                                        maxLength={320}
                                        {...errorAttributes(field.id)}
                                    />
                                    {renderError(field.id)}
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    {error && (
                        <p role="alert" className="ah-field-error">
                            {error}
                        </p>
                    )}
                    <button className="ah-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? presentation.submitting : presentation.submit}
                    </button>
                    <PersonalDataConsentNote language={language}>{presentation.consentPurpose}</PersonalDataConsentNote>
                </form>
            </DialogContent>
        </Dialog>
    );
}
