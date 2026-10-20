import { describe, expect, it } from 'vitest';
import { createAudioProgress, readAudioHistory, readRememberedAudioTrack, type AudioTrack } from './audioPlayerState';

const article: AudioTrack = { id: 'a', src: '/a.mp3', title: 'Article', author: 'Author', href: '/articles/a', language: 'cs', kind: 'article' };

describe('shared audio history', () => {
    it('only marks an article complete when the recording actually ends', () => {
        expect(createAudioProgress(article, { positionInSeconds: 99, durationInSeconds: 100, isEnded: false }).isPlayed).toBe(false);
        expect(createAudioProgress(article, { positionInSeconds: 100, durationInSeconds: 100, isEnded: true }).isPlayed).toBe(true);
    });
    it('retains the existing podcast outro completion policy', () => {
        expect(createAudioProgress({ ...article, kind: 'podcast' }, { positionInSeconds: 99, durationInSeconds: 100, isEnded: false }).isPlayed).toBe(true);
    });
    it('ignores malformed browser state without losing other valid histories', () => {
        const progress = createAudioProgress(article, { positionInSeconds: 12.35, durationInSeconds: 100, isEnded: false });
        expect(readAudioHistory(JSON.stringify({ valid: progress, broken: { positionInSeconds: -10 } }))).toEqual({ valid: progress });
        expect(readAudioHistory('broken')).toEqual({});
        expect(readRememberedAudioTrack(JSON.stringify({ ...article, src: 'javascript:alert(1)' }))).toBeNull();
        expect(readRememberedAudioTrack(JSON.stringify(article))).toEqual(article);
    });
});
