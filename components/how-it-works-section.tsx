'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { openQualificationPopup } from '@/components/qualification-popup';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   CUSTOM SVG ICONS
   ═══════════════════════════════════════════════════════════ */

function UploadDocsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="M9 15l3-3 3 3" />
        </svg>
    );
}

function CreateAgentIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="5" y="8" width="14" height="10" rx="2" />
            <path d="M12 8V5" />
            <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
            <circle cx="9" cy="13" r="1.5" />
            <circle cx="15" cy="13" r="1.5" />
            <path d="M10 16h4" />
            <path d="M8 18v2" />
            <path d="M16 18v2" />
        </svg>
    );
}

function AskQuestionIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M7 8h10" strokeWidth="1.4" />
            <path d="M7 11h7" strokeWidth="1.4" />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const stepVisuals = [
    {
        number: '01',
        CustomIcon: UploadDocsIcon,
        iconColor: 'text-cyan-500',
        dotColor: 'bg-cyan-500',
        glowColor: 'shadow-cyan-500/30',
    },
    {
        number: '02',
        CustomIcon: CreateAgentIcon,
        iconColor: 'text-blue-500',
        dotColor: 'bg-blue-500',
        glowColor: 'shadow-blue-500/30',
    },
    {
        number: '03',
        CustomIcon: AskQuestionIcon,
        iconColor: 'text-violet-500',
        dotColor: 'bg-violet-500',
        glowColor: 'shadow-violet-500/30',
    },
];

/* ═══════════════════════════════════════════════════════════
   MAIN SECTION - Vertical Timeline, alternating sides
   ═══════════════════════════════════════════════════════════ */
export function HowItWorksSection({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { howItWorks } = getProFirmyContent(language);
    const steps = howItWorks.steps.map((step, index) => ({
        ...step,
        ...stepVisuals[index],
    }));

    const handleCTAClick = () => {
        openQualificationPopup();
    };

    return (
        <section className="relative pt-[50px] pb-24 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        {howItWorks.eyebrow}
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-2xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        {howItWorks.heading}
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line - center */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
                        <div className="w-full h-full bg-gradient-to-b from-cyan-300 via-blue-300 to-violet-300 opacity-30"></div>
                    </div>
                    {/* Vertical line - mobile (left) */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-px md:hidden">
                        <div className="w-full h-full bg-gradient-to-b from-cyan-300 via-blue-300 to-violet-300 opacity-30"></div>
                    </div>

                    <div className="space-y-16 md:space-y-24">
                        {steps.map((step, i) => {
                            const isLeft = i % 2 === 0;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="relative"
                                >
                                    {/* ─── DESKTOP layout ─── */}
                                    <div className="hidden md:grid md:grid-cols-[1fr_60px_1fr] items-center">
                                        {/* Left column */}
                                        <div className={isLeft ? 'pr-12' : ''}>
                                            {isLeft && (
                                                <div className="text-right">
                                                    <div className="flex items-center justify-end gap-3 mb-3">
                                                        <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">
                                                            {step.title}
                                                        </h3>
                                                        <step.CustomIcon
                                                            className={`shrink-0 w-7 h-7 ${step.iconColor}`}
                                                        />
                                                    </div>
                                                    <p className="text-[15px] text-gray-500 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Center dot */}
                                        <div className="flex justify-center">
                                            <div
                                                className={`relative w-[46px] h-[46px] rounded-full ${step.dotColor} flex items-center justify-center shadow-lg ${step.glowColor}`}
                                            >
                                                <span className="text-[13px] font-bold text-white">{step.number}</span>
                                            </div>
                                        </div>

                                        {/* Right column */}
                                        <div className={!isLeft ? 'pl-12' : ''}>
                                            {!isLeft && (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <step.CustomIcon
                                                            className={`shrink-0 w-7 h-7 ${step.iconColor}`}
                                                        />
                                                        <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-[15px] text-gray-500 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ─── MOBILE layout ─── */}
                                    <div className="md:hidden flex gap-6">
                                        {/* Dot */}
                                        <div className="shrink-0 relative">
                                            <div
                                                className={`w-[44px] h-[44px] rounded-full ${step.dotColor} flex items-center justify-center shadow-lg ${step.glowColor}`}
                                            >
                                                <span className="text-[12px] font-bold text-white">{step.number}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="pt-1">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <step.CustomIcon className={`shrink-0 w-6 h-6 ${step.iconColor}`} />
                                                <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-[14.5px] text-gray-500 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-20"
                >
                    <Button
                        onClick={handleCTAClick}
                        size="lg"
                        className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white hover:shadow-xl hover:shadow-cyan-500/15 transform hover:scale-[1.03] transition-all duration-300 text-[16px] font-semibold px-8 py-6 rounded-full border border-white/20"
                    >
                        {howItWorks.cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
