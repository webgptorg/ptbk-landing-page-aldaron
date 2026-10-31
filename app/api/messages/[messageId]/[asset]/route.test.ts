import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ load: vi.fn(), audio: vi.fn(), sign: vi.fn() }));
vi.mock('@/lib/messages/messageDatabase', () => ({ loadMessageByShortcode: mocks.load, getCurrentMessageAudio: mocks.audio, MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } }));
vi.mock('@/lib/storage/objectStorage', () => ({ signStoredObject: mocks.sign }));
import { GET } from './route';
import { TEST_MESSAGE } from '@/lib/messages/messageTestFixtures';
const get = (asset: string, host = 'pavolhejny.cz') => GET(new Request(`https://${host}/api/messages/${TEST_MESSAGE.shortcode}/${asset}`, { headers: { host, range: 'bytes=0-100' } }), { params: Promise.resolve({ messageId: TEST_MESSAGE.shortcode, asset }) });
beforeEach(() => { mocks.load.mockResolvedValue(TEST_MESSAGE); mocks.audio.mockReturnValue(null); mocks.sign.mockResolvedValue('https://cdn.example/signed-audio'); });
afterEach(() => vi.clearAllMocks());
describe('message exports and CDN audio', () => {
    it('exports the short message with its link while preserving the full context byte-for-byte', async () => {
        expect(await (await get('message.md')).text()).toContain(`Ahoj týme,\n\nhttps://pavolhejny.cz/${TEST_MESSAGE.shortcode}\n\n`);
        const full = await get('context.md'); expect(await full.text()).toBe(TEST_MESSAGE.context); expect(full.headers.get('cache-control')).toContain('no-store');
    });
    it('rechecks domain and code before exposing data or signing any object', async () => {
        mocks.load.mockResolvedValue(null);
        expect((await get('audio.mp3', 'pavolhejny.com')).status).toBe(404);
        expect(mocks.load).toHaveBeenCalledWith(TEST_MESSAGE.shortcode, 'pavolhejny.com');
        expect(mocks.sign).not.toHaveBeenCalled();
    });
    it('omits stale or absent audio and timing', async () => {
        expect((await get('audio.mp3')).status).toBe(404); expect((await get('words.json')).status).toBe(404);
        expect(mocks.sign).not.toHaveBeenCalled();
    });
    it('sends only a temporary CDN location, letting storage handle actual media ranges', async () => {
        mocks.audio.mockReturnValue({ key: 'messages/test/revision.mp3' });
        const response = await get('audio.mp3'); expect(response.status).toBe(307); expect(response.headers.get('location')).toBe('https://cdn.example/signed-audio');
        expect(await response.text()).toBe(''); expect(mocks.sign).toHaveBeenCalledWith('messages/test/revision.mp3');
    });
});
