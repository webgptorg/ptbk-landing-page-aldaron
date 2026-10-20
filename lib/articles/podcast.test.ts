// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createArticlePodcastFeed, getArticlePodcastDefinition } from './podcast';
import type { Article } from './types';

function article(overrides: Partial<Article> = {}): Article {
    return {
        id: 'spec-driven-anchoring-cs',
        translationGroupId: 'spec-driven-anchoring',
        authorId: 'pavol-hejny',
        language: 'cs',
        slug: 'co-prichazi-po-generovani-kodu',
        title: 'Co přichází po generování kódu?',
        perex: 'Úvaha o programování a umělé inteligenci.',
        publishedAt: '2026-10-20T12:00:00.000Z',
        tags: ['AI'],
        markdown: 'Celý článek.',
        canonicalUrl: 'https://pavolhejny.cz/articles/co-prichazi-po-generovani-kodu',
        pdfUrl: 'https://ptbk.io/article-assets/spec-driven-anchoring-cs/article.pdf',
        author: {
            id: 'pavol-hejny',
            name: 'Pavol Hejný',
            domains: { cs: 'https://pavolhejny.cz', en: 'https://pavolhejny.com' },
            photoUrl: 'https://ptbk.io/people/pavol-hejny-transparent-square.png',
            bio: { cs: 'Vývojář.', en: 'Developer.' },
            socialLinks: [],
        },
        translations: [],
        audio: {
            url: 'https://ptbk.io/article-assets/spec-driven-anchoring-cs/audio/narration.mp3',
            duration: 1234.5,
            byteLength: 12000000,
            mimeType: 'audio/mpeg',
            subtitlesUrl: 'https://ptbk.io/article-assets/spec-driven-anchoring-cs/audio/subtitles.vtt',
        },
        ...overrides,
    };
}

function parseFeed(source: string): Document {
    const document = new DOMParser().parseFromString(source, 'application/xml');
    expect(document.querySelector('parsererror')).toBeNull();
    return document;
}

function firstItem(source: string): Element {
    return parseFeed(source).querySelector('item')!;
}

