import { describe, expect, it, vi } from 'vitest';
import { createInkDrawing, freshInkSeed } from './heroInk';

describe('procedural hero ink', () => {
    it('can reproduce a drawing for SSR, hydration and visual review', () => {
        expect(createInkDrawing(314159)).toEqual(createInkDrawing(314159));
    });

    it('keeps different drawings finite, distinct and inside the reserved SVG', () => {
        const outlines = new Set<string>();
        for (let seed = 0; seed < 512; seed++) {
            const drawing = createInkDrawing(seed);
            expect(drawing.strokes).toHaveLength(2);
            outlines.add(drawing.strokes.map(stroke => stroke.outline).join('|'));
            for (const stroke of drawing.strokes) {
                expect(stroke.outline.endsWith('Z')).toBe(true);
                expect(stroke.outline).not.toMatch(/NaN|Infinity/);
                const coords = stroke.outline.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
                for (let i = 0; i < coords.length; i++) {
                    expect(coords[i]).toBeGreaterThanOrEqual(0);
                    expect(coords[i]).toBeLessThanOrEqual(i % 2 ? 40 : 160);
                }
            }
            const [primary, secondary] = drawing.strokes;
            expect(secondary.delay).toBeGreaterThan(primary.duration);
            expect(secondary.delay + secondary.duration).toBeLessThan(1400);
        }
        expect(outlines.size).toBe(512);
    });

    it('draws the full stroke forwards and its shorter return backwards', () => {
        const [primary, secondary] = createInkDrawing(32).strokes;
        const coordinates = (path: string) => path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        const a = coordinates(primary.spine), b = coordinates(secondary.spine);
        expect(a[0]).toBeLessThan(a.at(-2)!);
        expect(b[0]).toBeGreaterThan(b.at(-2)!);
        expect(Math.abs(b.at(-2)! - b[0])).toBeLessThan(a.at(-2)! - a[0]);
        expect(secondary.maskWidth).toBeLessThan(primary.maskWidth);
    });

    it('does not repeat the previous drawing when the random source repeats', () => {
        const random = vi.spyOn(crypto, 'getRandomValues').mockImplementation(array => {
            (array as Uint32Array).fill(71);
            return array;
        });
        try {
            expect(freshInkSeed()).toBe(71);
            expect(freshInkSeed(71)).toBe(72);
        } finally { random.mockRestore(); }
    });
});
