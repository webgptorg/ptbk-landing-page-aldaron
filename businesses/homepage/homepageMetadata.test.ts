import { describe, expect, it } from 'vitest';
import { HOMEPAGE_METADATA, HOMEPAGE_PAGE_DEFINITIONS, HOMEPAGE_SOCIAL_PREVIEW_OPTIONS } from './homepageMetadata';
import { PRO_FIRMY_METADATA } from '@/businesses/pro-firmy/proFirmyMetadata';
import { resolveSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';

describe('autonomous responsibility homepage metadata', () => {
    it.each(['cs', 'en'] as const)(
        'owns localized positioning and a new card while preserving routes (%s)',
        (language) => {
            const definition = HOMEPAGE_PAGE_DEFINITIONS[language];
            const metadata = HOMEPAGE_METADATA[language];
            expect(metadata.alternates?.canonical).toBe(`https://ptbk.io/${language}`);
            expect(metadata.alternates?.languages).toMatchObject({
                cs: 'https://ptbk.io/cs',
                en: 'https://ptbk.io/en',
            });
            expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(definition);
            expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);
            expect(JSON.stringify(metadata)).not.toMatch(
                /halucin|hallucinat|100%|virtual employee|virtuální zaměstnanec|Instant access|Okamžitý přístup/,
            );
            expect(HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language]).toMatchObject({
                artwork: 'agenda',
                hostname: 'ptbk.io',
                title: definition.socialTitle,
            });
            expect(resolveSocialPreviewImagePath(definition)).toBe(
                `/${language}/opengraph-image?v=2&content=agendas-1`,
            );
        },
    );
    it('keeps the preserved offer and authored previews independent of the homepage revision', () => {
        expect(PRO_FIRMY_METADATA.alternates?.canonical).toBe('https://ptbk.io/cs/pro-firmy');
        expect(JSON.stringify(PRO_FIRMY_METADATA)).toContain('virtuálního zaměstnance');
        expect(JSON.stringify(PRO_FIRMY_METADATA)).not.toContain('agendas-1');
        expect(
            resolveSocialPreviewImagePath({ ...HOMEPAGE_PAGE_DEFINITIONS.en, socialPreviewImagePath: '/authored.png' }),
        ).toBe('/authored.png');
    });
});
