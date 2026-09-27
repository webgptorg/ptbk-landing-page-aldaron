import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { createAbsoluteUrl, SITE_NAME } from '@/lib/metadata/site-config';
import type { SocialPreviewBrandKind } from '@/lib/metadata/social-preview-assets';
import type { SocialPreviewArtworkKind } from '@/lib/metadata/social-preview-artwork';
import type { SocialPreviewImageOptions } from '@/lib/metadata/social-preview-image';
import {
    createSocialPreviewPalette,
    PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
    type SocialPreviewPaletteSeed,
} from '@/lib/metadata/social-preview-palette';

/**
 * Page specific part of a sharing preview image
 *
 * Note: The headline is intentionally missing here - it is taken from the
 *       page definition so that a sharing preview can never drift away from
 *       what the page actually claims. The remaining configuration is visual,
 *       not a second set of marketing copy.
 */
export type SocialPreviewContent = {
    /**
     * Small uppercase line above the headline
     */
    readonly eyebrow: string;

    /**
     * Non-textual visual metaphor matched to what the page is about
     */
    readonly artwork: SocialPreviewArtworkKind;

    /**
     * Colors specific to the page
     */
    readonly paletteSeed: SocialPreviewPaletteSeed;

    /**
     * Brand shown next to its mark, defaults to the page's brand or the site name
     */
    readonly brandLabel?: string;

    /** The local brand mark and, for a personal page, its portrait. */
    readonly brandKind?: SocialPreviewBrandKind;
};

/**
 * Combines a page definition with its page specific artwork into complete sharing preview image options
 *
 * @param definition single source of truth describing the page
 * @param content page specific part of the sharing preview
 */
export function createSocialPreviewOptions(
    definition: PageMetadataDefinition,
    content: Partial<SocialPreviewContent> = {},
): SocialPreviewImageOptions {
    const socialTitle = definition.socialTitle ?? definition.title;

    return {
        alt: definition.socialPreviewImageAlt ?? socialTitle,
        brandLabel: content.brandLabel ?? definition.brand?.name ?? SITE_NAME,
        brandKind: content.brandKind ?? 'promptbook',
        eyebrow:
            content.eyebrow ??
            (definition.language === 'cs' ? 'Informace a užitečné odkazy' : 'Information & resources'),
        title: socialTitle,
        description: definition.socialDescription ?? definition.description,
        hostname: new URL(createAbsoluteUrl(definition.path)).hostname,
        artwork: content.artwork ?? 'knowledge',
        palette: createSocialPreviewPalette(content.paletteSeed ?? PROMPTBOOK_SOCIAL_PREVIEW_PALETTE),
    };
}
