/**
 * @vitest-environment jsdom
 */

import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AiTaKrajtaEpisodeCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeCard';
import type { PodcastEpisodePlaybackProgress } from '@/lib/podcast/podcastPlaybackProgress';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=aaaaaaaaaaa';

const EPISODE: AiTaKrajtaEpisode = {
    id: 'episode-1',
    slug: '1',
    number: 1,
    title: 'AI ta Krajta #1 | Testovací díl',
    shortTitle: 'Testovací díl',
    summary: 'Popis testovacího dílu.',
    hosts: [],
    audioUrl: 'https://audio.example.com/episode-1.mp3',
    videoUrl: YOUTUBE_VIDEO_URL,
    pageUrl: 'https://podcaster.example.com/episode-1',
    publishedAt: '2026-08-30T12:00:00.000Z',
    durationInSeconds: 1800,
    imageUrl: null,
    personIds: [],
};

afterEach(cleanup);

function renderEpisodeCard(
    episode: AiTaKrajtaEpisode,
    playbackProgress: PodcastEpisodePlaybackProgress | null = null,
): void {
    render(
        <AiTaKrajtaEpisodeCard
            episode={episode}
            isLoaded={false}
            isPlaying={false}
            playbackProgress={playbackProgress}
            selectedPersonId={null}
            onPlayToggle={vi.fn()}
            onPersonClick={vi.fn()}
        />,
    );
}

describe('AI ta Krajta episode card', () => {
    it('offers the particular YouTube video instead of the publisher page as its primary external link', () => {
        renderEpisodeCard(EPISODE);

        const episodeLink = screen.getByRole('link', { name: 'Otevřít na YouTube' });

        expect(episodeLink.getAttribute('href')).toBe(YOUTUBE_VIDEO_URL);
        expect(episodeLink.getAttribute('target')).toBe('_blank');
    });

    it('lists every credited person, including a person without a portrait profile', () => {
        renderEpisodeCard({ ...EPISODE, hosts: ['Pavol Hejný', 'Petr Šimeček'] });

        expect(screen.getByText('U mikrofonu: Pavol Hejný, Petr Šimeček')).toBeDefined();
    });

    it('opens the YouTube video from its round control when the RSS recording is not available yet', () => {
        renderEpisodeCard({ ...EPISODE, audioUrl: null });

        const episodeLinks = screen.getAllByRole('link');

        expect(episodeLinks.map((episodeLink) => episodeLink.getAttribute('href'))).toEqual([
            YOUTUBE_VIDEO_URL,
            YOUTUBE_VIDEO_URL,
        ]);
    });

    it('marks nothing on an episode which this browser never started', () => {
        renderEpisodeCard(EPISODE);

        expect(screen.queryByText('Přehráno')).toBeNull();
        expect(screen.queryByText(/^Zbývá /)).toBeNull();
        expect(screen.getByRole('button', { name: `Přehrát ${EPISODE.title}` })).toBeDefined();
    });

    it('says how much is left of an episode which was left in the middle and offers to continue in it', () => {
        renderEpisodeCard(EPISODE, {
            positionInSeconds: 600,
            durationInSeconds: 1800,
            isPlayed: false,
            updatedAt: Date.parse('2026-08-30T12:00:00.000Z'),
        });

        expect(screen.getByText('Zbývá 20:00')).toBeDefined();
        expect(screen.getByRole('button', { name: `Pokračovat v ${EPISODE.title}` })).toBeDefined();
    });

    it('marks an episode which was heard to its end as played', () => {
        renderEpisodeCard(EPISODE, {
            positionInSeconds: 1800,
            durationInSeconds: 1800,
            isPlayed: true,
            updatedAt: Date.parse('2026-08-30T12:00:00.000Z'),
        });

        expect(screen.getByText('Přehráno')).toBeDefined();
        expect(screen.queryByText(/^Zbývá /)).toBeNull();
    });
});
