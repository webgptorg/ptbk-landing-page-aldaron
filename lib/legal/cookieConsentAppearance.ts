import { AI_TA_KRAJTA_COLORS, AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
import { isWorkshopRoomPath } from '@/lib/workshops/workshopRoomTheme';
import type { CSSProperties } from 'react';

export type CookieConsentTheme = 'light' | 'dark' | 'podcast' | 'room';

const DARK_COOKIE_CONSENT_PATHS = ['/ai-supervize', '/ai-supervize-mini', '/cs/online-workshop', '/cs/komunita'];

/** The banner and its portalled settings share the page palette, including the podcast's own brand colors. */
export const PODCAST_COOKIE_CONSENT_STYLE = {
    '--cookie-surface': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
    '--cookie-accent': AI_TA_KRAJTA_COLORS.CORAL,
    '--cookie-accent-text': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
} as CSSProperties;

export function getCookieConsentTheme(pathname: string | null): CookieConsentTheme {
    const normalizedPathname = pathname?.toLowerCase().replace(/\/+$/, '') ?? '';
    const isWithinPath = (path: string) => normalizedPathname === path || normalizedPathname.startsWith(`${path}/`);

    if (isWithinPath(AI_TA_KRAJTA_PATH)) return 'podcast';
    if (isWorkshopRoomPath(normalizedPathname)) return 'room';
    return DARK_COOKIE_CONSENT_PATHS.some(isWithinPath) ? 'dark' : 'light';
}
