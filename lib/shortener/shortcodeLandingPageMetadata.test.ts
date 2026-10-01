import { SOCIAL_PREVIEW_IMAGE_VERSION } from '@/lib/metadata/social-preview-image-config';
import {
    createShortcodeLandingPageMetadata,
    extractShortcodeLandingPageMetadata,
} from '@/lib/shortener/shortcodeLandingPageMetadata';
import { describe, expect, it } from 'vitest';

describe('shortcode landing-page metadata', () => {
    it('preserves authored Open Graph copy and image ahead of the document and its decorative images', () => {
        const metadata = createShortcodeLandingPageMetadata('launch', `
            <title>Document title</title>
            <meta name="description" content="Document summary" />
            <meta property="og:title" content="A launch worth sharing" />
            <meta property="og:description" content="Build &amp; share your next project." />
            <meta property="og:image" content="https://example.test/card.jpg?width=1200&amp;height=630" />
            <meta name="twitter:image" content="https://example.test/alternative.jpg" />
            <img src="/decorative-logo.png" />
        `);

        expect(metadata.openGraph).toMatchObject({
            title: 'A launch worth sharing',
            description: 'Build & share your next project.',
            images: [{
                url: 'https://example.test/card.jpg?width=1200&height=630',
                alt: 'A launch worth sharing',
            }],
        });
        expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images);
    });

    it('uses authored X metadata when Open Graph is absent or its image is unsupported', () => {
        expect(extractShortcodeLandingPageMetadata(`
            <meta name="twitter:title" content="Workshop invitation" />
            <meta name="twitter:description" content="Join the workshop." />
            <meta property="og:image" content="javascript:invalid" />
            <meta name="twitter:image" content="/workshop.jpg" />
            <img src="/decorative-logo.png" />
        `)).toEqual({
            title: 'Workshop invitation',
            description: 'Join the workshop.',
            image: '/workshop.jpg',
        });
    });

    it('uses a generated card only when the author has not supplied a preview image', () => {
        const generated = createShortcodeLandingPageMetadata('launch', '# A new project\n\nMeet the project.');
        const authored = createShortcodeLandingPageMetadata(
            'launch',
            '# A new project\n\n![Preview](https://example.test/card.jpg)',
        );

        expect(generated.openGraph?.images).toEqual([
            expect.objectContaining({
                url: `https://ptbk.io/launch/opengraph-image?v=${SOCIAL_PREVIEW_IMAGE_VERSION}`,
                width: 1200,
                height: 630,
                type: 'image/png',
            }),
        ]);
        expect(authored.openGraph?.images).toEqual([{ url: 'https://example.test/card.jpg', alt: 'A new project' }]);
        expect(authored.twitter?.images).toEqual(authored.openGraph?.images);
    });

    it('uses the H1, leading summary, and first safe Markdown image', () => {
        const metadata = extractShortcodeLandingPageMetadata(`
            # AI workshop for product teams

            > Learn a practical workflow for shipping reliable features with AI agents.

            ![Workshop illustration](https://cdn.example.test/workshop.png "Workshop")

            This later paragraph is not the sharing description.
        `);

        expect(metadata).toEqual({
            title: 'AI workshop for product teams',
            description: 'Learn a practical workflow for shipping reliable features with AI agents.',
            image: 'https://cdn.example.test/workshop.png',
        });
    });

    it('uses explicit HTML metadata for a fully custom landing page', () => {
        const metadata = extractShortcodeLandingPageMetadata(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Custom launch page</title>
                    <meta name="description" content="A concise, custom launch summary." />
                </head>
                <body><img src="/launch-card.png" /></body>
            </html>
        `);

        expect(metadata).toEqual({
            title: 'Custom launch page',
            description: 'A concise, custom launch summary.',
            image: '/launch-card.png',
        });
    });

    it('ignores unsupported image protocols and supplies a complete noindex sharing preview', () => {
        const extractedMetadata = extractShortcodeLandingPageMetadata(`
            # Safe link

            A short, useful destination.

            ![Unsafe](javascript:alert('no'))
        `);
        const metadata = createShortcodeLandingPageMetadata('safe-link', '# Safe link\n\nA short, useful destination.');

        expect(extractedMetadata.image).toBeNull();
        expect(metadata).toMatchObject({
            title: 'Safe link | Promptbook',
            description: 'A short, useful destination.',
            alternates: { canonical: 'https://ptbk.io/safe-link' },
            robots: { index: false, follow: false },
            openGraph: {
                title: 'Safe link',
                url: 'https://ptbk.io/safe-link',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Safe link',
            },
        });
    });
});
