import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';
import { describe, expect, it } from 'vitest';

describe('getLanguageFromPathname', () => {
    it('agrees with every page about the language that page is written in', () => {
        const disagreements = INDEXED_PAGE_METADATA_DEFINITIONS.filter(
            (definition) => getLanguageFromPathname(definition.path) !== definition.language,
        ).map((definition) => definition.path);

        expect(disagreements).toEqual([]);
    });

    it('resolves the pages nested under a Czech page as Czech', () => {
        expect(getLanguageFromPathname('/cs/online-workshop/participant')).toBe('cs');
        expect(getLanguageFromPathname('/ai-supervize-mini/participant')).toBe('cs');
    });

    it('does not mistake a longer path for the Czech page it starts with', () => {
        expect(getLanguageFromPathname('/csillag')).toBe('en');
        expect(getLanguageFromPathname('/for-agronomy')).toBe('en');
    });

    it('ignores a trailing slash and the letter case', () => {
        expect(getLanguageFromPathname('/pro-mesta/')).toBe('cs');
        expect(getLanguageFromPathname('/Pro-Mesta')).toBe('cs');
    });

    it('falls back to the language of the site when the page is unknown or not known yet', () => {
        expect(getLanguageFromPathname('/branding')).toBe('en');
        expect(getLanguageFromPathname('/')).toBe('en');
        expect(getLanguageFromPathname(null)).toBe('en');
    });
});
