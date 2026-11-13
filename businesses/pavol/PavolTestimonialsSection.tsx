import { pavolTestimonials as PAVOL_TESTIMONIALS } from '@/businesses/pavol/config-testimonials';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import Image from 'next/image';

/** A static quote layout keeps every reference readable before JavaScript loads. */
export function PavolTestimonialsSection({ language }: { readonly language: SupportedHomepageLanguage }) {
    const TESTIMONIALS = PAVOL_TESTIMONIALS[language];
    const SELECTED_NAMES = ['Jan Šedo', 'Tomáš Studeník'];
    const EXCERPTS = language === 'cs'
        ? [
            'Pavol vytvořil prototyp naší aplikace H-edu a díky němu jsme hned získali investici.',
            'Pavol se vyzná v nových technologiích a umí rychle najít řešení pro průmysl, vzdělávání i rozvoj měst.',
        ]
        : [
            'Pavol built the prototype for our H-edu app, which helped us secure investment right away.',
            'He understands new technology and quickly finds solutions for industry, education, and city development.',
        ];
    return (
        <section id="testimonials" tabIndex={-1} className="pavol-section outline-none">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading {...PAVOL_PAGE_CONTENT[language].testimonials} />
                <div className="mt-9 grid gap-8 md:grid-cols-2 md:gap-12">
                    {SELECTED_NAMES.map((NAME, index) => {
                        const TESTIMONIAL = TESTIMONIALS.find(item => item.name === NAME);
                        if (!TESTIMONIAL) return null;
                        return <figure key={TESTIMONIAL.name} className="flex flex-col border-t border-[var(--pavol-border)] pt-6">
                            <blockquote className="mb-6 text-lg leading-relaxed">{language === 'cs' ? '„' : '“'}{EXCERPTS[index]}{language === 'cs' ? '“' : '”'}</blockquote>
                            <figcaption className="mt-auto flex items-center gap-3">
                                {TESTIMONIAL.avatar && (
                                    <Image
                                        src={TESTIMONIAL.avatar}
                                        alt={TESTIMONIAL.name}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 shrink-0 rounded-full bg-[var(--pavol-warm)] object-cover"
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-semibold">{TESTIMONIAL.name}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-[var(--pavol-muted)]">
                                        {TESTIMONIAL.role}
                                    </p>
                                </div>
                            </figcaption>
                        </figure>;
                    })}
                </div>
                <details className="mt-8 text-sm">
                    <summary className="w-fit cursor-pointer py-3 text-[var(--pavol-muted)] underline underline-offset-4">
                        {language === 'cs' ? 'Všechny reference v plném znění' : 'All testimonials in full'}
                    </summary>
                    <div className="mt-5 grid gap-8 md:grid-cols-2">
                        {TESTIMONIALS.map(TESTIMONIAL => (
                            <figure key={TESTIMONIAL.name} className="border-t border-[var(--pavol-border)] pt-5">
                                <blockquote className="leading-relaxed">{TESTIMONIAL.testimonial}</blockquote>
                                <figcaption className="mt-4 text-[var(--pavol-muted)]">
                                    <span className="font-semibold text-[var(--pavol-ink)]">{TESTIMONIAL.name}</span> · {TESTIMONIAL.role}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </details>
            </div>
        </section>
    );
}
