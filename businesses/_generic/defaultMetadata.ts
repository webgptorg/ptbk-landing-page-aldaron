import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';

/**
 * Definition of the site wide fallback, which is what a page inherits when it does not describe itself
 */
export const DEFAULT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/',
    language: 'en',
    title: 'Promptbook - Create AI that Truly Understands Your Business',
    socialTitle: 'Create AI that truly understands your business',
    description:
        "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    socialDescription:
        "Capture your company's context, rules, and knowledge into simple Books and build AI agents that align perfectly with your business.",
    socialPreviewImageAlt: 'Promptbook - Create AI that truly understands your business',
    isSocialPreviewImageGenerated: true,
    languageAlternates: { cs: '/cs', en: '/en' },
};

/**
 * Sharing preview shown for the brand itself and for every page without an image of its own
 */
export const DEFAULT_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(DEFAULT_PAGE_DEFINITION, {
    eyebrow: 'AI transformation for business',
    artwork: 'knowledge',
    paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
});

/**
 * Definition of the superseded homepage, which is kept reachable but must not compete with `/cs` and `/en` in search
 *
 * @deprecated using new page from Neonmedia
 */
const OLD_HOMEPAGE_PAGE_DEFINITION: PageMetadataDefinition = {
    ...DEFAULT_PAGE_DEFINITION,
    path: '/old',
    isSocialPreviewImageGenerated: false,
    languageAlternates: undefined,
    isIndexed: false,
};

/**
 * @deprecated using new page from Neonmedia
 */
export const OLD_HOMEPAGE_METADATA: Metadata = createPageMetadata(OLD_HOMEPAGE_PAGE_DEFINITION);
