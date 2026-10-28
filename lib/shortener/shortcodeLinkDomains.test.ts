import { describe, expect, it } from 'vitest';
import { createPublicShortcodeLinkUrl } from './shortcodeLink';
import { isShortcodeLinkAvailableOnHostname, SHORTCODE_LINK_DOMAINS } from './shortcodeLinkDomains';
import { SHORTCODE_LINK_VALUES_SCHEMA } from './shortcodeLinkSchema';
import { createShortcodeLinkDatabaseValues, createShortcodeLinkInsertValues } from './shortcodeLinkDatabase';
import { createShortcodeLandingPageMetadata } from './shortcodeLandingPageMetadata';

describe('short-link domain scopes', () => {
    it('keeps legacy and new default links available on every public host and future aliases', () => {
        for (const domain of [...SHORTCODE_LINK_DOMAINS, 'www.pavolhejny.cz', 'future.example']) {
            expect(isShortcodeLinkAvailableOnHostname(null, domain)).toBe(true);
            expect(isShortcodeLinkAvailableOnHostname(undefined, domain)).toBe(true);
        }
    });
    it('enforces subsets including www, case, DNS dots and the existing Promptbook alias', () => {
        expect(isShortcodeLinkAvailableOnHostname(['pavolhejny.cz'], 'WWW.PAVOLHEJNY.CZ.:443')).toBe(true);
        expect(isShortcodeLinkAvailableOnHostname(['ptbk.io'], 'new.ptbk.io')).toBe(true);
        for (const domain of ['ptbk.io', 'pavolhejny.com', 'pavolhejny.cz.attacker.example']) {
            expect(isShortcodeLinkAvailableOnHostname(['pavolhejny.cz'], domain)).toBe(false);
        }
        expect(isShortcodeLinkAvailableOnHostname([], 'ptbk.io')).toBe(false);
    });
    it('validates subsets and never turns an omitted legacy PATCH field into all-domain access', () => {
        const values = { shortcode: 'abc-123', urls: ['https://example.com'], note: null, landingPage: null };
        for (const domains of [null, ['ptbk.io'], ['pavolhejny.cz', 'pavolhejny.com']]) {
            expect(SHORTCODE_LINK_VALUES_SCHEMA.safeParse({ ...values, domains }).success).toBe(true);
        }
        for (const domains of [[], ['evil.example'], ['ptbk.io', 'ptbk.io'], [null], 'ptbk.io', ['www.ptbk.io']]) {
            expect(SHORTCODE_LINK_VALUES_SCHEMA.safeParse({ ...values, domains }).success).toBe(false);
        }
        const parsed = SHORTCODE_LINK_VALUES_SCHEMA.parse(values);
        expect(createShortcodeLinkDatabaseValues(parsed)).not.toHaveProperty('domains');
        expect(createShortcodeLinkInsertValues(parsed)).toHaveProperty('domains', null);
        expect(createShortcodeLinkDatabaseValues({ ...values, domains: null })).toHaveProperty('domains', null);
    });
    it('uses an enabled domain in copied links and sharing metadata', () => {
        expect(createPublicShortcodeLinkUrl('abc')).toBe('https://ptbk.io/abc');
        expect(createPublicShortcodeLinkUrl('abc', ['pavolhejny.cz'])).toBe('https://pavolhejny.cz/abc');
        const metadata = createShortcodeLandingPageMetadata('abc', '# Hello', 'www.pavolhejny.cz');
        expect(metadata.alternates?.canonical).toBe('https://pavolhejny.cz/abc');
        expect(JSON.stringify(metadata.openGraph)).toContain('https://pavolhejny.cz/abc/opengraph-image');
    });
});
