'use client';

import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'promptbook_notif_shown';

export function BookingNotification({ language = 'cs' }: { language?: HomepageLanguage }) {
    const { bookingNotification } = getHomepageContent(language);
    const notifications = bookingNotification.notifications;
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState(notifications[0]);

    useEffect(() => {
        // Check if already shown this session
        if (typeof window === 'undefined') return;

        const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
        if (alreadyShown) return;

        // Pick a random notification
        const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
        setNotification(randomNotif);

        // Show after 6 seconds
        const showTimer = setTimeout(() => {
            setVisible(true);
            sessionStorage.setItem(STORAGE_KEY, 'true');
        }, 6000);

        return () => clearTimeout(showTimer);
    }, [notifications]);

    // Auto-dismiss after 8 seconds
    useEffect(() => {
        if (!visible) return;
        const hideTimer = setTimeout(() => setVisible(false), 8000);
        return () => clearTimeout(hideTimer);
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 30, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="fixed bottom-6 left-6 z-50 max-w-sm"
                >
                    <div className="bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 px-5 py-4 flex items-start gap-3">
                        {/* Pulse dot */}
                        <div className="mt-1 relative shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[#0f172a] leading-snug">
                                {notification.company} {bookingNotification.messageSuffix}
                            </p>
                            <p className="text-[12px] text-gray-400 mt-0.5">{notification.time}</p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setVisible(false)}
                            className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
