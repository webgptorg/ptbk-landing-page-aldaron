import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { PavolContactForm } from '@/businesses/pavol/usePavolContactForm';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowUpRight, Check } from 'lucide-react';

export function PavolServicesSection({
    language,
    form,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly form: PavolContactForm;
}) {
    const CONTENT = PAVOL_PAGE_CONTENT[language].services;

    return (
        <section id="services" tabIndex={-1} className="pavol-section bg-white outline-none">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading {...CONTENT} />
                <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-5">
                    {CONTENT.items.map((SERVICE, index) => (
                        <article key={SERVICE.id} className="pavol-service flex flex-col rounded-2xl p-6 sm:p-7">
                            <div aria-hidden="true" className="flex items-center justify-between">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--pavol-border)] text-[var(--pavol-accent)]">
                                    <SERVICE.icon className="h-6 w-6" strokeWidth={1.5} />
                                </span>
                                <span className="font-mono text-sm text-[var(--pavol-muted)]">0{index + 1}</span>
                            </div>
                            <h3 className="mt-6 text-2xl font-medium tracking-tight">
                                {SERVICE.title}
                            </h3>
                            <p className="mt-4 text-base leading-relaxed text-[var(--pavol-muted)]">
                                {SERVICE.description}
                            </p>
                            <ul className="mb-8 mt-6 space-y-3 text-sm text-[var(--pavol-ink)]">
                                {SERVICE.topics.map((TOPIC) => (
                                    <li key={TOPIC} className="flex gap-3">
                                        <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--pavol-accent)]" />
                                        {TOPIC}
                                    </li>
                                ))}
                            </ul>
                            {SERVICE.formats && <details className="mb-6 rounded-xl border border-[var(--pavol-border)] p-4 text-sm">
                                <summary className="cursor-pointer font-medium">{language === 'cs' ? 'Jak může vzdělávání vypadat' : 'Example formats'}</summary>
                                <dl className="mt-4 space-y-4">{SERVICE.formats.map(format => <div key={format.title}>
                                    <dt className="font-medium">{format.title}</dt>
                                    <dd className="mt-1 leading-relaxed text-[var(--pavol-muted)]">{format.description}</dd>
                                </div>)}</dl>
                            </details>}
                            <a
                                href="#contact"
                                aria-disabled={form.isSubmitting}
                                onClick={(event) => {
                                    if (form.isSubmitting) {
                                        event.preventDefault();
                                        return;
                                    }
                                    form.selectService(SERVICE.id);
                                }}
                                className="group mt-auto inline-flex min-h-14 items-center justify-between gap-4 border-t border-[var(--pavol-border)] pt-5 text-sm font-semibold text-[var(--pavol-ink)] aria-disabled:opacity-50"
                            >
                                {SERVICE.buttonLabel}
                                <span className="pavol-link-arrow">
                                    <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                                </span>
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
