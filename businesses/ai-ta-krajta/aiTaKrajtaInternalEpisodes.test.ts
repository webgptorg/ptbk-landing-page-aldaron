import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { getAiTaKrajtaEpisodeLink } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeLink';
import {
    AI_TA_KRAJTA_INTERNAL_EPISODES,
    createAiTaKrajtaInternalEpisodes,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { AI_TA_KRAJTA_NAME } from '@/businesses/ai-ta-krajta/config';
import { mergePodcastEpisodes } from '@/lib/podcast/mergePodcastEpisodes';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { describe, expect, it } from 'vitest';

/**
 * Participant counts manually checked against the cover the show published for every video.
 *
 * The archive JSON remains the one source of the names themselves. Keeping just these independent counts here makes
 * an accidental omission visible without maintaining a second copy of every roster.
 */
const AUDITED_HOST_COUNTS_BY_YOUTUBE_VIDEO_ID: Readonly<Record<string, number>> = {
    zbVvChkQQHs: 3,
    '9kMN7t4kLNs': 3,
    '7drdqrvimS0': 3,
    J3gLNpOPr6o: 3,
    XkjNwXu9b4w: 3,
    '7So2NSC-UEw': 3,
    CTzZ0gm5RhQ: 3,
    p30kZEcrivI: 4,
    nC4hb2KoCno: 2,
    BQqEjLX2k5o: 4,
    '8-sTGboWE1o': 3,
    '8GQ7q3dm1MM': 3,
    KG9A8ry0MfI: 3,
    h2WGGZsH8Yk: 6,
    IO9jqmJzWSs: 3,
    wqfwjPznGo8: 5,
    c7YeaZFSmqs: 6,
    '5Sf1xOILuiI': 5,
    WJa9RGNRbUw: 5,
    O1o1QhYVKB4: 5,
    p9PvTNkc2qY: 4,
    VGm3XFBLgvg: 3,
    c3NusktZPH8: 5,
    L0_AZh8i9Wg: 4,
    xCdy420Cpw0: 4,
    VgPuJyJL5oE: 3,
    P8Z6nbPKklU: 4,
    '9Hv-Ci3o-jQ': 3,
    yVtLkDWrKe4: 3,
    Z8BnVKbWWT8: 2,
    uEYZATkfRcA: 4,
    '2Uiqu4hEx_g': 2,
    OG2rRDX8Evw: 5,
    W5RVPpiolYs: 3,
    'S-kv0ORNa_U': 3,
    relN1UILe5U: 3,
    ZGjPAEQhM0g: 3,
    '8pe_TMlItOY': 5,
    UkgMgDup1zg: 4,
    t7P1siPskAM: 3,
    '3zW6VeE0lCs': 5,
    zfw2OFjYxH8: 4,
    '_wI-urWvALU': 4,
    Kev5eZwiWMU: 5,
    RrKFAyYjbgg: 5,
    '0dfaV9MSyzk': 3,
    xtebb91xaIo: 5,
    OlUNTW1zNNM: 5,
    HkfwsujLKJE: 4,
    lRQvIPZ7Zmg: 4,
    nD1v9dMvnLY: 4,
    qJGlaeJzKb0: 6,
    '286qEr6Cjj0': 3,
    L7wFV3zND7s: 5,
    Vy4qWZQuyP4: 6,
    'yyjDIIz-rSw': 3,
    U6cN0r4NIgs: 5,
    x8jGleNWbGM: 4,
    XbJ38bwAI0s: 4,
    nybIDZw5tAs: 4,
    PPBfxWi_glM: 5,
    'tcpqmy-t7Y0': 4,
    H7cKQjOwmBM: 4,
    ePOYetVQiS0: 5,
    '9cHpxAIF0XQ': 4,
    i2WVm7smabY: 5,
    WkqtptW099E: 3,
};

const AUDITED_HOST_NAMES_BY_YOUTUBE_VIDEO_ID = [
    {
        youtubeVideoId: 'h2WGGZsH8Yk',
        hostNames: ['Pavol Hejný', 'Jiří Jahn', 'Petr Glaser', 'Katka Fajmanová', 'Dalibor Krejčí', 'Šimon Podhajský'],
    },
    {
        youtubeVideoId: 'VGm3XFBLgvg',
        hostNames: ['Tomáš Koblížek', 'Pavol Hejný', 'Jiří Jahn'],
    },
    {
        youtubeVideoId: 'tcpqmy-t7Y0',
        hostNames: ['Šimon Podhajský', 'Patrik Braborec', 'Jiří Jahn', 'Petr Šimeček'],
    },
    {
        youtubeVideoId: '7So2NSC-UEw',
        hostNames: ['Pavol Hejný', 'Roman Baranovič', 'Šimon Podhajský'],
    },
    {
        youtubeVideoId: 'J3gLNpOPr6o',
        hostNames: ['Pavol Hejný', 'Jiří Jahn', 'Katka Fajmanová'],
    },
] as const;

/**
 * Builds an episode of the page out of what one test is about, so that a test says only what it checks
 */
function createPageEpisode(values: Partial<AiTaKrajtaEpisode>): AiTaKrajtaEpisode {
    return {
        id: 'episode',
        slug: '1',
        number: 1,
        title: 'AI ta Krajta #1',
        shortTitle: 'Testovací díl',
        summary: '',
        audioUrl: 'https://example.com/1.mp3',
        videoUrl: null,
        pageUrl: null,
        publishedAt: '2026-08-01T00:00:00.000Z',
        durationInSeconds: 1800,
        imageUrl: null,
        hosts: [],
        personIds: [],
        ...values,
    };
}

describe('AI_TA_KRAJTA_INTERNAL_EPISODES', () => {
    it('carries the whole archive of the show', () => {
        expect(AI_TA_KRAJTA_INTERNAL_EPISODES.length).toBeGreaterThan(60);
    });

    it('names each episode once, so no episode can be listed twice', () => {
        const episodeKeys = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.number ?? episode.title);

        expect(new Set(episodeKeys).size).toBe(episodeKeys.length);
    });

    it('links every video by an address YouTube really serves', () => {
        const brokenVideoIds = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.youtubeVideoId).filter(
            (youtubeVideoId) => youtubeVideoId !== null && extractYoutubeVideoId(youtubeVideoId) === null,
        );

        expect(brokenVideoIds).toEqual([]);
    });

    it('says when every episode was published', () => {
        const brokenMoments = AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => episode.publishedAt).filter(
            (publishedAt) => Number.isNaN(new Date(publishedAt).getTime()),
        );

        expect(brokenMoments).toEqual([]);
    });

    it('keeps every participant counted in the published video covers', () => {
        const hostCountByYoutubeVideoId = Object.fromEntries(
            AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => [episode.youtubeVideoId, episode.hosts.length]),
        );

        expect(hostCountByYoutubeVideoId).toEqual(AUDITED_HOST_COUNTS_BY_YOUTUBE_VIDEO_ID);
    });

    it.each(AUDITED_HOST_NAMES_BY_YOUTUBE_VIDEO_ID)(
        'keeps the verified roster of $youtubeVideoId when a live description omits it',
        ({ youtubeVideoId, hostNames }) => {
            const episode = AI_TA_KRAJTA_INTERNAL_EPISODES.find(
                (candidate) => candidate.youtubeVideoId === youtubeVideoId,
            );

            expect(episode?.hosts).toEqual(hostNames);
        },
    );

    it('writes a non-empty roster of non-empty names for every episode', () => {
        expect(
            AI_TA_KRAJTA_INTERNAL_EPISODES.filter(
                (episode) => episode.hosts.length === 0 || episode.hosts.some((hostName) => hostName.trim() === ''),
            ).map((episode) => episode.number ?? episode.title),
        ).toEqual([]);
    });

    it('keeps a complete searchable transcript for every episode', () => {
        const incompletelyTranscribedEpisodes = AI_TA_KRAJTA_INTERNAL_EPISODES.filter(
            (episode) => episode.transcript.trim().length < 1_000,
        );

        expect(incompletelyTranscribedEpisodes).toEqual([]);
    });
});

