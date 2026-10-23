'use client';

import Image from 'next/image';
import { BookOpen, Quote } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import { brandTestimonials, universityTestimonial } from './brandTestimonialsData';
import s from './brand-testimonials.module.css';

const copy = {
    cs: {
        title: 'Důvěra vzniká při práci.',
        product: 'Zkušenosti s Promptbookem',
        people: 'Zkušenosti se spoluprací s Pavolem',
        context: 'Pavol Hejný · spoluzakladatel Promptbooku',
    },
    en: {
        title: 'Trust comes from working together.',
        product: 'Working with Promptbook',
        people: 'Working with Pavol',
        context: 'Pavol Hejný · cofounder of Promptbook',
    },
} as const;

/** All references remain readable without animation, a carousel or user interaction. */
export function BrandTestimonials() {
    const { locale } = useSiteLocale();
    const content = copy[locale];
    const university = universityTestimonial[locale];

    return (
        <section className={s.section} aria-labelledby="brand-references-heading">
            <div className={s.heading}>
                <h2 id="brand-references-heading">{content.title}</h2>
            </div>

            <div className={s.university}>
                <div className={s.universityIdentity}>
                    <span className={s.universityMark} aria-hidden="true"><BookOpen strokeWidth={1.3} /></span>
                    <p className={s.eyebrow}>{content.product}</p>
                    <h3>{university.name}</h3>
                </div>
                <figure className={s.productQuote}>
                    <blockquote>{university.testimonial}</blockquote>
                    <figcaption>{university.role} · {university.name}</figcaption>
                </figure>
            </div>

            <div className={s.personalHeading}>
                <h3>{content.people}</h3>
                <p>{content.context}</p>
            </div>
            <div className={s.quotes}>
                {brandTestimonials[locale].map((reference, index) => (
                    <figure key={reference.name} className={index === 0 ? s.featuredQuote : s.quote}>
                        <Quote className={s.quoteMark} size={25} strokeWidth={1.4} aria-hidden="true" />
                        <blockquote>{reference.testimonial}</blockquote>
                        <figcaption className={s.author}>
                            <Image
                                src={reference.avatar}
                                alt=""
                                width={52}
                                height={52}
                                className={s.avatar}
                                sizes="52px"
                            />
                            <div>
                                <p className={s.authorName}>{reference.name}</p>
                                <p className={s.authorRole}>{reference.role}</p>
                            </div>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
