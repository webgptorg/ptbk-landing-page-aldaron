import { fetchCachedText } from '@/lib/network/fetchCachedText';
import { createYoutubeWatchUrl } from '@/lib/youtube/youtubeEmbed';

const YOUTUBE_WATCH_PAGE_MEDIA_TYPES = 'text/html,application/xhtml+xml;q=0.9';
const YOUTUBE_VIDEO_DURATION_PATTERN = /(?:\\?")lengthSeconds(?:\\?")\s*:\s*(?:\\?")(\d+)(?:\\?")/;

export type FetchYoutubeVideoDurationOptions = {
    readonly videoId: string;
    readonly revalidateSeconds: number;
};

/**
 * Reads the total duration from the public YouTube player data embedded in a watch page.
 *
 * Note: A channel feed deliberately has no duration field. The watch page is therefore the keyless public source for
 *       a workshop replay's length, and an unknown or unavailable video stays lengthless instead of holding a card
 *       render up with an error.
 */
export function parseYoutubeVideoDurationSeconds(html: string): number | null {
    const durationMatch = html.match(YOUTUBE_VIDEO_DURATION_PATTERN);
    const durationInSeconds = Number(durationMatch?.[1]);

    return Number.isSafeInteger(durationInSeconds) && durationInSeconds > 0 ? durationInSeconds : null;
}

/**
 * Fetches the total duration of one public YouTube video, or nothing while YouTube does not expose it.
 */
export async function fetchYoutubeVideoDurationSeconds({
    videoId,
    revalidateSeconds,
}: FetchYoutubeVideoDurationOptions): Promise<number | null> {
    const watchPageHtml = await fetchCachedText({
        url: createYoutubeWatchUrl(videoId),
        revalidateSeconds,
        acceptedMediaTypes: YOUTUBE_WATCH_PAGE_MEDIA_TYPES,
    });

    return watchPageHtml === null ? null : parseYoutubeVideoDurationSeconds(watchPageHtml);
}
