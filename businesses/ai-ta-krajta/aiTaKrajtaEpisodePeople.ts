import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AI_TA_KRAJTA_PEOPLE, getAiTaKrajtaPersonById, isAiTaKrajtaPersonNamedByText, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    createAiTaKrajtaSearchWords,
    isAiTaKrajtaTextMatchingSearchWords,
    normalizeAiTaKrajtaSearchText,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaTextSearch';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';

/**
 * Does the episode name this person, either in its own words or in the roster?
 */
function isPersonInEpisode(person: AiTaKrajtaPerson, episode: PodcastEpisode, episodeText: string): boolean {
    if (episode.number !== null && person.episodeNumbers.includes(episode.number)) {
        return true;
    }

    return person.mentionPatterns.some((pattern) => episodeText.includes(normalizeAiTaKrajtaSearchText(pattern)));
}

/**
 * Does a merged source explicitly list this person by name?
 */
function isPersonListedAsHost(person: AiTaKrajtaPerson, hostNames: readonly string[]): boolean {
    return hostNames.some((hostName) => isAiTaKrajtaPersonNamedByText(person, hostName));
}

/**
 * Works out who took part in one episode
 *
 * Note: The show names its participants in the episode description, usually in the list of guests at its end, so this
 *       reads them from there instead of keeping a second cast list which would go stale with the next episode. An
 *       episode which names nobody gets nobody, because guessing a face onto an episode is worse than showing none.
 */
export function resolveAiTaKrajtaEpisodePersonIds(episode: PodcastEpisode): readonly string[] {
    const episodeText = normalizeAiTaKrajtaSearchText(`${episode.title} ${episode.descriptionText}`);

    return AI_TA_KRAJTA_PEOPLE.filter(
        (person) => isPersonListedAsHost(person, episode.hosts) || isPersonInEpisode(person, episode, episodeText),
    ).map((person) => person.id);
}

/**
 * People of one episode, an empty list when the episode names nobody
 */
export function getAiTaKrajtaEpisodePeople(episode: AiTaKrajtaEpisode): readonly AiTaKrajtaPerson[] {
    return episode.personIds
        .map((personId) => getAiTaKrajtaPersonById(personId))
        .filter((person): person is AiTaKrajtaPerson => person !== null);
}

/**
 * How many episodes each person took part in, looked up by the identifier of that person
 */
export function countAiTaKrajtaEpisodesByPerson(
    episodes: readonly AiTaKrajtaEpisode[],
): ReadonlyMap<string, number> {
    const episodeCountByPersonId = new Map<string, number>();

    for (const episode of episodes) {
        for (const personId of episode.personIds) {
            episodeCountByPersonId.set(personId, (episodeCountByPersonId.get(personId) ?? 0) + 1);
        }
    }

    return episodeCountByPersonId;
}

export type AiTaKrajtaEpisodeFilter = {
    /**
     * Only episodes with this person, `null` for all of them
     */
    readonly personId: string | null;

    /**
     * Words which have to appear in the title or in the summary of the episode
     */
    readonly searchQuery: string;

    /**
     * Safe episode identifiers returned by the server-only transcript search
     */
    readonly transcriptMatchingEpisodeSlugs: readonly string[];
};

/**
 * Narrows the archive down to what the visitor asked for
 *
 * Note: This is the one place which decides what the list shows, so the count next to the filter and the list below
 *       it can never disagree.
 */
export function filterAiTaKrajtaEpisodes(
    episodes: readonly AiTaKrajtaEpisode[],
    filter: AiTaKrajtaEpisodeFilter,
): readonly AiTaKrajtaEpisode[] {
    const searchWords = createAiTaKrajtaSearchWords(filter.searchQuery);
    const transcriptMatchingEpisodeSlugSet = new Set(filter.transcriptMatchingEpisodeSlugs);

    return episodes.filter((episode) => {
        if (filter.personId !== null && !episode.personIds.includes(filter.personId)) {
            return false;
        }

        // Note: The search reads what the card shows plus the number of the episode. The full title would drag the
        //       name of the show into every episode, so typing `krajta` would find all of them and nothing else.
        const episodeText = `${episode.number ?? ''} ${episode.shortTitle} ${episode.summary}`;

        return (
            isAiTaKrajtaTextMatchingSearchWords(episodeText, searchWords) ||
            transcriptMatchingEpisodeSlugSet.has(episode.slug)
        );
    });
}
