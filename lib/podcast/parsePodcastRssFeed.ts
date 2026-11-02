import { convertHtmlDescriptionToPlainText } from '@/lib/text/descriptionText';
import { parsePodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import {
    createPodcastEpisodeShortTitle,
    createPodcastEpisodeSlug,
    createPodcastEpisodeTitleSlug,
    readPodcastEpisodeNumberFromTitle,
} from '@/lib/podcast/podcastEpisodeIdentity';
import { EMPTY_PODCAST_FEED, type PodcastEpisode, type PodcastFeed } from '@/lib/podcast/PodcastFeed';
import { createPodcastEpisodeSummary, type PodcastShowConventions } from '@/lib/podcast/podcastShowConventions';
import { readRssChannelHeader } from '@/lib/podcast/rssXml';
import { readXmlElements, readXmlTagAttribute, readXmlTagText } from '@/lib/xml/xmlTags';

export type ParsePodcastRssFeedOptions = PodcastShowConventions & {
    /**
     * Reads names which this particular show writes in the original description
     *
     * Note: The generic parser deliberately knows no show's roster. The raw description is provided before links and
     *       HTML are removed, because a publisher can place `Hosté:` directly after a URL without a separating space.
     */
    readonly readEpisodeHostNames?: (descriptionHtml: string) => readonly string[];
};

/**
 * Reads the number of an episode, which a feed either writes into the title as `#64` or states in its own tag
 *
 * Note: The title wins, because it is the number the listeners see and quote. The tag is a second place where the
 *       editors type the same number, and this very feed has already shipped two different episodes stating `62`.
 */
function readEpisodeNumber(itemXml: string, title: string): number | null {
    const titleNumber = readPodcastEpisodeNumberFromTitle(title);

    if (titleNumber !== null) {
        return titleNumber;
    }

    const statedNumber = Number(readXmlTagText(itemXml, 'itunes:episode'));

    return Number.isSafeInteger(statedNumber) && statedNumber > 0 ? statedNumber : null;
}

/**
 * Reads the whole description of an episode as plain text
 */
function readDescriptionHtml(itemXml: string): string {
    return readXmlTagText(itemXml, 'description') ?? readXmlTagText(itemXml, 'itunes:summary') ?? '';
}

/**
 * Reads the moment an episode was published, falling back to the beginning of time so that sorting never throws
 */
function readPublishedAt(itemXml: string): string {
    const publishedAt = new Date(readXmlTagText(itemXml, 'pubDate') ?? '');

    return Number.isNaN(publishedAt.getTime()) ? new Date(0).toISOString() : publishedAt.toISOString();
}

/**
 * Reads one `<item>` of a feed as one episode, `null` when it has nothing to play
 */
function parsePodcastEpisode(itemXml: string, options: ParsePodcastRssFeedOptions): PodcastEpisode | null {
    const audioUrl = readXmlTagAttribute(itemXml, 'enclosure', 'url');
    const title = readXmlTagText(itemXml, 'title');

    if (audioUrl === null || title === null) {
        return null;
    }

    const number = readEpisodeNumber(itemXml, title);
    const descriptionHtml = readDescriptionHtml(itemXml);
    const descriptionText = convertHtmlDescriptionToPlainText(descriptionHtml);

    return {
        id: readXmlTagText(itemXml, 'guid') ?? audioUrl,
        slug: createPodcastEpisodeSlug(number, title),
        number,
        title,
        shortTitle: createPodcastEpisodeShortTitle(title, options.showTitle),
        summary: createPodcastEpisodeSummary(descriptionText, options.summaryStopPhrases),
        descriptionText,
        hosts: options.readEpisodeHostNames?.(descriptionHtml) ?? [],
        audioUrl,
        ...(Number(readXmlTagAttribute(itemXml, 'enclosure', 'length')) > 0 ? { audioByteLength: Number(readXmlTagAttribute(itemXml, 'enclosure', 'length')) } : {}),
        videoUrl: null,
        pageUrl: readXmlTagText(itemXml, 'link'),
        publishedAt: readPublishedAt(itemXml),
        durationInSeconds: parsePodcastEpisodeDuration(readXmlTagText(itemXml, 'itunes:duration')),
        imageUrl: readXmlTagAttribute(itemXml, 'itunes:image', 'href'),
    };
}

/**
 * Makes sure that a link which names one episode can never mean two of them
 *
 * Note: Two episodes end up sharing a slug whenever the editors mistype a number, which they do. The older of the two
 *       keeps the number and its title takes over, so that the newest episode always has the short link.
 */
function withUniqueSlugs(episodes: readonly PodcastEpisode[]): readonly PodcastEpisode[] {
    const takenSlugs = new Set<string>();

    return episodes.map((episode) => {
        if (!takenSlugs.has(episode.slug)) {
            takenSlugs.add(episode.slug);
            return episode;
        }

        return { ...episode, slug: createPodcastEpisodeTitleSlug(episode.title) };
    });
}

/**
 * Reads a podcast and its episodes out of the RSS feed the publisher of the podcast serves
 *
 * Note: Nothing here invents a value which the feed does not state. What the feed does not carry at all, such as the
 *       video of an episode, is left to the other sources of the archive. An episode which has no audio is left out,
 *       because an `<item>` of a podcast feed without a recording is not an episode.
 *
 * @param xml body of the RSS feed
 * @param options habits of the one show, such as how its titles and descriptions are written
 * @returns the show with its episodes sorted from the newest one
 */
export function parsePodcastRssFeed(xml: string, options: ParsePodcastRssFeedOptions = {}): PodcastFeed {
    const channelHeader = readRssChannelHeader(xml);
    const episodes = withUniqueSlugs(
        readXmlElements(xml, 'item')
            .map((itemXml) => parsePodcastEpisode(itemXml, options))
            .filter((episode): episode is PodcastEpisode => episode !== null)
            .sort((firstEpisode, secondEpisode) => secondEpisode.publishedAt.localeCompare(firstEpisode.publishedAt)),
    );

    return {
        ...EMPTY_PODCAST_FEED,
        title: readXmlTagText(channelHeader, 'title') ?? EMPTY_PODCAST_FEED.title,
        description: readXmlTagText(channelHeader, 'description') ?? EMPTY_PODCAST_FEED.description,
        imageUrl: readXmlTagAttribute(channelHeader, 'itunes:image', 'href'),
        episodes,
    };
}
