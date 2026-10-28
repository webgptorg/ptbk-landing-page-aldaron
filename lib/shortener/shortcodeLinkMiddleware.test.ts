import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasPublicShortcodeLinkOnHostname } from './shortcodeLinkMiddleware';
const fetchMock = vi.fn();
beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://database.example');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-test-key');
    vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe('branded short-link existence check', () => {
    it('reads scopes without tracking a click or following a destination', async () => {
        fetchMock.mockResolvedValue(Response.json([{ id: 1, domains: ['pavolhejny.cz'] }]));
        expect(await hasPublicShortcodeLinkOnHostname('abc', 'www.pavolhejny.cz')).toBe(true);
        expect(await hasPublicShortcodeLinkOnHostname('abc', 'pavolhejny.com')).toBe(false);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url.pathname).toBe('/rest/v1/ShortcodeLink');
        expect(url.searchParams.get('shortcode')).toBe('eq.abc');
        expect(url.searchParams.get('select')).toBe('id,domains');
        expect(options.cache).toBe('no-store');
    });
    it('allows a legacy all-domain link and fails closed on missing or malformed rows and outages', async () => {
        fetchMock.mockResolvedValue(Response.json([{ id: 1, domains: null }]));
        expect(await hasPublicShortcodeLinkOnHostname('abc', 'ai-ta-krajta.cz')).toBe(true);
        for (const rows of [[], [{ id: 1 }], [{ id: 1, domains: 'all' }], [{ id: 1, domains: [null] }]]) {
            fetchMock.mockResolvedValue(Response.json(rows));
            expect(await hasPublicShortcodeLinkOnHostname('abc', 'ai-ta-krajta.cz')).toBe(false);
        }
        fetchMock.mockResolvedValue(new Response('', { status: 503 }));
        expect(await hasPublicShortcodeLinkOnHostname('abc', 'ai-ta-krajta.cz')).toBe(false);
        fetchMock.mockRejectedValue(new Error('offline'));
        expect(await hasPublicShortcodeLinkOnHostname('abc', 'ai-ta-krajta.cz')).toBe(false);
    });
});
