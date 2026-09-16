import { SECONDS_PER_MINUTE, splitDurationIntoParts } from '@/lib/durationParts';

/**
 * Reads the length of a recording as an RSS feed states it
 *
 * A feed may write it as `HH:MM:SS`, as `MM:SS` or as a plain number of seconds, and all three mean the same thing.
 *
 * @returns length in seconds, `null` when the feed states something which is not a length
 */
export function parsePodcastEpisodeDuration(rawDuration: string | null): number | null {
    if (rawDuration === null) {
        return null;
    }

    const parts = rawDuration.trim().split(':');

    if (parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) {
        return null;
    }

    const durationInSeconds = parts.reduce((seconds, part) => seconds * SECONDS_PER_MINUTE + Number(part), 0);

    return durationInSeconds > 0 ? durationInSeconds : null;
}

/**
 * Writes a media length the way somebody reads it before deciding to press play.
 *
 * @param durationInSeconds length of the recording
 * @returns length written as `1:05:30` or as `35:34`
 */
export function formatMediaDuration(durationInSeconds: number): string {
    const { hours, minutes, seconds } = splitDurationIntoParts(durationInSeconds);
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours === 0) {
        return `${minutes}:${paddedSeconds}`;
    }

    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`;
}

/**
 * The podcast name remains for existing callers, while video cards use the media-wide formatter above.
 */
export function formatPodcastEpisodeDuration(durationInSeconds: number): string {
    return formatMediaDuration(durationInSeconds);
}
