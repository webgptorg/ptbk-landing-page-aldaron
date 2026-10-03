'use client';

import { getHomepageContent } from './homepageContent';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const HOMEPAGE_ENQUIRY_PLACE_NAME = 'qualification-popup';
const FIELD_CLASS_NAME =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-950 focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:opacity-60';

/** Reuses contact capture and its source; qualifies the responsibility rather than document-search pain. */
export function HomepageEnquiryDialog({ language }: { language: SupportedHomepageLanguage }) {
    const content = getHomepageContent(language);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [draft, setDraft] = useState({ responsibility: '', fullname: '', company: '', email: '', phone: '' });
    const isRequestPending = useRef(false);
    const triggerElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleOpen = () => {
            triggerElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setIsOpen(true);
        };
        window.addEventListener('open-qualification-popup', handleOpen);
        return () => window.removeEventListener('open-qualification-popup', handleOpen);
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isRequestPending.current) return;
        isRequestPending.current = true;
        setIsSubmitting(true);
        setIsFailed(false);

        try {
            await subscribeToWaitlist({
                fullname: draft.fullname.trim(),
                email: draft.email.trim(),
                phone: draft.phone.trim(),
                placeName: HOMEPAGE_ENQUIRY_PLACE_NAME,
                note: JSON.stringify(
                    {
                        proposition: 'ongoing-agenda',
                        language,
                        responsibility: draft.responsibility.trim(),
                        company: draft.company.trim(),
                    },
                    null,
                    4,
                ),
            });
            const parameters = new URLSearchParams({
                source: 'agenda',
                language,
                name: draft.fullname.trim(),
                email: draft.email.trim(),
            });
            window.location.assign(`/dekujeme?${parameters.toString()}`);
        } catch {
            setIsFailed(true);
            isRequestPending.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isNextOpen) => {
                if (!isRequestPending.current) setIsOpen(isNextOpen);
            }}
        >
            <DialogContent
                lang={language}
                closeLabel={content.enquiry.close}
                isCloseButtonDisabled={isSubmitting}
                className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl p-5 sm:p-7"
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    triggerElement.current?.focus();
                }}
                onEscapeKeyDown={(event) => {
                    if (isRequestPending.current) event.preventDefault();
                }}
                onPointerDownOutside={(event) => {
                    if (isRequestPending.current) event.preventDefault();
                }}
            >
                <DialogTitle className="pr-7 text-2xl leading-tight text-slate-950">
                    {content.enquiry.title}
                </DialogTitle>
                <DialogDescription className="leading-relaxed text-slate-600">
                    {content.enquiry.description}
                </DialogDescription>
                <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
                    <fieldset disabled={isSubmitting} className="space-y-4">
                        <div>
                            <label htmlFor="agenda-responsibility" className="text-sm font-medium text-slate-700">
                                {content.enquiry.responsibility}
                            </label>
                            <textarea
                                id="agenda-responsibility"
                                name="responsibility"
                                rows={3}
                                required
                                maxLength={4000}
                                value={draft.responsibility}
                                onChange={(event) => setDraft({ ...draft, responsibility: event.target.value })}
                                placeholder={content.enquiry.responsibilityPlaceholder}
                                className={FIELD_CLASS_NAME}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="agenda-fullname" className="text-sm font-medium text-slate-700">
                                    {content.enquiry.fullname}
                                </label>
                                <input
                                    id="agenda-fullname"
                                    name="fullname"
                                    autoComplete="name"
                                    required
                                    pattern=".*\S.*"
                                    maxLength={200}
                                    value={draft.fullname}
                                    onChange={(event) => setDraft({ ...draft, fullname: event.target.value })}
                                    className={FIELD_CLASS_NAME}
                                />
                            </div>
                            <div>
                                <label htmlFor="agenda-company" className="text-sm font-medium text-slate-700">
                                    {content.enquiry.company}
                                </label>
                                <input
                                    id="agenda-company"
                                    name="company"
                                    autoComplete="organization"
                                    required
                                    pattern=".*\S.*"
                                    maxLength={200}
                                    value={draft.company}
                                    onChange={(event) => setDraft({ ...draft, company: event.target.value })}
                                    className={FIELD_CLASS_NAME}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="agenda-email" className="text-sm font-medium text-slate-700">
                                {content.enquiry.email}
                            </label>
                            <input
                                id="agenda-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={320}
                                value={draft.email}
                                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                                className={FIELD_CLASS_NAME}
                            />
                        </div>
                        <div>
                            <label htmlFor="agenda-phone" className="text-sm font-medium text-slate-700">
                                {content.enquiry.phone}
                            </label>
                            <input
                                id="agenda-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                maxLength={100}
                                value={draft.phone}
                                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                                className={FIELD_CLASS_NAME}
                            />
                        </div>
                        {isFailed && (
                            <p role="alert" className="text-sm leading-relaxed text-red-700">
                                {content.enquiry.error}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-auto min-h-12 w-full whitespace-normal rounded-full bg-cyan-700 px-4 py-3 text-base font-semibold text-white hover:bg-cyan-800"
                        >
                            {isSubmitting ? content.enquiry.submitting : content.callToAction}
                        </Button>
                    </fieldset>
                    <PersonalDataConsentNote
                        language={language}
                        className="mt-4 text-xs text-slate-500"
                        linkClassName="text-cyan-800 underline underline-offset-2"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
