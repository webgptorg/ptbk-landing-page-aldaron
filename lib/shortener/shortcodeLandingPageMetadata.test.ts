import {
    createShortcodeLandingPageMetadata,
    extractShortcodeLandingPageMetadata,
} from '@/lib/shortener/shortcodeLandingPageMetadata';
import { describe, expect, it } from 'vitest';

describe('shortcode landing-page metadata', () => {
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
            alternates: { canonical: '/safe-link' },
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
