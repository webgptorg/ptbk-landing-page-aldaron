import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/storage/objectStorage', () => ({ signStoredObject: vi.fn() }));
vi.mock('./managedArticles', () => ({ getManagedArticleRow: vi.fn(), getCurrentManagedArticleAsset: vi.fn() }));
vi.mock('./publishedArticles', () => ({
    canReadManagedArticlePlacement: vi.fn(),
    getArticlePlacement: (article: { placements: { destination: string }[] }, destination: string) =>
        article.placements.find((placement) => placement.destination === destination),
}));

import { signStoredObject } from '@/lib/storage/objectStorage';
import { getCurrentManagedArticleAsset, getManagedArticleRow, type ManagedArticleRow } from './managedArticles';
import { canReadManagedArticlePlacement } from './publishedArticles';
import { serveManagedArticleAsset } from './serveManagedArticleAsset';

const id = '0929ab4a-64f3-4688-8ff5-8c980dddc114';
const key = `managed-articles/${id}/audio/internal.mp3`;
const signedUrl = 'https://private-storage.invalid/object?token=secret';
const request = new Request('https://ptbk.io/api/articles/media/id/audio', { headers: { Range: 'bytes=4-6' } });

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
});

describe('direct managed article media', () => {
    it('keeps a members-only recording off the public path and the other community', async () => {
        vi.mocked(getManagedArticleRow).mockResolvedValue({
            placements: [{ destination: 'vyvojari', visibility: 'members' }],
        } as ManagedArticleRow);
        vi.mocked(canReadManagedArticlePlacement).mockResolvedValue(false);

        for (const community of [undefined, 'promptbook', 'vyvojari'] as const) {
            const response = await serveManagedArticleAsset(request, { id, kind: 'audio' }, community);
            expect(response.status).toBe(404);
            expect(response.headers.get('cache-control')).toBe('private, no-store');
        }
        expect(canReadManagedArticlePlacement).toHaveBeenCalledExactlyOnceWith({ destination: 'vyvojari', visibility: 'members' });
        expect(signStoredObject).not.toHaveBeenCalled();
    });

    it('streams the authorized byte range without exposing the private storage URL', async () => {
        vi.mocked(getManagedArticleRow).mockResolvedValue({
            placements: [{ destination: 'vyvojari', visibility: 'paid' }],
        } as ManagedArticleRow);
        vi.mocked(canReadManagedArticlePlacement).mockResolvedValue(true);
        vi.mocked(getCurrentManagedArticleAsset).mockReturnValue({ key, byteLength: 10, contentHash: 'current' });
        vi.mocked(signStoredObject).mockResolvedValue(signedUrl);
        const fetch = vi.fn().mockResolvedValue(new Response('xyz', {
            status: 206, headers: { 'Content-Range': 'bytes 4-6/10', 'Accept-Ranges': 'bytes' },
        }));
        vi.stubGlobal('fetch', fetch);

        const response = await serveManagedArticleAsset(request, { id, kind: 'audio' }, 'vyvojari');
        expect(response.status).toBe(206);
        expect(response.headers.get('content-range')).toBe('bytes 4-6/10');
        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('access-control-allow-origin')).toBeNull();
        expect(await response.text()).toBe('xyz');
        expect(fetch).toHaveBeenCalledExactlyOnceWith(signedUrl, expect.objectContaining({ headers: { Range: 'bytes=4-6' } }));
    });
});
