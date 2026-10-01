'use client';

import { getProFirmyContent, type ProFirmyLanguage } from '@/businesses/pro-firmy/proFirmyContent';
import { motion, useInView } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    Brain,
    Cloud,
    FileText,
    FolderOpen,
    Handshake,
    HardDrive,
    Lightbulb,
    Mail,
    MessageCircleQuestion,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CUSTOM SVG ICONS - no background, pure accent-color path
   ═══════════════════════════════════════════════════════════ */

function ScatteredDataIcon({ className }: { className?: string }) {
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
            {/* Folder base */}
            <path d="M3 7V17a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            {/* Search magnifier */}
            <circle cx="14" cy="13" r="3" />
            <path d="M16.5 15.5L19 18" />
            {/* Scatter dots */}
            <circle cx="7" cy="12" r="0.8" fill="currentColor" stroke="none" />
            <circle cx="9" cy="15" r="0.8" fill="currentColor" stroke="none" />
        </svg>
    );
}

function HelpdeskIcon({ className }: { className?: string }) {
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
            {/* Person */}
            <circle cx="9" cy="7" r="3" />
            <path d="M9 13c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z" />
            {/* Chat bubble with ? */}
            <rect x="15" y="3" width="7" height="6" rx="1.5" />
            <path d="M17.2 5.5a1.3 1.3 0 011.8.2c.2.3.2.7 0 1l-.8.8" />
            <circle cx="18.2" cy="8" r="0.3" fill="currentColor" stroke="none" />
        </svg>
    );
}

