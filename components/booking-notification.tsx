'use client';

import { getHomepageContent, type HomepageLanguage } from '@/businesses/homepage/homepageContent';
import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'promptbook_notif_shown';

export function BookingNotification({ language = 'cs' }: { language?: HomepageLanguage }) {
    const { bookingNotification } = getHomepageContent(language);
    const notifications = bookingNotification.notifications;
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState(notifications[0]);
    const notificationReference = useRef<HTMLDivElement>(null);
    const { clearance } = useFixedControlClearance(notificationReference, '.cookie-consent__panel', isVisible);

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
            setIsVisible(true);
            sessionStorage.setItem(STORAGE_KEY, 'true');
        }, 6000);

        return () => clearTimeout(showTimer);
    }, [notifications]);

    // Auto-dismiss after 8 seconds
    useEffect(() => {
        if (!isVisible) return;
        const hideTimer = setTimeout(() => setIsVisible(false), 8000);
        return () => clearTimeout(hideTimer);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={notificationReference}
                    data-booking-notification
                    initial={{ opacity: 0, y: 30, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="fixed left-6 right-6 z-40 max-w-sm"
                    style={{ bottom: `calc(${clearance}px + max(1.5rem, env(safe-area-inset-bottom)))` }}
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
                            onClick={() => setIsVisible(false)}
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
