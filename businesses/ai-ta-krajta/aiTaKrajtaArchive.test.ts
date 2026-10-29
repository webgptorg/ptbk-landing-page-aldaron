import { describe, expect, it, vi } from 'vitest';

// Next provides React's server cache at runtime; standalone React 18 tests use an identity wrapper.
vi.mock('react', async () => ({ ...await vi.importActual<typeof import('react')>('react'), cache: <T>(fn: T) => fn }));
vi.mock('@/lib/podcast/fetchPodcastFeed', () => ({ fetchPodcastFeed: vi.fn(async () => ({ episodes: [] })) }));
vi.mock('@/lib/youtube/fetchYoutubeChannelVideos', () => ({ fetchYoutubeChannelVideos: vi.fn(async () => []) }));
vi.mock('./aiTaKrajtaPublicPlatformStatistics', () => ({ fetchAiTaKrajtaPublicPlatformStatistics: vi.fn(async () => { throw new Error('Recording lists must not load audience profiles'); }) }));
import { fetchAiTaKrajtaEpisodes } from './aiTaKrajtaArchive';
import { fetchAiTaKrajtaPublicPlatformStatistics } from './aiTaKrajtaPublicPlatformStatistics';

describe('shared episode archive', () => {
    it('retains the credited fallback recordings without fetching public audience profiles', async () => {
        const episodes = await fetchAiTaKrajtaEpisodes(3600);
        expect(episodes.length).toBeGreaterThan(0);
        expect(episodes.some((episode) => episode.personIds.includes('pavol-hejny'))).toBe(true);
        expect(episodes.every((episode) => !('descriptionText' in episode))).toBe(true);
        expect(fetchAiTaKrajtaPublicPlatformStatistics).not.toHaveBeenCalled();
    });
});
