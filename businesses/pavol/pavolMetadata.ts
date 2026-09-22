import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import type { SocialPreviewPaletteSeed } from '@/lib/metadata/social-preview-palette';
import { createPersonStructuredData, type StructuredDataNode } from '@/lib/metadata/structured-data';
import type { Metadata } from 'next';

/**
 * Name of the person the page is about
 */
const PAVOL_NAME = 'Pavol Hejný';

/**
 * Portrait used in structured data
 */
const PAVOL_IMAGE_PATH = '/people/pavol-hejny-transparent-square.png';

/**
 * Profiles which represent the person elsewhere on the web
 */
const PAVOL_SOCIAL_URLS: readonly string[] = [
    'https://github.com/hejny',
    'https://www.linkedin.com/in/hejny/',
    'https://www.facebook.com/hejny',
    'https://www.youtube.com/@pavolhejny',
];

/**
 * Paths of the personal page in every language it is published in
 */
const PAVOL_LANGUAGE_ALTERNATES: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/cs/pavol',
    en: '/en/pavol',
};

/**
 * Warmer palette which sets the personal page apart from the product pages
 */
const PAVOL_PALETTE_SEED: SocialPreviewPaletteSeed = {
    backgroundStart: '#0c0a14',
    backgroundEnd: '#2f2440',
    accent: '#ffd97a',
    accentSoft: '#7aebff',
};

export const PAVOL_PAGE_DEFINITIONS: Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>> = {
    cs: {
        path: PAVOL_LANGUAGE_ALTERNATES.cs,
        language: 'cs',
        title: 'Pavol Hejný | AI konzultace, vývoj a workshopy',
        socialTitle: 'Pavol Hejný',
        description:
            'Osobní stránka Pavola Hejného. Pomáhá firmám s AI ve vývoji, produktech a interních procesech. Nabízí konzultace, workshopy a přednášky.',
        socialDescription: 'AI konzultace, vývoj a workshopy pro firmy a týmy.',
        socialPreviewImageAlt: 'Pavol Hejný - AI konzultace, vývoj a workshopy',
        keywords: ['Pavol Hejný', 'AI konzultace', 'AI workshopy', 'přednášky', 'vývoj', 'Promptbook'],
        languageAlternates: PAVOL_LANGUAGE_ALTERNATES,
        openGraphType: 'profile',
        isSocialPreviewImageGenerated: true,
        sitemapPriority: 0.8,
    },
    en: {
        path: PAVOL_LANGUAGE_ALTERNATES.en,
        language: 'en',
        title: 'Pavol Hejný | AI consulting, software development, and workshops',
        socialTitle: 'Pavol Hejný',
        description:
            'Pavol Hejný helps companies use AI in development, products, and internal processes through consulting, workshops, and talks.',
        socialDescription: 'AI consulting, software development, and workshops for companies and teams.',
        socialPreviewImageAlt: 'Pavol Hejný - AI consulting, software development, and workshops',
        keywords: ['Pavol Hejný', 'AI consulting', 'AI workshops', 'talks', 'development', 'Promptbook'],
        languageAlternates: PAVOL_LANGUAGE_ALTERNATES,
        openGraphType: 'profile',
        isSocialPreviewImageGenerated: true,
        sitemapPriority: 0.8,
    },
};

export const PAVOL_METADATA: Readonly<Record<SupportedHomepageLanguage, Metadata>> = {
    cs: createPageMetadata(PAVOL_PAGE_DEFINITIONS.cs),
    en: createPageMetadata(PAVOL_PAGE_DEFINITIONS.en),
};

/**
 * Personal branding of the page, which replaces the Promptbook favicon
 */
export const PAVOL_LAYOUT_METADATA: Metadata = {
    icons: {
        icon: [{ url: '/logo/pavol-hejny-ph.svg', type: 'image/svg+xml' }],
        shortcut: ['/logo/pavol-hejny-ph.svg'],
    },
};

export const PAVOL_SOCIAL_PREVIEW_OPTIONS: Readonly<Record<SupportedHomepageLanguage, SocialPreviewImageOptions>> = {
    cs: createSocialPreviewOptions(PAVOL_PAGE_DEFINITIONS.cs, {
        brandLabel: PAVOL_NAME,
        eyebrow: 'AI konzultace, workshopy a vývoj',
        artwork: 'person',
        paletteSeed: PAVOL_PALETTE_SEED,
    }),
    en: createSocialPreviewOptions(PAVOL_PAGE_DEFINITIONS.en, {
        brandLabel: PAVOL_NAME,
        eyebrow: 'AI consulting, workshops, and software development',
        artwork: 'person',
        paletteSeed: PAVOL_PALETTE_SEED,
    }),
};

/**
 * Job title presented to search engines in each language
 */
const PAVOL_JOB_TITLE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'AI konzultant a vývojář',
    en: 'AI consultant and software developer',
};

/**
 * Builds the schema.org description of the person behind the page
 */
export function createPavolStructuredData(language: SupportedHomepageLanguage): StructuredDataNode {
    const definition = PAVOL_PAGE_DEFINITIONS[language];

    return createPersonStructuredData({
        name: PAVOL_NAME,
        jobTitle: PAVOL_JOB_TITLE_BY_LANGUAGE[language],
        description: definition.description,
        path: definition.path,
        imagePath: PAVOL_IMAGE_PATH,
        socialUrls: PAVOL_SOCIAL_URLS,
    });
}
