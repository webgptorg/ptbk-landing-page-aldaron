/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/lib/articles/types';
import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PavolMediaSection } from './PavolMediaSection';
import { PavolPodcastIndex } from './PavolPodcastIndex';
import { PAVOL_PODCAST_METADATA } from './pavolPodcastMetadata';

const { playTrack } = vi.hoisted(() => ({ playTrack: vi.fn() }));
vi.mock('@/components/audio-player/AudioPlayerProvider', () => ({
    useAudioPlayerControls: () => ({ track: null, isPlaying: false, getProgress: () => undefined, playTrack }),
}));
vi.mock('@/lib/workshops/workshopPublic', () => ({ loadPublishedWorkshopSummaries: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/articles/publishedArticles', () => ({ getPersonalArticleListings: vi.fn() }));
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
function workshop(slug: string, startsAt: string, endsAt: string | null): WorkshopSummary {
    return { id: slug, kind: 'workshop', slug, title: `Workshop ${slug}`, description: 'Short introduction.\n\n- More detail in the archive.',
        startsAt, endsAt, isPublished: true, event: DEFAULT_EVENT_DETAILS };
}

beforeEach(() => {
    vi.mocked(loadPublishedWorkshopSummaries).mockResolvedValue([]);
    vi.mocked(getPersonalArticleListings).mockResolvedValue(articles);
    vi.mocked(fetchPavolPodcasts).mockResolvedValue(podcasts);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers(); });

describe('personal homepage previews and archives', () => {
    it.each(['cs', 'en'] as const)('shows one compact selection in %s and keeps matching-language article playback', async (language) => {
        const localizedArticles = articles.map(article => ({ ...article, language,
            canonicalUrl: `https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/articles/${article.slug}` }));
        const localizedPodcasts = podcasts.map(podcast => ({ ...podcast, language }));
        vi.mocked(getPersonalArticleListings).mockResolvedValue(localizedArticles);
        vi.mocked(fetchPavolPodcasts).mockResolvedValue(localizedPodcasts);
        const { container } = render(await PavolMediaSection({ language, revalidateSeconds: 3600 }));
        const section = container.querySelector<HTMLElement>('#writing')!;
        expect(Array.from(container.querySelectorAll('section'), element => element.id)).toEqual(['writing']);
        expect(within(section).getAllByRole('article')).toHaveLength(3);
        expect(screen.getByRole('heading', { name: 'Article 0' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Podcast 0' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Article 1' })).toBeNull();
        for (const archive of ['articles', 'podcasts', 'talks']) {
            expect(section.querySelector(`a[href="/${archive}"]`)).not.toBeNull();
            expect(section.querySelector(`#${archive}`)).not.toBeNull();
        }
        expect(section.querySelector('#media')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: language === 'cs' ? 'Poslechnout článek' : 'Listen to article' }));
        expect(playTrack).toHaveBeenCalledWith(expect.objectContaining({ id: 'article-0', kind: 'article', href: '/articles/article-0', appearance: 'personal', language }));
    });

    it('omits Czech recordings from the English homepage without removing their archive', async () => {
        vi.mocked(getPersonalArticleListings).mockResolvedValue(articles); // A wrong-language source must not leak into this preview.
        const { container } = render(await PavolMediaSection({ language: 'en', revalidateSeconds: 3600 }));
        expect(screen.queryByRole('heading', { name: 'Article 0' })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Podcast 0' })).toBeNull();
        expect(container.querySelector('a[href="/podcasts"]')).not.toBeNull();
        expect(container.querySelector('details summary')?.textContent).toBe('In the media');
    });

    it('selects the nearest upcoming owned workshop rather than historical or later events', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-13T12:00:00Z'));
        vi.mocked(loadPublishedWorkshopSummaries).mockResolvedValue([
            workshop('past', '2026-11-12T10:00:00Z', '2026-11-12T11:00:00Z'),
            workshop('later', '2026-12-01T10:00:00Z', null),
            workshop('next', '2026-11-14T10:00:00Z', null),
            { ...workshop('unpublished', '2026-11-13T13:00:00Z', null), isPublished: false },
            { ...workshop('other-lecturer', '2026-11-13T13:00:00Z', null), event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: 'https://example.com' } },
        ]);
        render(await PavolMediaSection({ language: 'cs', revalidateSeconds: 3600 }));
        expect(screen.getByRole('heading', { name: 'Workshop next' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Workshop past' })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Workshop later' })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Workshop unpublished' })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Workshop other-lecturer' })).toBeNull();
        expect(screen.getAllByRole('article')).toHaveLength(3);
    });

    it.each(['cs', 'en'] as const)('keeps all podcasts, only podcasts, and working homepage navigation in the %s archive', async (language) => {
        const { container } = render(await PavolPodcastIndex({ language, revalidateSeconds: 3600 }));
        expect(screen.getAllByRole('article')).toHaveLength(13);
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
        expect(screen.queryByText('Article 0')).toBeNull();
        expect((screen.getByRole('combobox', { name: language === 'cs' ? 'Řazení' : 'Sort by' }) as HTMLSelectElement).value).toBe('smart');
        expect(container.querySelector('header a[href="/#writing"]')).not.toBeNull();
        expect(within(container.querySelector('footer')!).getByRole('button', { name: 'Podcast' })).toBeTruthy();
        expect(container.querySelector('a[hreflang="en"]')?.getAttribute('href')).toBe('https://pavolhejny.com/podcasts');
        expect(PAVOL_PODCAST_METADATA[language].alternates?.canonical).toBe(`https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/podcasts`);
    });
});
