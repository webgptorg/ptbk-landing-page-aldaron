'use client';

import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { PavolContactForm } from '@/businesses/pavol/usePavolContactForm';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowUpRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function PavolContactSection({
    language,
    form,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly form: PavolContactForm;
}) {
    const CONTENT = PAVOL_PAGE_CONTENT[language];
    const CONTACT = CONTENT.contact;
    const SUCCESS_REF = useRef<HTMLDivElement>(null);
    const FIELDS = [
        {
            name: 'name',
            label: CONTACT.formNameLabel,
            placeholder: CONTACT.formNamePlaceholder,
            autoComplete: 'name',
            type: 'text',
            isRequired: true,
        },
        {
            name: 'email',
            label: CONTACT.formEmailLabel,
            placeholder: CONTACT.formEmailPlaceholder,
            autoComplete: 'email',
            type: 'email',
            isRequired: true,
        },
        {
            name: 'company',
            label: CONTACT.formCompanyLabel,
            placeholder: CONTACT.formCompanyPlaceholder,
            autoComplete: 'organization',
            type: 'text',
            isRequired: false,
        },
    ] as const;

    useEffect(() => {
        if (form.isSubmitted) SUCCESS_REF.current?.focus({ preventScroll: true });
    }, [form.isSubmitted]);

    return (
        <section id="contact" tabIndex={-1} className="bg-[var(--pavol-warm)] py-16 outline-none sm:py-24">
            <div className={`${PAVOL_CONTAINER_CLASS_NAME} grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20`}>
                <div>
                    <PavolSectionHeading
                        eyebrow={CONTACT.eyebrow}
                        title={CONTACT.title}
                        description={CONTACT.description}
                    />
                    <div className="mt-10 border-t border-[var(--pavol-ink)]/15 pt-7">
                        <h3 className="text-sm font-semibold text-[var(--pavol-ink)]">{CONTACT.otherContactsTitle}</h3>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {CONTACT.links.map((LINK) => (
                                <li key={LINK.href}>
                                    <a
                                        href={LINK.href}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--pavol-ink)]/15 px-4 text-sm text-slate-700 transition-colors hover:bg-white"
                                    >
                                        {LINK.icon && <LINK.icon aria-hidden="true" className="h-4 w-4" />}
                                        {LINK.label}
                                        <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="rounded-3xl border border-[var(--pavol-ink)]/10 bg-white p-5 shadow-sm sm:p-8">
                    {form.isSubmitted ? (
                        <div
                            ref={SUCCESS_REF}
                            role="status"
                            tabIndex={-1}
                            className="flex h-full flex-col items-center justify-center py-12 text-center outline-none"
                        >
                            <CheckCircle2 aria-hidden="true" className="h-12 w-12 text-[var(--pavol-accent)]" />
                            <h3 className="mt-6 text-2xl font-semibold">{CONTACT.successTitle}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">{CONTACT.successDescription}</p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-6 rounded-full"
                                onClick={() => {
                                    form.resetForm();
                                    requestAnimationFrame(() => document.getElementById('pavol-name')?.focus());
                                }}
                            >
                                {CONTACT.anotherMessageLabel}
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={form.submitForm}
                            aria-busy={form.isSubmitting}
                            aria-describedby={form.error ? 'pavol-contact-error' : undefined}
                        >
                            <noscript>
                                <p className="mb-5 text-sm leading-relaxed text-slate-600">
                                    {CONTACT.javascriptRequiredMessage}
                                </p>
                            </noscript>
                            <fieldset
                                disabled={!form.isReady || form.isSubmitting}
                                className="space-y-5 disabled:opacity-70"
                            >
                                <legend className="sr-only">{CONTACT.title}</legend>
                                <div>
                                    <label htmlFor="pavol-inquiry" className="text-sm font-semibold text-slate-700">
                                        {CONTACT.inquiryLabel}
                                    </label>
                                    <select
                                        id="pavol-inquiry"
                                        name="inquiry"
                                        value={form.selectedServiceId}
                                        onChange={(event) => form.selectService(event.target.value)}
                                        className="mt-2 h-12 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                    >
                                        <option value="">{CONTACT.generalInquiryLabel}</option>
                                        {CONTENT.services.items.map((SERVICE) => (
                                            <option key={SERVICE.id} value={SERVICE.id}>
                                                {SERVICE.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {FIELDS.map((FIELD) => (
                                    <div key={FIELD.name}>
                                        <label
                                            htmlFor={`pavol-${FIELD.name}`}
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            {FIELD.label}{' '}
                                            {!FIELD.isRequired && (
                                                <span className="ml-2 font-normal text-slate-500">
                                                    ({CONTACT.optionalLabel})
                                                </span>
                                            )}
                                        </label>
                                        <Input
                                            id={`pavol-${FIELD.name}`}
                                            name={FIELD.name}
                                            type={FIELD.type}
                                            required={FIELD.isRequired}
                                            value={form.fields[FIELD.name]}
                                            onChange={(event) => form.updateField(FIELD.name, event.target.value)}
                                            placeholder={FIELD.placeholder}
                                            autoComplete={FIELD.autoComplete}
                                            className="mt-2 h-12 bg-white text-base"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label htmlFor="pavol-message" className="text-sm font-semibold text-slate-700">
                                        {CONTACT.formMessageLabel}
                                    </label>
                                    <Textarea
                                        id="pavol-message"
                                        name="message"
                                        required
                                        value={form.fields.message}
                                        onChange={(event) => form.updateField('message', event.target.value)}
                                        placeholder={CONTACT.formMessagePlaceholder}
                                        className="mt-2 min-h-[160px] resize-y bg-white text-base"
                                    />
                                </div>
                                {form.error && (
                                    <p
                                        id="pavol-contact-error"
                                        role="alert"
                                        className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {form.error}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    disabled={!form.isReady || form.isSubmitting}
                                    className="h-12 w-full rounded-full bg-[var(--pavol-ink)] text-white hover:bg-[var(--pavol-accent)]"
                                >
                                    {form.isSubmitting ? CONTACT.submittingLabel : CONTACT.submitLabel}
                                    {form.isSubmitting ? (
                                        <Loader2 aria-hidden="true" className="ml-2 h-4 w-4 motion-safe:animate-spin" />
                                    ) : (
                                        <Send aria-hidden="true" className="ml-2 h-4 w-4" />
                                    )}
                                </Button>
                                <PersonalDataConsentNote
                                    language={language}
                                    className="text-center text-slate-500"
                                    linkClassName="text-[var(--pavol-accent)]"
                                />
                            </fieldset>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
