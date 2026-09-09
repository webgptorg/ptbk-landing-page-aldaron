import { RSS_FEED_MEDIA_TYPES } from '@/lib/network/feedMediaTypes';
import { fetchCachedText } from '@/lib/network/fetchCachedText';
import { parsePodcastRssFeed, type ParsePodcastRssFeedOptions } from '@/lib/podcast/parsePodcastRssFeed';
import { EMPTY_PODCAST_FEED, type PodcastFeed } from '@/lib/podcast/PodcastFeed';

export type FetchPodcastFeedOptions = ParsePodcastRssFeedOptions & {
    /**
     * Address of the RSS feed of the show
     */
    readonly feedUrl: string;

    /**
     * How long a fetched feed may be reused before it is read again
     */
    readonly revalidateSeconds: number;
};

/**
 * Reads the feed of a podcast from its publisher
 *
 * Note: A page which lists episodes has to render even when the publisher is unreachable or answers with something
 *       which is not a feed, so the caller receives a show without episodes instead of an exception.
 *
 * @returns the show with its episodes, or `EMPTY_PODCAST_FEED` when the feed could not be read
 */
export async function fetchPodcastFeed(options: FetchPodcastFeedOptions): Promise<PodcastFeed> {
    const { feedUrl, revalidateSeconds, ...parseOptions } = options;

    const feedXml = await fetchCachedText({
        url: feedUrl,
        revalidateSeconds,
        acceptedMediaTypes: RSS_FEED_MEDIA_TYPES,
    });

    return feedXml === null ? EMPTY_PODCAST_FEED : parsePodcastRssFeed(feedXml, parseOptions);
}