describe('createAiTaKrajtaInternalEpisodes', () => {
    // Note: This is the archive as the page renders it while neither the podcast feed nor YouTube can be read, which
    //       is the whole reason the list is written down at all.
    const episodes = mergePodcastEpisodes([createAiTaKrajtaInternalEpisodes()], { showTitle: AI_TA_KRAJTA_NAME });

    it('lists the whole archive on its own, newest first', () => {
        expect(episodes.length).toBe(AI_TA_KRAJTA_INTERNAL_EPISODES.length);
        expect(episodes[0].publishedAt >= episodes[1].publishedAt).toBe(true);
    });

    it('gives every episode a link to watch and nothing to play', () => {
        const episodesWithoutVideo = episodes.filter((episode) => episode.videoUrl === null);

        expect(episodes.every((episode) => episode.audioUrl === null)).toBe(true);
        expect(episodesWithoutVideo.length).toBeLessThanOrEqual(1);
    });

    it('drops the repeated show name and number from the title of an episode', () => {
        expect(episodes.every((episode) => !episode.shortTitle.startsWith(AI_TA_KRAJTA_NAME))).toBe(true);
    });

    it('does not pass complete transcripts into the fallback archive', () => {
        const serializedEpisodes = JSON.stringify(createAiTaKrajtaInternalEpisodes());
        const firstTranscriptExcerpt = AI_TA_KRAJTA_INTERNAL_EPISODES[0]!.transcript.slice(0, 80);

        expect(serializedEpisodes).not.toContain('"transcript"');
        expect(serializedEpisodes).not.toContain(firstTranscriptExcerpt);
    });
});

describe('getAiTaKrajtaEpisodeLink', () => {
    it('opens an episode on YouTube whenever there is a video of it', () => {
        const episode = createPageEpisode({
            videoUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
            pageUrl: 'https://podcasters.example.com/1',
        });

        expect(getAiTaKrajtaEpisodeLink(episode)).toEqual({
            label: 'Otevřít na YouTube',
            url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
        });
    });

    it('falls back to the page of the publisher for an episode which has no video', () => {
        const episode = createPageEpisode({ pageUrl: 'https://podcasters.example.com/1' });

        expect(getAiTaKrajtaEpisodeLink(episode)).toEqual({
            label: 'Otevřít u vydavatele',
            url: 'https://podcasters.example.com/1',
        });
    });

    it('offers nothing rather than a dead link for an episode nobody links', () => {
        expect(getAiTaKrajtaEpisodeLink(createPageEpisode({}))).toBeNull();
    });
});
