import sitemap from '@/app/sitemap';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { describe, expect, it } from 'vitest';

describe('sitemap', () => {
    it('contains every and only indexable page definition', () => {
        const entries = sitemap();

        expect(entries).toHaveLength(INDEXED_PAGE_METADATA_DEFINITIONS.length);
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/komunita');
        expect(entries.map((entry) => entry.url)).not.toContain('https://ptbk.io/cs/online-workshop/participant');
    });

    it('does not pretend that every page changed when the site is deployed', () => {
        expect(sitemap().every((entry) => entry.lastModified === undefined)).toBe(true);
    });
});
