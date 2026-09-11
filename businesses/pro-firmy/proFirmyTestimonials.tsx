'use client';

import { motion } from 'framer-motion';
import { BookOpen, Quote } from 'lucide-react';
import { type ComponentType } from 'react';

interface ProFirmyTestimonial {
    quote: string;
    author: string;
    company: string;
    icon: ComponentType<{ className?: string }>;
}

const testimonials: ProFirmyTestimonial[] = [
    {
        quote: 'Promptbook nás od sebe neodstřihl. Naopak. Konečně máme čas řešit opravdovou práci, za kterou jsme placeni.',
        author: 'IT oddělení',
        company: 'Slezská univerzita v Opavě',
        icon: BookOpen,
    },
    /*
    Note: Commenting out non-prooven testimonial for now
    {
        quote: 'Nováčci se už nemusí bát zeptat. Mají odpovědi okamžitě a přesně podle našich interních směrnic.',
        author: 'Městská část',
        company: 'Praha 13',
        icon: Building2,
    },
    */
];

const metrics = [
    { value: '1 000 000', label: 'normostran kapacity' /* <- !!!!!! */ },
    { value: '100%', label: 'v souladu s GDPR' },
    { value: '0', label: 'halucinací' },
];

export function ProFirmyTestimonialsSection() {
    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">Reference</p>
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        Co o Promptbooku říkají firmy, které ho{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            používají.
                        </span>
                    </h2>
                </motion.div>

                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={testimonial.company}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-500"
                        >
                            <div className="absolute top-6 right-6">
                                <Quote className="w-8 h-8 text-gray-100 group-hover:text-cyan-100 transition-colors duration-300" />
                            </div>

                            <blockquote className="text-[17px] text-[#0f172a] leading-relaxed font-medium mb-6 pr-8 italic">
                                "{testimonial.quote}"
                            </blockquote>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                                    <testimonial.icon className="w-4.5 h-4.5 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-semibold text-[#0f172a]">{testimonial.company}</p>
                                    <p className="text-[13px] text-gray-400">{testimonial.author}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Metrics Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                >
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="text-center py-6 sm:py-8 bg-white rounded-2xl border border-gray-100"
                        >
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent mb-2">
                                {metric.value}
                            </div>
                            <p className="text-[14px] text-gray-400 font-medium">{metric.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
