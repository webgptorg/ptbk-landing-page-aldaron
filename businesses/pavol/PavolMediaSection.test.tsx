/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArticleListing } from '@/lib/articles/types';
import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PavolMediaSection } from './PavolMediaSection';
import { PavolPodcastIndex } from './PavolPodcastIndex';
import { PAVOL_PODCAST_METADATA } from './pavolPodcastMetadata';
import type { PavolPodcast } from './pavolPodcasts';

const { playTrack } = vi.hoisted(() => ({ playTrack: vi.fn() }));
vi.mock('@/components/audio-player/AudioPlayerProvider', () => ({
    useAudioPlayerControls: () => ({ track: null, isPlaying: false, getProgress: () => undefined, playTrack }),
}));
vi.mock('@/lib/articles/publishedArticles', () => ({ getPersonalArticleListings: vi.fn() }));
vi.mock('./fetchPavolPodcasts', () => ({ fetchPavolPodcasts: vi.fn() }));

function articleListings(language: SupportedHomepageLanguage): ArticleListing[] {
    const slug = language === 'cs' ? 'co-prichazi-po-generovani-kodu' : 'what-comes-after-code-generation';
    const native: ArticleListing = {
        id: `spec-driven-anchoring-${language}`, authorId: 'pavol-hejny', language,
        slug, title: 'Native 50-year article', perex: 'Article introduction.', publishedAt: '2026-10-20T12:00:00Z',
        canonicalUrl: `https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/articles/${slug}`,
        author: { id: 'pavol-hejny', name: 'Pavol Hejný', photoUrl: '/people/pavol-hejny-transparent-square.png', bio: { cs: '', en: '' }, domains: {}, socialLinks: [] },
        audio: { url: 'https://example.com/native-article.mp3', duration: 60, byteLength: 1000, mimeType: 'audio/mpeg' },
    };
    return [native, ...Array.from({ length: 11 }, (_, index) => ({
        ...native, id: `syndicated-${index}`, slug: `syndicated-${index}`, title: `New syndicated article ${index}`,
        syndicated: true as const, publishedAt: new Date(Date.UTC(2026, 10, 14 - index)).toISOString(),
        canonicalUrl: `https://ptbk.io/${language}/komunity/promptbook/clanky/syndicated-${index}`,
    }))];
}
const podcasts: PavolPodcast[] = [
    ...Array.from({ length: 11 }, (_, index) => ({
        id: `ai-ta-krajta:${index}`, source: 'AI ta Krajta', title: `Podcast ${index}`, description: 'Podcast description.',
        href: `https://ai-ta-krajta.cz/?episode=${index}`, publishedAt: new Date(Date.UTC(2026, 9, 30 - index)).toISOString(),
        language: 'cs' as const, audioUrl: `https://example.com/${index}.mp3`, durationInSeconds: 60,
    })),
    { id: 'datatalk', source: 'Data Talk', title: 'Data Talk episode', description: 'A conversation about development.',
        href: 'https://www.datatalk.cz/podcast/epizoda-157', publishedAt: '2025-10-16T12:00:00Z', language: 'cs',
        audioUrl: 'https://example.com/datatalk.mp3', durationInSeconds: 60, imageSrc: '/pavol/media/datatalk.png' },
    { id: 'other-show', source: 'Other show', title: 'Other show episode', description: 'Another conversation.',
        href: 'https://example.com/episode', publishedAt: '2026-07-15T12:00:00Z', language: 'cs',
        audioUrl: 'https://example.com/other.mp3', durationInSeconds: 60 },
];

