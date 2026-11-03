import { describe, expect, it } from 'vitest';
import { getReleaseSupport, PRODUCT_RELEASES, type ProductRelease } from './catalog';
import { compareReleaseVersions, isCurrentGeneration } from './version';
const release = (version: string, listedAt: string): ProductRelease => ({ version, listedAt, publishedAt: '2026-01-01T00:00:00Z', prerelease: version.includes('-') });
describe('release publication and support', () => {
    it('orders numeric prereleases and excludes the older generation', () => {
        expect(compareReleaseVersions('0.118.0-10', '0.118.0-2')).toBeGreaterThan(0);
        expect(compareReleaseVersions('0.118.0', '0.118.0-99')).toBeGreaterThan(0);
        expect(isCurrentGeneration('0.117.99')).toBe(false);
        expect(isCurrentGeneration('0.118.0-0')).toBe(true);
    });
    it('never grants stable support to a prerelease', () => {
        const item = release('0.118.0-0', '2026-11-03T00:00:00Z');
        expect(getReleaseSupport({ ...item, prerelease: false }, [item]).status).toBe('prerelease');
    });
    it('starts the line minimum on this website rather than the old npm date', () => {
        const item = release('0.118.0', '2026-11-03T00:00:00Z');
        expect(getReleaseSupport(item, [item]).until).toBe('2027-02-01T00:00:00.000Z');
    });
    it('supports the newest patch without restarting the line minimum', () => {
        const first = release('0.118.0', '2026-11-03T00:00:00Z'), patch = release('0.118.1', '2026-12-01T00:00:00Z');
        const now = new Date('2026-12-02T00:00:00Z');
        expect(getReleaseSupport(first, [first, patch], now).status).toBe('superseded');
        expect(getReleaseSupport(patch, [first, patch], now).until).toBe('2027-02-01T00:00:00.000Z');
    });
    it('keeps at least the latest stable line after its minimum expires', () => {
        const item = release('0.118.0', '2026-11-03T00:00:00Z');
        expect(getReleaseSupport(item, [item], new Date('2027-12-01')).status).toBe('supported');
    });
    it('ends an older line only after its minimum and preserves explicit extensions', () => {
        const old = release('0.118.0', '2026-11-03T00:00:00Z'), next = release('0.119.0', '2027-01-01T00:00:00Z');
        expect(getReleaseSupport(old, [old, next], new Date('2027-02-02')).status).toBe('ended');
        const extended = { ...old, supportUntil: '2027-03-01T00:00:00Z' };
        expect(getReleaseSupport(extended, [extended, next], new Date('2027-02-02')).status).toBe('supported');
    });
    it('contains unique versions with explicit independent publication dates', () => {
        expect(new Set(PRODUCT_RELEASES.map(item => item.version)).size).toBe(PRODUCT_RELEASES.length);
        for (const item of PRODUCT_RELEASES) {
            expect(isCurrentGeneration(item.version)).toBe(true);
            expect(Date.parse(item.listedAt)).toBeGreaterThanOrEqual(Date.parse(item.publishedAt));
        }
    });
});
