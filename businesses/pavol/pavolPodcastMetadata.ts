import { getArticlePodcastUrl } from '@/lib/articles/urls';
import type { Metadata } from 'next';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { PAVOL_PAGE_DEFINITIONS, PAVOL_SOCIAL_PREVIEW_OPTIONS } from './pavolMetadata';

const paths = {
    cs: `${PAVOL_PAGE_DEFINITIONS.cs.path}/podcasts`,
    en: `${PAVOL_PAGE_DEFINITIONS.en.path}/podcasts`,
};

const definitions: Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>> = {
    cs: {
        ...PAVOL_PAGE_DEFINITIONS.cs,
        path: paths.cs,
        title: 'Podcasty | Pavol Hejný',
        socialTitle: 'Podcasty s Pavolem Hejným',
        description: 'Všechny podcastové rozhovory s Pavolem Hejným o AI, vývoji softwaru a vzdělávání. Poslechněte si je přímo na webu.',
        socialDescription: 'Rozhovory o AI, vývoji softwaru a vzdělávání.',
        socialPreviewImageAlt: 'Podcasty s Pavolem Hejným',
        languageAlternates: paths,
        openGraphType: 'website',
    },
    en: {
        ...PAVOL_PAGE_DEFINITIONS.en,
        path: paths.en,
        title: 'Podcasts | Pavol Hejný',
        socialTitle: 'Podcasts with Pavol Hejný',
        description: 'All podcast conversations with Pavol Hejný about AI, software development, and education. Listen directly on the website.',
        socialDescription: 'Conversations about AI, software development, and education.',
        socialPreviewImageAlt: 'Podcasts with Pavol Hejný',
        languageAlternates: paths,
        openGraphType: 'website',
    },
};

export const PAVOL_PODCAST_METADATA: Readonly<Record<SupportedHomepageLanguage, Metadata>> = {
    cs: { ...createPageMetadata(definitions.cs), alternates: { ...createPageMetadata(definitions.cs).alternates, types: { 'application/rss+xml': getArticlePodcastUrl('cs', 'personal') } } },
    en: { ...createPageMetadata(definitions.en), alternates: { ...createPageMetadata(definitions.en).alternates, types: { 'application/rss+xml': getArticlePodcastUrl('en', 'personal') } } },
};

export const PAVOL_PODCAST_SOCIAL_PREVIEW_OPTIONS = {
    cs: { ...PAVOL_SOCIAL_PREVIEW_OPTIONS.cs, alt: definitions.cs.socialPreviewImageAlt!, title: definitions.cs.socialTitle!, description: definitions.cs.socialDescription!, eyebrow: 'Do sluchátek' },
    en: { ...PAVOL_SOCIAL_PREVIEW_OPTIONS.en, alt: definitions.en.socialPreviewImageAlt!, title: definitions.en.socialTitle!, description: definitions.en.socialDescription!, eyebrow: 'For your headphones' },
};
