'use client';

import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type ContactFormFields = {
    name: string;
    email: string;
    company: string;
    message: string;
};

const EMPTY_FORM_FIELDS: ContactFormFields = { name: '', email: '', company: '', message: '' };

/** Keeps service selection, a visitor's draft, and submission status in one place. */
export function usePavolContactForm(language: SupportedHomepageLanguage) {
    const CONTENT = PAVOL_PAGE_CONTENT[language];
    const [fields, setFields] = useState(EMPTY_FORM_FIELDS);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const IS_REQUEST_PENDING = useRef(false);

    useEffect(() => setIsReady(true), []);

    function selectService(serviceId: string) {
        if (IS_REQUEST_PENDING.current) return;
        const SERVICE = CONTENT.services.items.find((ITEM) => ITEM.id === serviceId);
        setSelectedServiceId(SERVICE?.id ?? '');
        setIsSubmitted(false);
        setError(null);
        setFields((CURRENT) => {
            const IS_TEMPLATE_MESSAGE = CONTENT.services.items.some((ITEM) => ITEM.prefillMessage === CURRENT.message);
            if (CURRENT.message.trim() && !IS_TEMPLATE_MESSAGE) return CURRENT;
            return { ...CURRENT, message: SERVICE?.prefillMessage ?? '' };
        });
    }

    function updateField(field: keyof ContactFormFields, value: string) {
        if (IS_REQUEST_PENDING.current) return;
        setFields((CURRENT) => ({ ...CURRENT, [field]: value }));
    }

    function resetForm() {
        if (IS_REQUEST_PENDING.current) return;
        setFields(EMPTY_FORM_FIELDS);
        setSelectedServiceId('');
        setError(null);
        setIsSubmitted(false);
    }

    async function submitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (IS_REQUEST_PENDING.current) return;
        const FIRST_EMPTY_FIELD = (['name', 'email', 'message'] as const).find((FIELD) => !fields[FIELD].trim());
        if (FIRST_EMPTY_FIELD) {
            setError(CONTENT.contact.errorMessage);
            const INPUT = event.currentTarget.elements.namedItem(FIRST_EMPTY_FIELD);
            if (INPUT instanceof HTMLElement) INPUT.focus();
            return;
        }

        IS_REQUEST_PENDING.current = true;
        setIsSubmitting(true);
        setError(null);
        try {
            await subscribeToWaitlist({
                fullname: fields.name.trim(),
                email: fields.email.trim(),
                placeName: `PavolPersonalPage-${language}`,
                note: [
                    `Language: ${language}`,
                    `Selected inquiry: ${selectedServiceId || 'general-contact'}`,
                    `Company: ${fields.company.trim() || '(not provided)'}`,
                    'Message:',
                    fields.message.trim(),
                ].join('\n'),
            });
            setIsSubmitted(true);
            setFields(EMPTY_FORM_FIELDS);
            setSelectedServiceId('');
        } catch {
            setError(CONTENT.contact.submissionErrorMessage);
        } finally {
            IS_REQUEST_PENDING.current = false;
            setIsSubmitting(false);
        }
    }

    return {
        fields,
        selectedServiceId,
        isSubmitting,
        isSubmitted,
        isReady,
        error,
        selectService,
        updateField,
        resetForm,
        submitForm,
    };
}

export type PavolContactForm = ReturnType<typeof usePavolContactForm>;
