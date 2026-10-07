import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import type { SocialPreviewPaletteSeed } from '@/lib/metadata/social-preview-palette';
import type { Metadata } from 'next';

/**
 * Paths of the homepage in every language it is published in
 */
const HOMEPAGE_LANGUAGE_ALTERNATES: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/cs',
    en: '/en',
};

export const HOMEPAGE_PAGE_DEFINITIONS: Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>> = {
    cs: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.cs,
        language: 'cs',
        title: 'Promptbook — Předejte AI agendu, ne každý další úkol',
        socialTitle: 'Předejte AI agendu. Ne každý další úkol.',
        description:
            'Méně zadávání a připomínání. S Promptbookem proberte AI pro průběžnou péči o web, zákaznickou komunikaci či firemní podklady v dohodnutých mezích.',
        socialDescription:
            'Vy určujete směr. Práce má navazovat i bez dalšího pobízení. Vyvíjíme a nasazujeme AI systémy pro konkrétní firemní agendy.',
        socialPreviewImageAlt:
            'Promptbook — předejte AI agendu. Ilustrace průběžné péče o produkt s kontrolou člověka.',
        keywords: ['AI pro firmy', 'autonomní agendy', 'péče o aplikace', 'zákaznická komunikace', 'Promptbook'],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        socialPreviewImageRevision: 'agendas-1',
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
    en: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.en,
        language: 'en',
        title: 'Promptbook — Hand over a responsibility, not another prompt',
        socialTitle: 'Hand over a responsibility. Not another prompt.',
        description:
            'Less assigning and chasing. Explore AI for ongoing application care, customer communication and business documents, with agreed boundaries and human oversight.',
        socialDescription:
            'You set the direction. Work should continue without another reminder. We develop and deploy AI systems for specific business responsibilities.',
        socialPreviewImageAlt:
            'Promptbook — hand over a responsibility. Illustration of ongoing product care with human oversight.',
        keywords: [
            'AI for business',
            'ongoing responsibilities',
            'autonomous agendas',
            'application care',
            'Promptbook',
        ],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        socialPreviewImageRevision: 'agendas-1',
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
};

export const HOMEPAGE_METADATA: Readonly<Record<SupportedHomepageLanguage, Metadata>> = {
    cs: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.cs),
    en: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.en),
};

const HOMEPAGE_SOCIAL_PREVIEW_PALETTE: SocialPreviewPaletteSeed = {
    backgroundStart: '#102b2a',
    backgroundEnd: '#244e42',
    accent: '#b8dec0',
    accentSoft: '#daf1be',
};

export const HOMEPAGE_SOCIAL_PREVIEW_OPTIONS: Readonly<Record<SupportedHomepageLanguage, SocialPreviewImageOptions>> = {
    cs: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.cs, {
        eyebrow: 'Průběžná práce. Váš směr.',
        artwork: 'responsibility',
        paletteSeed: HOMEPAGE_SOCIAL_PREVIEW_PALETTE,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'Ongoing work. Your direction.',
        artwork: 'responsibility',
        paletteSeed: HOMEPAGE_SOCIAL_PREVIEW_PALETTE,
    }),
};
