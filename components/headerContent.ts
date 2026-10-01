import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Copy of the site header which every public page shares unless it passes its own
 *
 * Note: This lives beside the `Header` which falls back to it, not with any one landing page. The header is worn by
 *       the homepage, by the specialized landing pages and by the supporting pages alike, so no single business may
 *       own the words it shows by default.
 */
type HeaderContent = {
    /**
     * Words opening the scarcity note shown in the middle of the header
     */
    fomoBefore: string;

    /**
     * Emphasized part of the scarcity note
     */
    fomoStrong: string;

    /**
     * Words closing the scarcity note
     */
    fomoAfter: string;

    /**
     * Label of the primary call to action on a phone, where the full label does not fit
     */
    ctaMobile: string;

    /**
     * Label of the primary call to action from a tablet upwards
     */
    ctaDesktop: string;
};

const HEADER_CONTENT = {
    cs: {
        fomoBefore: 'Zbývá',
        fomoStrong: '7 míst z 10',
        fomoAfter: 'pro strategický hovor zdarma',
        ctaMobile: 'Chci hovor zdarma',
        ctaDesktop: 'Zarezervovat hovor zdarma',
    },
    en: {
        fomoBefore: 'Only',
        fomoStrong: '7 of 10 spots',
        fomoAfter: 'left for a free strategy call',
        ctaMobile: 'Free call',
        ctaDesktop: 'Book a free call',
    },
} satisfies Record<SupportedHomepageLanguage, HeaderContent>;

export function getHeaderContent(language: SupportedHomepageLanguage = 'cs'): HeaderContent {
    return HEADER_CONTENT[language];
}
