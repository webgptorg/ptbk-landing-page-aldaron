import { describe, expect, it } from 'vitest';
import { getAudioSourceNavigation } from './audioSourceNavigation';

describe('audio source navigation', () => {
    it('keeps a relative article link in the same site, preserving its query and anchor', () => {
        expect(getAudioSourceNavigation({ kind: 'article', href: '/articles/example?view=full#chapter' }, 'https://www.pavolhejny.cz/'))
            .toEqual({ href: '/articles/example?view=full#chapter', external: false, isCurrentArticle: false });
    });
    it('recognizes the current article across canonical www aliases and trailing slashes', () => {
        expect(getAudioSourceNavigation({ kind: 'article', href: 'https://pavolhejny.cz/articles/example' }, 'https://www.pavolhejny.cz/articles/example/?x=1'))
            .toEqual({ href: '/articles/example', external: false, isCurrentArticle: true });
    });
    it('does not offer tracking for a different article or a podcast at the same path', () => {
        expect(getAudioSourceNavigation({ kind: 'article', href: '/articles/one' }, 'https://ptbk.io/articles/one-more')?.isCurrentArticle).toBe(false);
        expect(getAudioSourceNavigation({ kind: 'podcast', href: '/' }, 'https://ptbk.io/')?.isCurrentArticle).toBe(false);
    });
    it.each(['https://www.vlny.cz/episode', 'https://ai-ta-krajta.cz/?episode=70', 'https://pavolhejny.com/articles/example', '//example.com/episode'])('opens another site externally: %s', (href) => {
        expect(getAudioSourceNavigation({ kind: 'podcast', href }, 'https://www.pavolhejny.cz/'))
            .toMatchObject({ external: true, isCurrentArticle: false });
    });
    it('does not treat another development port or a different protocol as internal', () => {
        expect(getAudioSourceNavigation({ kind: 'article', href: 'http://localhost:4009/articles/example' }, 'http://localhost:4018/')?.external).toBe(true);
        expect(getAudioSourceNavigation({ kind: 'article', href: 'http://ptbk.io/articles/example' }, 'https://ptbk.io/')?.external).toBe(true);
    });
    it('rejects unsupported and malformed destinations', () => {
        expect(getAudioSourceNavigation({ kind: 'article', href: 'javascript:alert(1)' }, 'https://ptbk.io/')).toBeNull();
        expect(getAudioSourceNavigation({ kind: 'article', href: 'https://[' }, 'https://ptbk.io/')).toBeNull();
    });
});
