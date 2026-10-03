import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { HOMEPAGE_PAGE_DEFINITIONS } from '@/businesses/homepage/homepageMetadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';

/**
 * Definition of the site wide fallback, which is what a page inherits when it does not describe itself
 */
export const DEFAULT_PAGE_DEFINITION: PageMetadataDefinition = {
    ...HOMEPAGE_PAGE_DEFINITIONS.en,
    path: '/',
};

/**
 * Sharing preview shown for the brand itself and for every page without an image of its own
 */
export const DEFAULT_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(DEFAULT_PAGE_DEFINITION, {
    eyebrow: 'AI agendas for companies and projects',
    artwork: 'agenda',
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
