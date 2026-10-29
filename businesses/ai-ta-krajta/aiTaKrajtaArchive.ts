import type { AiTaKrajtaArchive, AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { createAiTaKrajtaAudienceStatistics } from '@/businesses/ai-ta-krajta/aiTaKrajtaAudienceStatistics';
import { readAiTaKrajtaEpisodeHostNames } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeHosts';
import { resolveAiTaKrajtaEpisodePersonIds } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { createAiTaKrajtaInternalEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import { fetchAiTaKrajtaPublicPlatformStatistics } from '@/businesses/ai-ta-krajta/aiTaKrajtaPublicPlatformStatistics';
import {
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_RSS_FEED_URL,
    AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_ID,
} from '@/businesses/ai-ta-krajta/config';
import { fetchPodcastFeed } from '@/lib/podcast/fetchPodcastFeed';
import { mergePodcastEpisodes, type PartialPodcastEpisode } from '@/lib/podcast/mergePodcastEpisodes';
import { createPodcastEpisodesFromYoutubeVideos } from '@/lib/podcast/podcastEpisodesFromYoutube';
import type { PodcastShowConventions } from '@/lib/podcast/podcastShowConventions';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';
import { fetchYoutubeChannelVideos } from '@/lib/youtube/fetchYoutubeChannelVideos';
import { cache } from 'react';

const SECONDS_PER_MINUTE = 60;

/**
 * How this one show writes its titles and its descriptions, which every source of its archive is read by
 */
const AI_TA_KRAJTA_SHOW_CONVENTIONS: PodcastShowConventions = {
    showTitle: AI_TA_KRAJTA_NAME,
    summaryStopPhrases: AI_TA_KRAJTA_SUMMARY_STOP_PHRASES,
};

/**
 * What the RSS feed itself knows in addition to the fields common to every source
 */
const AI_TA_KRAJTA_RSS_FEED_OPTIONS = {
    ...AI_TA_KRAJTA_SHOW_CONVENTIONS,
    readEpisodeHostNames: readAiTaKrajtaEpisodeHostNames,
};

/**
 * What the YouTube channel itself knows in addition to the fields common to every source
 */
const AI_TA_KRAJTA_YOUTUBE_EPISODE_OPTIONS = {
    readEpisodeHostNames: readAiTaKrajtaEpisodeHostNames,
};

/**
 * How long an episode usually takes, which says more about the show than an average dragged by one four hour special
 */
function getMedianDurationInMinutes(episodes: readonly AiTaKrajtaEpisode[]): number | null {
    const durations = episodes
        .map((episode) => episode.durationInSeconds)
        .filter((durationInSeconds): durationInSeconds is number => durationInSeconds !== null)
        .sort((firstDuration, secondDuration) => firstDuration - secondDuration);

    if (durations.length === 0) {
        return null;
    }

    return Math.round(durations[Math.floor(durations.length / 2)] / SECONDS_PER_MINUTE);
}

/**
 * Turns one merged episode into the episode the page renders, leaving its whole description behind
 */
function createAiTaKrajtaEpisode(episode: PodcastEpisode): AiTaKrajtaEpisode {
    const { descriptionText, ...episodeWithoutDescription } = episode;

    return { ...episodeWithoutDescription, personIds: resolveAiTaKrajtaEpisodePersonIds(episode) };
}

/**
 * Asks every source of the archive what it knows about the episodes, in the order the sources are trusted
 *
 * Note: The podcast feed is asked first, because it is the show publishing itself and the only source which carries a
 *       recording to play. YouTube follows it with the video of an episode and with an episode which is already out as
 *       a video while the feed has not caught up. The written down list closes the row, filling in what neither could
 *       be asked for - and carrying the whole archive on its own while both of them are unreachable.
 *
 * @param revalidateSeconds how long a fetched source may be reused
 */
async function fetchAiTaKrajtaEpisodeSources(
    revalidateSeconds: number,
): Promise<readonly (readonly PartialPodcastEpisode[])[]> {
    const [feed, youtubeVideos] = await Promise.all([
        fetchPodcastFeed({
            feedUrl: AI_TA_KRAJTA_RSS_FEED_URL,
            revalidateSeconds,
            ...AI_TA_KRAJTA_RSS_FEED_OPTIONS,
        }),
        fetchYoutubeChannelVideos({ channelId: AI_TA_KRAJTA_YOUTUBE_CHANNEL_ID, revalidateSeconds }),
    ]);

    return [
        feed.episodes,
        createPodcastEpisodesFromYoutubeVideos(youtubeVideos, AI_TA_KRAJTA_YOUTUBE_EPISODE_OPTIONS),
        createAiTaKrajtaInternalEpisodes(),
    ];
}

/**
 * Reads the archive of the show out of every source there is of it
 *
 * Note: This runs on the server, so the browser receives one list of episodes which already know who took part in
 *       them, where they are watched and what is played from them, and which no longer carry the whole description
 *       they were read out of. Nothing of the sources themselves reaches the browser - a listener never downloads a
 *       feed - and the recording of an episode is played straight from where the show publishes it.
 *
 * @param revalidateSeconds how long a fetched source may be reused, which the route decides together with how long it
 *                          reuses the page built from it
 */
export const fetchAiTaKrajtaEpisodes = cache(async (revalidateSeconds: number): Promise<readonly AiTaKrajtaEpisode[]> => {
    const sources = await fetchAiTaKrajtaEpisodeSources(revalidateSeconds);
    return mergePodcastEpisodes(sources, AI_TA_KRAJTA_SHOW_CONVENTIONS).map(createAiTaKrajtaEpisode);
});

/** Consumers listing recordings alone never fetch audience profiles. */
export const fetchAiTaKrajtaArchive = cache(async (revalidateSeconds: number): Promise<AiTaKrajtaArchive> => {
    const [episodes, platformStatistics] = await Promise.all([
        fetchAiTaKrajtaEpisodes(revalidateSeconds),
        fetchAiTaKrajtaPublicPlatformStatistics(revalidateSeconds),
    ]);

    return {
        episodes,
        statistics: createAiTaKrajtaAudienceStatistics(episodes, platformStatistics),
        firstPublishedAt: episodes[episodes.length - 1]?.publishedAt ?? null,
        medianDurationInMinutes: getMedianDurationInMinutes(episodes),
    };
});
