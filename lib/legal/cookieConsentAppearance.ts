import { AI_TA_KRAJTA_COLORS, AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
import type { CSSProperties } from 'react';

/** Shared by the consent bar and its portalled settings dialog. Unlisted pages use the site's light surface. */
export type CookieConsentAppearance = {
    readonly theme: 'light' | 'dark' | 'podcast';
    readonly style?: CSSProperties;
};

const LIGHT_APPEARANCE: CookieConsentAppearance = { theme: 'light' };
const DARK_APPEARANCE: CookieConsentAppearance = { theme: 'dark' };
const PODCAST_APPEARANCE: CookieConsentAppearance = {
    theme: 'podcast',
    style: {
        '--cookie-surface': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
        '--cookie-text': AI_TA_KRAJTA_COLORS.PAPER,
        '--cookie-accent': AI_TA_KRAJTA_COLORS.CORAL,
        '--cookie-accent-text': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
    } as CSSProperties,
};

const DARK_LANDING_PATHS = ['/ai-supervize', '/ai-supervize-mini', '/cs/online-workshop', '/admin/login'];
const DARK_ROOM_PATHS = ['/cs/komunita', '/cs/online-workshop/participant'];
const LIGHT_MEMBERSHIP_PATH = '/cs/komunita/clenstvi';

function isPageWithinPath(pathname: string, path: string): boolean {
    return pathname === path || pathname.startsWith(`${path}/`);
}

export function getCookieConsentAppearance(pathname: string | null): CookieConsentAppearance {
    const normalizedPathname = pathname?.replace(/\/+$/, '').toLowerCase() ?? '';

    if (isPageWithinPath(normalizedPathname, AI_TA_KRAJTA_PATH)) {
        return PODCAST_APPEARANCE;
    }

    const isDarkPage =
        DARK_LANDING_PATHS.includes(normalizedPathname) ||
        (DARK_ROOM_PATHS.some((path) => isPageWithinPath(normalizedPathname, path)) &&
            !isPageWithinPath(normalizedPathname, LIGHT_MEMBERSHIP_PATH));

    return isDarkPage ? DARK_APPEARANCE : LIGHT_APPEARANCE;
}
