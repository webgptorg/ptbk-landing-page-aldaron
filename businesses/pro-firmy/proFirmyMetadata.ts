import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';
import type { Metadata } from 'next';

/**
 * Note: The page is published in Czech only, so it names no language alternates. `/en` belongs to the main homepage
 *       and holds the agenda proposition, so claiming it here would send readers to a different promise.
 */
export const PRO_FIRMY_PAGE_DEFINITION: PageMetadataDefinition = {
    path: PRO_FIRMY_PATH,
    language: 'cs',
    title: 'Promptbook pro firmy - okamžitý přístup ke všemu, co vaše firma kdy napsala',
    socialTitle: 'Promptbook pro firmy',
    description:
        'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR. Česká AI platforma pro firemní data.',
    socialDescription:
        'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR.',
    socialPreviewImageAlt: 'Promptbook pro firmy - okamžitý přístup ke všemu, co vaše firma kdy napsala',
    keywords: [
        'AI pro firmy',
        'firemní dokumenty',
        'firemní data',
        'virtuální zaměstnanec',
        'GDPR',
        'česká AI',
        'Promptbook',
    ],
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.9,
    sitemapChangeFrequency: 'weekly',
};

export const PRO_FIRMY_METADATA: Metadata = createPageMetadata(PRO_FIRMY_PAGE_DEFINITION);

export const PRO_FIRMY_SOCIAL_PREVIEW_OPTIONS: SocialPreviewImageOptions = createSocialPreviewOptions(
    PRO_FIRMY_PAGE_DEFINITION,
    {
        eyebrow: 'Česká AI platforma pro firemní data',
        artwork: 'knowledge',
        paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    },
);
