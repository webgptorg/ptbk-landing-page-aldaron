'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const WORKSHOP_ROOM_THEME_OPTIONS = [
    { value: 'system', label: 'Podle zařízení', Icon: Monitor },
    { value: 'light', label: 'Světlý režim', Icon: Sun },
    { value: 'dark', label: 'Tmavý režim', Icon: Moon },
] as const;

/** The same keyboard-accessible choice in the waiting room and every connected room. */
export function WorkshopRoomThemeControl() {
    const { theme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    return (
        <div
            role="group"
            aria-label="Barevný režim"
            className="inline-flex shrink-0 self-end rounded-full border border-room-border/15 bg-room-surface p-1 sm:self-auto"
        >
            {WORKSHOP_ROOM_THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={label}
                    title={label}
                    aria-pressed={isMounted && theme === value}
                    onClick={() => setTheme(value)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-room-muted transition-colors hover:bg-room-overlay/10 hover:text-room-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent aria-pressed:bg-room-accent/15 aria-pressed:text-room-accent"
                >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
            ))}
        </div>
    );
}
