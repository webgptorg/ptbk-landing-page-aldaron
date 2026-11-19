import { afterEach, describe, expect, it, vi } from 'vitest';

const { getCached, cache } = vi.hoisted(() => ({ getCached: vi.fn(), cache: vi.fn() }));
vi.mock('next/cache', () => ({ unstable_cache: (...args: unknown[]) => { cache(...args); return getCached; } }));
import { getReleaseCatalog, RELEASE_REFRESH_SECONDS } from './live';
import snapshot from './catalog.json';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); getCached.mockReset(); });

describe('live release catalogue resilience', () => {
    it('shares a five-minute data cache rather than a build-time page snapshot', () => {
        expect(cache).toHaveBeenCalledWith(expect.any(Function), expect.any(Array), { revalidate: 300 });
        expect(RELEASE_REFRESH_SECONDS).toBe(300);
    });
    it('serves a visibly stale snapshot after initial failure and recovers on the next successful read', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        getCached.mockRejectedValueOnce(new Error('GitHub Releases: HTTP 403'));
        expect(await getReleaseCatalog()).toEqual({ ...snapshot, stale: true });
        const current = { checkedAt: new Date().toISOString(), releases: [] };
        getCached.mockResolvedValueOnce(current);
        expect(await getReleaseCatalog()).toEqual({ ...current, stale: false });
    });
    it('marks an old last-good value as stale during an upstream outage', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-19T14:00:00Z'));
        getCached.mockResolvedValue({ checkedAt: '2026-11-19T13:40:00Z', releases: [] });
        expect((await getReleaseCatalog()).stale).toBe(true);
    });
});
