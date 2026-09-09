import { ATOM_FEED_MEDIA_TYPES } from '@/lib/network/feedMediaTypes';
import { fetchCachedText } from '@/lib/network/fetchCachedText';
import {
    createYoutubeChannelFeedUrl,
    parseYoutubeChannelFeed,
    type YoutubeChannelVideo,
} from '@/lib/youtube/youtubeChannelFeed';

export type FetchYoutubeChannelVideosOptions = {
    /**
     * Identifier of the channel, for example `UC5Tbrm0RPCqaye9Nf5qIYGQ`
     */
    readonly channelId: string;

    /**
     * How long a fetched feed may be reused before it is read again
     */
    readonly revalidateSeconds: number;
};

/**
 * Reads the newest videos of a YouTube channel
 *
 * Note: A page which lists videos has to render even when YouTube is unreachable, so the caller receives no video
 *       instead of an exception.
 *
 * @returns videos of the channel, newest first, an empty list when the feed could not be read
 */
export async function fetchYoutubeChannelVideos(
    options: FetchYoutubeChannelVideosOptions,
): Promise<readonly YoutubeChannelVideo[]> {
    const feedXml = await fetchCachedText({
        url: createYoutubeChannelFeedUrl(options.channelId),
        revalidateSeconds: options.revalidateSeconds,
        acceptedMediaTypes: ATOM_FEED_MEDIA_TYPES,
    });

    return feedXml === null ? [] : parseYoutubeChannelFeed(feedXml);
}
