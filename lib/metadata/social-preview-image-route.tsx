import {
    createSocialPreviewImage,
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
    type SocialPreviewImageOptions,
} from '@/lib/metadata/social-preview-image';
import { createSocialPreviewOptions, type SocialPreviewContent } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';

/**
 * Exports expected by the Next.js `opengraph-image` file convention
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
type SocialPreviewImageRoute = {
    readonly alt: string;
    readonly size: typeof SOCIAL_PREVIEW_IMAGE_SIZE;
    readonly contentType: typeof SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
    readonly renderSocialPreviewImage: () => ReturnType<typeof createSocialPreviewImage>;
};

/**
 * Builds every export an `opengraph-image` route needs, so a route file only has to pick its preview options
 *
 * @param options content and colors of the card
 */
export function createSocialPreviewImageRoute(options: SocialPreviewImageOptions): SocialPreviewImageRoute {
    return {
        alt: options.alt,
        size: SOCIAL_PREVIEW_IMAGE_SIZE,
        contentType: SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
        renderSocialPreviewImage: () => createSocialPreviewImage(options),
    };
}

/** Supporting pages reuse their metadata copy and can choose a visual without duplicating an image template. */
export function createPageSocialPreviewImageRoute(
    definition: PageMetadataDefinition,
    content?: Partial<SocialPreviewContent>,
): SocialPreviewImageRoute {
    return createSocialPreviewImageRoute(createSocialPreviewOptions(definition, content));
}