function AIRiskIcon({ className }: { className?: string }) {
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
            {/* Shield */}
            <path d="M12 3l8 4v5c0 5.25-3.5 8.25-8 10-4.5-1.75-8-4.75-8-10V7l8-4z" />
            {/* Alert triangle inside */}
            <path d="M12 9v3" />
            <circle cx="12" cy="15" r="0.5" fill="currentColor" stroke="none" />
            {/* Lightning bolt */}
            <path d="M10.5 8l2-2 -1 3h2.5l-2 2 1-3h-2.5z" strokeWidth="0" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

function KnowledgeExitIcon({ className }: { className?: string }) {
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
            {/* Person */}
            <circle cx="10" cy="7" r="3" />
            <path d="M4 18v-1c0-2 2-4 6-4s6 2 6 4v1" />
            {/* Exit arrow */}
            <path d="M18 10l3-3-3-3" strokeWidth="1.8" />
            <path d="M21 7h-6" strokeWidth="1.8" />
            {/* Dotted trail */}
            <circle cx="17" cy="13" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
            <circle cx="19" cy="14.5" r="0.6" fill="currentColor" stroke="none" opacity="0.3" />
            <circle cx="21" cy="16" r="0.6" fill="currentColor" stroke="none" opacity="0.15" />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════
   MICRO-ILLUSTRATION 1: Scattered Files
   Files drift outward from center to edges - smooth linear
   ═══════════════════════════════════════════════════════════ */
function ScatteredFilesIllustration() {
    const items = [
        { Icon: FileText, dx: -120, dy: -15, delay: 0, color: '#f97316' },
        { Icon: Mail, dx: 130, dy: -10, delay: 1.0, color: '#fb923c' },
        { Icon: HardDrive, dx: -110, dy: 12, delay: 2.0, color: '#f59e0b' },
        { Icon: Cloud, dx: 125, dy: 15, delay: 3.0, color: '#fbbf24' },
        { Icon: Brain, dx: -135, dy: -20, delay: 4.0, color: '#f97316' },
        { Icon: FolderOpen, dx: 115, dy: 18, delay: 5.0, color: '#fb923c' },
    ];

    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Central "hub" */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-orange-100 border border-orange-200/50 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-orange-500" strokeWidth={1.8} />
            </div>

            {/* Connection lines - dashed */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" fill="none">
                <motion.path
                    d="M30 30 L100 50 L170 25"
                    stroke="#f9731618"
                    strokeWidth="0.8"
                    strokeDasharray="4 3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <motion.path
                    d="M40 75 L100 50 L165 70"
                    stroke="#f9731612"
                    strokeWidth="0.8"
                    strokeDasharray="4 3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 6, delay: 2, repeat: Infinity, ease: 'linear' }}
                />
            </svg>

            {/* File particles drifting to edges */}
            {items.map(({ Icon, dx, dy, delay, color }, idx) => (
                <motion.div
                    key={idx}
                    className="absolute left-1/2 top-1/2"
                    animate={{
                        x: [0, dx],
                        y: [0, dy],
                        opacity: [0, 0.9, 0.7, 0],
                        scale: [0.7, 1, 0.9, 0.5],
                    }}
                    transition={{
                        duration: 5,
                        delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm border"
                        style={{ backgroundColor: `${color}12`, borderColor: `${color}25` }}
                    >
                        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MICRO-ILLUSTRATION 2: Chat Helpdesk
   Question bubbles drift outward from central person
   ═══════════════════════════════════════════════════════════ */
function HelpdeskIllustration() {
    const bubbles = [
        { dx: -120, dy: -18, delay: 0 },
        { dx: 130, dy: -12, delay: 1.0 },
        { dx: -110, dy: 15, delay: 2.0 },
        { dx: 125, dy: 10, delay: 3.0 },
        { dx: -130, dy: -5, delay: 4.0 },
        { dx: 115, dy: 20, delay: 5.0 },
    ];

    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Central person icon */}
            <motion.div
                className="relative z-10"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-11 h-11 rounded-full bg-blue-100 border border-blue-200/50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
                </div>
            </motion.div>

            {/* Question bubbles drifting to edges */}
            {bubbles.map(({ dx, dy, delay }, idx) => (
                <motion.div
                    key={idx}
                    className="absolute left-1/2 top-1/2"
                    animate={{
                        x: [0, dx],
                        y: [0, dy],
                        opacity: [0, 0.85, 0.6, 0],
                        scale: [0.6, 1, 0.9, 0.4],
                    }}
                    transition={{
                        duration: 5,
                        delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <MessageCircleQuestion className="w-7 h-7 text-blue-400/80" strokeWidth={1.5} />
                </motion.div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MICRO-ILLUSTRATION 3: AI Risk / Hallucination
   Glitching document with warning + scan lines
   ═══════════════════════════════════════════════════════════ */
function AIRiskIllustration() {
    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Fake "document" with glitching lines */}
            <motion.div
                className="relative w-36 bg-white rounded-lg border border-red-100 shadow-sm p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Fake text lines */}
                <div className="space-y-1.5 mb-3">
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-4/5" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-full" />
                </div>

                {/* "Hallucinated" line - glitches red */}
                <motion.div
                    className="h-1.5 rounded-full w-11/12"
                    animate={{
                        backgroundColor: ['#fecaca', '#fca5a5', '#f87171', '#fca5a5', '#fecaca'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="space-y-1.5 mt-1.5">
                    <motion.div
                        className="h-1.5 rounded-full w-3/5"
                        animate={{
                            backgroundColor: ['#fecaca', '#fca5a5', '#f87171', '#fca5a5', '#fecaca'],
                        }}
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Warning badge */}
                <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                </motion.div>
            </motion.div>

            {/* Scanning line - horizontal sweep */}
            <motion.div
                className="absolute left-8 right-8 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent"
                animate={{ top: ['25%', '75%', '25%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Subtle glitch lines */}
            <motion.div
                className="absolute left-0 right-0 h-px bg-red-300/25"
                style={{ top: '35%' }}
                animate={{ opacity: [0, 0.5, 0], x: [-30, 30, -30] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute left-0 right-0 h-px bg-red-300/15"
                style={{ top: '70%' }}
                animate={{ opacity: [0, 0.35, 0], x: [20, -20, 20] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1 }}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MICRO-ILLUSTRATION 4: Fading Knowledge
   Person icon with knowledge particles drifting to edges
   ═══════════════════════════════════════════════════════════ */
function FadingKnowledgeIllustration() {
    const particles = [
        { Icon: BookOpen, startX: -6, startY: -8, dx: -130, dy: -12, delay: 0 },
        { Icon: Lightbulb, startX: 6, startY: -6, dx: 125, dy: -15, delay: 1.0 },
        { Icon: Handshake, startX: -8, startY: 6, dx: -140, dy: 10, delay: 2.0 },
        { Icon: Brain, startX: 8, startY: 4, dx: 135, dy: 8, delay: 3.0 },
        { Icon: FileText, startX: -4, startY: 0, dx: -120, dy: -20, delay: 4.0 },
        { Icon: Users, startX: 5, startY: 2, dx: 130, dy: 15, delay: 5.0 },
    ];

    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Central person - gentle pulse */}
            <motion.div
                className="relative z-10"
                animate={{ opacity: [1, 0.55, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-13 h-13 rounded-full bg-purple-100 border border-purple-200/50 flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-500" strokeWidth={1.8} />
                </div>
            </motion.div>

            {/* Knowledge particles drifting to the edges */}
            {particles.map(({ Icon, startX, startY, dx, dy, delay }, idx) => (
                <motion.div
                    key={idx}
                    className="absolute left-1/2 top-1/2"
                    style={{ marginLeft: startX, marginTop: startY }}
                    animate={{
                        x: [0, dx],
                        y: [0, dy],
                        opacity: [0, 0.9, 0.7, 0],
                        scale: [0.7, 1, 0.9, 0.5],
                    }}
                    transition={{
                        duration: 5,
                        delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/40 flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 text-purple-500" strokeWidth={1.8} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const painPointVisuals = [
    {
        CustomIcon: ScatteredDataIcon,
        accentColor: 'from-orange-500 to-amber-500',
        bgAccent: 'from-orange-50 to-amber-50',
        borderAccent: 'border-orange-200/50',
        iconColor: 'text-orange-500',
        illustrationBg: 'from-orange-50/80 to-amber-50/40',
        Illustration: ScatteredFilesIllustration,
    },
    {
        CustomIcon: HelpdeskIcon,
        accentColor: 'from-blue-500 to-indigo-500',
        bgAccent: 'from-blue-50 to-indigo-50',
        borderAccent: 'border-blue-200/50',
        iconColor: 'text-blue-500',
        illustrationBg: 'from-blue-50/80 to-indigo-50/40',
        Illustration: HelpdeskIllustration,
    },
    {
        CustomIcon: AIRiskIcon,
        accentColor: 'from-red-500 to-rose-500',
        bgAccent: 'from-red-50 to-rose-50',
        borderAccent: 'border-red-200/50',
        iconColor: 'text-red-500',
        illustrationBg: 'from-red-50/80 to-rose-50/40',
        Illustration: AIRiskIllustration,
    },
    {
        CustomIcon: KnowledgeExitIcon,
        accentColor: 'from-purple-500 to-violet-500',
        bgAccent: 'from-purple-50 to-violet-50',
        borderAccent: 'border-purple-200/50',
        iconColor: 'text-purple-500',
        illustrationBg: 'from-purple-50/80 to-violet-50/40',
        Illustration: FadingKnowledgeIllustration,
    },
];

/* ═══════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════ */
export function PainPointsSection({ language = 'cs' }: { language?: ProFirmyLanguage }) {
    const { painPoints } = getProFirmyContent(language);
    const points = painPoints.points.map((point, index) => ({
        ...point,
        ...painPointVisuals[index],
    }));

    return (
        <section className="relative pt-[50px] pb-24 bg-gradient-to-b from-gray-50/80 to-white overflow-hidden">
            {/* Subtle background orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-100/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        {painPoints.eyebrow}
                    </p>
                    <h2
                        className="text-[28px] sm:text-[32px] lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-2xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        {painPoints.heading}
                    </h2>
                </motion.div>

                {/* Pain Point Cards - 2x2 Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                    {points.map((point, i) => (
                        <motion.div
                            key={point.title}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500"
                        >
                            {/* Top accent line */}
                            <div
                                className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${point.accentColor} opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-10`}
                            ></div>

                            {/* ─── Illustration Zone ─── */}
                            <div
                                className={`relative h-32 bg-gradient-to-br ${point.illustrationBg} border-b border-gray-100/80`}
                            >
                                <point.Illustration />
                            </div>

                            {/* ─── Content Zone ─── */}
                            <div className="p-7">
                                {/* Icon + Title - same line */}
                                <div className="flex items-center gap-3 mb-4">
                                    <point.CustomIcon className={`shrink-0 w-7 h-7 ${point.iconColor}`} />
                                    <h3 className="text-lg font-bold text-[#0f172a] tracking-tight leading-tight">
                                        {point.title}
                                    </h3>
                                </div>

                                {/* Description - full width, aligned with icon */}
                                <p className="text-[14.5px] text-gray-500 leading-relaxed mb-4">{point.description}</p>

                                {/* Consequence - italic citation */}
                                <p className="text-[14.5px] italic font-semibold text-gray-500 leading-relaxed">
                                    <span className={point.iconColor}>→</span> {point.consequence}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Time Allocation infographic - animated */}
                <TimeAllocationChart content={painPoints.timeAllocation} />
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════
   ANIMATED TIME ALLOCATION CHART
   Bars grow + numbers count up on scroll
   ═══════════════════════════════════════════════════ */
function CountUp({ target, suffix = '%' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 1200;
        const step = 16;
        const increment = target / (duration / step);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, step);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

function TimeAllocationChart({
    content,
}: {
    content: {
        title: string;
        beforeLabel: string;
        beforePrimary: string;
        beforeSecondary: string;
        beforeNote: string;
        afterLabel: string;
        afterPrimary: string;
        afterSecondary: string;
        afterNote: string;
    };
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 p-10 max-w-2xl mx-auto mt-10"
        >
            <h3 className="text-lg font-bold text-[#0f172a] text-center mb-8">{content.title}</h3>

            <div className="space-y-6">
                {/* Before */}
                <div>
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {content.beforeLabel}
                    </p>
                    <div className="flex rounded-xl overflow-hidden h-12 bg-gray-100">
                        <motion.div
                            className="bg-gradient-to-r from-red-200 to-red-300 flex items-center justify-center"
                            initial={{ width: '0%' }}
                            animate={isInView ? { width: '80%' } : { width: '0%' }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="text-[14px] font-bold text-red-800">
                                <CountUp target={80} /> {content.beforePrimary}
                            </span>
                        </motion.div>
                        <motion.div
                            className="bg-gradient-to-r from-cyan-300 to-cyan-400 flex items-center justify-center"
                            initial={{ width: '0%' }}
                            animate={isInView ? { width: '20%' } : { width: '0%' }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="text-[12px] font-bold text-cyan-800">{content.beforeSecondary}</span>
                        </motion.div>
                    </div>
                    <p className="text-[12px] text-gray-400 mt-2">{content.beforeNote}</p>
                </div>

                {/* After */}
                <div>
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {content.afterLabel}
                    </p>
                    <div className="flex rounded-xl overflow-hidden h-12 bg-gray-100">
                        <motion.div
                            className="bg-gradient-to-r from-red-200 to-red-300 flex items-center justify-center"
                            initial={{ width: '0%' }}
                            animate={isInView ? { width: '20%' } : { width: '0%' }}
                            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="text-[12px] font-bold text-red-800">{content.afterSecondary}</span>
                        </motion.div>
                        <motion.div
                            className="bg-gradient-to-r from-cyan-300 to-cyan-400 flex items-center justify-center"
                            initial={{ width: '0%' }}
                            animate={isInView ? { width: '80%' } : { width: '0%' }}
                            transition={{ duration: 1, delay: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="text-[14px] font-bold text-cyan-800">
                                <CountUp target={80} /> {content.afterPrimary}
                            </span>
                        </motion.div>
                    </div>
                    <p className="text-[12px] text-gray-400 mt-2 text-right">{content.afterNote}</p>
                </div>
            </div>
        </motion.div>
    );
}
