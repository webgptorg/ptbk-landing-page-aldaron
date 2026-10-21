import { describe, expect, it } from 'vitest';
import { findArticleWordAtTime, getArticleTimedSentences, getArticleWordStartTimes, parseArticleWordTimings } from './articleTiming';

const words = [
    { start: 0, end: 0.4, text: 'AI', wordId: 'w0', sentenceId: 's0' },
    { start: 0.4, end: 0.8, text: 'AI', wordId: 'w0', sentenceId: 's0' },
    { start: 1.2, end: 2, text: 'píše.', wordId: 'w1', sentenceId: 's0' },
    { start: 3, end: 4, text: 'Dál.', wordId: 'w2', sentenceId: 's1' },
];

describe('article narration alignment', () => {
    it('accepts explicit many-to-one visual mappings and keeps the first seek timestamp', () => {
        expect(parseArticleWordTimings({ version: 1, words })).toEqual({ version: 1, words });
        expect(getArticleWordStartTimes(words).get('w0')).toBe(0);
        expect(getArticleTimedSentences(words)).toEqual([
            { id: 's0', start: 0, end: 2, wordIds: ['w0', 'w1'] },
            { id: 's1', start: 3, end: 4, wordIds: ['w2'] },
        ]);
    });

    it('uses the real interval and leaves silent gaps unhighlighted', () => {
        expect(findArticleWordAtTime(words, 0.4)).toBe(words[1]);
        expect(findArticleWordAtTime(words, 0.8)).toBeUndefined();
        expect(findArticleWordAtTime(words, 1)).toBeUndefined();
        expect(findArticleWordAtTime(words, 1.3)).toBe(words[2]);
        expect(findArticleWordAtTime(words, 4)).toBeUndefined();
        expect(findArticleWordAtTime(words, Number.NaN)).toBeUndefined();
    });

    it.each([
        null,
        { version: 2, words },
        { version: 1, words: [] },
        { version: 1, words: [{ ...words[0], start: -1 }] },
        { version: 1, words: [{ ...words[0], end: 0 }] },
        { version: 1, words: [{ ...words[0], wordId: 'unmapped' }] },
        { version: 1, words: [{ ...words[0], end: Number.POSITIVE_INFINITY }] },
        { version: 1, words: [words[2], words[0]] },
    ])('rejects malformed alignments without estimating a replacement: %j', (value) => {
        expect(parseArticleWordTimings(value)).toBeNull();
    });
});
