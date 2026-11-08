import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAVOL_KRAJTA_SHOW_ARTWORK_URL } from '@/businesses/pavol/pavolPodcastArtwork';
import { GET } from './route';

const fetchImage = vi.fn<typeof fetch>();
const videoFile = 'V1DKmqhDaHk.jpg';

function requestArtwork(host: string, file = videoFile) {
    const url = `https://${host}/api/pavol/podcast-artwork/v1/${file}`;
    return GET(new Request(url, { headers: { host } }), { params: Promise.resolve({ file }) });
}

describe('personal podcast artwork', () => {
    beforeEach(() => {
        fetchImage.mockReset();
        vi.stubGlobal('fetch', fetchImage);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('falls through a YouTube placeholder to a real thumbnail and renders a square JPEG', async () => {
        const thumbnail = async (width: number, height: number) => {
            const bytes = await sharp({
                create: { width, height, channels: 3, background: '#1f645d' },
            }).jpeg().toBuffer();
            return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/jpeg' } });
        };
        fetchImage.mockResolvedValueOnce(await thumbnail(120, 90));
        fetchImage.mockResolvedValueOnce(await thumbnail(320, 180));

        const response = await requestArtwork('pavolhejny.cz');
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/jpeg');
        expect(fetchImage).toHaveBeenCalledTimes(2);
        const image = sharp(Buffer.from(await response.arrayBuffer()));
        expect(await image.metadata()).toMatchObject({ format: 'jpeg', width: 1400, height: 1400, hasAlpha: false });
    });

    it('uses the original square show cover when no rendition is available', async () => {
        fetchImage.mockRejectedValue(new Error('Unavailable'));
        const response = await requestArtwork('pavolhejny.com');
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(PAVOL_KRAJTA_SHOW_ARTWORK_URL);
    });

    it('rejects malformed filenames and requests on the show site before fetching', async () => {
        expect((await requestArtwork('pavolhejny.cz', 'invalid.jpg')).status).toBe(404);
        expect((await requestArtwork('ai-ta-krajta.cz')).status).toBe(404);
        expect(fetchImage).not.toHaveBeenCalled();
    });
});
