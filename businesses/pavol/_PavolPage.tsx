'use client';

import { PavolFooter } from '@/businesses/pavol/_PavolFooter';
import { pavolNumbers as PAVOL_NUMBERS } from '@/businesses/pavol/config-numbers';
import { pavolTestimonials as PAVOL_TESTIMONIALS } from '@/businesses/pavol/config-testimonials';
import { PAVOL_CONTAINER_CLASS_NAME, PAVOL_SITE_STYLE } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolContactSection } from '@/businesses/pavol/PavolContactSection';
import { PavolHeader } from '@/businesses/pavol/PavolHeader';
import { PavolHero } from '@/businesses/pavol/PavolHero';
import { PavolMediaSection } from '@/businesses/pavol/PavolMediaSection';
import { PavolProjectsSection } from '@/businesses/pavol/PavolProjectsSection';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import { usePavolContactForm } from '@/businesses/pavol/usePavolContactForm';
import { TestimonialsSection } from '@/components/testimonials-section';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ArrowUpRight, Check } from 'lucide-react';
import './pavol.css';

export function PavolPage({ language }: { readonly language: SupportedHomepageLanguage }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language];
    const FORM = usePavolContactForm(language);

    return (
        <div className="pavol-site min-h-screen bg-[#fffaf5] text-[var(--pavol-ink)]" style={PAVOL_SITE_STYLE}>
            <PavolHeader language={language} />
            <main id="main-content" tabIndex={-1} className="outline-none">
                <PavolHero content={CONTENT.hero} />
                <section
                    id="numbers"
                    tabIndex={-1}
                    className="bg-[var(--pavol-ink)] py-12 text-white outline-none sm:py-14"
                >
                    <div className={PAVOL_CONTAINER_CLASS_NAME}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                            <h2 className="shrink-0 text-xl font-semibold">{CONTENT.numbers.title}</h2>
                            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
                                {CONTENT.numbers.description}
                            </p>
                        </div>
                        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 lg:grid-cols-4 lg:gap-10">
                            {PAVOL_NUMBERS[language].map((ITEM) => (
                                <div key={ITEM.label} className="flex flex-col">
                                    <dt className="mt-3 max-w-xs text-xs leading-relaxed text-slate-300 sm:text-sm">
                                        {ITEM.label}
                                    </dt>
                                    <dd className="order-first text-4xl font-semibold tracking-tight text-[#edc987] sm:text-5xl">
                                        {ITEM.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>
                <section id="services" tabIndex={-1} className="py-16 outline-none sm:py-24">
                    <div className={PAVOL_CONTAINER_CLASS_NAME}>
                        <PavolSectionHeading
                            eyebrow={CONTENT.services.eyebrow}
                            title={CONTENT.services.title}
                            description={CONTENT.services.description}
                        />
                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            {CONTENT.services.items.map((SERVICE) => (
                                <article
                                    key={SERVICE.id}
                                    className="flex flex-col rounded-3xl border border-[var(--pavol-ink)]/10 bg-white p-6 sm:p-8"
                                >
                                    <div
                                        aria-hidden="true"
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3f1] text-[var(--pavol-accent)]"
                                    >
                                        <SERVICE.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {SERVICE.title}
                                    </h3>
                                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                                        {SERVICE.description}
                                    </p>
                                    <ul className="mb-7 mt-6 space-y-3 text-sm text-slate-700">
                                        {SERVICE.topics.map((TOPIC) => (
                                            <li key={TOPIC} className="flex gap-3">
                                                <Check
                                                    aria-hidden="true"
                                                    className="h-5 w-5 shrink-0 text-[var(--pavol-accent)]"
                                                />
                                                {TOPIC}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="#contact"
                                        aria-disabled={FORM.isSubmitting}
                                        onClick={(event) => {
                                            if (FORM.isSubmitting) {
                                                event.preventDefault();
                                                return;
                                            }
                                            FORM.selectService(SERVICE.id);
                                        }}
                                        className="mt-auto inline-flex min-h-12 items-center justify-between gap-4 rounded-xl border-t border-[var(--pavol-ink)]/10 pt-5 text-sm font-semibold text-[var(--pavol-accent)] hover:text-[var(--pavol-ink)] aria-disabled:opacity-50"
                                    >
                                        {SERVICE.buttonLabel}
                                        <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
                                    </a>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                <PavolProjectsSection language={language} />
                <TestimonialsSection
                    id="testimonials"
                    language={language}
                    className="bg-none bg-[#fffaf5] py-16 sm:py-24"
                    containerClassName={PAVOL_CONTAINER_CLASS_NAME}
                    eyebrow={CONTENT.testimonials.eyebrow}
                    title={CONTENT.testimonials.title}
                    description={CONTENT.testimonials.description}
                    testimonials={PAVOL_TESTIMONIALS[language]}
                    metrics={[]}
                    isAnimated={false}
                />
                <PavolMediaSection language={language} />
                <PavolContactSection language={language} form={FORM} />
            </main>
            <PavolFooter language={language} />
        </div>
    );
}
