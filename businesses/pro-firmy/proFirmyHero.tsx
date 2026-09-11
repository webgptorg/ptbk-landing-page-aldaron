'use client';

import { Button } from '@/components/ui/button';
import { CompletedBubble, TypewriterBubble } from '@/components/ui/ChatBubbles';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, FileText, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export const proFirmyChatMessages = [
    {
        id: 1,
        type: 'user' as const,
        text: 'Ahoj, jsem tu nová a nemůžu najít, kolik mám dní dovolené. Poradíte?',
        startDelay: 0,
        static: true,
    },
    {
        id: 2,
        type: 'bot' as const,
        text: 'Vítejte ve firmě, Anno! Podle pracovního řádu máte nárok na **25 dní dovolené ročně**.',
        startDelay: 2000,
        static: false,
    },
    {
        id: 3,
        type: 'bot' as const,
        text: 'Pošlu vám to i na e-mail, ať to máte po ruce. Ještě něco?',
        startDelay: 1200,
        static: false,
    },
    {
        id: 4,
        type: 'user' as const,
        text: 'Super, díky! Přesně tohle jsem potřebovala.',
        startDelay: 1000,
        static: false,
    },
];

export function ProFirmyHeroSection() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
    const [completedMessages, setCompletedMessages] = useState<number[]>([]);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);

    useEffect(() => {
        const staticIndices = proFirmyChatMessages.reduce<number[]>((acc, m, i) => (m.static ? [...acc, i] : acc), []);
        setCompletedMessages(staticIndices);

        const firstAnimatedIndex = proFirmyChatMessages.findIndex((m) => !m.static);
        if (firstAnimatedIndex === -1) return;

        const indicatorTimer = setTimeout(() => {
            setShowTypingIndicator(true);
        }, 800);

        const typingTimer = setTimeout(() => {
            setShowTypingIndicator(false);
            setCurrentMessageIndex(firstAnimatedIndex);
        }, 800 + proFirmyChatMessages[firstAnimatedIndex].startDelay);

        return () => {
            clearTimeout(indicatorTimer);
            clearTimeout(typingTimer);
        };
    }, []);

    const handleMessageComplete = useCallback(() => {
        setCompletedMessages((prev) => [...prev, currentMessageIndex]);

        let nextIndex = currentMessageIndex + 1;
        while (nextIndex < proFirmyChatMessages.length && proFirmyChatMessages[nextIndex].static) {
            nextIndex++;
        }

        if (nextIndex < proFirmyChatMessages.length) {
            const nextMsg = proFirmyChatMessages[nextIndex];
            if (nextMsg.type === 'bot') {
                setShowTypingIndicator(true);
                const timer = setTimeout(() => {
                    setShowTypingIndicator(false);
                    setCurrentMessageIndex(nextIndex);
                }, nextMsg.startDelay);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    setCurrentMessageIndex(nextIndex);
                }, nextMsg.startDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [currentMessageIndex]);

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-promptbook-blue rounded-full blur-3xl opacity-[0.07]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-promptbook-green rounded-full blur-3xl opacity-[0.07]"></div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        <div className="space-y-7">
                            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200/60 px-4 py-2 rounded-full text-[13px] font-medium text-gray-500 tracking-wide uppercase">
                                <Sparkles className="w-3.5 h-3.5 text-promptbook-blue-dark" />
                                Česká AI platforma pro firemní data
                            </div>

                            <h1
                                className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-[#0f172a] tracking-tight"
                                style={{ lineHeight: 1 }}
                            >
                                Co kdyby každý váš
                                <br />
                                zaměstnanec měl{' '}
                                <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                                    okamžitý
                                    <br />
                                    přístup
                                </span>{' '}
                                ke všemu, co vaše
                                <br />
                                firma kdy napsala?
                            </h1>

                            <p className="text-[17px] sm:text-lg text-gray-500 leading-[1.7] max-w-lg tracking-[0.01em]">
                                Promptbook přečte stovky tisíc normostran vašich dokumentů a&nbsp;odpoví na cokoliv. Ptát
                                se může nováček i zkušený manažer. Oba dostanou stejně přesnou odpověď.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link href="?modal=get-started">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white hover:shadow-xl hover:shadow-cyan-500/15 transform hover:scale-[1.03] transition-all duration-300 text-[16px] font-semibold px-8 py-6 rounded-full border border-white/20"
                                    id="hero-cta"
                                >
                                    Chci strategický hovor zdarma
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-y-2 gap-x-5 text-[13px] text-gray-400 tracking-wide">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-gray-300" />
                                <span>100% GDPR</span>
                            </div>
                            <span className="text-gray-200 hidden sm:inline">|</span>
                            <div className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-gray-300" />
                                <span>Až 1 000 000 normostran {/* <- !!!!!! */}</span>
                            </div>
                            <span className="text-gray-200 hidden sm:inline">|</span>
                            <div className="flex items-center gap-1.5">
                                <svg
                                    className="w-4 h-4 text-gray-300"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16l-4-3-4 3-4-3-4 3z" />
                                </svg>
                                <span>Česká platforma</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Chat Animation */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                            {/* Chat Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-600">
                                        Promptbook, HR asistent
                                    </span>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="p-6 space-y-4 min-h-[320px]">
                                <AnimatePresence>
                                    {proFirmyChatMessages.map((msg, index) => {
                                        const isCompleted = completedMessages.includes(index);
                                        const isCurrentlyTyping = currentMessageIndex === index && !isCompleted;

                                        if (!isCompleted && !isCurrentlyTyping) return null;

                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {isCurrentlyTyping ? (
                                                    <TypewriterBubble
                                                        text={msg.text}
                                                        type={msg.type}
                                                        onComplete={handleMessageComplete}
                                                    />
                                                ) : (
                                                    <CompletedBubble text={msg.text} type={msg.type} />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Typing indicator */}
                                {showTypingIndicator && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-promptbook-blue/20 rounded-2xl rounded-bl-md px-5 py-3">
                                            <div className="flex gap-1.5">
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-gray-400 border border-gray-200">
                                        Napište dotaz...
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-promptbook-blue-dark flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-promptbook-blue rounded-full blur-2xl opacity-20"></div>
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-promptbook-green rounded-full blur-2xl opacity-15"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
