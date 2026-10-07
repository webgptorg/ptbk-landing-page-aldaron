import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH } from '@/lib/metadata/site-config';
import { SOCIAL_PREVIEW_IMAGE_VERSION } from '@/lib/metadata/social-preview-image-config';

/** A fixed design version never carries a visitor's query-string identity into an image URL. */
export function createGeneratedSocialPreviewImagePath(pagePath = '/', revision?: string): string {
    const pathname = pagePath.split(/[?#]/)[0]!.replace(/\/$/, '');
    return `${pathname}${DEFAULT_SOCIAL_PREVIEW_IMAGE_PATH}?v=${SOCIAL_PREVIEW_IMAGE_VERSION}${revision ? `-${encodeURIComponent(revision)}` : ''}`;
}

/**
 * Resolves the sharing preview image of a page from the same definition that
 * supplies its title, canonical URL, and Open Graph metadata.
 *
 * A page with its own `opengraph-image` route keeps that image next to its
 * route. Pages without one deliberately share the stable site-wide card.
 */
export function resolveSocialPreviewImagePath(definition: PageMetadataDefinition): string {
    if (definition.socialPreviewImagePath) {
        return definition.socialPreviewImagePath;
    }

    return createGeneratedSocialPreviewImagePath(
        definition.isSocialPreviewImageGenerated ? definition.path : '/',
        definition.isSocialPreviewImageGenerated ? definition.socialPreviewImageRevision : undefined,
    );
}
