import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchYoutubeSubtitles } from './fetchYoutubeSubtitles';

const VIDEO_ID = 'dQw4w9WgXcQ';
const CAPTION_TEXT = 'WEBVTT\n\n00:01.000 --> 00:04.000\nDobrý den. Hello.';
const FETCH_MOCK = vi.fn();
const createTrack = (languageCode: string, kind?: string, baseUrl = `https://www.youtube.com/api/timedtext?v=${VIDEO_ID}&lang=${languageCode}`) => ({ languageCode, kind, baseUrl, name: { runs: [{ text: 'A [quoted] "name"' }] } });

describe('YouTube subtitle import', () => {
    beforeEach(() => { FETCH_MOCK.mockReset(); vi.stubGlobal('fetch', FETCH_MOCK); });
    afterEach(() => vi.unstubAllGlobals());
    it.each(['cs', 'en'] as const)('chooses authored %s captions ahead of ASR and keeps original timing', async (language) => {
        FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify({ captionTracks: [createTrack(language, 'asr'), createTrack(language)] })))
            .mockResolvedValueOnce(new Response(CAPTION_TEXT));
        expect(await fetchYoutubeSubtitles(VIDEO_ID, language)).toEqual([{ startSeconds: 1, endSeconds: 4, text: 'Dobrý den. Hello.' }]);
        const [url, options] = FETCH_MOCK.mock.calls[1]!;
        expect(url).toBe(`https://www.youtube.com/api/timedtext?v=${VIDEO_ID}&lang=${language}&fmt=vtt`);
        expect(options.redirect).toBe('error');
        expect(options.signal).toBeInstanceOf(AbortSignal);
        expect(FETCH_MOCK.mock.calls[0]![1].method).toBe('POST');
    });
    it('tries automatic captions when an advertised authored track cannot be downloaded', async () => {
        FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify({ captionTracks: [createTrack('cs', 'asr'), createTrack('cs')] })))
            .mockResolvedValueOnce(new Response('')).mockResolvedValueOnce(new Response(CAPTION_TEXT));
        expect(await fetchYoutubeSubtitles(VIDEO_ID, 'cs')).toHaveLength(1);
        expect(FETCH_MOCK).toHaveBeenCalledTimes(3);
    });
    it('does not substitute English for missing Czech captions', async () => {
        FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify({ captionTracks: [createTrack('en')] })));
        await expect(fetchYoutubeSubtitles(VIDEO_ID, 'cs')).rejects.toThrow('vybraném jazyce');
        expect(FETCH_MOCK).toHaveBeenCalledTimes(2);
    });
    it.each(['https://127.0.0.1/api/timedtext', 'https://youtube.com.evil.example/api/timedtext',
        `http://www.youtube.com/api/timedtext?v=${VIDEO_ID}`, `https://www.youtube.com:123/api/timedtext?v=${VIDEO_ID}`,
        'https://www.youtube.com/api/timedtext?v=AAAAAAAAAAA'])('refuses untrusted caption URLs: %s', async (baseUrl) => {
        FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify({ captionTracks: [createTrack('cs', undefined, baseUrl)] })));
        await expect(fetchYoutubeSubtitles(VIDEO_ID, 'cs')).rejects.toThrow('stažení');
        expect(FETCH_MOCK).toHaveBeenCalledTimes(2);
        expect(FETCH_MOCK.mock.calls[1]![0]).toBe(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
    });
    it('reports unavailable captions instead of saving an empty successful track', async () => {
        FETCH_MOCK.mockResolvedValueOnce(new Response('consent or challenge page'));
        await expect(fetchYoutubeSubtitles(VIDEO_ID, 'en')).rejects.toThrow('YouTube neposkytl');
    });
    it('falls back to the public watch page when the mobile player has no captions', async () => {
        FETCH_MOCK.mockResolvedValueOnce(new Response('{}'))
            .mockResolvedValueOnce(new Response(JSON.stringify({ captionTracks: [createTrack('en')] })))
            .mockResolvedValueOnce(new Response(CAPTION_TEXT));
        expect(await fetchYoutubeSubtitles(VIDEO_ID, 'en')).toHaveLength(1);
        expect(FETCH_MOCK).toHaveBeenCalledTimes(3);
    });
});
