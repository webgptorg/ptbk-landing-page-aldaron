/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { parsePodcastRssFeed } from '@/lib/podcast/parsePodcastRssFeed';
import { createPavolFeed } from './pavolFeed';
import { getArticles } from '@/lib/articles/load';
import { getPavolAiTaKrajtaPodcasts, type PavolPodcast } from './pavolPodcasts';

const appearance: PavolPodcast = {
    id: 'source:stable-id', source: 'A & B', title: 'A < B', description: 'English summary',
    href: 'https://example.org/episode', publishedAt: '2026-11-01T10:00:00Z', language: 'cs',
    audioUrl: 'https://example.org/recording.mp3?a=1&b=2', audioByteLength: 12345, durationInSeconds: 60,
};

describe('combined personal RSS', () => {
    it.each([
        ['cs', 'Od AI nápadu k reálným penězům: A jak škálovat byznys'],
        ['en', 'From an AI idea to revenue: scaling a business'],
    ] as const)('labels Krajta parts and specials in the %s feed and retains the topic for new episodes', (language, multipartTopic) => {
        const feed = parsePodcastRssFeed(`<rss><channel><title>AI ta Krajta</title>
            <item><title>Od AI nápadu k reálným penězům: A jak škálovat byznys | AItaKrajta #71-2</title><enclosure url="https://example.org/71-2.mp3" /></item>
            <item><title>AI ta Krajta #999 | Nový díl &amp; AI</title><enclosure url="https://example.org/999.mp3" /></item>
            <item><title>Rozhovor bez čísla | AItaKrajta speciál</title><enclosure url="https://example.org/special.mp3" /></item>
            </channel></rss>`, { showTitle: 'AI ta Krajta' });
        const podcasts = getPavolAiTaKrajtaPodcasts(feed.episodes.map(episode => ({ ...episode, personIds: ['pavol-hejny'] })), language);
        const doc = new DOMParser().parseFromString(createPavolFeed([], [...podcasts, appearance], language), 'application/xml');
        const titles = Object.fromEntries(Array.from(doc.querySelectorAll('item')).map(item => [
            item.querySelector('guid')?.textContent, item.querySelector('title')?.textContent,
        ]));
        expect(titles).toEqual({
            'ai-ta-krajta:71': `AI ta Krajta #71-2: ${multipartTopic}`,
            'ai-ta-krajta:999': 'AI ta Krajta #999: Nový díl & AI',
            'ai-ta-krajta:rozhovor-bez-cisla-aitakrajta-special': 'AI ta Krajta: Rozhovor bez čísla',
            [appearance.id]: appearance.title,
        });
    });

    it('preserves existing article identity and canonical audio and includes source appearances once', () => {
        const articles = getArticles('cs', 'personal');
        const xml = createPavolFeed(articles, [appearance, appearance], 'cs');
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        expect(doc.querySelector('parsererror')).toBeNull();
        expect(doc.querySelectorAll('item')).toHaveLength(articles.length + 1);
        const podcast = doc.querySelector('item')!;
        expect(podcast.querySelector('title')?.textContent).toBe('A < B');
        expect(podcast.querySelector('enclosure')?.getAttribute('length')).toBe('12345');
        expect(xml).toContain('spec-driven-anchoring-cs');
        expect(xml).toContain(articles[0].audio!.url);
    });
    it('includes readable articles while narration is pending, marks Czech recordings in English, and rejects unsafe links', () => {
        const articles = getArticles('en', 'personal');
        const xml = createPavolFeed(articles, [appearance, { ...appearance, id: 'unsafe', href: 'javascript:alert(1)' }], 'en');
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        expect(doc.querySelector('parsererror')).toBeNull();
        expect(doc.querySelectorAll('item')).toHaveLength(articles.length + 1);
        expect(xml).toContain('Audio in Czech');
        expect(xml).toContain('spec-driven-anchoring-en');
        expect(xml).not.toContain('unsafe');
        const article = Array.from(doc.querySelectorAll('item')).find(item => item.querySelector('guid')?.textContent === 'spec-driven-anchoring-en');
        expect(article?.querySelector('enclosure')).toBeNull();
    });
});
