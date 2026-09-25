import { getWorkshopMaterialLinkDestinations, replaceWorkshopMaterialLinkDestinations } from '@/lib/workshops/workshopMaterialLinks';
import { describe, expect, it } from 'vitest';
import {
    createWorkshopQuickLinkMarkdown,
    getWorkshopMaterialAppendSortOrders,
    parseWorkshopQuickLinkInput,
} from './workshopQuickLinkMaterials';

describe('quick workshop link materials', () => {
    it('ignores blanks, identifies bad lines, and deduplicates only identical destinations', () => {
        const rows = parseWorkshopQuickLinkInput([
            '',
            'https://example.com/watch?part=1#intro',
            'https://example.com/watch?part=1#intro',
            'https://example.com/watch?part=2#intro',
            'file:///private',
            'https://user:pass@example.com/watch',
        ].join('\n'));

        expect(rows.map((row) => [row.lineNumber, row.issue, row.destination])).toEqual([
            [2, null, 'https://example.com/watch?part=1#intro'],
            [3, 'duplicate', 'https://example.com/watch?part=1#intro'],
            [4, null, 'https://example.com/watch?part=2#intro'],
            [5, 'invalid', null],
            [6, 'invalid', null],
        ]);
    });

    it('escapes an untrusted title while keeping the complete tracked destination', () => {
        const destination = 'https://example.com/a(b)?campaign=one&part=2#section';
        const markdown = createWorkshopQuickLinkMarkdown('A [guide] \\ to (start)', destination);

        expect(markdown).toBe('[A \\[guide\\] \\\\ to (start)](<https://example.com/a(b)?campaign=one&part=2#section>)');
        expect(getWorkshopMaterialLinkDestinations(markdown)).toEqual([destination]);
        expect(replaceWorkshopMaterialLinkDestinations(markdown, new Map([[destination, 'https://ptbk.io/abc']]))).toContain('https://ptbk.io/abc');
        expect(createWorkshopQuickLinkMarkdown('<img src=x onerror=alert(1)> & guide', destination))
            .toContain('[&lt;img src=x onerror=alert(1)&gt; &amp; guide]');
    });

    it('appends after the largest actual order, including sparse orders and a batch', () => {
        expect(getWorkshopMaterialAppendSortOrders([], 1)).toEqual([0]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 10 }, { sortOrder: 70 }], 3)).toEqual([80, 90, 100]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 99_998 }], 2)).toEqual([99_999, 100_000]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 100_000 }], 1)).toBeNull();
    });
});
