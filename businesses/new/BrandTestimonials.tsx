'use client';

import Image from 'next/image';
import { BookOpen, Quote } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import { brandTestimonials, universityTestimonial } from './brandTestimonialsData';
import s from './brand-testimonials.module.css';

/** Every original reference gets the same card, with its own unaltered attribution. */
export function BrandTestimonials() {
    const { locale } = useSiteLocale();
    const references = [universityTestimonial[locale], ...brandTestimonials[locale]];

    return (
        <section className={s.section} aria-labelledby="brand-references-heading">
            <h2 id="brand-references-heading" className={s.heading}>{locale === 'en' ? 'References' : 'Reference'}</h2>
            <div className={s.quotes}>
                {references.map(reference => (
                    <figure key={reference.name} className={s.quote}>
                        <Quote className={s.quoteMark} size={23} strokeWidth={1.4} aria-hidden="true" />
                        <blockquote>{reference.testimonial}</blockquote>
                        <figcaption className={s.author}>
                            {'avatar' in reference ? (
                                <Image src={reference.avatar} alt="" width={46} height={46} className={s.avatar} sizes="46px" />
                            ) : (
                                <span className={s.universityMark} aria-hidden="true"><BookOpen size={23} strokeWidth={1.4} /></span>
                            )}
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
