import {
    ONLINE_WORKSHOP_PARTICIPANT_PATH,
    ONLINE_WORKSHOP_PATH,
    ONLINE_WORKSHOP_THANK_YOU_PATH,
} from '@/businesses/online-workshop/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { resolveSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';
import {
    createOnlineEventStructuredData,
    createWebPageStructuredData,
    type StructuredDataNode,
} from '@/lib/metadata/structured-data';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import type { Metadata } from 'next';

export const ONLINE_WORKSHOP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_PATH,
    language: 'cs',
    title: 'Promptbook | Online workshop zdarma',
    socialTitle: 'Online workshop zdarma',
    description:
        'Jak s AI agenty psát produkční kód a nepřepisovat po nich všechno. 60minutový online workshop naživo pro tech leady, CTO a vývojáře, kteří už používají Claude Code, Cursor, Copilot nebo Codex.',
    socialDescription:
        'Naživo uvidíš, kde se AI agenti lámou na reálných projektech a jak z nich dostat produkční kód. Zdarma, 60 minut + Q&A.',
    socialPreviewImageAlt: 'Online workshop zdarma - Promptbook',
    keywords: ['online workshop', 'AI agenti', 'produkční kód', 'Claude Code', 'Cursor', 'Copilot', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.8,
    sitemapChangeFrequency: 'weekly',
};

/**
 * Note: The page confirms a registration which already happened, it has nothing to offer to a visitor arriving from
 *       search, so it stays out of the search results and out of the sitemap.
 */
export const ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_THANK_YOU_PATH,
    language: 'cs',
    title: 'Promptbook | Registrace na online workshop potvrzena',
    socialTitle: 'Registrace na online workshop potvrzena',
    isSocialPreviewImageGenerated: true,
    description: 'Potvrzení registrace na bezplatný online workshop o psaní produkčního kódu s AI agenty.',
    isIndexed: false,
};

export const ONLINE_WORKSHOP_PARTICIPANT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ONLINE_WORKSHOP_PARTICIPANT_PATH,
    language: 'cs',
    title: 'Živý online workshop | Promptbook',
    socialTitle: 'Živý online workshop Promptbooku',
    description: 'Soukromá místnost účastníků online workshopu o produkčním vývoji s AI agenty.',
    socialDescription: 'Připojte se do živé místnosti workshopu Promptbooku.',
    socialPreviewImageAlt: 'Živý online workshop Promptbooku',
    isSocialPreviewImageGenerated: true,
    isIndexed: false,
};

export const ONLINE_WORKSHOP_METADATA: Metadata = createPageMetadata(ONLINE_WORKSHOP_PAGE_DEFINITION);

export const ONLINE_WORKSHOP_THANK_YOU_METADATA: Metadata = createPageMetadata(
    ONLINE_WORKSHOP_THANK_YOU_PAGE_DEFINITION,
);

export const ONLINE_WORKSHOP_PARTICIPANT_METADATA: Metadata = {
    ...createPageMetadata(ONLINE_WORKSHOP_PARTICIPANT_PAGE_DEFINITION),
    // YouTube requires a referrer for its embedded player. This policy reveals
    // only this site's origin to YouTube, never the participant query string.
    referrer: 'strict-origin-when-cross-origin',
};

export const ONLINE_WORKSHOP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(ONLINE_WORKSHOP_PAGE_DEFINITION, {
    eyebrow: 'Online workshop naživo',
    artwork: 'workshop',
    paletteSeed: {
        backgroundStart: '#04131c',
        backgroundEnd: '#123847',
        accent: '#7aebff',
        accentSoft: '#b48fff',
    },
});

/**
 * Preview kept intentionally generic: participant URLs can contain personal
 * data, so a social crawler must never receive a name, e-mail address, or a
 * term-specific room URL from the card it caches.
 */
export const ONLINE_WORKSHOP_PARTICIPANT_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(
    ONLINE_WORKSHOP_PARTICIPANT_PAGE_DEFINITION,
    {
        eyebrow: 'Online workshop naživo',
        artwork: 'workshop',
        paletteSeed: {
            backgroundStart: '#04131c',
            backgroundEnd: '#123847',
            accent: '#7aebff',
            accentSoft: '#b48fff',
        },
    },
);

/**
 * Builds the page and event JSON-LD from the current public schedule.
 *
 * Every event points at the public registration page. The participant room is
 * deliberately not a Schema.org URL because its query parameters may identify
 * a registrant and its content is not meant for search engines.
 */
export function createOnlineWorkshopStructuredData(workshops: readonly WorkshopSummary[]): readonly StructuredDataNode[] {
    const eventDescription = ONLINE_WORKSHOP_PAGE_DEFINITION.socialDescription ?? ONLINE_WORKSHOP_PAGE_DEFINITION.description;
    const imagePath = resolveSocialPreviewImagePath(ONLINE_WORKSHOP_PAGE_DEFINITION);

    return [
        createWebPageStructuredData(ONLINE_WORKSHOP_PAGE_DEFINITION),
        ...workshops.map((workshop) =>
            createOnlineEventStructuredData({
                id: workshop.slug,
                name: workshop.title,
                description: eventDescription,
                path: ONLINE_WORKSHOP_PAGE_DEFINITION.path,
                imagePath,
                language: ONLINE_WORKSHOP_PAGE_DEFINITION.language,
                startsAt: workshop.startsAt,
                endsAt: workshop.endsAt,
                price: '0',
                priceCurrency: 'CZK',
            }),
        ),
    ];
}
