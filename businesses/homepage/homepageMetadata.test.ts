import { DEFAULT_PAGE_DEFINITION, DEFAULT_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/_generic/defaultMetadata';
import { HOMEPAGE_METADATA, HOMEPAGE_PAGE_DEFINITIONS, HOMEPAGE_SOCIAL_PREVIEW_OPTIONS } from './homepageMetadata';
import { PRO_FIRMY_PAGE_DEFINITION } from '@/businesses/pro-firmy/proFirmyMetadata';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { SOCIAL_PREVIEW_IMAGE_VERSION } from '@/lib/metadata/social-preview-image-config';
import {
    createOrganizationStructuredData,
    createWebPageStructuredData,
    createWebSiteStructuredData,
} from '@/lib/metadata/structured-data';
import { describe, expect, it } from 'vitest';

describe('agenda homepage metadata', () => {
    it.each(['cs', 'en'] as const)('keeps %s SEO, sharing and schema aligned on the agenda proposition', (language) => {
        const definition = HOMEPAGE_PAGE_DEFINITIONS[language];
        const metadata = HOMEPAGE_METADATA[language];
        const preview = HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language];
        const schema = createWebPageStructuredData(definition);
        expect(definition.description).toMatch(/agend/i);
        expect(definition.description).not.toMatch(/virtuální zaměstnanec|virtual employee|100% GDPR|hallucination/i);
        expect(metadata.alternates).toMatchObject({
            canonical: `https://ptbk.io/${language}`,
            languages: { cs: 'https://ptbk.io/cs', en: 'https://ptbk.io/en' },
        });
        expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);
        expect(metadata.openGraph?.images).toEqual([
            expect.objectContaining({
                url: `https://ptbk.io/${language}/opengraph-image?v=${SOCIAL_PREVIEW_IMAGE_VERSION}`,
                alt: definition.socialPreviewImageAlt,
            }),
        ]);
        expect(preview).toMatchObject({
            title: definition.socialTitle,
            description: definition.socialDescription,
            artwork: 'agenda',
            hostname: 'ptbk.io',
        });
        expect(schema).toMatchObject({
            url: `https://ptbk.io/${language}`,
            name: definition.title,
            description: definition.description,
            inLanguage: language === 'cs' ? 'cs-CZ' : 'en-US',
        });
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(definition);
    });

    it('updates the site-level proposition while preserving the independent company-data page', () => {
        expect(createOrganizationStructuredData().description).toMatch(/ongoing responsibilities/);
        expect(createWebSiteStructuredData().description).toMatch(/AI agendas/);
        expect(DEFAULT_PAGE_DEFINITION.description).toBe(HOMEPAGE_PAGE_DEFINITIONS.en.description);
        expect(DEFAULT_SOCIAL_PREVIEW_OPTIONS.artwork).toBe('agenda');
        expect(PRO_FIRMY_PAGE_DEFINITION.path).toBe('/cs/pro-firmy');
        expect(PRO_FIRMY_PAGE_DEFINITION.description).toMatch(/firemní dokumenty/i);
        expect(PRO_FIRMY_PAGE_DEFINITION.languageAlternates).toBeUndefined();
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(PRO_FIRMY_PAGE_DEFINITION);
    });
});
