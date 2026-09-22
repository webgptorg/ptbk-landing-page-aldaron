import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { describe, expect, it } from 'vitest';

const TRANSLATED_PAGE: PageMetadataDefinition = {
    path: '/cs/example',
    language: 'cs',
    title: 'Ukázková stránka | Promptbook',
    description: 'Ukázkový popis stránky.',
    languageAlternates: {
        cs: '/cs/example',
        en: '/en/example',
    },
    isSocialPreviewImageGenerated: true,
};

describe('createPageMetadata', () => {
    it('keeps language alternates aligned between SEO and Open Graph', () => {
        const metadata = createPageMetadata(TRANSLATED_PAGE);

        expect(metadata.alternates).toMatchObject({
            canonical: '/cs/example',
            languages: {
                cs: '/cs/example',
                en: '/en/example',
                'x-default': '/en/example',
            },
        });
        expect(metadata.openGraph).toMatchObject({
            locale: 'cs_CZ',
            alternateLocale: ['en_US'],
            url: 'https://ptbk.io/cs/example',
            images: [
                {
                    url: '/cs/example/opengraph-image',
                    width: 1200,
                    height: 630,
                },
            ],
        });
    });

    it('does not claim made-up dimensions for a third-party image', () => {
        const metadata = createPageMetadata({
            ...TRANSLATED_PAGE,
            socialPreviewImagePath: 'https://cdn.example.test/card.png',
        });

        expect(metadata.openGraph).toMatchObject({
            images: [{ url: 'https://cdn.example.test/card.png' }],
        });

        const images = metadata.openGraph?.images;
        const firstImage = Array.isArray(images) ? images[0] : images;

        expect((firstImage as { width?: number }).width).toBeUndefined();
    });

    it('uses private crawler directives for pages with sensitive query-string conventions', () => {
        const metadata = createPageMetadata({ ...TRANSLATED_PAGE, isIndexed: false });

        expect(metadata.robots).toMatchObject({
            index: false,
            follow: false,
            noarchive: true,
            nosnippet: true,
            noimageindex: true,
            googleBot: {
                index: false,
                follow: false,
                noarchive: true,
                nosnippet: true,
                noimageindex: true,
            },
        });
    });

    it('lets an independently branded page replace the site identity everywhere a sharing card reads it', () => {
        const metadata = createPageMetadata({
            ...TRANSLATED_PAGE,
            brand: {
                name: 'Ukázková značka 🐍',
                socialHandle: '@ukazka',
            },
        });

        expect(metadata).toMatchObject({
            applicationName: 'Ukázková značka 🐍',
            authors: [{ name: 'Ukázková značka 🐍', url: 'https://ptbk.io/cs/example' }],
            creator: 'Ukázková značka 🐍',
            publisher: 'Ukázková značka 🐍',
            openGraph: { siteName: 'Ukázková značka 🐍' },
            twitter: { site: '@ukazka', creator: '@ukazka' },
        });
    });
});