beforeEach(() => {
    vi.mocked(getPersonalArticleListings).mockResolvedValue(articleListings('cs'));
    vi.mocked(fetchPavolPodcasts).mockResolvedValue(podcasts);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('personal homepage previews and archives', () => {
    it.each(['cs', 'en'] as const)('features Krajta and Data Talk before the native article, Euro and another show in %s', async (language) => {
        vi.mocked(getPersonalArticleListings).mockResolvedValue(articleListings(language));
        const { container } = render(await PavolMediaSection({ language, revalidateSeconds: 3600 }));
        const section = container.querySelector<HTMLElement>('#writing')!;
        const cards = within(section).getAllByRole('article');
        expect(Array.from(container.querySelectorAll('section'), element => element.id)).toEqual(['writing']);
        expect(cards).toHaveLength(5);
        expect(cards.slice(0, 2).map(card => within(card).getByRole('img').getAttribute('aria-label')))
            .toEqual(['AI ta Krajta', 'Data Talk']);
        expect(within(cards[0]).getByRole('heading').textContent).toBe('Podcast 0');
        expect(within(cards[1]).getByRole('heading').textContent).toBe('Data Talk episode');
        expect(within(cards[2]).getByRole('heading').textContent).toBe('Native 50-year article');
        expect(within(cards[3]).getByText('Euro.cz')).toBeTruthy();
        expect(within(cards[4]).getByRole('heading').textContent).toBe('Other show episode');
        expect(screen.queryByRole('heading', { name: /^New syndicated article/ })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Podcast 1' })).toBeNull();
        const brand = within(cards[0]).getByRole('img', { name: 'AI ta Krajta' });
        expect(brand.querySelector('svg path')).not.toBeNull();
        for (const archive of ['articles', 'podcasts', 'talks']) {
            expect(section.querySelector(`a[href="/${archive}"]`)).not.toBeNull();
            expect(section.querySelector(`#${archive}`)).not.toBeNull();
        }
        expect(section.querySelector('#media')).not.toBeNull();

        fireEvent.click(within(cards[0]).getByRole('button', { name: language === 'cs' ? 'Poslechnout: Podcast 0' : 'Listen: Podcast 0' }));
        expect(playTrack).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'ai-ta-krajta:0', src: 'https://example.com/0.mp3', kind: 'podcast', appearance: 'personal', language }));
        fireEvent.click(within(cards[1]).getByRole('button', { name: language === 'cs' ? 'Poslechnout: Data Talk episode' : 'Listen: Data Talk episode' }));
        expect(playTrack).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'datatalk', src: 'https://example.com/datatalk.mp3', href: 'https://www.datatalk.cz/podcast/epizoda-157', kind: 'podcast', language }));
        fireEvent.click(within(cards[2]).getByRole('button', { name: language === 'cs' ? 'Poslechnout článek' : 'Listen to article' }));
        expect(playTrack).toHaveBeenLastCalledWith(expect.objectContaining({ id: `spec-driven-anchoring-${language}`, kind: 'article', appearance: 'personal', language }));
    });

    it('keeps original Czech recordings on the English homepage with an explicit audio-language label', async () => {
        // A wrong-language article source must still stay out of this preview.
        vi.mocked(getPersonalArticleListings).mockResolvedValue(articleListings('cs'));
        const { container } = render(await PavolMediaSection({ language: 'en', revalidateSeconds: 3600 }));
        expect(screen.queryByRole('heading', { name: 'Native 50-year article' })).toBeNull();
        expect(screen.getByRole('heading', { name: 'Podcast 0' })).toBeTruthy();
        const first = container.querySelector<HTMLElement>('#writing article')!;
        expect(within(first).getByLabelText('Audio in Czech', { exact: true })).toBeTruthy();
        expect(within(first).getByRole('button', { name: 'Listen: Podcast 0' })).toBeTruthy();
        expect(container.querySelector('a[href="/podcasts"]')).not.toBeNull();
    });

    it('uses only the publisher destination when a featured recording has no verified audio', async () => {
        vi.mocked(fetchPavolPodcasts).mockResolvedValue(podcasts.map(podcast => podcast.id === 'ai-ta-krajta:0' ? { ...podcast, audioUrl: null } : podcast));
        const { container } = render(await PavolMediaSection({ language: 'cs', revalidateSeconds: 3600 }));
        const first = container.querySelector<HTMLElement>('#writing article')!;
        expect(within(first).queryByRole('button', { name: 'Poslechnout: Podcast 0' })).toBeNull();
        const publisher = within(first).getByRole('link', { name: 'Poslechnout u vydavatele' });
        expect(publisher.getAttribute('href')).toBe('https://ai-ta-krajta.cz/?episode=0');
        expect(first.querySelector('audio, source, a[href$=".mp3"]')).toBeNull();
        expect(playTrack).not.toHaveBeenCalled();
    });

    it.each(['cs', 'en'] as const)('server-renders the bounded selection and direct Euro link in %s before JavaScript', async language => {
        vi.mocked(getPersonalArticleListings).mockResolvedValue(articleListings(language));
        const html = renderToStaticMarkup(await PavolMediaSection({ language, revalidateSeconds: 3600 }));
        const document = new DOMParser().parseFromString(html, 'text/html');
        const cards = Array.from(document.querySelectorAll('#writing article'));
        expect(cards).toHaveLength(5);
        expect(cards.slice(0, 2).map(card => card.querySelector('[role="img"]')?.getAttribute('aria-label')))
            .toEqual(['AI ta Krajta', 'Data Talk']);
        expect(cards[2].textContent).toContain('Native 50-year article');
        expect(cards[3].querySelector('a')?.getAttribute('href')).toContain('euro.cz');
        expect(document.querySelector('#writing details')).toBeNull();
    });

    it.each(['cs', 'en'] as const)('keeps all podcasts, only podcasts, and working homepage navigation in the %s archive', async (language) => {
        const { container } = render(await PavolPodcastIndex({ language, revalidateSeconds: 3600 }));
        expect(screen.getAllByRole('article')).toHaveLength(13);
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
        expect(screen.queryByText('Native 50-year article')).toBeNull();
        expect((screen.getByRole('combobox', { name: language === 'cs' ? 'Řazení' : 'Sort by' }) as HTMLSelectElement).value).toBe('smart');
        expect(container.querySelector('header a[href="/#writing"]')).not.toBeNull();
        expect(within(container.querySelector('footer')!).getByRole('button', { name: 'Podcast' })).toBeTruthy();
        expect(container.querySelector('a[hreflang="en"]')?.getAttribute('href')).toBe('https://pavolhejny.com/podcasts');
        expect(PAVOL_PODCAST_METADATA[language].alternates?.canonical).toBe(`https://pavolhejny.${language === 'cs' ? 'cz' : 'com'}/podcasts`);
    });
});