describe('article podcast RSS', () => {
    it('keeps the variant GUID and actual enclosure identical in independent Czech feeds', () => {
        const input = article();
        const promptbook = firstItem(createArticlePodcastFeed([input], 'cs', 'promptbook'));
        const personal = firstItem(createArticlePodcastFeed([input], 'cs', 'personal'));

        for (const item of [promptbook, personal]) {
            expect(item.querySelector('guid')?.textContent).toBe(input.id);
            expect(item.querySelector('guid')?.getAttribute('isPermaLink')).toBe('false');
            expect(item.querySelector('enclosure')?.getAttribute('url')).toBe(input.audio!.url);
            expect(item.querySelector('enclosure')?.getAttribute('length')).toBe('12000000');
            expect(item.querySelector('enclosure')?.getAttribute('type')).toBe('audio/mpeg');
            expect(item.getElementsByTagName('itunes:duration')[0].textContent).toBe('1235');
            expect(item.getElementsByTagName('podcast:transcript')[0].getAttribute('url')).toBe(input.audio!.subtitlesUrl);
        }
        expect(promptbook.querySelector('link')?.textContent).toBe('https://ptbk.io/cs/articles/co-prichazi-po-generovani-kodu');
        expect(personal.querySelector('link')?.textContent).toBe(input.canonicalUrl);
        expect(promptbook.querySelector('description')?.textContent).toContain(input.canonicalUrl);
    });

    it('filters author independently of language and publishes all authors on Promptbook', () => {
        const own = article();
        const other = article({ id: 'another-author-cs', authorId: 'another-author', slug: 'jiny-clanek' });
        const english = article({ id: 'english', language: 'en', slug: 'english' });
        const inputs = [own, other, english];

        expect(parseFeed(createArticlePodcastFeed(inputs, 'cs', 'promptbook')).querySelectorAll('item')).toHaveLength(2);
        expect(parseFeed(createArticlePodcastFeed(inputs, 'cs', 'personal')).querySelectorAll('item')).toHaveLength(1);
        expect(firstItem(createArticlePodcastFeed(inputs, 'en', 'personal')).querySelector('guid')?.textContent).toBe('english');
    });

    it('serves valid empty English feeds and does not pretend that pending audio exists', () => {
        const pending = article({ audio: undefined });
        for (const publication of ['promptbook', 'personal'] as const) {
            const document = parseFeed(createArticlePodcastFeed([article(), pending], 'en', publication));
            expect(document.querySelectorAll('item')).toHaveLength(0);
            expect(document.querySelector('channel > language')?.textContent).toBe('en');
            expect(document.querySelector('channel > pubDate')).toBeNull();
            expect(document.getElementsByTagName('atom:link')[0].getAttribute('href')).toMatch(/\/articles\/podcast\.xml$/);
        }
        expect(parseFeed(createArticlePodcastFeed([pending], 'cs', 'promptbook')).querySelectorAll('item')).toHaveLength(0);
    });

    it('uses each language and publication own public URLs with real brand artwork', () => {
        expect(getArticlePodcastDefinition('cs', 'promptbook')).toMatchObject({
            feedUrl: 'https://ptbk.io/cs/articles/podcast.xml',
            imageUrl: 'https://ptbk.io/article-podcasts/promptbook.png',
        });
        expect(getArticlePodcastDefinition('en', 'promptbook').feedUrl).toBe('https://ptbk.io/en/articles/podcast.xml');
        expect(getArticlePodcastDefinition('cs', 'personal')).toMatchObject({
            feedUrl: 'https://pavolhejny.cz/articles/podcast.xml',
            imageUrl: 'https://ptbk.io/article-podcasts/pavol-hejny.png',
        });
        expect(getArticlePodcastDefinition('en', 'personal').feedUrl).toBe('https://pavolhejny.com/articles/podcast.xml');
    });

    it('encodes authored text and URLs without creating XML elements or HTML injection', () => {
        const input = article({
            title: 'AI & <script> ]]> "novinka"',
            perex: '<img src=x onerror="alert(1)"> & další text ]]>',
            audio: { ...article().audio!, url: 'https://ptbk.io/audio.mp3?x=1&y=2' },
        });
        const document = parseFeed(createArticlePodcastFeed([input], 'cs', 'promptbook'));
        const item = document.querySelector('item')!;
        expect(item.querySelector('title')?.textContent).toBe(input.title);
        expect(item.querySelector('script')).toBeNull();
        expect(item.querySelector('enclosure')?.getAttribute('url')).toBe(input.audio!.url);
        const html = new DOMParser().parseFromString(item.querySelector('description')!.textContent!, 'text/html');
        expect(html.querySelector('img')).toBeNull();
        expect(html.querySelector('p')?.textContent).toBe(input.perex);
    });

    it('is deterministic, orders by publication time and never mutates the article list', () => {
        const older = article({ id: 'older', publishedAt: '2026-10-19T12:00:00.000Z' });
        const newer = article({ id: 'newer' });
        const inputs = Object.freeze([older, newer]);
        const first = createArticlePodcastFeed(inputs, 'cs', 'promptbook');
        expect(createArticlePodcastFeed(inputs, 'cs', 'promptbook')).toBe(first);
        expect(Array.from(parseFeed(first).querySelectorAll('item guid'), (node) => node.textContent)).toEqual(['newer', 'older']);
        expect(inputs.map((input) => input.id)).toEqual(['older', 'newer']);
        expect(parseFeed(first).querySelector('channel > pubDate')?.textContent).toBe('Tue, 20 Oct 2026 12:00:00 GMT');
    });

    it('never publishes enclosures with an unusable URL, duration, or byte length', () => {
        const audio = article().audio!;
        const inputs = [
            article({ audio: { ...audio, byteLength: 0 } }),
            article({ audio: { ...audio, byteLength: 1.5 } }),
            article({ audio: { ...audio, duration: NaN } }),
            article({ audio: { ...audio, url: '/not-absolute.mp3' } }),
        ];
        expect(parseFeed(createArticlePodcastFeed(inputs, 'cs', 'promptbook')).querySelectorAll('item')).toHaveLength(0);
    });
});
