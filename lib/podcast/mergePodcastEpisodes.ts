import {
    createPodcastEpisodeShortTitle,
    createPodcastEpisodeSlug,
    readPodcastEpisodeNumberFromTitle,
} from '@/lib/podcast/podcastEpisodeIdentity';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';
import { createPodcastEpisodeSummary, type PodcastShowConventions } from '@/lib/podcast/podcastShowConventions';

/**
 * What one source of an archive knows about one episode
 *
 * Note: No source knows everything. The feed of the show carries the recording and the description, the video channel
 *       carries the video, and the list kept in the application carries whatever neither of them can be asked for at
 *       the moment. Every source therefore describes an episode as far as it can and leaves the rest out.
 */
export type PartialPodcastEpisode = Partial<PodcastEpisode> & Pick<PodcastEpisode, 'title'>;

export type MergePodcastEpisodesOptions = PodcastShowConventions;

/**
 * The moment an episode is treated as published when no source says when it was
 */
const UNKNOWN_PUBLISHED_AT = new Date(0).toISOString();

/**
 * Whether a source said nothing about a value, so that a source after it may still say it
 *
 * Note: An empty text is nothing said rather than something said, because a feed which has no description for an
 *       episode publishes an empty `<description>` rather than none.
 */
function isValueMissing(value: unknown): boolean {
    return value === undefined || value === null || value === '';
}

/**
 * Writes a host name the way it is compared across publishers
 *
 * Note: The names remain as their first source spells them. This key exists only to keep `Jiří Jahn` and `Jiri Jahn`
 *       from rendering as two people when two publishers disagree about diacritics.
 */
function normalizePodcastEpisodeHostName(hostName: string): string {
    return hostName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/**
 * Joins the named people of every source without losing anyone a source explicitly listed
 */
function mergePodcastEpisodeHostNames(
    ...hostNameLists: readonly (readonly string[] | undefined)[]
): readonly string[] {
    const hostNamesByNormalizedName = new Map<string, string>();

    for (const hostNames of hostNameLists) {
        for (const hostName of hostNames ?? []) {
            const trimmedHostName = hostName.trim();

            if (trimmedHostName === '') {
                continue;
            }

            const normalizedHostName = normalizePodcastEpisodeHostName(trimmedHostName);

            if (!hostNamesByNormalizedName.has(normalizedHostName)) {
                hostNamesByNormalizedName.set(normalizedHostName, trimmedHostName);
            }
        }
    }

    return Array.from(hostNamesByNormalizedName.values());
}

/**
 * Adds to an episode everything a less preferred source knows about it and the preferred one does not
 */
function fillMissingValues(
    preferredEpisode: PartialPodcastEpisode,
    fallbackEpisode: PartialPodcastEpisode,
): PartialPodcastEpisode {
    const { hosts: fallbackHosts, ...fallbackEpisodeWithoutHosts } = fallbackEpisode;
    const filledValues = Object.entries(fallbackEpisodeWithoutHosts).filter(
        ([valueName, value]) =>
            !isValueMissing(value) && isValueMissing(preferredEpisode[valueName as keyof PartialPodcastEpisode]),
    );
    const hosts = mergePodcastEpisodeHostNames(preferredEpisode.hosts, fallbackHosts);
    const filledFallbackValues = Object.fromEntries(filledValues) as Partial<PodcastEpisode>;

    // Note: Scalar values are filled by their name rather than one by one, so that another thing worth knowing about
    //       an episode is added to `PodcastEpisode` alone and merges without this function being touched. Host names
    //       are deliberately different: every source may know a different person, so their union is the useful value.
    return {
        ...preferredEpisode,
        ...filledFallbackValues,
        ...(hosts.length === 0 ? {} : { hosts }),
    };
}

/**
 * Fills in everything an episode still lacks after every source has said what it knows
 */
function completePodcastEpisode(
    slug: string,
    episode: PartialPodcastEpisode,
    options: MergePodcastEpisodesOptions,
): PodcastEpisode {
    const descriptionText = episode.descriptionText ?? '';

    return {
        id: episode.id ?? slug,
        slug,
        number: episode.number ?? readPodcastEpisodeNumberFromTitle(episode.title),
        title: episode.title,
        shortTitle: episode.shortTitle ?? createPodcastEpisodeShortTitle(episode.title, options.showTitle),
        summary: episode.summary ?? createPodcastEpisodeSummary(descriptionText, options.summaryStopPhrases),
        descriptionText,
        hosts: mergePodcastEpisodeHostNames(episode.hosts),
        audioUrl: episode.audioUrl ?? null,
        ...(episode.audioByteLength ? { audioByteLength: episode.audioByteLength } : {}),
        videoUrl: episode.videoUrl ?? null,
        pageUrl: episode.pageUrl ?? null,
        publishedAt: episode.publishedAt ?? UNKNOWN_PUBLISHED_AT,
        durationInSeconds: episode.durationInSeconds ?? null,
        imageUrl: episode.imageUrl ?? null,
    };
}

/**
 * The identifier under which every source describes the same episode
 *
 * Note: An episode is the number the show gave it, which every place it is published repeats in the title. A special
 *       published outside the numbering is its own title instead, which the shows write identically wherever they
 *       publish it, because there is nothing else two places would agree on.
 */
function readEpisodeSlug(episode: PartialPodcastEpisode): string {
    return (
        episode.slug ??
        createPodcastEpisodeSlug(episode.number ?? readPodcastEpisodeNumberFromTitle(episode.title), episode.title)
    );
}

/**
 * Brings together what several sources say about the episodes of one show
 *
 * Note: Two sources describing one episode make one episode carrying the most either of them knows, rather than two
 *       entries or one impoverished entry. A source which is listed earlier is the more trusted one for scalar values:
 *       a later source only fills in what no earlier source said, and never overwrites it. The one exception is
 *       `hosts`, whose values are joined by name because each source can list a different person.
 *
 * @param sources episodes of each source, in the order the sources are trusted
 * @param options habits of the one show, such as how its titles are written
 * @returns every episode any source knows, newest first, each of them exactly once
 */
export function mergePodcastEpisodes(
    sources: readonly (readonly PartialPodcastEpisode[])[],
    options: MergePodcastEpisodesOptions = {},
): readonly PodcastEpisode[] {
    const episodesBySlug = new Map<string, PartialPodcastEpisode>();

    for (const sourceEpisodes of sources) {
        for (const episode of sourceEpisodes) {
            const slug = readEpisodeSlug(episode);
            const knownEpisode = episodesBySlug.get(slug);

            episodesBySlug.set(
                slug,
                knownEpisode === undefined ? episode : fillMissingValues(knownEpisode, episode),
            );
        }
    }

    return Array.from(episodesBySlug, ([slug, episode]) => completePodcastEpisode(slug, episode, options)).sort(
        (firstEpisode, secondEpisode) => secondEpisode.publishedAt.localeCompare(firstEpisode.publishedAt),
    );
}
