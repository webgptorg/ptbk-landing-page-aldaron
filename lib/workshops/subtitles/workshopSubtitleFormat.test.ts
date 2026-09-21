import { describe, expect, it } from 'vitest';
import { formatSubtitleTime, parseSubtitleFile, serializeSubtitleFile } from './workshopSubtitleFormat';
import { SUBTITLE_CREATE_SCHEMA, SUBTITLE_CUE_SCHEMA } from './workshopSubtitleTypes';

const CUES = [
    { startSeconds: 1.125, endSeconds: 4.5, text: 'Příliš žluťoučký kůň.\nLet’s write <code> & tests.' },
    { startSeconds: 3661, endSeconds: 3662.999, text: 'English and čeština.' },
];

describe('shared timed subtitle format', () => {
    it.each(['vtt', 'srt'] as const)('round-trips Czech/English text, entities and hour-long timestamps through %s', (format) => {
        expect(parseSubtitleFile(serializeSubtitleFile(CUES, format))).toEqual(CUES);
    });
    it('accepts BOM/CRLF, cue names, settings and WebVTT markup while ignoring metadata', () => {
        expect(parseSubtitleFile('\uFEFFWEBVTT\r\nLanguage: cs\r\n\r\nNOTE metadata\r\nignore\r\n\r\nintro\r\n00:01.125 --> 00:04.500 align:start\r\n<v Pavol><b>Ahoj</b> &amp; hello &#x1f44b;')).toEqual([
            { startSeconds: 1.125, endSeconds: 4.5, text: 'Ahoj & hello 👋' },
        ]);
    });
    it.each(['', 'plain text', '1\n00:00:04,000 --> 00:00:02,000\nBackwards',
        '1\n00:60:00,000 --> 00:61:00,000\nInvalid minutes',
        '1\n00:00:02,000 --> 00:00:03,000\nSecond\n\n2\n00:00:01,000 --> 00:00:02,000\nFirst',
        '1\n00:00:01,000 --> 00:00:02,000\n'])('refuses malformed or empty subtitle tracks', (text) => {
        expect(() => parseSubtitleFile(text)).toThrow();
    });
    it('carries millisecond rounding across minutes', () => {
        expect(formatSubtitleTime(59.9999)).toBe('00:01:00.000');
        const cue = SUBTITLE_CUE_SCHEMA.parse({ startSeconds: 1.12345, endSeconds: 3.555555, text: 'Czech\r\n\r\nEnglish' });
        expect(parseSubtitleFile(serializeSubtitleFile([cue]))).toEqual([{ startSeconds: 1.123, endSeconds: 3.556, text: 'Czech\nEnglish' }]);
        expect(SUBTITLE_CUE_SCHEMA.safeParse({ startSeconds: 1, endSeconds: 1.00001, text: 'Too short' }).success).toBe(false);
    });
    it('validates language and bounded cue timing before persistence', () => {
        const values = { language: 'mul', cues: CUES, source: 'manual', sourceYoutubeVideoId: null, sourceFilename: null };
        expect(SUBTITLE_CREATE_SCHEMA.safeParse(values).success).toBe(true);
        for (const cues of [[{ ...CUES[0], endSeconds: Infinity }], [{ ...CUES[0], startSeconds: -1 }], []]) {
            expect(SUBTITLE_CREATE_SCHEMA.safeParse({ ...values, cues }).success).toBe(false);
        }
        expect(SUBTITLE_CREATE_SCHEMA.safeParse({ ...values, language: 'not-a-language' }).success).toBe(false);
    });
});
