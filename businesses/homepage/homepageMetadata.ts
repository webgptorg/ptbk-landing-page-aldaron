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
        title: 'Promptbook – Svěřte AI agendu. Ať práce pokračuje.',
        socialTitle: 'Svěřte AI agendu. Ať práce pokračuje.',
        description:
            'Promptbook mění jednotlivé AI úkoly v dlouhodobé agendy pro firmy a projekty. Kontext, cíle, agenti a nástroje pro práci na pozadí, s vaším dohledem.',
        socialDescription:
            'Od jednorázového úkolu k průběžné péči o web, aplikaci nebo firemní agendu. Vy určujete směr. Práce pokračuje.',
        socialPreviewImageAlt: 'Promptbook – AI agendy: kontext, úkoly a nástroje v průběžném pracovním cyklu',
        keywords: [
            'AI agendy',
            'AI pro firmy',
            'práce na pozadí',
            'údržba aplikací',
            'dlouhodobá odpovědnost',
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
        title: 'Promptbook – Give AI a responsibility. Let the work continue.',
        socialTitle: 'Give AI a responsibility. Let the work continue.',
        description:
            'Promptbook turns individual AI tasks into ongoing agendas for companies and projects. Context, goals, agents and tools for background work with human oversight.',
        socialDescription:
            'From a one-shot task to ongoing care for your application, website or business agenda. You set the direction. The work continues.',
        socialPreviewImageAlt: 'Promptbook – AI agendas: context, tasks and tools in a continuous work cycle',
        keywords: [
            'AI agendas',
            'AI for business',
            'background work',
            'application maintenance',
            'ongoing responsibilities',
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
        eyebrow: 'AI pro dlouhodobé agendy',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'AI for ongoing responsibilities',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
};
