import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrapePublicWebPagePreview } from './publicWebPagePreview';

afterEach(() => vi.unstubAllGlobals());

describe('public page preview target restrictions', () => {
    it('classifies invalid and private starting URLs before fetching', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(scrapePublicWebPagePreview('file:///private')).rejects.toMatchObject({ kind: 'invalid' });
        await expect(scrapePublicWebPagePreview('http://127.0.0.1/private')).rejects.toMatchObject({ kind: 'disallowed' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('classifies a redirect to a private URL and never fetches its target', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
            status: 302,
            headers: { location: 'http://127.0.0.1/private' },
        }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(scrapePublicWebPagePreview('https://1.1.1.1/guide')).rejects.toMatchObject({ kind: 'disallowed' });
        expect(fetchMock).toHaveBeenCalledOnce();
    });
});
