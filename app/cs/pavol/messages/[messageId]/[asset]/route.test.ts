import { beforeEach, describe, expect, it, vi } from 'vitest';
const { source, audio } = vi.hoisted(() => ({ source: vi.fn(), audio: vi.fn() }));
vi.mock('@/lib/messages/messageStore', () => ({
    getSharedMessage: source, readMessageFile: audio,
    isMessageHostname: (host: string) => host === 'pavolhejny.cz',
    MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
}));
import { GET } from './route';
const request = (asset: string, host = 'pavolhejny.cz', range?: string) => GET(new Request(`https://${host}/messages/test/${asset}`, {
    headers: { host, ...(range ? { range } : {}) },
}), { params: Promise.resolve({ messageId: 'test-message', asset }) });

describe('private message downloads', () => {
    beforeEach(() => {
        source.mockReset().mockResolvedValue({ markdown: '# Přesně odeslaná zpráva\n\nText zprávy.', context: '# Úplný kontext\n\nPůvodní podklad.', audio: { byteLength: 10 }, timings: { version: 1, words: [] } });
        audio.mockReset().mockResolvedValue(Buffer.from('0123456789'));
    });
    it('returns the exact message and context as separate private Markdown downloads', async () => {
        const message = await request('message.md');
        const context = await request('context.md');
        expect(await message.text()).toBe('# Přesně odeslaná zpráva\n\nText zprávy.');
        expect(await context.text()).toBe('# Úplný kontext\n\nPůvodní podklad.');
        expect(message.headers.get('content-disposition')).toContain('zprava.md');
        expect(context.headers.get('content-disposition')).toContain('kontext.md');
        expect(message.headers.get('cache-control')).toContain('no-store');
        expect(context.headers.get('x-robots-tag')).toContain('noindex');
    });
    it('does not expose files, data from another domain or an unknown capability', async () => {
        expect((await request('message.enc')).status).toBe(404);
        expect((await request('message.md', 'pavolhejny.com')).status).toBe(404);
        source.mockResolvedValueOnce(null);
        expect((await request('context.md')).status).toBe(404);
    });
    it('serves exact byte ranges for seeking and rejects unsatisfiable ranges', async () => {
        const response = await request('audio.mp3', 'pavolhejny.cz', 'bytes=3-6');
        expect(response.status).toBe(206);
        expect(response.headers.get('content-range')).toBe('bytes 3-6/10');
        expect(await response.text()).toBe('3456');
        expect((await request('audio.mp3', 'pavolhejny.cz', 'bytes=11-')).status).toBe(416);
    });
});
