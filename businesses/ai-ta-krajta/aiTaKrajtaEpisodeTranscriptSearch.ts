import {
    AI_TA_KRAJTA_INTERNAL_EPISODES,
    type AiTaKrajtaInternalEpisode,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes';
import {
    createAiTaKrajtaSearchWords,
    isAiTaKrajtaTextMatchingSearchWords,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaTextSearch';
import { createPodcastEpisodeSlug } from '@/lib/podcast/podcastEpisodeIdentity';
import { readPodcastTranscript } from '@/lib/podcast/readPodcastTranscript';

/**
 * Finds the safe identifiers of episodes whose complete server-side transcript contains every searched word
 *
 * Note: This module deliberately stays on the server-side path. It returns only episode slugs, never a transcript,
 *       so the archive rendered by the browser remains as small and private as before.
 */
export function findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(
    episodes: readonly AiTaKrajtaInternalEpisode[],
    searchQuery: string,
): readonly string[] {
    const searchWords = createAiTaKrajtaSearchWords(searchQuery);

    if (searchWords.length === 0) {
        return [];
    }

    return episodes
        .filter((episode) => isAiTaKrajtaTextMatchingSearchWords(readPodcastTranscript(episode), searchWords))
        .map((episode) => createPodcastEpisodeSlug(episode.number, episode.title));
}

/**
 * Finds the safe identifiers of the written-down archive episodes which mention the searched words in their transcript
 */
export function findAiTaKrajtaEpisodeSlugsMatchingTranscript(searchQuery: string): readonly string[] {
    return findAiTaKrajtaEpisodeSlugsMatchingTranscriptInEpisodes(AI_TA_KRAJTA_INTERNAL_EPISODES, searchQuery);
}
