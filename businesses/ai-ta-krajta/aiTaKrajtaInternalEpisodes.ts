import aiTaKrajtaEpisodes from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json';
import type { PartialPodcastEpisode } from '@/lib/podcast/mergePodcastEpisodes';
import { createYoutubeWatchUrl } from '@/lib/youtube/youtubeEmbed';

/**
 * One episode as this application itself knows it, without asking anybody
 */
export type AiTaKrajtaInternalEpisode = {
    /**
     * Number of the episode, `null` for a special which was published outside the numbering
     */
    readonly number: number | null;

    /**
     * Title the episode is published under, including the show name and the episode number
     */
    readonly title: string;

    /**
     * Moment the episode was published, as an ISO 8601 string
     */
    readonly publishedAt: string;

    /**
     * Length of the recording in seconds, `null` when it is not known
     */
    readonly durationInSeconds: number | null;

    /**
     * Video of the episode on YouTube, `null` for an episode which was never published there
     */
    readonly youtubeVideoId: string | null;

    /**
     * People known to have been at the microphone, written by their published names
     *
     * Note: This closes gaps in descriptions which do not list the people at all. It remains a source rather than an
     *       override: `mergePodcastEpisodes` joins it with the names found in the live RSS and YouTube feeds.
     */
    readonly hosts: readonly string[];

    /**
     * Complete Czech transcript of the recording, retained only for server-side archive search
     *
     * Note: `createAiTaKrajtaInternalEpisodes` deliberately does not pass this into a podcast episode, which keeps
     *       the transcript out of the object a page serializes to a browser.
     */
    readonly transcript?: string;

    /** A separately committed, speaker-labelled transcript. Unmigrated episodes retain their inline text. */
    readonly transcriptFile?: string;
};

/**
 * Every episode of the show as this application has it written down
 *
 * Note: This list exists for two reasons. It is what the page falls back on when neither the podcast feed nor YouTube
 *       can be read, so the archive is listed rather than empty; and it is where an episode gets what no feed can be
 *       asked for - most of all the video of an episode older than the handful of videos the channel feed lists.
 *
 *       It is therefore neither the source of truth nor a place to correct a mistake of the feed: whatever the feed
 *       and the channel say wins over it. It goes out of date slowly and harmlessly, because a new episode reaches the
 *       page from the two live sources long before anybody adds it here.
 */
export const AI_TA_KRAJTA_INTERNAL_EPISODES: readonly AiTaKrajtaInternalEpisode[] = aiTaKrajtaEpisodes;

/**
 * Reads the written down episodes as one source of the archive
 */
export function createAiTaKrajtaInternalEpisodes(): readonly PartialPodcastEpisode[] {
    return AI_TA_KRAJTA_INTERNAL_EPISODES.map((episode) => ({
        id: `internal:${episode.number ?? episode.title}`,
        number: episode.number,
        title: episode.title,
        publishedAt: episode.publishedAt,
        durationInSeconds: episode.durationInSeconds,
        hosts: episode.hosts,
        videoUrl: episode.youtubeVideoId === null ? null : createYoutubeWatchUrl(episode.youtubeVideoId),
    }));
}
