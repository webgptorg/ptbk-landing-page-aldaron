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

        expect(entries).toHaveLength(primaryDefinitions.length);
        expect(entries.map((entry) => entry.url)).not.toContain('https://ai-ta-krajta.cz/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://pavolhejny.cz/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://pavolhejny.com/');
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/komunita');
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/online-workshop/participant');
    });

    it('does not pretend that every page changed when the site is deployed', () => {
        expect(sitemap().every((entry) => entry.lastModified === undefined)).toBe(true);
    });
});
