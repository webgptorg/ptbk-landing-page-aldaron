import { HOMEPAGE_METADATA, HOMEPAGE_PAGE_DEFINITIONS, HOMEPAGE_SOCIAL_PREVIEW_OPTIONS } from './homepageMetadata';
import { PRO_FIRMY_METADATA, PRO_FIRMY_PAGE_DEFINITION } from '@/businesses/pro-firmy/proFirmyMetadata';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { createWebPageStructuredData } from '@/lib/metadata/structured-data';
import { describe, expect, it } from 'vitest';

describe('agenda homepage identity', () => {
    for (const LANGUAGE of ['cs', 'en'] as const) {
        it(`owns localized metadata and structured data in ${LANGUAGE}`, () => {
            const DEFINITION = HOMEPAGE_PAGE_DEFINITIONS[LANGUAGE];
            const METADATA = HOMEPAGE_METADATA[LANGUAGE];
            const URL = `https://ptbk.io/${LANGUAGE}`;
            expect(METADATA.alternates?.canonical).toBe(URL);
            expect(METADATA.alternates?.languages).toMatchObject({
                cs: 'https://ptbk.io/cs',
                en: 'https://ptbk.io/en',
            });
            expect(METADATA.openGraph?.url).toBe(URL);
            expect(METADATA.description).toMatch(/agend/i);
            expect(JSON.stringify(METADATA)).not.toMatch(
                /GDPR|halucinac|hallucinat|virtuální zaměstnanec|virtual employee/i,
            );
            expect(METADATA.twitter?.images).toEqual(METADATA.openGraph?.images);
            expect(HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[LANGUAGE].artwork).toBe('agenda');
            expect(createWebPageStructuredData(DEFINITION)).toMatchObject({
                '@type': 'WebPage',
                url: URL,
                description: DEFINITION.description,
                inLanguage: LANGUAGE === 'cs' ? 'cs-CZ' : 'en-US',
            });
            expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(DEFINITION);
        });
    }

    it('keeps the separate company-document proposition indexed and Czech-only', () => {
        expect(PRO_FIRMY_METADATA.description).toMatch(/dokumenty/);
        expect(PRO_FIRMY_METADATA.alternates?.canonical).toBe('https://ptbk.io/cs/pro-firmy');
        expect(PRO_FIRMY_PAGE_DEFINITION.languageAlternates).toBeUndefined();
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(PRO_FIRMY_PAGE_DEFINITION);
    });
});
