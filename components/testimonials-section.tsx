'use client';

import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Image, { type StaticImageData } from 'next/image';
import type { ComponentType, ReactNode } from 'react';

export type Testimonial = {
    name: string;
    role: string;
    testimonial: string;
    avatar?: StaticImageData | string;
    icon?: ComponentType<{ className?: string }>;
};

export type TestimonialsSectionMetric = {
    value: string;
    label: string;
    suffix?: string;
};

type TestimonialsSectionProps = {
    id?: string;
    className?: string;
    containerClassName?: string;
    isAnimated?: boolean;
    language?: HomepageLanguage;
    eyebrow?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    testimonials?: Testimonial[];
    metrics?: TestimonialsSectionMetric[];
};

/* Custom SVG icons */
function UniversityIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Roof / pediment */}
            <path d="M2 10L12 3l10 7" />
            {/* Columns */}
            <path d="M5 10v8" />
            <path d="M9 10v8" />
            <path d="M15 10v8" />
            <path d="M19 10v8" />
            {/* Base */}
            <path d="M3 18h18" />
            {/* Top beam */}
            <path d="M3 10h18" />
        </svg>
    );
}

function CityHallIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Main building */}
            <rect x="4" y="8" width="16" height="13" rx="1" />
            {/* Tower */}
            <rect x="9" y="3" width="6" height="5" />
            {/* Flag */}
            <path d="M12 1v2" />
            {/* Windows */}
            <rect x="7" y="11" width="3" height="3" rx="0.5" />
            <rect x="14" y="11" width="3" height="3" rx="0.5" />
            {/* Door */}
            <path d="M10 21v-4h4v4" />
        </svg>
    );
}

const testimonialVisuals = [
    {
        CustomIcon: UniversityIcon,
    },
    {
        CustomIcon: CityHallIcon,
    },
];

export function TestimonialsSection({
    id,
    className,
    containerClassName,
    isAnimated = true,
    language = 'cs',
    eyebrow,
    title,
    description,
    testimonials,
    metrics,
}: TestimonialsSectionProps) {
    const { testimonials: homepageTestimonials } = getHomepageContent(language);
    const resolvedTestimonials: Testimonial[] =
        testimonials ??
        homepageTestimonials.items.map((testimonial, index) => ({
            name: testimonial.company,
            role: testimonial.author,
            testimonial: testimonial.quote,
            icon: testimonialVisuals[index]?.CustomIcon,
        }));
    const resolvedMetrics = metrics ?? homepageTestimonials.metrics;
    const resolvedEyebrow = eyebrow ?? homepageTestimonials.eyebrow;
    const resolvedTitle = title ?? homepageTestimonials.heading;

    return (
        <section
            id={id}
            className={cn(
                'relative overflow-hidden bg-gradient-to-b from-gray-50/50 to-white pt-[50px] pb-24 scroll-mt-28',
                className,
            )}
        >
            <div className={cn('max-w-6xl mx-auto px-6 relative z-10', containerClassName)}>
                {/* Header */}
                <motion.div
                    initial={isAnimated ? { opacity: 0, y: 20 } : false}
                    whileInView={isAnimated ? { opacity: 1, y: 0 } : undefined}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        {resolvedEyebrow}
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        {resolvedTitle}
                    </h2>
                    {description && (
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-500 sm:text-lg">
                            {description}
                        </p>
                    )}
                </motion.div>

                {/* Testimonial Cards */}
                <div className={cn('grid md:grid-cols-2 gap-6', resolvedMetrics.length > 0 && 'mb-16')}>
                    {resolvedTestimonials.map((testimonial, i) => {
                        const FallbackIcon =
                            testimonial.icon ?? testimonialVisuals[i % testimonialVisuals.length]?.CustomIcon;

                        return (
                            <motion.div
                                key={`${testimonial.name}-${testimonial.role}`}
                                initial={isAnimated ? { opacity: 0, y: 25 } : false}
                                whileInView={isAnimated ? { opacity: 1, y: 0 } : undefined}
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-500 flex flex-col"
                            >
                                {/* Quote icon */}
                                <div className="absolute top-6 right-6">
                                    <Quote className="w-8 h-8 text-gray-100 group-hover:text-cyan-100 transition-colors duration-300" />
                                </div>

                                {/* Quote text */}
                                <blockquote className="text-[15px] sm:text-[17px] text-[#0f172a] leading-relaxed font-normal sm:font-medium mb-6 pr-8 italic">
                                    {testimonial.testimonial}
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-3 mt-auto">
                                    {testimonial.avatar ? (
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                                            <Image
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        FallbackIcon && <FallbackIcon className="w-8 h-8 text-cyan-600 shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-[14px] font-semibold text-[#0f172a]">{testimonial.name}</p>
                                        <p className="text-[13px] text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Metrics Strip */}
                {resolvedMetrics.length > 0 && (
                    <motion.div
                        initial={isAnimated ? { opacity: 0, y: 20 } : false}
                        whileInView={isAnimated ? { opacity: 1, y: 0 } : undefined}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                    >
                        {resolvedMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="text-center py-6 sm:py-8 bg-white rounded-2xl border border-gray-100"
                            >
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent mb-2">
                                    {metric.value}
                                    {metric.suffix ?? ''}
                                </div>
                                <p className="text-[14px] text-gray-400 font-medium">{metric.label}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
