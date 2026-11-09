import { describe, expect, it } from 'vitest';
import { LEGAL_DOCUMENT_KINDS, LEGAL_PAGE_PATHS, getLegalKindBySlug } from './legalPagePaths';
import { getLegacyLegalRedirect } from './legalRedirects';
import { localizedPath } from '@/businesses/new/localization';
import { getLegalLinks } from './legalLinks';
import { LEGAL_PAGE_METADATA } from './legalPageMetadata';
import { legalRouteMetadata, legalRouteParams } from './legalRoute';
import { PROMPTBOOK_ONLINE_TERMS_PATH, PROMPTBOOK_ONLINE_TERMS_VERSION } from './promptbookOnlineTermsVersion';
describe('canonical legal navigation', () => {
    it('maps every document in both directions without losing its identity', () => {
        for (const kind of LEGAL_DOCUMENT_KINDS) for (const language of ['cs', 'en'] as const) {
            const url = LEGAL_PAGE_PATHS[kind][language];
            expect(getLegalKindBySlug(url.split('/').at(-1)!, language)).toBe(kind);
            expect(localizedPath(url, language === 'cs' ? 'en' : 'cs')).toBe(LEGAL_PAGE_PATHS[kind][language === 'cs' ? 'en' : 'cs']);
            expect(getLegalLinks(language).some(link => link.href === url)).toBe(true);
        }
    });
    it('redirects old localized and language-negotiated URLs', () => {
        expect(getLegacyLegalRedirect('/en/podminky-produktu')).toBe('/en/legal/product-terms');
        expect(getLegacyLegalRedirect('/cs/soukromi')).toBe('/cs/legal/ochrana-osobnich-udaju');
        expect(getLegacyLegalRedirect('/privacy', 'en')).toBe('/en/legal/privacy-policy');
        expect(getLegacyLegalRedirect('/en/legal/partner-terms')).toBeNull();
        expect(getLegalKindBySlug('unknown', 'en')).toBeUndefined();
    });
    it('keeps the accepted online terms at their versioned Czech address', () => {
        const parts = ['podminky-produktu', PROMPTBOOK_ONLINE_TERMS_VERSION];
        expect(legalRouteParams('cs')).toContainEqual({ document: parts });
        expect(legalRouteParams('en')).not.toContainEqual({ document: parts });
        expect(legalRouteMetadata(parts, 'cs').alternates?.canonical).toMatch(PROMPTBOOK_ONLINE_TERMS_PATH);
        expect(localizedPath(PROMPTBOOK_ONLINE_TERMS_PATH, 'en')).toBe(LEGAL_PAGE_PATHS.productTerms.en);
    });
    it('publishes current legal documents in both languages', () => {
        for (const kind of LEGAL_DOCUMENT_KINDS) for (const language of ['cs', 'en'] as const) {
            expect(LEGAL_PAGE_METADATA[kind][language].robots).toBeUndefined();
        }
    });
});
