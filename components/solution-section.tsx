'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CUSTOM SVG ICONS - no background, accent-color only
   ═══════════════════════════════════════════════════════════ */

function NaturalChatIcon({ className }: { className?: string }) {
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
            {/* Chat bubble */}
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            {/* Voice wave lines inside */}
            <path d="M9 10v0" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 9v2" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 8v4" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function VaultIcon({ className }: { className?: string }) {
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
            {/* Lock body */}
            <rect x="3" y="11" width="18" height="11" rx="2" />
            {/* Lock shackle */}
            <path d="M7 11V7a5 5 0 0110 0v4" />
            {/* Keyhole */}
            <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <path d="M12 17.5v2" strokeWidth="1.8" />
        </svg>
    );
}

function HonestyIcon({ className }: { className?: string }) {
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
            {/* Shield outline */}
            <path d="M12 3l8 4v5c0 5.25-3.5 8.25-8 10-4.5-1.75-8-4.75-8-10V7l8-4z" />
            {/* Checkmark inside */}
            <path d="M9 12.5l2 2 4-4" strokeWidth="2" />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const benefitVisuals = [
    {
        CustomIcon: NaturalChatIcon,
        iconColor: 'text-cyan-500',
        accentColor: 'from-cyan-500 to-blue-500',
    },
    {
        CustomIcon: VaultIcon,
        iconColor: 'text-emerald-500',
        accentColor: 'from-emerald-500 to-teal-500',
    },
    {
        CustomIcon: HonestyIcon,
        iconColor: 'text-violet-500',
        accentColor: 'from-violet-500 to-purple-500',
    },
];

/* ═══════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════ */
export function SolutionSection({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { solution } = getProFirmyContent(language);
    const benefits = solution.benefits.map((benefit, index) => ({
        ...benefit,
        ...benefitVisuals[index],
    }));

    return (
        <section className="relative pt-[50px] pb-24 bg-white overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-50/40 via-transparent to-transparent"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        {solution.eyebrow}
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto mb-5"
                        style={{ lineHeight: 1.2 }}
                    >
                        {solution.heading}
                    </h2>
                    <p className="text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        {solution.description}
                    </p>
                </motion.div>

                {/* 3 Benefit Cards - matching pain points style */}
                <div className="grid md:grid-cols-3 gap-5">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500 flex flex-col"
                        >
                            {/* Top accent line */}
                            <div
                                className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${benefit.accentColor} opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                            ></div>

                            {/* Icon + Title - same line */}
                            <div className="flex items-center gap-3 mb-4">
                                <benefit.CustomIcon className={`shrink-0 w-7 h-7 ${benefit.iconColor}`} />
                                <h3 className="text-lg font-bold text-[#0f172a] tracking-tight leading-tight">
                                    {benefit.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-[14.5px] text-gray-500 leading-relaxed mb-4 flex-1">
                                {benefit.description}
                            </p>

                            {/* Highlight - italic citation */}
                            <p className="text-[14.5px] italic font-semibold text-gray-500 leading-relaxed">
                                <span className={benefit.iconColor}>→</span> {benefit.highlight}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
