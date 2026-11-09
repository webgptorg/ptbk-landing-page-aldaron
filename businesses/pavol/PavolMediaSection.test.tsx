/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/lib/articles/types';
import { getPublishedArticles } from '@/lib/articles/publishedArticles';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PavolMediaSection } from './PavolMediaSection';
import { PavolPodcastIndex } from './PavolPodcastIndex';
import { PAVOL_PAGE_CONTENT } from './pavolContent';
import { PAVOL_PODCAST_METADATA } from './pavolPodcastMetadata';

const { playTrack } = vi.hoisted(() => ({ playTrack: vi.fn() }));
vi.mock('@/components/audio-player/AudioPlayerProvider', () => ({
    useAudioPlayerControls: () => ({ track: null, isPlaying: false, getProgress: () => undefined, playTrack }),
}));
vi.mock('@/lib/workshops/workshopPublic', () => ({ loadPublishedWorkshopSummaries: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/articles/publishedArticles', () => ({ getPublishedArticles: vi.fn() }));
vi.mock('./fetchPavolPodcasts', () => ({ fetchPavolPodcasts: vi.fn() }));

const articles: Article[] = Array.from({ length: 12 }, (_, index) => ({
    id: `article-${index}`, translationGroupId: `article-${index}`, authorId: 'pavol-hejny',
    language: 'cs', slug: `article-${index}`, title: `Article ${index}`, perex: 'Article introduction.',
    publishedAt: new Date(Date.UTC(2026, 9, 30 - index)).toISOString(), tags: [], markdown: 'Article body.',
    canonicalUrl: `https://pavolhejny.cz/articles/article-${index}`, pdfUrl: '/article.pdf', translations: [],
    author: { id: 'pavol-hejny', name: 'Pavol Hejný', photoUrl: '/people/pavol-hejny-transparent-square.png', bio: { cs: '', en: '' }, domains: { cs: 'https://pavolhejny.cz' }, socialLinks: [] },
    audio: { url: `https://pavolhejny.cz/audio/${index}.mp3`, duration: 60, byteLength: 1000, mimeType: 'audio/mpeg' },
}));
const podcasts = [
    ...Array.from({ length: 12 }, (_, index) => ({
        id: `podcast-${index}`, source: 'AI ta Krajta', title: `Podcast ${index}`, description: 'Podcast description.',
        href: `https://ai-ta-krajta.cz/?episode=${index}`, publishedAt: new Date(Date.UTC(2026, 9, 30 - index)).toISOString(),
        language: 'cs' as const, audioUrl: `https://example.com/${index}.mp3`, durationInSeconds: 60,
    })),
    { id: 'other-show', source: 'Other show', title: 'Other show episode', description: 'Another conversation.',
        href: 'https://example.com/episode', publishedAt: '2025-01-01T12:00:00Z', language: 'cs' as const,
        audioUrl: 'https://example.com/other.mp3', durationInSeconds: 60 },
];

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('personal homepage previews and archives', () => {
    it.each(['cs', 'en'] as const)('shows separate bounded previews in %s and keeps article playback on the homepage', async (language) => {
        vi.mocked(getPublishedArticles).mockResolvedValue(articles);
        vi.mocked(fetchPavolPodcasts).mockResolvedValue(podcasts);
        const { container } = render(await PavolMediaSection({ language, revalidateSeconds: 3600 }));
        const articleSection = container.querySelector<HTMLElement>('#articles')!;
        const podcastSection = container.querySelector<HTMLElement>('#podcasts')!;
        expect(Array.from(container.querySelectorAll('section'), (section) => section.id)).toEqual(['talks', 'media', 'articles', 'podcasts']);
        expect(within(articleSection).getAllByRole('article')).toHaveLength(10);
        expect(within(podcastSection).getAllByRole('article')).toHaveLength(4);
        // The older alternative show must enter the preview before the ten-item cut.
        expect(within(podcastSection).getAllByRole('heading')[2].textContent).toBe('Other show episode');
        expect(within(articleSection).getByRole('link', { name: language === 'cs' ? 'Zobrazit víc článků' : 'Show more articles' }).getAttribute('href')).toBe('/articles');
        expect(within(podcastSection).getByRole('link', { name: language === 'cs' ? 'Zobrazit víc podcastů' : 'Show more podcasts' }).getAttribute('href')).toBe('/podcasts');
        expect(PAVOL_PAGE_CONTENT[language].header.navItems.filter((item) => ['#articles', '#podcasts'].includes(item.href)).map((item) => item.href)).toEqual(['#articles', '#podcasts']);
        fireEvent.click(within(articleSection).getAllByRole('button', { name: 'Poslechnout článek' })[0]);
        expect(playTrack).toHaveBeenCalledWith(expect.objectContaining({ id: 'article-0', kind: 'article', href: '/articles/article-0', appearance: 'personal' }));
    });

    it.each(['cs', 'en'] as const)('keeps all podcasts, only podcasts, and working homepage navigation in the %s archive', async (language) => {
        vi.mocked(fetchPavolPodcasts).mockResolvedValue(podcasts);
        const { container } = render(await PavolPodcastIndex({ language, revalidateSeconds: 3600 }));
        expect(screen.getAllByRole('article')).toHaveLength(13);
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
        expect(screen.queryByText('Article 0')).toBeNull();
        expect((screen.getByRole('combobox', { name: language === 'cs' ? 'Řazení' : 'Sort by' }) as HTMLSelectElement).value).toBe('smart');
        expect(container.querySelector('header a[href="/#articles"]')).not.toBeNull();
        expect(container.querySelector('footer a[href="/#podcasts"]')).not.toBeNull();
        expect(container.querySelector('a[hreflang="en"]')?.getAttribute('href')).toBe('https://pavolhejny.com/podcasts');
        expect(PAVOL_PODCAST_METADATA[language].alternates?.canonical).toBe(`https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/podcasts`);
    });
});
