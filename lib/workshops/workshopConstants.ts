export const WORKSHOP_TABLE_NAME = 'workshops';
export const WORKSHOP_CONTENT_TABLE_NAME = 'workshop_content_blocks';
export const WORKSHOP_PARTICIPANT_TABLE_NAME = 'workshop_participants';
export const WORKSHOP_COMMENT_TABLE_NAME = 'workshop_comments';
export const WORKSHOP_UPVOTE_TABLE_NAME = 'workshop_comment_upvotes';
export const WORKSHOP_REACTION_TABLE_NAME = 'workshop_reactions';
export const WORKSHOP_CONTENT_SHORTCODE_LINK_TABLE_NAME = 'workshop_content_shortcode_links';
export const WORKSHOP_COMMENT_SHORTCODE_LINK_TABLE_NAME = 'workshop_comment_shortcode_links';
export const WORKSHOP_FEEDBACK_TABLE_NAME = 'workshop_feedback';
export const WORKSHOP_POLL_TABLE_NAME = 'workshop_polls';
export const WORKSHOP_POLL_OPTION_TABLE_NAME = 'workshop_poll_options';
export const WORKSHOP_POLL_VOTE_TABLE_NAME = 'workshop_poll_votes';
export const WORKSHOP_POLL_WORKSHOP_TABLE_NAME = 'workshop_poll_workshops';
export const DUPLICATE_WORKSHOP_ATTACHED_POLLS_FUNCTION_NAME = 'duplicate_workshop_attached_polls';

export const WORKSHOP_SESSION_COOKIE_PREFIX = 'workshop_session_';
export const WORKSHOP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const WORKSHOP_SESSION_TOKEN_BYTES = 32;
export const MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH = 200;
export const MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH = 320;
export const MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH = 2_000;
export const MAXIMAL_WORKSHOP_SLUG_LENGTH = 100;
export const MAXIMAL_WORKSHOP_REACTION_LENGTH = 16;
export const DEFAULT_WORKSHOP_DURATION_MINUTES = 60;

/**
 * How many reactions a single workshop may offer at once
 *
 * Note: The database guards the very same number, so both of them are changed together.
 */
export const MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT = 16;
export const MAXIMAL_WORKSHOP_COMMENT_LENGTH = 2_000;
export const MAXIMAL_WORKSHOP_FEEDBACK_TEXT_LENGTH = 5_000;
export const MAXIMAL_WORKSHOP_POLL_QUESTION_LENGTH = 500;
export const MAXIMAL_WORKSHOP_POLL_OPTION_LENGTH = 200;
export const MINIMAL_WORKSHOP_POLL_OPTION_COUNT = 2;
export const MAXIMAL_WORKSHOP_POLL_OPTION_COUNT = 8;
/**
 * How many workshop occurrences one poll can be about
 *
 * Note: The database guards the very same number, so both of them are changed together.
 */
export const MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT = 20;
export const MAXIMAL_VISIBLE_WORKSHOP_POLL_COUNT = 20;
export const MAXIMAL_ADMIN_WORKSHOP_POLL_COUNT = 1_000;
export const MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT = 1_000_000;
export const MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS = 120;

/**
 * How many of the newest commits of the connected repository one room lists
 *
 * Note: The commits are read through one cached server-side answer however many participants have the room open, so
 *       the room can follow the project without turning every participant into a GitHub client.
 */
export const MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT = 10;

/**
 * How long a branch name may be, which is what Git itself allows a reference to be
 */
export const MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_LENGTH = 255;
/** How many branch names one workshop may select explicitly; an empty selection means all branches */
export const MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_COUNT = 50;
export const WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS = 60;

/**
 * How long after their last request a participant still counts as watching the workshop
 *
 * Note: An open room reports its presence every 30 seconds and reloads the whole state at most every 150 seconds,
 *       so this window stays above both to never drop an attentive participant out of the count.
 */
export const WORKSHOP_WATCHING_WINDOW_SECONDS = 180;

/**
 * How long one presence sample of a participant lasts, which is what the audience of the administration graph is
 * counted from
 *
 * Note: The database bins the presence it records by the very same number of seconds, see `migrations/*.sql`, so both
 *       of them are changed together. A room reports its presence more often than this, which is what makes a sample
 *       cost one row per watched minute rather than one row per request.
 */
export const WORKSHOP_PRESENCE_SAMPLE_BUCKET_SECONDS = 60;

/**
 * How many messages of a room the administration reads to count the metrics an administrator wrote themselves
 *
 * Note: Whole message bodies travel to the browser for this, so a very busy room is sampled from its newest messages
 *       instead of sending an unbounded answer on every refresh.
 */
export const MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT = 5_000;

export const MAXIMAL_VISIBLE_COMMENT_COUNT = 200;
export const MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT = 50;
export const MAXIMAL_RECENT_REACTION_COUNT = 50;
export const MAXIMAL_ADMIN_PARTICIPANT_LIST_COUNT = 5_000;
export const MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT = 1_000_000;
export const WORKSHOP_REALTIME_TOPIC_PREFIX = 'workshop:';
export const WORKSHOP_REALTIME_EVENT_NAME = 'workshop-event';

/**
 * The reactions a workshop offers until an admin says otherwise
 *
 * Note: Every one of them is celebrated by an animation of its own, see `workshopReactionAnimations`.
 */
export const DEFAULT_WORKSHOP_REACTIONS = [
    '👍',
    '❤️',
    '👏',
    '🔥',
    '💡',
    '😂',
    '</>',
    '✨',
    '🐍',
    '👀',
    '🎉',
    '🎆',
    '👩‍💻',
] as const;

export function getWorkshopSessionCookieName(workshopSlug: string): string {
    return `${WORKSHOP_SESSION_COOKIE_PREFIX}${workshopSlug}`;
}

export function getWorkshopRealtimeTopic(workshopSlug: string): string {
    return `${WORKSHOP_REALTIME_TOPIC_PREFIX}${workshopSlug}`;
}
