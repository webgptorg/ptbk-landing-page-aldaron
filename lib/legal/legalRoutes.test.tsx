import { describe, expect, it } from 'vitest';
import { LEGAL_DOCUMENT_KINDS, LEGAL_PAGE_PATHS, getLegalKindBySlug } from './legalPagePaths';
import { getLegacyLegalRedirect } from './legalRedirects';
import { localizedPath } from '@/businesses/new/localization';
import { getLegalLinks } from './legalLinks';
import { LEGAL_PAGE_METADATA } from './legalPageMetadata';
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
    it('keeps drafts non-indexed', () => {
        expect(LEGAL_PAGE_METADATA.partnerTerms.cs.robots).toMatchObject({ index: false });
        expect(LEGAL_PAGE_METADATA.jointPrivacy.en.robots).toMatchObject({ index: false });
    });
});
