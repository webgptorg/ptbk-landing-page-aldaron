import { createHash } from 'node:crypto';
import { Fragment, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LEGAL_DOCUMENT_KINDS, LEGAL_PAGE_PATHS, getLegalKindBySlug } from './legalPagePaths';
import { getLegacyLegalRedirect } from './legalRedirects';
import { localizedPath } from '@/businesses/new/localization';
import { getLegalLinks } from './legalLinks';
import { LEGAL_PAGE_METADATA } from './legalPageMetadata';
import { legalRouteMetadata, legalRouteParams } from './legalRoute';
import { PROMPTBOOK_ONLINE_TERMS_PATH, PROMPTBOOK_ONLINE_TERMS_VERSION, PROMPTBOOK_ONLINE_TERMS_V1_VERSION, PROMPTBOOK_ONLINE_TERMS_VERSIONS, getPromptbookOnlineTermsPath } from './promptbookOnlineTermsVersion';
import { getPromptbookOnlineTermsDocument } from './promptbookOnlineTermsDocument';
import { LEGAL_PAGE_DEFINITION_LIST } from './legalPageMetadata';
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


describe('accepted online agreements', () => {
    it('keeps each published edition at its own canonical URL and in the sitemap', () => {
        for (const version of PROMPTBOOK_ONLINE_TERMS_VERSIONS) {
            const path = getPromptbookOnlineTermsPath(version)!;
            const parts = ['podminky-produktu', version];
            expect(legalRouteParams('cs')).toContainEqual({ document: parts });
            expect(legalRouteParams('en')).not.toContainEqual({ document: parts });
            expect(legalRouteMetadata(parts, 'cs').alternates?.canonical).toMatch(path);
            expect(LEGAL_PAGE_DEFINITION_LIST.some(definition => definition.path === path)).toBe(true);
            expect(localizedPath(path, 'en')).toBe(LEGAL_PAGE_PATHS.productTerms.en);
        }
    });

    it('preserves the complete originally published v1 wording for existing customers', () => {
        const document = getPromptbookOnlineTermsDocument(PROMPTBOOK_ONLINE_TERMS_V1_VERSION)!;
        const markup = (node: React.ReactNode) => renderToStaticMarkup(createElement(Fragment, null, node));
        const published = {
            title: document.title,
            publication: document.publication,
            perex: markup(document.perex),
            sections: document.sections.map(section => ({
                heading: section.heading,
                paragraphs: section.paragraphs?.map(markup),
                bullets: section.bullets?.map(markup),
            })),
        };
        // Generated from the v1 body before adding the consumer edition; do not update for new agreements.
        expect(createHash('sha256').update(JSON.stringify(published)).digest('hex')).toBe('153e8b12e96f3a91ae7d028991bf6550bc1a5bf3d66cf128a1341ccce2a6231f');
    });

    it('applies consumer withdrawal and the full refund to v2 without rewriting v1', () => {
        const old = getPromptbookOnlineTermsDocument(PROMPTBOOK_ONLINE_TERMS_V1_VERSION)!;
        const current = getPromptbookOnlineTermsDocument(PROMPTBOOK_ONLINE_TERMS_VERSION)!;
        const text = current.sections.flatMap(section => section.paragraphs ?? []).join(' ');
        expect(current.publication?.date).toBe('2026-11-11');
        expect(current.perex).toContain('spotřebitele');
        expect(old.perex).toContain('podnikatelů');
        expect(text).toContain('neznamená ztrátu práva odstoupit');
        expect(text).toContain('celou přijatou cenu bez poměrné srážky');
        expect(text).toContain('nejpozději do 14 dnů');
        expect(text).toContain('stejným způsobem');
        expect(text).toContain('budoucí obnovování');
        expect(current.sections.some(section => section.heading === 'Vzor odstoupení od smlouvy')).toBe(true);
    });

    it('does not substitute current wording for an unrecognised agreement', () => {
        expect(getPromptbookOnlineTermsDocument('2099-01-01-online-v99')).toBeNull();
        expect(getPromptbookOnlineTermsPath('2099-01-01-online-v99')).toBeNull();
        expect(legalRouteMetadata(['podminky-produktu', '2099-01-01-online-v99'], 'cs')).toEqual({});
    });
});
