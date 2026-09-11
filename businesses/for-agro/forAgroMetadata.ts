import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const FOR_AGRO_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/for-agro',
    language: 'cs',
    title: 'AI pro agronomii a zemědělské společnosti | Promptbook',
    socialTitle: 'AI pro agronomii a zemědělské společnosti',
    description:
        'Převeďte agronomické know-how, compliance a provozní postupy do AI agentů pro týmy v různých regionech.',
    socialDescription:
        'AI agenti pro agronomické know-how, compliance a provozní postupy v týmech v různých regionech.',
    socialPreviewImageAlt: 'AI pro agronomii a zemědělské společnosti - Promptbook',
    keywords: ['AI pro agronomii', 'zemědělství', 'agronomie', 'zemědělské společnosti', 'compliance', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.9,
};

export const FOR_AGRO_METADATA: Metadata = createPageMetadata(FOR_AGRO_PAGE_DEFINITION);

export const FOR_AGRO_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(FOR_AGRO_PAGE_DEFINITION, {
    eyebrow: 'AI pro zemědělské provozy',
    artwork: 'agriculture',
    paletteSeed: {
        backgroundStart: '#061a10',
        backgroundEnd: '#17452c',
        accent: '#8fffcc',
        accentSoft: '#d9ff7a',
    },
});
