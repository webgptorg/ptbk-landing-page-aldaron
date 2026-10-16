import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';
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
        title: 'Promptbook — Předejte AI agendu. Získejte prostor.',
        socialTitle: 'Předejte AI agendu. Získejte prostor.',
        description:
            'AI pro průběžnou firemní práci: péče o web, komunikace i příprava podkladů. Vy určujete cíl a hranice. Proberte s Promptbookem nasazení ve vaší firmě.',
        socialDescription:
            'Práce, která navazuje v dohodnutých hranicích. Vy držíte směr. Společně probereme vaši agendu a možnosti nasazení.',
        socialPreviewImageAlt: 'Promptbook — průběžná péče o firemní agendy s kontrolou člověka',
        keywords: ['AI pro firmy', 'autonomní agendy', 'průběžná péče o aplikace', 'firemní procesy', 'Promptbook'],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        socialPreviewContentVersion: 'agendas-1',
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
    en: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.en,
        language: 'en',
        title: 'Promptbook — Hand over the routine. Keep the direction.',
        socialTitle: 'Hand over the routine. Keep the direction.',
        description:
            'AI for ongoing business responsibilities: product care, customer communication and document preparation. Discuss deployment with Promptbook.',
        socialDescription:
            'Relevant work continues within agreed boundaries. You set the direction. Let’s discuss your responsibility and deployment options.',
        socialPreviewImageAlt: 'Promptbook — ongoing care for business responsibilities with human oversight',
        keywords: [
            'AI for business',
            'ongoing responsibilities',
            'autonomous agendas',
            'application maintenance',
            'Promptbook',
        ],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        socialPreviewContentVersion: 'agendas-1',
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
};

export const HOMEPAGE_METADATA: Readonly<Record<SupportedHomepageLanguage, Metadata>> = {
    cs: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.cs),
    en: createPageMetadata(HOMEPAGE_PAGE_DEFINITIONS.en),
};

export const HOMEPAGE_SOCIAL_PREVIEW_OPTIONS: Readonly<Record<SupportedHomepageLanguage, SocialPreviewImageOptions>> = {
    cs: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.cs, {
        eyebrow: 'Průběžná práce. Pod vaším vedením.',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'Ongoing work. Under your direction.',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
};
