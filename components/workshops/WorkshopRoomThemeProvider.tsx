'use client';

import { isWorkshopRoomPath, WORKSHOP_ROOM_THEME_STORAGE_KEY } from '@/lib/workshops/workshopRoomTheme';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * next-themes applies the saved/system preference before paint and synchronizes tabs.
 * Only room-specific tokens use this attribute; the site's global .dark palette is untouched.
 * Keeping the provider above routes and portals preserves both the preference and open forms.
 */
export function WorkshopRoomThemeProvider({ children }: { readonly children: ReactNode }) {
    const pathname = usePathname();

    return (
        <ThemeProvider
            attribute="data-room-theme"
            storageKey={WORKSHOP_ROOM_THEME_STORAGE_KEY}
            defaultTheme="system"
            forcedTheme={isWorkshopRoomPath(pathname) ? undefined : 'dark'}
            enableColorScheme={false}
        >
            {children}
        </ThemeProvider>
    );
}
