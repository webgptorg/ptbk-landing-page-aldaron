import { SHORTCODE_LINK_PUBLIC_BASE_URL } from '@/lib/shortener/shortcodeLinkConstants';
import { getPreferredShortcodeLinkHostname } from './shortcodeLinkDomains';

/**
 * The application which created a short link. The list deliberately describes
 * the product surface rather than a database table, so the administration can
 * answer where a link came from without reviving the retired `App` relation.
 */
export const SHORTCODE_LINK_SOURCE_APP_VALUES = ['admin-shortener', 'online-workshop', 'community'] as const;

export type ShortcodeLinkSourceApp = (typeof SHORTCODE_LINK_SOURCE_APP_VALUES)[number];

export const DEFAULT_SHORTCODE_LINK_SOURCE_APP: ShortcodeLinkSourceApp = 'admin-shortener';

const SHORTCODE_LINK_SOURCE_APP_LABELS: Readonly<Record<ShortcodeLinkSourceApp, string>> = {
    'admin-shortener': 'Admin shortener',
    'online-workshop': 'Online workshop',
    community: 'Community',
};

/**
 * Whether a source-app value is one this version of the administration knows
 * how to present. A legacy row keeps a safe manual-admin fallback instead of
 * making the whole listing unreadable.
 */
export function isShortcodeLinkSourceApp(value: unknown): value is ShortcodeLinkSourceApp {
    return typeof value === 'string' && SHORTCODE_LINK_SOURCE_APP_VALUES.includes(value as ShortcodeLinkSourceApp);
}

export function getShortcodeLinkSourceAppLabel(sourceApp: ShortcodeLinkSourceApp): string {
    return SHORTCODE_LINK_SOURCE_APP_LABELS[sourceApp];
}

export function getShortcodeLinkCreationLabel(isAdHoc: boolean): string {
    return isAdHoc ? 'Ad hoc' : 'Created manually';
}

/**
 * Everything an administrator decides about one short link
 *
 * Note: Creating and editing write exactly these values, which is what keeps one validation and one database mapping
 *       enough for both.
 */
export type ShortcodeLinkValues = {
    /** null means every domain. Omission keeps existing scope when an older API client edits a link. */
    readonly domains?: readonly string[] | null;
    /**
     * The part of the public address which follows {@link SHORTCODE_LINK_PUBLIC_BASE_URL}
     */
    readonly shortcode: string;

    /**
     * Where the short link leads; a visitor of a link with more than one destination reaches a random one of them
     */
    readonly urls: readonly string[];

    /**
     * A private remark of the administration, which no visitor ever sees
     */
    readonly note: string | null;

    /**
     * Markdown or HTML shown instead of redirecting straight away, or `null` for a plain redirect
     */
    readonly landingPage: string | null;
};

/**
 * One short link as it is stored, which is its values together with what only the database decides
 */
export type ShortcodeLink = ShortcodeLinkValues & {
    readonly id: number;
    readonly createdAt: string;

    /**
     * `true` when another application made this short link as part of its own
     * workflow rather than an administrator composing it in the shortener.
     */
    readonly isAdHoc: boolean;

    /**
     * The application which made the link, independent from the old
     * Promptbook Studio `appId` relation.
     */
    readonly sourceApp: ShortcodeLinkSourceApp;
};

/**
 * One short link together with the aggregate that is useful only to the administration list.
 */
export type ShortcodeLinkSummary = ShortcodeLink & {
    /**
     * How many times the public short address was navigated to.
     */
    readonly clickCount: number;
};

/**
 * One recorded navigation of a public short link. These values are held privately by the administration; public
 * visitors never receive another visitor's click data.
 */
export type ShortcodeLinkClick = {
    readonly id: number;
    readonly shortcodeLinkId: number;
    readonly navigatedAt: string;
    readonly clickedAt: string | null;
    readonly ip: string | null;
    readonly userAgent: string | null;
    readonly referer: string | null;
    readonly language: string | null;
    readonly platform: string | null;
};

/**
 * The address which is handed out for a shortcode
 */
export function createPublicShortcodeLinkUrl(shortcode: string, domains?: readonly string[] | null): string {
    return `https://${getPreferredShortcodeLinkHostname(domains)}/${shortcode}`;
}

/**
 * Whether a short link greets its visitor with a page of its own instead of redirecting them straight away
 */
export function hasShortcodeLinkLandingPage(shortcodeLink: ShortcodeLink): boolean {
    return shortcodeLink.landingPage !== null;
}
