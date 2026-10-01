import { HOMEPAGE_PATHS } from '@/businesses/homepage/config';
import {
    createHomepageStructuredData,
    HOMEPAGE_METADATA,
    HOMEPAGE_PAGE_DEFINITIONS,
    HOMEPAGE_SOCIAL_PREVIEW_OPTIONS,
} from '@/businesses/homepage/homepageMetadata';
import { PRO_FIRMY_PAGE_DEFINITION, PRO_FIRMY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pro-firmy/proFirmyMetadata';
import { SUPPORTED_HOMEPAGE_LANGUAGES } from '@/lib/homepage-language';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import {
    SOCIAL_PREVIEW_DESCRIPTION_MAXIMUM_LENGTH,
    SOCIAL_PREVIEW_TITLE_MAXIMUM_LENGTH,
} from '@/lib/metadata/social-preview-image-config';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { describe, expect, it } from 'vitest';

/**
 * Words which only describe the company-data proposition preserved at `/cs/pro-firmy`
 *
 * Note: The homepage may not claim any of them any more, in any of the fields a search engine or a social network
 *       reads, because that promise now lives at an address of its own.
 */
const COMPANY_DATA_ONLY_CLAIMS: readonly string[] = [
    'virtuáln',
    'virtual employee',
    'firemní dokumenty',
    'company documents',
    'gdpr',
    'halucinac',
    'hallucination',
];

describe('homepage metadata', () => {
    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('claims its own localized address in %s', (language) => {
        const path = HOMEPAGE_PATHS[language];

        expect(HOMEPAGE_PAGE_DEFINITIONS[language].path).toBe(path);
        expect(HOMEPAGE_METADATA[language].alternates?.canonical).toBe(createAbsoluteUrl(path));
        expect(HOMEPAGE_METADATA[language].openGraph?.url).toBe(createAbsoluteUrl(path));
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('offers every other language of the homepage from %s', (language) => {
        expect(HOMEPAGE_PAGE_DEFINITIONS[language].languageAlternates).toEqual(HOMEPAGE_PATHS);
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('describes the agenda proposition in %s', (language) => {
        const definition = HOMEPAGE_PAGE_DEFINITIONS[language];
        const everythingPublished = [
            definition.title,
            definition.description,
            definition.socialTitle,
            definition.socialDescription,
            definition.socialPreviewImageAlt,
            ...(definition.keywords ?? []),
            HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language].eyebrow,
        ]
            .join(' ')
            .toLowerCase();

        expect(everythingPublished).toContain('agend');

        for (const claim of COMPANY_DATA_ONLY_CLAIMS) {
            expect(everythingPublished).not.toContain(claim);
        }
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('draws the agenda rather than the document card in %s', (language) => {
        expect(HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language].artwork).toBe('agenda');
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('states the whole claim on the card in %s', (language) => {
        // Note: Being shortened by the renderer would end the card mid-sentence, and the card is where the claim is
        //       read before anybody reaches the page.
        const options = HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language];

        expect(options.title.length).toBeLessThanOrEqual(SOCIAL_PREVIEW_TITLE_MAXIMUM_LENGTH);
        expect(options.description.length).toBeLessThanOrEqual(SOCIAL_PREVIEW_DESCRIPTION_MAXIMUM_LENGTH);
    });

    it('leaves the document artwork to the proposition which still makes that claim', () => {
        expect(PRO_FIRMY_SOCIAL_PREVIEW_OPTIONS.artwork).toBe('knowledge');
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('tells search engines what the page itself claims in %s', (language) => {
        const definition = HOMEPAGE_PAGE_DEFINITIONS[language];
        const [webPage] = createHomepageStructuredData(language);

        expect(webPage).toMatchObject({
            '@type': 'WebPage',
            name: definition.title,
            description: definition.description,
            url: createAbsoluteUrl(definition.path),
        });
    });

    it('is listed for search engines beside the proposition it replaced', () => {
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(HOMEPAGE_PAGE_DEFINITIONS.cs);
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(HOMEPAGE_PAGE_DEFINITIONS.en);
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(PRO_FIRMY_PAGE_DEFINITION);
    });
});
