import { pavolTestimonials as PAVOL_TESTIMONIALS } from '@/businesses/pavol/config-testimonials';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { Quote } from 'lucide-react';
import Image from 'next/image';

/** A static quote layout keeps every reference readable before JavaScript loads. */
export function PavolTestimonialsSection({ language }: { readonly language: SupportedHomepageLanguage }) {
    return (
        <section id="testimonials" tabIndex={-1} className="pavol-section outline-none">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading {...PAVOL_PAGE_CONTENT[language].testimonials} />
                <div className="pavol-testimonials mt-12 grid gap-7 md:grid-cols-2">
                    {PAVOL_TESTIMONIALS[language].map((TESTIMONIAL, index) => (
                        <figure key={TESTIMONIAL.name} className="pavol-testimonial flex flex-col">
                            {index === 0 && (
                                <Quote
                                    aria-hidden="true"
                                    className="mb-6 h-9 w-9 text-[var(--pavol-accent)]"
                                    strokeWidth={1.5}
                                />
                            )}
                            <blockquote className="mb-7 text-base leading-relaxed">{TESTIMONIAL.testimonial}</blockquote>
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
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
