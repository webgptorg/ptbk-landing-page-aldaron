export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

/**
 * One length of time read as the hours, minutes and seconds a person writes it in
 */
export type DurationParts = {
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
};

/**
 * Reads a length of time as the hours, minutes and seconds it is made of
 *
 * Note: Seconds remain the one stored value everywhere; these parts exist only so that somebody can write a position
 *       in a recording as a clock instead of counting it out in seconds.
 *
 * @param durationInSeconds length of time, of which anything but a whole non-negative number is read as none at all
 */
export function splitDurationIntoParts(durationInSeconds: number): DurationParts {
    const wholeSeconds = Number.isFinite(durationInSeconds) ? Math.max(0, Math.trunc(durationInSeconds)) : 0;

    return {
        hours: Math.floor(wholeSeconds / SECONDS_PER_HOUR),
        minutes: Math.floor(wholeSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR,
        seconds: wholeSeconds % SECONDS_PER_MINUTE,
    };
}

/**
 * Writes hours, minutes and seconds back as the one length of time they mean
 */
export function joinDurationParts({ hours, minutes, seconds }: DurationParts): number {
    return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}
