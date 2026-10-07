'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type QualificationPresentation = {
    readonly copy: {
        readonly title: string;
        readonly description: string;
        readonly agenda: string;
        readonly other: string;
        readonly placeholder: string;
        readonly message: string;
        readonly messagePlaceholder: string;
        readonly name: string;
        readonly company: string;
        readonly email: string;
        readonly phone: string;
        readonly submit: string;
        readonly submitting: string;
        readonly close: string;
        readonly required: string;
        readonly invalidEmail: string;
        readonly failure: string;
    };
    readonly areas: readonly string[];
    readonly confirmationPath: string;
};

type EnquiryFields = 'agenda' | 'message' | 'name' | 'company' | 'email' | 'phone';
const REQUIRED_FIELDS = ['agenda', 'message', 'name', 'company', 'email'] as const;
const EMPTY_ANSWERS: Record<EnquiryFields, string> = {
    agenda: '',
    message: '',
    name: '',
    company: '',
    email: '',
    phone: '',
};

/** A configurable presentation over the existing contact delivery and consent infrastructure. */
export function QualificationEnquiryPopup({
    language,
    presentation,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly presentation: QualificationPresentation;
}) {
    const { copy } = presentation;
    const [isOpen, setIsOpen] = useState(false);
    const [answers, setAnswers] = useState(EMPTY_ANSWERS);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const isSubmittingReference = useRef(false);
    const triggerReference = useRef<HTMLElement | null>(null);
    const formReference = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const openPopup = (event: Event) => {
            event.preventDefault(); // Acknowledge that the progressively enhanced CTA has a working listener.
            triggerReference.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setIsOpen(true);
        };
        window.addEventListener('open-qualification-popup', openPopup);
        return () => window.removeEventListener('open-qualification-popup', openPopup);
    }, []);

    const fieldError = (field: EnquiryFields) => {
        if (field !== 'phone' && !answers[field].trim()) return copy.required;
        if (field === 'email' && !isEmailAddressValid(answers.email.trim())) return copy.invalidEmail;
        return '';
    };
    const updateAnswer = (field: EnquiryFields, value: string) =>
        setAnswers((current) => ({ ...current, [field]: value }));
    const fieldProperties = (field: EnquiryFields) => ({
        id: `enquiry-${field}`,
        name: field,
        value: answers[field],
        'aria-invalid': isValidationShown && !!fieldError(field),
        'aria-describedby': isValidationShown && fieldError(field) ? `enquiry-${field}-error` : undefined,
        required: field !== 'phone',
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            updateAnswer(field, event.target.value),
    });
    const renderError = (field: EnquiryFields) =>
        isValidationShown && fieldError(field) ? (
            <span className="hp-field-error" id={`enquiry-${field}-error`}>
                {fieldError(field)}
            </span>
        ) : null;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (isSubmittingReference.current) return;
        setIsValidationShown(true);
        const invalidField = REQUIRED_FIELDS.find((field) => fieldError(field));
        if (invalidField) {
            formReference.current?.querySelector<HTMLElement>(`#enquiry-${invalidField}`)?.focus();
            return;
        }
        isSubmittingReference.current = true;
        setIsSubmitting(true);
        setError('');
        try {
            await subscribeToWaitlist({
                fullname: answers.name.trim(),
                email: answers.email.trim(),
                phone: answers.phone.trim(),
                placeName: 'qualification-popup',
                note: JSON.stringify({ ...answers, proposition: 'autonomous-agendas', language }, null, 4),
            });
            // Keep the established full-load conversion destination; do not put contact identity in its URL.
            window.location.assign(presentation.confirmationPath);
        } catch {
            setError(copy.failure);
            isSubmittingReference.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isNextOpen) => {
                if (!isSubmittingReference.current) setIsOpen(isNextOpen);
            }}
        >
            <DialogContent
                className="hp-enquiry-dialog"
                closeLabel={copy.close}
                lang={language}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    triggerReference.current?.focus();
                }}
            >
                <DialogTitle className="hp-enquiry-title">{copy.title}</DialogTitle>
                <DialogDescription>{copy.description}</DialogDescription>
                <form ref={formReference} onSubmit={submit} noValidate aria-busy={isSubmitting}>
                    <fieldset disabled={isSubmitting}>
                        <label htmlFor="enquiry-agenda">{copy.agenda}</label>
                        <select {...fieldProperties('agenda')}>
                            <option value="">{copy.placeholder}</option>
                            {[...presentation.areas, copy.other].map((area) => (
                                <option key={area}>{area}</option>
                            ))}
                        </select>
                        {renderError('agenda')}
                        <label htmlFor="enquiry-message">{copy.message}</label>
                        <textarea
                            {...fieldProperties('message')}
                            placeholder={copy.messagePlaceholder}
                            rows={3}
                            maxLength={5000}
                        />
                        {renderError('message')}
                        <div className="hp-enquiry-fields">
                            {(['name', 'company', 'email', 'phone'] as const).map((field) => (
                                <div key={field}>
                                    <label htmlFor={`enquiry-${field}`}>{copy[field]}</label>
                                    <input
                                        {...fieldProperties(field)}
                                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                                        autoComplete={
                                            field === 'company' ? 'organization' : field === 'phone' ? 'tel' : field
                                        }
                                        maxLength={200}
                                    />
                                    {renderError(field)}
                                </div>
                            ))}
                        </div>
                        {error && (
                            <p role="alert" className="hp-submit-error">
                                {error}
                            </p>
                        )}
                        <button type="submit" className="hp-button">
                            {isSubmitting ? copy.submitting : copy.submit}
                        </button>
                    </fieldset>
                    <PersonalDataConsentNote language={language} className="hp-enquiry-consent" />
                </form>
            </DialogContent>
        </Dialog>
    );
}
