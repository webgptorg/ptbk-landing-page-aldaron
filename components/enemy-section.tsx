'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export function EnemySection({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { enemy } = getProFirmyContent(language);

    return (
        <section className="relative pt-[50px] pb-24 bg-white overflow-hidden">
            {/* Subtle bg */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-red-50/40 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-50/30 to-transparent rounded-full blur-3xl"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        {enemy.eyebrow}
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        {enemy.heading}
                    </h2>
                </motion.div>

                {/* Outer container */}
                <div className="rounded-2xl border border-gray-200 bg-white/50 py-8 px-6">
                    {/* Column Headers - desktop */}
                    <div className="hidden md:grid md:grid-cols-2 gap-8 mb-8">
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-5 py-2">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <span className="text-[13px] font-semibold text-red-600">{enemy.chatgptLabel}</span>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 rounded-full px-5 py-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                <span className="text-[13px] font-semibold text-cyan-700">{enemy.promptbookLabel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Rows */}
                    <div className="space-y-6">
                        {enemy.comparisons.map((row, i) => (
                            <motion.div
                                key={row.feature}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-20px' }}
                                transition={{ duration: 0.45, delay: i * 0.08 }}
                            >
                                {/* Desktop */}
                                <div className="hidden md:block relative mt-4">
                                    {/* Single card with dark blue border */}
                                    <div className="rounded-xl border border-[#010080]/20 bg-white overflow-hidden">
                                        <div className="grid grid-cols-[1fr_1px_1fr]">
                                            {/* ChatGPT - left */}
                                            <div className="py-5 px-5 flex items-center justify-center gap-3">
                                                <p className="text-[14.5px] text-gray-500 leading-relaxed text-center">
                                                    {row.chatgpt}
                                                </p>
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                    <X className="w-3 h-3 text-red-500" />
                                                </div>
                                            </div>

                                            {/* Vertical divider */}
                                            <div className="bg-gray-200"></div>

                                            {/* Promptbook - right */}
                                            <div className="py-5 px-5 flex items-center justify-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                                                    <Check className="w-3 h-3 text-cyan-600" />
                                                </div>
                                                <p className="text-[14.5px] font-medium text-[#0f172a] leading-relaxed text-center">
                                                    {row.promptbook}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feature pill - on top border, half in half out */}
                                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10">
                                        <div className="bg-[#010080] rounded-full px-4 py-1.5 whitespace-nowrap flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none translate-y-[0.5px]">
                                                {row.feature}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile: chat-style layout */}
                                <div className="md:hidden space-y-3">
                                    {/* Question header - centered */}
                                    <p
                                        className={`text-[14px] font-bold text-[#0f172a] text-center uppercase tracking-wide ${i > 0 ? 'mt-5' : ''}`}
                                    >
                                        {row.feature}
                                    </p>

                                    {/* ChatGPT - left aligned, compact */}
                                    <div className="flex justify-start">
                                        <div className="bg-red-50/80 rounded-2xl rounded-tl-md border border-red-200/50 px-5 py-3 max-w-[85%]">
                                            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                                                {enemy.chatgptLabel}
                                            </span>
                                            <p className="text-[14.5px] text-gray-600 leading-relaxed mt-1">
                                                {row.chatgpt}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Promptbook - right aligned, compact */}
                                    <div className="flex justify-end">
                                        <div className="bg-cyan-50/80 rounded-2xl rounded-tr-md border border-cyan-200/50 px-5 py-3 max-w-[85%]">
                                            <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
                                                {enemy.promptbookLabel}
                                            </span>
                                            <p className="text-[14.5px] font-medium text-[#0f172a] leading-relaxed mt-1">
                                                {row.promptbook}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
