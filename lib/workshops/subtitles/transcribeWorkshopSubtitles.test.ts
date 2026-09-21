import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { transcribeWorkshopSubtitles } from './transcribeWorkshopSubtitles';
import { MAXIMAL_SUBTITLE_AUDIO_BYTES } from './workshopSubtitleTypes';

const FETCH_MOCK = vi.fn();
const AUDIO_FILE = new File(['audio'], 'original.wav', { type: 'audio/wav' });

describe('timed recording transcription', () => {
    beforeEach(() => { vi.stubEnv('OPENAI_API_KEY', 'test-key'); vi.stubGlobal('fetch', FETCH_MOCK); FETCH_MOCK.mockReset(); });
    afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
    it.each(['cs', 'en', 'mul'] as const)('transcribes %s without translating and requests timestamps', async (language) => {
        FETCH_MOCK.mockResolvedValue(new Response(JSON.stringify({ segments: [{ start: 2.25, end: 4.5, text: ' Řeč and speech. ' }] })));
        expect(await transcribeWorkshopSubtitles(AUDIO_FILE, language)).toEqual([{ startSeconds: 2.25, endSeconds: 4.5, text: 'Řeč and speech.' }]);
        const [url, options] = FETCH_MOCK.mock.calls[0]!;
        expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
        expect(options.body.get('language')).toBe(language === 'mul' ? null : language);
        expect(options.body.get('response_format')).toBe('verbose_json');
        expect(options.body.get('model')).toBe('whisper-1');
        expect(options.body.get('timestamp_granularities[]')).toBe('segment');
    });
    it('accepts silent chunks but rejects malformed or out-of-range provider output', async () => {
        FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify({ segments: [] })));
        expect(await transcribeWorkshopSubtitles(AUDIO_FILE, 'cs')).toEqual([]);
        for (const result of [{ text: 'No timestamps' }, { segments: [{ start: 0, end: 1000, text: 'Wrong timing' }] }]) {
            FETCH_MOCK.mockResolvedValueOnce(new Response(JSON.stringify(result)));
            await expect(transcribeWorkshopSubtitles(AUDIO_FILE, 'cs')).rejects.toThrow();
        }
    });
    it('refuses missing configuration and oversized or invalid audio before any provider call', async () => {
        for (const file of [new File([], 'empty.wav', { type: 'audio/wav' }), new File(['x'], 'video.mp4', { type: 'video/mp4' }),
            new File([new Uint8Array(MAXIMAL_SUBTITLE_AUDIO_BYTES + 1)], 'large.wav', { type: 'audio/wav' })]) {
            await expect(transcribeWorkshopSubtitles(file, 'cs')).rejects.toThrow();
        }
        vi.stubEnv('OPENAI_API_KEY', '');
        await expect(transcribeWorkshopSubtitles(AUDIO_FILE, 'cs')).rejects.toThrow('not configured');
        expect(FETCH_MOCK).not.toHaveBeenCalled();
    });
});
