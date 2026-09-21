import { fetchPublicWebPageResource } from '@/lib/network/publicWebPagePreview';
import { loadPublicWebPagePreviewImage } from '@/lib/network/publicWebPagePreviewImage';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MOCKS = vi.hoisted(() => ({ lookup: vi.fn(), fetch: vi.fn() }));
vi.mock('node:dns/promises', () => ({ lookup: MOCKS.lookup }));

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', MOCKS.fetch);
    MOCKS.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
});
afterEach(() => vi.unstubAllGlobals());

describe('public preview images for a portable PDF', () => {
    it('normalizes a public WebP image to an embedded JPEG without distorting its aspect ratio', async () => {
        const bytes = await sharp({ create: { width: 80, height: 120, channels: 3, background: '#20a0c0' } }).webp().toBuffer();
        MOCKS.fetch.mockResolvedValue(new Response(new Uint8Array(bytes), { headers: { 'content-type': 'image/webp' } }));
        const result = await loadPublicWebPagePreviewImage('https://example.com/image.webp', 300);
        expect(result).toMatch(/^data:image\/jpeg;base64,/);
        const metadata = await sharp(Buffer.from(result!.split(',')[1], 'base64')).metadata();
        expect(metadata).toMatchObject({ width: 1200, height: 630, format: 'jpeg' });
    });

    it.each(['https://localhost/image.png', 'https://127.0.0.1/image.png', 'file:///image.png'])('does not request a private or unsupported image: %s', async (url) => {
        expect(await loadPublicWebPagePreviewImage(url, 300)).toBeNull();
        expect(MOCKS.fetch).not.toHaveBeenCalled();
    });

    it('checks DNS again at every redirect and refuses private targets', async () => {
        MOCKS.lookup.mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }])
            .mockResolvedValueOnce([{ address: '10.0.0.2', family: 4 }]);
        MOCKS.fetch.mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://internal.example/image.png' } }));
        expect(await loadPublicWebPagePreviewImage('https://example.com/image', 300)).toBeNull();
        expect(MOCKS.fetch).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['image/svg+xml', '<svg></svg>'], ['text/html', '<html></html>'], ['image/png', 'corrupted image'],
        ['image/png', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>'],
    ])('degrades gracefully for %s', async (contentType, body) => {
        MOCKS.fetch.mockResolvedValue(new Response(body, { headers: { 'content-type': contentType } }));
        expect(await loadPublicWebPagePreviewImage('https://example.com/image', 300)).toBeNull();
    });

    it('enforces the streaming byte limit even when Content-Length is absent', async () => {
        MOCKS.fetch.mockResolvedValue(new Response(new Uint8Array(101), { headers: { 'content-type': 'image/png' } }));
        await expect(fetchPublicWebPageResource('https://example.com/image', {
            accept: 'image/png', contentTypePattern: /^image\/png$/, maximalBytes: 100,
        })).rejects.toThrow('too large');
    });
});
