import { loadMessageByShortcode } from '@/lib/messages/messageDatabase';
import { createSocialPreviewPalette } from '@/lib/metadata/social-preview-palette';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import {
    createSocialPreviewImage,
    SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE,
    SOCIAL_PREVIEW_IMAGE_SIZE,
} from '@/lib/metadata/social-preview-image';
import { loadPublicShortcodeLink } from '@/lib/shortener/publicShortcodeLink';
import { createShortcodeLandingPageDefinition } from '@/lib/shortener/shortcodeLandingPageMetadata';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getShortcodeLinkRequestHostname } from '@/lib/shortener/shortcodeLinkDomains';

export const dynamic = 'force-dynamic';
export const alt = 'Shared link from Promptbook';
export const contentType = SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE;
export const size = SOCIAL_PREVIEW_IMAGE_SIZE;

/** Read authored public copy without following a destination or recording a click. */
export default async function ShortcodeImage({ params }: { readonly params: Promise<{ readonly shortcode: string }> }) {
    const { shortcode } = await params;
    const link = await loadPublicShortcodeLink(shortcode);
    if (link?.sourceApp === 'messages') {
        const message = await loadMessageByShortcode(shortcode, getShortcodeLinkRequestHostname(await headers()));
        if (!message) notFound();
        return createSocialPreviewImage({
            alt: `${message.title} — rozbalit zprávu`, brandLabel: 'Pavol Hejný', brandKind: 'personal',
            eyebrow: 'ŠIRŠÍ KONTEXT TÉHLE ZPRÁVY', title: message.title,
            description: 'Přečtěte si souvislosti. Zeptejte se. Poslechněte si zprávu.', hostname: `${message.domain}/${message.shortcode}`, artwork: 'message',
            palette: createSocialPreviewPalette({ backgroundStart: '#071c24', backgroundEnd: '#183b45', accent: '#7ae9d7', accentSoft: '#9dd7fa' }),
        }, { 'Cache-Control': 'no-store' });
    }
    if (link === null || link.landingPage === null) {
        notFound();
    }

    return createSocialPreviewImage(
        createSocialPreviewOptions(createShortcodeLandingPageDefinition(shortcode, link.landingPage, getShortcodeLinkRequestHostname(await headers())), {
            eyebrow: 'Shared with Promptbook',
            artwork: 'launch',
        }),
        { 'Cache-Control': 'no-store' },
    );
}
