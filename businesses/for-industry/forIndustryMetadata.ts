import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

export const FOR_INDUSTRY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/for-industry',
    language: 'en',
    title: 'AI for industrial companies | Promptbook',
    socialTitle: 'Put your technical knowledge to work',
    description:
        'Turn technical manuals, standard operating procedures, and maintenance know-how into AI agents that help technicians and support staff find reliable answers.',
    socialDescription:
        'Technical manuals, SOPs, and maintenance know-how in AI agents your technicians and support staff can use.',
    socialPreviewImageAlt: 'Promptbook for industrial companies',
    keywords: ['AI for industry', 'manufacturing', 'technical documentation', 'maintenance', 'SOP', 'Promptbook'],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
};

export const FOR_INDUSTRY_METADATA: Metadata = createPageMetadata(FOR_INDUSTRY_PAGE_DEFINITION);

export const FOR_INDUSTRY_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(FOR_INDUSTRY_PAGE_DEFINITION, {
    eyebrow: 'AI for industrial operations',
    artwork: 'industry',
    paletteSeed: {
        backgroundStart: '#12100a',
        backgroundEnd: '#3d3218',
        accent: '#ffd97a',
        accentSoft: '#7aebff',
    },
});
