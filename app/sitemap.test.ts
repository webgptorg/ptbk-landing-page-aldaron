import { getAllArticles } from '@/lib/articles/load';
import sitemap from '@/app/sitemap';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { PRIMARY_SITE_URL, createPublicUrl } from '@/lib/domains/publicDomainRouting';
import { describe, expect, it } from 'vitest';

describe('sitemap', () => {
    it('contains every and only indexable Promptbook page definition', () => {
        const entries = sitemap();
        const primaryDefinitions = INDEXED_PAGE_METADATA_DEFINITIONS.filter(
            (definition) => new URL(createPublicUrl(definition.path)).origin === PRIMARY_SITE_URL,
        );

        const urls = entries.map(entry => entry.url);
        expect(new Set(urls).size).toBe(urls.length);
        for (const definition of primaryDefinitions) expect(urls).toContain(createPublicUrl(definition.path));
        for (const path of ['/cs', '/en', '/cs/cenik', '/en/cenik', '/cs/agendy/email', '/en/srovnani/chatgpt']) {
            const entry = entries.find(entry => entry.url === `https://ptbk.io${path}`);
            expect(entry).toBeDefined();
            expect(entry?.alternates?.languages).toHaveProperty('cs');
            expect(entry?.alternates?.languages).toHaveProperty('en');
        }
        expect(urls.some(url => new URL(url).pathname.startsWith('/new'))).toBe(false);
        expect(entries.map((entry) => entry.url)).not.toContain('https://ai-ta-krajta.cz/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://pavolhejny.cz/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://pavolhejny.com/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/komunita');
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/online-workshop/participant');
    });

    it('does not pretend that every page changed when the site is deployed', () => {
        expect(sitemap().filter((entry) => !entry.url.includes('/articles/')).every((entry) => entry.lastModified === undefined)).toBe(true);
        for (const article of getAllArticles()) {
            expect(sitemap().find((entry) => entry.url.endsWith(`/articles/${article.slug}`))?.lastModified).toBe(article.updatedAt ?? article.publishedAt);
        }
    });
});
