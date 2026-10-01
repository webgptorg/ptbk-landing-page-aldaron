import { HOMEPAGE_PATHS } from '@/businesses/homepage/config';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';
import { createWebPageStructuredData, type StructuredDataNode } from '@/lib/metadata/structured-data';
import type { Metadata } from 'next';

/**
 * Paths of the homepage in every language it is published in
 */
const HOMEPAGE_LANGUAGE_ALTERNATES: Readonly<Record<SupportedHomepageLanguage, string>> = HOMEPAGE_PATHS;

/**
 * What the main homepage claims, in every language it is published in
 *
 * Note: The proposition is the agenda - a bounded area of responsibility which keeps being handled - and not the
 *       company-document question answering the homepage used to describe. That one is preserved at
 *       `/cs/pro-firmy` and keeps its own definition in `businesses/pro-firmy/proFirmyMetadata.ts`.
 */
export const HOMEPAGE_PAGE_DEFINITIONS: Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>> = {
    cs: {
        path: HOMEPAGE_LANGUAGE_ALTERNATES.cs,
        language: 'cs',
        title: 'Promptbook - dejte AI na starost celou agendu, ne jednotlivé prompty',
        socialTitle: 'Dejte AI na starost celou agendu, ne jednotlivé prompty',
        description:
            'Agenda je ohraničená oblast odpovědnosti s vlastním kontextem, cíli, úkoly, agenty a pravidly. Promptbook ji drží v běhu na pozadí a ozve se, když je potřeba rozhodnout.',
        socialDescription:
            'Agenda je ohraničená oblast odpovědnosti s vlastním kontextem, cíli, úkoly a agenty. Promptbook ji drží v běhu na pozadí.',
        socialPreviewImageAlt: 'Promptbook - agenda, která běží na pozadí, místo jednorázových promptů',
        keywords: [
            'AI agenda',
            'dlouhodobě běžící AI agenti',
            'automatizace odpovědností',
            'AI pro firmy',
            'údržba aplikace pomocí AI',
            'kódovací agenti',
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
        title: 'Promptbook - hand AI a whole agenda, not individual prompts',
        socialTitle: 'Hand AI a whole agenda, not individual prompts',
        description:
            'An agenda is a bounded area of responsibility with its own context, goals, tasks, agents and rules. Promptbook keeps it running in the background and comes back to you when something needs deciding.',
        socialDescription:
            'An agenda is a bounded area of responsibility with its own context, goals, tasks and agents. Promptbook keeps it running in the background.',
        socialPreviewImageAlt: 'Promptbook - an agenda running in the background instead of one-shot prompts',
        keywords: [
            'AI agenda',
            'long-running AI agents',
            'ongoing responsibility automation',
            'AI for business',
            'self-maintaining application',
            'coding agents',
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
        eyebrow: 'Agendy, ne jednotlivé prompty',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
    en: createSocialPreviewOptions(HOMEPAGE_PAGE_DEFINITIONS.en, {
        eyebrow: 'Agendas, not individual prompts',
        artwork: 'agenda',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    }),
};

/**
 * Schema.org description of the homepage, read from the very definition which supplies its title and description so
 * that what search engines are told can never drift away from what the page claims
 */
export function createHomepageStructuredData(language: SupportedHomepageLanguage): readonly StructuredDataNode[] {
    return [createWebPageStructuredData(HOMEPAGE_PAGE_DEFINITIONS[language])];
}
