import { HOMEPAGE_PAGE_DEFINITIONS } from '@/businesses/homepage/homepageMetadata';
import { PRO_FIRMY_PATH } from '@/businesses/pro-firmy/config';
import { PRO_FIRMY_METADATA, PRO_FIRMY_PAGE_DEFINITION } from '@/businesses/pro-firmy/proFirmyMetadata';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { describe, expect, it } from 'vitest';

describe('company-data landing page metadata', () => {
    it('claims its own address rather than the homepage it was preserved from', () => {
        expect(PRO_FIRMY_PATH).toBe('/cs/pro-firmy');
        expect(PRO_FIRMY_METADATA.alternates?.canonical).toBe(createAbsoluteUrl(PRO_FIRMY_PATH));
        expect(PRO_FIRMY_METADATA.openGraph?.url).toBe(createAbsoluteUrl(PRO_FIRMY_PATH));
        expect(PRO_FIRMY_METADATA.alternates?.canonical).not.toBe(createAbsoluteUrl(HOMEPAGE_PAGE_DEFINITIONS.cs.path));
    });

    it('names no language alternate, because the slug is published in Czech only', () => {
        expect(PRO_FIRMY_PAGE_DEFINITION.languageAlternates).toBeUndefined();
        expect(PRO_FIRMY_METADATA.alternates?.languages).toBeUndefined();
    });

    it('is offered to search engines beside the homepage it was preserved from', () => {
        expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(PRO_FIRMY_PAGE_DEFINITION);
        expect(PRO_FIRMY_PAGE_DEFINITION.isIndexed).not.toBe(false);
    });
});
