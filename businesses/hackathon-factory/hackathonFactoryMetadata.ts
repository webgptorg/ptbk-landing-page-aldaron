import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const HACKATHON_FACTORY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/hackathon-factory',
    language: 'cs',
    title: 'Hackathon Factory | Skutečné problémy, použitelné výstupy',
    socialTitle: 'Hackathon Factory',
    description:
        'Hackathon Factory spojuje lidi s konkrétními problémy s developery, kteří během krátkého sprintu připraví prototyp, podklad pro rozhodnutí nebo plán.',
    socialDescription:
        'Krátké hackathon sprinty pro CTO, startupy a vývojáře. Na konci máte prototyp, rozhodnutí nebo plán, který můžete použít hned další den.',
    socialPreviewImageAlt: 'Hackathon Factory - skutečné problémy, použitelné výstupy',
    keywords: ['hackathon', 'prototyp', 'startup', 'CTO', 'vývojáři', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
};

export const HACKATHON_FACTORY_METADATA: Metadata = createPageMetadata(HACKATHON_FACTORY_PAGE_DEFINITION);

export const HACKATHON_FACTORY_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(HACKATHON_FACTORY_PAGE_DEFINITION, {
    eyebrow: 'Skutečné problémy, použitelné výstupy',
    artwork: 'launch',
    paletteSeed: {
        backgroundStart: '#1c0a12',
        backgroundEnd: '#4d1f33',
        accent: '#ff8fb4',
        accentSoft: '#ffd97a',
    },
});
