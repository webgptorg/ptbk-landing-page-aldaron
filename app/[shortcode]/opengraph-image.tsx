import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import {
    createSocialPreviewImage,
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
} from '@/lib/metadata/social-preview-image';
import { loadPublicShortcodeLink } from '@/lib/shortener/publicShortcodeLink';
import { createShortcodeLandingPageDefinition } from '@/lib/shortener/shortcodeLandingPageMetadata';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const alt = 'Shared link from Promptbook';
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;

/** Read authored public copy without following a destination or recording a click. */
export default async function ShortcodeImage({ params }: { readonly params: Promise<{ readonly shortcode: string }> }) {
    const { shortcode } = await params;
    const link = await loadPublicShortcodeLink(shortcode);
    if (link === null || link.landingPage === null) {
        notFound();
    }

    return createSocialPreviewImage(
        createSocialPreviewOptions(createShortcodeLandingPageDefinition(shortcode, link.landingPage), {
            eyebrow: 'Shared with Promptbook',
            artwork: 'launch',
        }),
        { 'Cache-Control': 'no-store' },
    );
}
