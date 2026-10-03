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
        title: 'Promptbook – AI agendy, které pracují na pozadí',
        socialTitle: 'Svěřte AI odpovědnost. Práce pokračuje.',
        description:
            'Promptbook mění průběžné odpovědnosti firem a projektů v AI agendy: vlastní kontext, cíle, úkoly, agenti a pravidla. Práce pokračuje na pozadí, člověk drží směr.',
        socialDescription:
            'Jedna agenda propojí kontext, cíle a AI nástroje v práci, která pokračuje na pozadí. Vy určujete pravidla a schvalujete důležitá rozhodnutí.',
        socialPreviewImageAlt:
            'Promptbook – průběžná AI agenda propojuje kontext, úkoly a nástroje s výsledky a lidským rozhodnutím',
        keywords: [
            'AI agendy',
            'průběžná odpovědnost',
            'AI pro firmy',
            'údržba aplikací',
            'práce na pozadí',
            'Promptbook',
        ],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
        sitemapPriority: 1,
        sitemapChangeFrequency: 'weekly',
    },
    en: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.en,
        language: 'en',
        title: 'Promptbook – Ongoing AI agendas for companies and projects',
        socialTitle: 'Give AI a responsibility. Keep work moving.',
        description:
            'Turn ongoing responsibilities into AI agendas with durable context, goals, tasks, agents and rules. Promptbook keeps work moving in the background, with people steering.',
        socialDescription:
            'Context, goals and AI tools become ongoing background work. You set the rules and approve the decisions that need you.',
        socialPreviewImageAlt:
            'Promptbook – an ongoing AI agenda connects context, tasks and tools to outcomes and human decisions',
        keywords: [
            'AI agendas',
            'ongoing responsibility',
            'AI for business',
            'application maintenance',
            'background work',
            'Promptbook',
        ],
        languageAlternates: HOMEPAGE_LANGUAGE_ALTERNATES,
        isSocialPreviewImageGenerated: true,
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
        eyebrow: 'AI agendy pro firmy a projekty',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'AI agendas for companies and projects',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
};
