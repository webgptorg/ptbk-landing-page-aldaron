'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { openQualificationPopup } from '@/components/qualification-popup';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function FinalCTASection({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { finalCta } = getProFirmyContent(language);

    const handleCTAClick = () => {
        openQualificationPopup();
    };

    return (
        <section className="relative pt-[50px] pb-24 overflow-hidden">
            {/* Base dark background */}
            <div className="absolute inset-0 bg-[#072e3f]" />

            {/* Grid + Central Radial Glow (combined in one layer) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px),
                        radial-gradient(circle at 50% 50%, rgba(8,145,178,0.35) 0%, rgba(14,116,144,0.15) 30%, transparent 65%)
                    `,
                    backgroundSize: '40px 40px, 40px 40px, 100% 100%',
                    animation: 'gridScroll 25s linear infinite',
                }}
            />

            {/* Second radial glow - warm accent for depth */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(20,184,166,0.1) 0%, transparent 50%)',
                }}
            />

            {/* Animated glow spots */}
            <div
                className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-cyan-400/[0.08] blur-[100px]"
                style={{ animation: 'pulseGlow 8s ease-in-out infinite' }}
            />
            <div
                className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-teal-300/[0.06] blur-[100px]"
                style={{ animation: 'pulseGlow 10s ease-in-out infinite 3s' }}
            />

            {/* Edge vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at center, transparent 40%, rgba(7,46,63,0.85) 80%, rgba(7,46,63,1) 100%)',
                }}
            />

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7 }}
                    className="space-y-8"
                >
                    {/* Heading */}
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.75rem] font-extrabold text-white tracking-tight"
                        style={{ lineHeight: 1.2 }}
                    >
                        {finalCta.heading}
                    </h2>

                    {/* Body */}
                    <p className="text-[17px] text-cyan-100/80 leading-relaxed max-w-xl mx-auto">
                        {finalCta.description}
                    </p>

                    {/* CTA */}
                    <div className="pt-2">
                        <Button
                            onClick={handleCTAClick}
                            size="lg"
                            className="bg-white text-[#0e7490] hover:bg-gray-50 hover:shadow-2xl hover:shadow-black/20 transform hover:scale-[1.03] transition-all duration-300 text-[14px] sm:text-[16px] font-bold px-6 sm:px-10 py-5 sm:py-7 rounded-full"
                        >
                            {finalCta.cta}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>

                    {/* Urgency: Progress bar */}
                    <div className="max-w-xs mx-auto space-y-2">
                        <div className="flex items-center justify-between text-[13px]">
                            <span className="text-cyan-100/70 font-medium">
                                {finalCta.capacityPrefix}{' '}
                                <span className="text-white font-bold">{finalCta.capacityStrong}</span>{' '}
                                {finalCta.capacitySuffix}
                            </span>
                            <span className="text-amber-300/90 font-semibold">{finalCta.capacityRemaining}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '70%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
                            />
                        </div>
                        <p className="text-[11px] text-cyan-200/40 leading-snug">{finalCta.capacityNote}</p>
                    </div>

                    {/* Risk reversal */}
                    <p className="text-[13px] text-cyan-100/60 leading-relaxed max-w-md mx-auto">
                        {finalCta.riskReversal}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
