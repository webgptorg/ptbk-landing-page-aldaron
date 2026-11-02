/**
 * One episode of a podcast, however many places publish it
 *
 * Note: The same episode is published in the RSS feed of the show, on its video channel and in the list this
 *       application keeps of it, and no one of those knows everything about it. What every source says is merged into
 *       one episode of this shape, so nothing beyond `mergePodcastEpisodes` has to know where a value came from.
 */
export type PodcastEpisode = {
    /**
     * Identifier given by the feed, unique within the feed and stable across its rebuilds
     */
    readonly id: string;

    /**
     * Short identifier of the episode in a link, for example `64`
     */
    readonly slug: string;

    /**
     * Number of the episode, `null` for a special which is published outside the numbering
     */
    readonly number: number | null;

    /**
     * Title as the feed publishes it, including the show name and the episode number
     */
    readonly title: string;

    /**
     * Title without the repeated show name and episode number, which is what a listing shows
     */
    readonly shortTitle: string;

    /**
     * Description of the episode with its markup and its link list removed
     */
    readonly summary: string;

    /**
     * Whole description of the episode as plain text, including what the summary cuts away
     *
     * Note: The tail of a description is where the show lists who was at the microphone, so it is kept for whoever
     *       wants to read facts out of it. It is long, so a page should not hand it to the browser unread.
     */
    readonly descriptionText: string;

    /**
     * Names of everyone the publisher explicitly lists as being at the microphone
     *
     * Note: A feed, a video channel and an application's own archive can each name a different part of the group.
     *       `mergePodcastEpisodes` keeps the union, so one incomplete source cannot make a person disappear.
     */
    readonly hosts: readonly string[];

    /**
     * Address of the audio file, which is what the player of the page plays
     *
     * Note: `null` for an episode which is only published as a video, which can be watched but not played here. Only
     *       the feed of the show carries a recording, so this is also `null` for the whole archive while that feed
     *       cannot be read.
     */
    readonly audioUrl: string | null;
    /** Original publisher enclosure size; absent when the source does not report it. */
    readonly audioByteLength?: number;

    /**
     * Address of the video of the episode, which is where a listener is sent to watch it
     *
     * Note: This is the primary link of an episode, because the show is made as a video and the recording is what is
     *       published from it. `null` when no source names a video.
     */
    readonly videoUrl: string | null;

    /**
     * Page of the episode at the publisher, `null` when the feed does not name one
     */
    readonly pageUrl: string | null;

    /**
     * Moment the episode was published, as an ISO 8601 string
     */
    readonly publishedAt: string;

    /**
     * Length of the recording in seconds, `null` when the feed does not state it
     */
    readonly durationInSeconds: number | null;

    /**
     * Artwork of the episode, `null` when the episode uses the artwork of the show
     */
    readonly imageUrl: string | null;
};

/**
 * One podcast together with the episodes its feed lists, newest first
 */
export type PodcastFeed = {
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string | null;
    readonly episodes: readonly PodcastEpisode[];
};

/**
 * Feed which carries no episode at all, used whenever the real feed cannot be read
 *
 * Note: A page which lists episodes has to stay readable even when the feed of the publisher is down, so it renders
 *       this instead of failing the whole request.
 */
export const EMPTY_PODCAST_FEED: PodcastFeed = {
    title: '',
    description: '',
    imageUrl: null,
    episodes: [],
};

/**
 * The episode a listener is offered first, which is the newest one the feed published
 *
 * @returns newest episode, `null` when the feed carries none
 */
export function getNewestPodcastEpisode(feed: PodcastFeed): PodcastEpisode | null {
    return feed.episodes[0] ?? null;
}
