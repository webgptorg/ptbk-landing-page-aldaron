import { describe, expect, it } from 'vitest';
import {
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

    it.each([
        'https://Example.COM',
        'HTTPS://Example.COM:443/a/../b?ref=%2f%2F&tag=one+two#demo',
        "https://example.com/a(b)?filter=[first]&part=2#chapter's!",
        'https://example.com/příručka?query=%5Bdemo%5D#část',
    ])('trims only line whitespace without reserializing %s', (destination) => {
        const rows = parseWorkshopQuickLinkInput(` \t${destination} \t\r\n`);

        expect(rows).toEqual([{ lineNumber: 1, value: destination, destination, issue: null }]);
    });

    it('appends after the largest actual order, including sparse orders and a batch', () => {
        expect(getWorkshopMaterialAppendSortOrders([], 1)).toEqual([0]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 0 }, { sortOrder: 1 }], 2)).toEqual([11, 21]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 10 }, { sortOrder: 70 }], 3)).toEqual([80, 90, 100]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 99_998 }], 2)).toEqual([99_999, 100_000]);
        expect(getWorkshopMaterialAppendSortOrders([{ sortOrder: 100_000 }], 1)).toBeNull();
    });
});
