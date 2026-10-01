'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { motion } from 'framer-motion';
import {
    Building2,
    Calculator,
    FlaskConical,
    GraduationCap,
    HardHat,
    Landmark,
    Monitor,
    Radio,
    Scale,
    ShieldCheck,
    ShoppingCart,
    Stethoscope,
    Truck,
    Zap,
} from 'lucide-react';

const industryIcons = [
    Building2,
    Scale,
    HardHat,
    Landmark,
    Stethoscope,
    GraduationCap,
    Truck,
    Zap,
    Monitor,
    ShieldCheck,
    FlaskConical,
    ShoppingCart,
    Calculator,
    Radio,
];

export function SocialProofStrip({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { socialProof } = getProFirmyContent(language);

    return (
        <section className="relative py-14 bg-white border-y border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-8">
                        {socialProof.eyebrow}
                    </p>
                </motion.div>
            </div>

            {/* Marquee container – full width with edge blur */}
            <div className="relative">
                {/* Left progressive blur */}
                <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-[120px] bg-gradient-to-r from-white to-transparent" />
                {/* Right progressive blur */}
                <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-[120px] bg-gradient-to-l from-white to-transparent" />

                <InfiniteSlider gap={48} duration={80} durationOnHover={160} className="py-2">
                    {socialProof.industries.map((label, index) => {
                        const Icon = industryIcons[index];

                        return (
                            <div key={label} className="flex items-center gap-2.5 group shrink-0 select-none">
                                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-cyan-50 group-hover:to-blue-50 group-hover:border-cyan-200/50 transition-all duration-300">
                                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#0891b2] transition-colors duration-300" />
                                </div>
                                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors duration-300 whitespace-nowrap">
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </InfiniteSlider>
            </div>
        </section>
    );
}
