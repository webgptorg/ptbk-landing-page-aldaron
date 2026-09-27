import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const AI_SUPERVIZE_MINI_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/ai-supervize-mini',
    language: 'cs',
    title: 'AI Supervize Mini | Praktický workshop pro jednotlivce',
    socialTitle: 'AI Supervize Mini - praktický workshop',
    description:
        'Jednodenní workshop pro vývojáře a produkťáky v TypeScriptu nebo JavaScriptu. Nástroje, rizika, verzování, testování a kvalita kódu při vývoji s AI. 4. září prezenčně v Praze, 9. září online.',
    socialDescription:
        'Jak zadávat práci AI a dovést ji až do merge, aniž ztratíte přehled o kódu. Praha pro 10 lidí nebo online pro 50.',
    socialPreviewImageAlt: 'AI Supervize Mini - praktický workshop pro vývojáře a produkťáky',
    keywords: ['AI workshop', 'školení AI', 'vývojáři', 'TypeScript', 'JavaScript', 'Praha', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.8,
    sitemapChangeFrequency: 'weekly',
};

export const AI_SUPERVIZE_MINI_METADATA: Metadata = createPageMetadata(AI_SUPERVIZE_MINI_PAGE_DEFINITION);

export const AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(AI_SUPERVIZE_MINI_PAGE_DEFINITION, {
    eyebrow: 'Jednodenní workshop',
    artwork: 'workshop',
    paletteSeed: {
        backgroundStart: '#0a0a1f',
        backgroundEnd: '#2a1f4d',
        accent: '#b48fff',
        accentSoft: '#7aebff',
    },
});

/**
 * Definition of the practical information for people who already registered, which has no place in search results
 */
export const AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/ai-supervize-mini/participant',
    language: 'cs',
    title: 'Informace pro účastníka | AI Supervize Mini',
    socialTitle: 'Vše připraveno na AI Supervizi Mini',
    isSocialPreviewImageGenerated: true,
    description:
        'Čas, místo, harmonogram a příprava pro registrované účastníky jednodenního workshopu AI Supervize Mini.',
    isIndexed: false,
};

export const AI_SUPERVIZE_MINI_PARTICIPANT_METADATA: Metadata = createPageMetadata(
    AI_SUPERVIZE_MINI_PARTICIPANT_PAGE_DEFINITION,
);
