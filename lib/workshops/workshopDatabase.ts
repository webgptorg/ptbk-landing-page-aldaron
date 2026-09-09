import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { createEventDetailsOrNull } from '@/lib/events/event';
import type { EventType } from '@/lib/events/eventTypes';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { loadAllSupabaseRows, SUPABASE_ROW_PAGE_SIZE, type SupabaseRowsPage } from '@/lib/supabase/loadAllSupabaseRows';
import { reportSupabaseError } from '@/lib/supabase/reportSupabaseError';
import {
    MAXIMAL_ADMIN_WORKSHOP_POLL_COUNT,
    MAXIMAL_RECENT_REACTION_COUNT,
    MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT,
    MAXIMAL_VISIBLE_WORKSHOP_POLL_COUNT,
    MAXIMAL_VISIBLE_COMMENT_COUNT,
    MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT,
    WORKSHOP_COMMENT_TABLE_NAME,
    WORKSHOP_CONTENT_TABLE_NAME,
    WORKSHOP_FEEDBACK_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_POLL_OPTION_TABLE_NAME,
    WORKSHOP_POLL_TABLE_NAME,
    WORKSHOP_POLL_VOTE_TABLE_NAME,
    WORKSHOP_POLL_WORKSHOP_TABLE_NAME,
    WORKSHOP_REACTION_TABLE_NAME,
    WORKSHOP_TABLE_NAME,
    WORKSHOP_UPVOTE_TABLE_NAME,
    WORKSHOP_WATCHING_WINDOW_SECONDS,
} from '@/lib/workshops/workshopConstants';
import { getDisplayedWorkshopCommentUpvoteCount, sortWorkshopComments } from '@/lib/workshops/workshopCommentValues';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import { getWorkshopKindCapabilities, isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
import { materializeWorkshopMaterialShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { materializeWorkshopCommentShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { areWorkshopCommentLinksEnabled } from '@/lib/workshops/workshopCommentLinks';
import { isWorkshopPanelOffered, normalizeWorkshopDisabledPanels } from '@/lib/workshops/workshopPanels';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { normalizeWorkshopParticipantEmail } from '@/lib/workshops/workshopParticipantEmail';
import { selectWorkshopContentForMember } from '@/lib/workshops/workshopPaidMembersContent';
import { selectWorkshopVideoForMember } from '@/lib/workshops/workshopPaidMembersVideo';
import { createWorkshopRepositoryOrNull } from '@/lib/workshops/workshopRepository';
import { loadRegisteredParticipantCountsByTermId } from '@/lib/workshops/workshopRegistrationDatabase';
import { getRegisteredParticipantCount } from '@/lib/workshops/workshopRegistrations';
import type {
    WorkshopAdminComment,
    WorkshopAdminFeedback,
    WorkshopAdminAnalytics,
    WorkshopAdminCommentSample,
    WorkshopAdminPoll,
    WorkshopAdminPollOption,
    WorkshopAdminParticipant,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopAdminTimelinePoint,
    WorkshopComment,
    WorkshopCommentAuthor,
    WorkshopCommentReference,
    WorkshopCommentSort,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopFeedback,
    WorkshopKind,
    WorkshopParticipant,
    WorkshopParticipantTimelineEvent,
    WorkshopPoll,
    WorkshopPollOption,
    WorkshopPublicState,
    WorkshopReaction,
    WorkshopReactionCount,
    WorkshopSummary,
} from '@/lib/workshops/workshopTypes';
import type { WorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type WorkshopRow = {
    readonly id: string;
    readonly room_kind: WorkshopKind;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly starts_at: string;
    readonly ends_at: string | null;
    readonly youtube_video_id: string | null;

    /**
     * The public teaser of the recording, shown once the workshop is over to everybody whose membership does not
     * unlock the recording itself
     */
    readonly preview_youtube_video_id: string | null;

    /**
     * The project this term is about, written as `owner/name`, together with the branch which is followed and the
     * address the project runs at, all three of which a term without a connected project leaves empty
     */
    readonly github_repository?: string | null;
    readonly github_repository_branch?: string | null;
    readonly deployment_url?: string | null;
    readonly is_published: boolean;
    readonly allowed_reactions: string[];

    /**
     * The event fields of one occurrence, which a permanent room leaves empty because it is no event
     */
    readonly event_type: string | null;
    readonly location_kind: string | null;
    readonly location_label: string;
    readonly price_czk: number | null;
    readonly maximum_participant_count: number | null;
    readonly artificial_watching_participant_count?: number;

    /**
     * The keys of the panels this workshop switched off for its participants
     */
    readonly disabled_panels: string[];

    /**
     * The message pinned on top of the chat of this workshop, or `null` when nothing is pinned
     */
    readonly pinned_comment_id: string | null;

    /**
     * The comment currently presented over the live stage, or `null` when the host is not answering a question
     */
    readonly stage_comment_id: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

type WorkshopSummaryRow = Pick<
    WorkshopRow,
    | 'id'
    | 'room_kind'
    | 'slug'
    | 'title'
    | 'description'
    | 'starts_at'
    | 'ends_at'
    | 'is_published'
    | 'event_type'
    | 'location_kind'
    | 'location_label'
    | 'price_czk'
    | 'maximum_participant_count'
>;

/**
 * Fields the public list and the administration selector need to identify one occurrence, say what it is about, and
 * describe the event it is a term of, without exposing its live room configuration.
 */
export const WORKSHOP_SUMMARY_COLUMNS =
    'id, room_kind, slug, title, description, starts_at, ends_at, is_published, event_type, location_kind, location_label, price_czk, maximum_participant_count';

type WorkshopContentRow = {
    readonly id: string;
    readonly title: string;
    readonly body_markdown: string;
    readonly unlock_at: string;
    readonly sort_order: number;
    readonly is_published: boolean;
    readonly is_follow_up: boolean;
    readonly is_paid_members_only: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};

/**
 * Note: This stays one literal, because the database client reads the requested columns out of the text itself.
 */
export const WORKSHOP_CONTENT_COLUMNS =
    'id, title, body_markdown, unlock_at, sort_order, is_published, is_follow_up, is_paid_members_only, created_at, updated_at';

/**
 * The one record a participant progressively fills after a workshop.
 */
export type WorkshopFeedbackRow = {
    readonly id: string;
    readonly workshop_id: string;
    readonly participant_id: string;
    readonly rating: number | string;
    readonly what_was_good: string | null;
    readonly what_was_bad: string | null;
    readonly note: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

const WORKSHOP_FEEDBACK_COLUMNS =
    'id, workshop_id, participant_id, rating, what_was_good, what_was_bad, note, created_at, updated_at';

type WorkshopFeedbackParticipantRow = Pick<WorkshopAdminParticipantRow, 'id' | 'fullname' | 'email'>;

export type WorkshopCommentRow = {
    readonly id: string;
    readonly participant_id: string | null;
    readonly parent_comment_id: string | null;
    readonly author_name: string;
    readonly body: string;
    readonly status: 'pending' | 'approved' | 'rejected';
    readonly upvote_count: number;
    readonly artificial_upvote_count: number;
    readonly is_artificial: boolean;
    readonly created_at: string;
};

/**
 * Everything a `WorkshopCommentRow` needs, so that a new comment field is selected everywhere at once
 */
export const WORKSHOP_COMMENT_COLUMNS =
    'id, participant_id, parent_comment_id, author_name, body, status, upvote_count, artificial_upvote_count, is_artificial, created_at';

type WorkshopCommentAuthorRow = {
    readonly id: string;
    readonly is_trusted: boolean;
    readonly is_interaction_banned: boolean;
    readonly is_moderator: boolean;
};

/**
 * As much of the author of a message as moderating it takes
 */
const WORKSHOP_COMMENT_AUTHOR_COLUMNS = 'id, is_trusted, is_interaction_banned, is_moderator';

/**
 * What every comment of one room is mapped against: the message holding its top, the people who wrote the comments,
 * and whether the one reading them moderates the room
 */
export type WorkshopCommentRoomContext = {
    readonly pinnedCommentId: string | null;
    readonly authorByParticipantId: ReadonlyMap<string, WorkshopCommentAuthor>;

    /**
     * Whether the reader moderates the room, which is who learns more about an author than their moderator badge
     */
    readonly isModerationOffered: boolean;
};

type WorkshopCommentReferenceRow = {
    readonly id: string;
    readonly author_name: string;
    readonly body: string;
};

/**
 * As little of a comment as it takes to recognize it outside of the chat, so in the moderation of a reply or in the
 * pinned message of the administration
 */
const WORKSHOP_COMMENT_REFERENCE_COLUMNS = 'id, author_name, body';

type WorkshopAdminParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly connected_at: string;
    readonly last_seen_at: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
    readonly active_duration_seconds: number;
};

/**
 * Everything the administration lists about one participant, so a new participant field is selected everywhere at once
 */
const WORKSHOP_ADMIN_PARTICIPANT_COLUMNS =
    'id, fullname, email, connected_at, last_seen_at, is_interaction_banned, is_trusted, is_moderator, active_duration_seconds';

/**
 * The database function which filters, sorts and pages a whole workshop audience, see `migrations/*.sql`
 */
const WORKSHOP_ADMIN_PARTICIPANT_PAGE_FUNCTION_NAME = 'get_workshop_admin_participant_page';

type WorkshopAdminParticipantPageRow = WorkshopAdminParticipantRow &
    WorkshopParticipantActivityTotalsRow & {
        readonly total_count: number | string;
    };

type WorkshopParticipantActivityTotalsRow = {
    readonly participant_id: string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly upvote_count: number | string;
};

type WorkshopContentLinkClickTotalsRow = {
    readonly content_block_id: string;
    readonly link_click_count: number | string;
};

type WorkshopParticipantCountRow = {
    readonly workshop_id: string;
    readonly participant_count: number | string;
};

type WorkshopCommentUpvoteRow = {
    readonly id: string;
    readonly comment_id: string;
    readonly created_at: string;
};

type WorkshopParticipantTimelineCommentRow = Pick<WorkshopCommentRow, 'id' | 'body' | 'status' | 'created_at'>;

type WorkshopParticipantTimelineCommentReferenceRow = Pick<WorkshopCommentRow, 'id' | 'author_name' | 'body'>;

type WorkshopAdminTimelinePointRow = {
    readonly bucket_starts_at: string;
    readonly watching_participant_count: number | string;
    readonly actively_watching_participant_count: number | string;
    readonly passively_watching_participant_count: number | string;
    readonly participant_count: number | string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly upvote_count: number | string;
    readonly link_click_count: number | string;
};

type WorkshopAdminReactionTimelineRow = {
    readonly bucket_starts_at: string;
    readonly emoji: string;
    readonly reaction_count: number | string;
};

type WorkshopAdminCommentSampleRow = Pick<WorkshopCommentRow, 'body' | 'created_at'>;

type WorkshopAdminReactionExportRow = {
    readonly id: string;
    readonly participant_id: string | null;
    readonly emoji: string;
    readonly created_at: string;
    readonly is_artificial: boolean;
};

type WorkshopAdminParticipantIdentityRow = Pick<WorkshopAdminParticipantRow, 'id' | 'fullname' | 'email'>;

type WorkshopReactionRow = {
    readonly id: string;
    readonly emoji: string;
    readonly created_at: string;
};

type WorkshopReactionCountRow = {
    readonly emoji: string;
    readonly reaction_count: number | string;
};

type WorkshopPollRow = {
    readonly id: string;
    readonly question: string;
    readonly is_closed: boolean;
    readonly is_visible: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};

const WORKSHOP_POLL_COLUMNS = 'id, question, is_closed, is_visible, created_at, updated_at';

type WorkshopPollOptionRow = {
    readonly id: string;
    readonly poll_id: string;
    readonly label: string;
    readonly sort_order: number;
    readonly artificial_vote_count: number;
};

const WORKSHOP_POLL_OPTION_COLUMNS = 'id, poll_id, label, sort_order, artificial_vote_count';

type WorkshopPollVoteCountRow = {
    readonly option_id: string;
    readonly vote_count: number | string;
};

type WorkshopParticipantPollVoteRow = {
    readonly option_id: string;
};

type WorkshopPollWorkshopRow = {
    readonly poll_id: string;
    readonly workshop_id: string;
};

type CreatedWorkshopReactionRow = WorkshopReactionRow & {
    readonly reaction_count: number | string;
};

const WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE = 'Workshop database is not configured';
const MAXIMAL_ADMIN_COMMENT_LIST_COUNT = 1_000;
function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : 0;
}

/**
 * Splits a set of foreign keys into database-safe batches. It avoids PostgREST's response limit truncating an
 * otherwise complete participant timeline or a large reaction export.
 */
async function loadWorkshopRowsByIds<Row>(
    rowIds: readonly string[],
    loadRows: (pageRowIds: readonly string[]) => PromiseLike<SupabaseRowsPage<Row>>,
): Promise<{ readonly rows: readonly Row[] | null; readonly errorMessage: string | null }> {
    const distinctRowIds = Array.from(new Set(rowIds));
    if (distinctRowIds.length === 0) {
        return { rows: [], errorMessage: null };
    }

    const rows: Row[] = [];
    for (let fromIndex = 0; fromIndex < distinctRowIds.length; fromIndex += SUPABASE_ROW_PAGE_SIZE) {
        const pageRowIds = distinctRowIds.slice(fromIndex, fromIndex + SUPABASE_ROW_PAGE_SIZE);
        const { data, error } = await loadRows(pageRowIds);
        if (error) {
            return { rows: null, errorMessage: error.message };
        }

        rows.push(...(data ?? []));
    }

    return { rows, errorMessage: null };
}

export function getWorkshopDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createWorkshopDatabaseUnavailableResponse(): NextResponse {
    console.error('The workshop database needs SUPABASE_SERVICE_ROLE_KEY because all workshop tables are RLS secured.');
    return NextResponse.json({ error: WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
}

export function mapWorkshopRow(row: WorkshopRow): WorkshopDetails {
    return {
        ...mapWorkshopSummaryRow(row),
        youtubeVideoId: row.youtube_video_id,
        previewYoutubeVideoId: row.preview_youtube_video_id,
        repository: createWorkshopRepositoryOrNull({
            repository: row.github_repository ?? null,
            branch: row.github_repository_branch ?? null,
            deploymentUrl: row.deployment_url ?? null,
        }),
        allowedReactions: row.allowed_reactions,
        disabledPanels: normalizeWorkshopDisabledPanels(row.disabled_panels),
        artificialWatchingParticipantCount: row.artificial_watching_participant_count ?? 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapWorkshopSummaryRow(row: WorkshopSummaryRow): WorkshopSummary {
    return {
        id: row.id,
        kind: row.room_kind,
        slug: row.slug,
        title: row.title,
        description: row.description,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        isPublished: row.is_published,
        event: createEventDetailsOrNull({
            type: row.event_type,
            locationKind: row.location_kind,
            locationLabel: row.location_label,
            priceCzk: row.price_czk,
            maximumParticipantCount: row.maximum_participant_count,
        }),
    };
}

/**
 * @param registeredParticipantCountByTermId how many people registered for each term on the landing page of its event,
 *                                           or `null` when the listed rooms are no terms of an event at all
 */
function mapWorkshopAdminSummaryRow(
    row: WorkshopSummaryRow,
    participantCount: number,
    registeredParticipantCountByTermId: ReadonlyMap<string, number> | null,
): WorkshopAdminSummary {
    const workshopSummary = mapWorkshopSummaryRow(row);

    return {
        ...workshopSummary,
        participantCount,
        registeredParticipantCount:
            registeredParticipantCountByTermId === null || workshopSummary.event === null
                ? null
                : getRegisteredParticipantCount(registeredParticipantCountByTermId, workshopSummary),
    };
}

export function mapWorkshopContentRow(row: WorkshopContentRow, linkClickCount = 0): WorkshopContentBlock {
    return {
        id: row.id,
        title: row.title,
        bodyMarkdown: row.body_markdown,
        unlockAt: row.unlock_at,
        sortOrder: row.sort_order,
        isPublished: row.is_published,
        isFollowUp: row.is_follow_up,
        isPaidMembersOnly: row.is_paid_members_only,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        linkClickCount,
    };
}

export function mapWorkshopFeedbackRow(row: WorkshopFeedbackRow): WorkshopFeedback {
    return {
        rating: Number(row.rating),
        whatWasGood: row.what_was_good,
        whatWasBad: row.what_was_bad,
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapWorkshopAdminFeedbackRow(
    row: WorkshopFeedbackRow,
    participantById: ReadonlyMap<string, WorkshopFeedbackParticipantRow>,
): WorkshopAdminFeedback | null {
    const participant = participantById.get(row.participant_id);
    if (participant === undefined) {
        return null;
    }

    return {
        id: row.id,
        participantId: row.participant_id,
        fullname: participant.fullname,
        email: participant.email,
        ...mapWorkshopFeedbackRow(row),
    };
}

export function mapWorkshopCommentRow(
    row: WorkshopCommentRow,
    isUpvotedByParticipant: boolean,
    roomContext: WorkshopCommentRoomContext,
): WorkshopComment {
    const author = row.participant_id === null ? undefined : roomContext.authorByParticipantId.get(row.participant_id);

    return {
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        status: row.status,
        upvoteCount: getDisplayedWorkshopCommentUpvoteCount(row.upvote_count, row.artificial_upvote_count),
        isUpvotedByParticipant,
        createdAt: row.created_at,
        isAuthorModerator: author?.isModerator ?? false,
        isArtificial: row.is_artificial,
        moderatedAuthor: roomContext.isModerationOffered ? (author ?? null) : null,
        parentCommentId: row.parent_comment_id,
        isPinned: row.id === roomContext.pinnedCommentId,
    };
}

function mapWorkshopCommentAuthorRow(row: WorkshopCommentAuthorRow): WorkshopCommentAuthor {
    return {
        participantId: row.id,
        isTrusted: row.is_trusted,
        isInteractionBanned: row.is_interaction_banned,
        isModerator: row.is_moderator,
    };
}

/**
 * The author of a message which the very participant who wrote it just sent, so it needs no second read of them
 */
export function createWorkshopCommentAuthor(participant: WorkshopParticipant): WorkshopCommentAuthor {
    return {
        participantId: participant.id,
        isTrusted: participant.isTrusted,
        isInteractionBanned: participant.isInteractionBanned,
        isModerator: participant.isModerator,
    };
}

/**
 * Loads the people who wrote the given comments, so every message says whether a moderator of the room wrote it
 *
 * Note: An artificial message of the administration has no author at all, and a deleted participant leaves their
 *       messages behind, so a missing author is an ordinary answer rather than a failure.
 * Note: Missing authors must never take the whole room down with them, so a failure is reported as nobody known, which
 *       costs the moderator badges of one refresh and nothing else.
 */
async function loadWorkshopCommentAuthors(
    supabase: SupabaseClient,
    workshopId: string,
    commentRows: readonly WorkshopCommentRow[],
): Promise<ReadonlyMap<string, WorkshopCommentAuthor>> {
    const authorParticipantIds = commentRows
        .map((commentRow) => commentRow.participant_id)
        .filter((participantId): participantId is string => participantId !== null);
    const { rows, errorMessage } = await loadWorkshopRowsByIds<WorkshopCommentAuthorRow>(
        authorParticipantIds,
        (pageParticipantIds) =>
            supabase
                .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                .select(WORKSHOP_COMMENT_AUTHOR_COLUMNS)
                .eq('workshop_id', workshopId)
                .in('id', pageParticipantIds),
    );

    if (rows === null) {
        console.error('Failed to load the authors of the workshop comments:', errorMessage ?? 'Unknown database error');
        return new Map();
    }

    return new Map(rows.map((row) => [row.id, mapWorkshopCommentAuthorRow(row)] as const));
}

function mapWorkshopCommentReferenceRow(row: WorkshopCommentReferenceRow): WorkshopCommentReference {
    return { id: row.id, authorName: row.author_name, body: row.body };
}

/**
 * Reads a comment only when it belongs to the requested room, so an administrative stage selection can never point
 * one workshop at a question from another one.
 */
export async function loadWorkshopCommentReference(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
): Promise<{ readonly comment: WorkshopCommentReference | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_REFERENCE_COLUMNS)
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .maybeSingle();
    if (error) {
        return { comment: null, errorMessage: error.message };
    }

    return {
        comment: data === null ? null : mapWorkshopCommentReferenceRow(data as WorkshopCommentReferenceRow),
        errorMessage: null,
    };
}

export function mapWorkshopAdminParticipantRow(
    row: WorkshopAdminParticipantRow,
    activityTotals: WorkshopParticipantActivityTotalsRow | undefined,
): WorkshopAdminParticipant {
    return {
        id: row.id,
        fullname: row.fullname,
        email: row.email,
        connectedAt: row.connected_at,
        lastSeenAt: row.last_seen_at,
        isInteractionBanned: row.is_interaction_banned,
        isTrusted: row.is_trusted,
        isModerator: row.is_moderator,
        activeDurationSeconds: getNonNegativeWholeNumber(row.active_duration_seconds),
        commentCount: getNonNegativeWholeNumber(activityTotals?.comment_count),
        reactionCount: getNonNegativeWholeNumber(activityTotals?.reaction_count),
        upvoteCount: getNonNegativeWholeNumber(activityTotals?.upvote_count),
    };
}

function mapWorkshopAdminParticipantPageRow(row: WorkshopAdminParticipantPageRow): WorkshopAdminParticipant {
    return mapWorkshopAdminParticipantRow(row, row);
}

/**
 * How long one measured bucket of the timeline lasts, which the database is asked for and which it also guards
 *
 * Note: An hour-long workshop is measured by the minute, because that is the resolution its graph is read at. A room
 *       which lasts for days is measured more coarsely, so that the answer stays small however long it has been open.
 */
function getWorkshopAdminTimelineBucketDurationSeconds(workshopRow: WorkshopRow): number {
    const startsAtMilliseconds = Date.parse(workshopRow.starts_at);
    const currentMilliseconds = Date.now();
    const configuredEndsAtMilliseconds =
        workshopRow.ends_at === null ? currentMilliseconds : Date.parse(workshopRow.ends_at);
    const endsAtMilliseconds = Math.max(startsAtMilliseconds, configuredEndsAtMilliseconds);
    const durationMilliseconds = endsAtMilliseconds - startsAtMilliseconds;

    if (durationMilliseconds <= 2 * 60 * 60 * 1_000) {
        return 60;
    }

    if (durationMilliseconds <= 8 * 60 * 60 * 1_000) {
        return 300;
    }

    if (durationMilliseconds <= 3 * 24 * 60 * 60 * 1_000) {
        return 900;
    }

    if (durationMilliseconds <= 30 * 24 * 60 * 60 * 1_000) {
        return 3_600;
    }

    return 86_400;
}

function getWorkshopAdminTimelineEndsAt(workshopRow: WorkshopRow): string {
    const startsAtMilliseconds = Date.parse(workshopRow.starts_at);
    const endsAtMilliseconds = workshopRow.ends_at === null ? Date.now() : Date.parse(workshopRow.ends_at);

    return new Date(Math.max(startsAtMilliseconds, endsAtMilliseconds)).toISOString();
}

function mapWorkshopAdminTimelinePointRow(
    row: WorkshopAdminTimelinePointRow,
    reactionCountsByEmoji: Readonly<Record<string, number>>,
): WorkshopAdminTimelinePoint {
    return {
        startsAt: row.bucket_starts_at,
        watchingParticipantCount: getNonNegativeWholeNumber(row.watching_participant_count),
        activelyWatchingParticipantCount: getNonNegativeWholeNumber(row.actively_watching_participant_count),
        passivelyWatchingParticipantCount: getNonNegativeWholeNumber(row.passively_watching_participant_count),
        participantCount: getNonNegativeWholeNumber(row.participant_count),
        commentCount: getNonNegativeWholeNumber(row.comment_count),
        reactionCount: getNonNegativeWholeNumber(row.reaction_count),
        upvoteCount: getNonNegativeWholeNumber(row.upvote_count),
        linkClickCount: getNonNegativeWholeNumber(row.link_click_count),
        reactionCountsByEmoji,
    };
}

/**
 * Which reaction was sent how many times in each bucket, gathered by the moment the bucket starts at
 *
 * Note: The emoji breakdown is loaded as its own table, because a room may offer any number of reactions and a fixed
 *       set of columns could never carry them.
 */
function groupWorkshopAdminReactionTimelineRows(
    rows: readonly WorkshopAdminReactionTimelineRow[],
): ReadonlyMap<string, Readonly<Record<string, number>>> {
    const reactionCountsByBucket = new Map<string, Record<string, number>>();

    for (const row of rows) {
        const reactionCounts = reactionCountsByBucket.get(row.bucket_starts_at) ?? {};
        reactionCounts[row.emoji] = (reactionCounts[row.emoji] ?? 0) + getNonNegativeWholeNumber(row.reaction_count);
        reactionCountsByBucket.set(row.bucket_starts_at, reactionCounts);
    }

    return reactionCountsByBucket;
}

export function mapWorkshopReactionRow(row: WorkshopReactionRow): WorkshopReaction {
    return { id: row.id, emoji: row.emoji, createdAt: row.created_at };
}

function mapWorkshopReactionCountRow(row: WorkshopReactionCountRow): WorkshopReactionCount {
    return { emoji: row.emoji, count: getNonNegativeWholeNumber(row.reaction_count) };
}

function mapWorkshopPollOptionRow(
    row: WorkshopPollOptionRow,
    voteCountByOptionId: ReadonlyMap<string, number>,
    selectedOptionIds: ReadonlySet<string>,
): WorkshopPollOption {
    const realVoteCount = voteCountByOptionId.get(row.id) ?? 0;
    return {
        id: row.id,
        label: row.label,
        sortOrder: row.sort_order,
        voteCount: realVoteCount + getNonNegativeWholeNumber(row.artificial_vote_count),
        isVotedByParticipant: selectedOptionIds.has(row.id),
    };
}

function mapWorkshopAdminPollOptionRow(
    row: WorkshopPollOptionRow,
    voteCountByOptionId: ReadonlyMap<string, number>,
    selectedOptionIds: ReadonlySet<string>,
): WorkshopAdminPollOption {
    const realVoteCount = voteCountByOptionId.get(row.id) ?? 0;
    const artificialVoteCount = getNonNegativeWholeNumber(row.artificial_vote_count);
    return {
        ...mapWorkshopPollOptionRow(row, voteCountByOptionId, selectedOptionIds),
        realVoteCount,
        artificialVoteCount,
    };
}

function mapWorkshopPollRow<Option extends WorkshopPollOption>(
    row: WorkshopPollRow,
    options: readonly Option[],
    attachedWorkshops: readonly WorkshopSummary[],
): Omit<WorkshopPoll, 'options'> & { readonly options: readonly Option[] } {
    return {
        id: row.id,
        question: row.question,
        isClosed: row.is_closed,
        isVisible: row.is_visible,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        options,
        attachedWorkshops,
    };
}

type WorkshopPollVoteErrorKind = 'not-found' | 'closed' | 'invalid-participant' | 'database';

export type WorkshopPollVoteSaveResult =
    | { readonly isSuccessful: true }
    | { readonly isSuccessful: false; readonly errorKind: WorkshopPollVoteErrorKind; readonly errorMessage: string };

const WORKSHOP_POLL_VOTE_ERROR_KIND_BY_DATABASE_MESSAGE: Readonly<
    Record<string, Exclude<WorkshopPollVoteErrorKind, 'database'>>
> = {
    WORKSHOP_POLL_NOT_VISIBLE: 'not-found',
    WORKSHOP_POLL_NOT_ATTACHED: 'not-found',
    WORKSHOP_POLL_OPTION_NOT_FOUND: 'not-found',
    WORKSHOP_POLL_CLOSED: 'closed',
    WORKSHOP_POLL_PARTICIPANT_INVALID: 'invalid-participant',
    WORKSHOP_POLL_VOTER_EMAIL_INVALID: 'invalid-participant',
};

/**
 * Persists one shared community-poll choice from the room a member currently entered.
 *
 * Note: The database owns the cross-room authorization and locks the poll with the write, so an attached workshop
 *       cannot create a second poll vote and an administrator cannot close a poll halfway through a choice.
 */
export async function saveWorkshopPollVote(
    supabase: SupabaseClient,
    workshopRow: Pick<WorkshopRow, 'id'>,
    participant: Pick<WorkshopParticipant, 'id' | 'email'>,
    pollId: string,
    optionId: string,
): Promise<WorkshopPollVoteSaveResult> {
    const { error } = await supabase.rpc('set_community_workshop_poll_vote', {
        target_room_id: workshopRow.id,
        target_poll_id: pollId,
        target_option_id: optionId,
        target_participant_id: participant.id,
        target_voter_email: normalizeWorkshopParticipantEmail(participant.email),
    });
    if (error === null) {
        return { isSuccessful: true };
    }

    return {
        isSuccessful: false,
        errorKind: WORKSHOP_POLL_VOTE_ERROR_KIND_BY_DATABASE_MESSAGE[error.message] ?? 'database',
        errorMessage: error.message,
    };
}

/**
 * Stores one reaction and returns the total for its exact text as one atomic database operation
 *
 * Note: The total travels with the persisted reaction rather than being incremented in a browser. That keeps every
 *       room correct when several participants react at once, when a room reconnects, or when its own broadcast comes
 *       back to it.
 */
export async function createWorkshopReaction(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string | null,
    emoji: string,
): Promise<
    | { readonly reaction: WorkshopReaction; readonly reactionCount: number; readonly errorMessage: null }
    | { readonly reaction: null; readonly reactionCount: null; readonly errorMessage: string }
> {
    const { data, error } = await supabase.rpc('create_workshop_reaction', {
        target_workshop_id: workshopId,
        target_participant_id: participantId,
        target_emoji: emoji,
    });
    const createdReactionRow = (data as readonly CreatedWorkshopReactionRow[] | null)?.[0];
    if (error || createdReactionRow === undefined) {
        return {
            reaction: null,
            reactionCount: null,
            errorMessage: error?.message ?? 'No reaction returned',
        };
    }

    return {
        reaction: mapWorkshopReactionRow(createdReactionRow),
        reactionCount: getNonNegativeWholeNumber(createdReactionRow.reaction_count),
        errorMessage: null,
    };
}

export async function findWorkshopBySlug(
    supabase: SupabaseClient,
    workshopSlug: string,
    isPublishedRequired: boolean,
): Promise<WorkshopRow | null> {
    let workshopQuery = supabase.from(WORKSHOP_TABLE_NAME).select('*').eq('slug', workshopSlug);

    if (isPublishedRequired) {
        workshopQuery = workshopQuery.eq('is_published', true);
    }

    const { data, error } = await workshopQuery.maybeSingle();
    if (error) {
        console.error(`Failed to load workshop "${workshopSlug}":`, error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

/**
 * Lists the terms of one kind of event which have not started yet in chronological order, which is the order visitors
 * should choose from on the landing page of that event.
 */
export async function findUpcomingPublishedWorkshops(
    supabase: SupabaseClient,
    eventType: EventType,
    currentTime = new Date().toISOString(),
): Promise<readonly WorkshopSummaryRow[]> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select(WORKSHOP_SUMMARY_COLUMNS)
        .eq('room_kind', 'workshop')
        .eq('event_type', eventType)
        .eq('is_published', true)
        .gt('starts_at', currentTime)
        .order('starts_at', { ascending: true });

    if (error) {
        console.error(`Failed to load upcoming "${eventType}" terms:`, error.message);
        return [];
    }

    return (data ?? []) as WorkshopSummaryRow[];
}

/**
 * Resolves legacy public URLs which did not name an occurrence to the term of that very event with the newest start
 * date, so a link of one event never opens a term of another one.
 */
export async function findMostRecentPublishedWorkshop(
    supabase: SupabaseClient,
    eventType: EventType,
): Promise<WorkshopRow | null> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select('*')
        .eq('room_kind', 'workshop')
        .eq('event_type', eventType)
        .eq('is_published', true)
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the most recent workshop:', error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

/**
 * Lists every published term of every kind of event for the persistent community room. Drafts stay private, while
 * past terms stay available as useful community history.
 */
export async function findPublishedWorkshops(supabase: SupabaseClient): Promise<readonly WorkshopSummaryRow[]> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopSummaryRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_TABLE_NAME)
            .select(WORKSHOP_SUMMARY_COLUMNS)
            .eq('room_kind', 'workshop')
            .eq('is_published', true)
            .order('starts_at', { ascending: false })
            .order('id', { ascending: false })
            .range(fromIndex, toIndex),
    );

    if (rows === null) {
        console.error('Failed to load published workshops:', errorMessage ?? 'Unknown database error');
        return [];
    }

    return rows;
}

/**
 * Resolves the one community room. The database allows at most one such row, so `maybeSingle` turns an absent
 * configuration into an ordinary unavailable public page instead of picking an arbitrary room.
 */
export async function findPublishedCommunity(supabase: SupabaseClient): Promise<WorkshopRow | null> {
    const { data, error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .select('*')
        .eq('room_kind', 'community')
        .eq('is_published', true)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the community room:', error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

export async function findWorkshopById(supabase: SupabaseClient, workshopId: string): Promise<WorkshopRow | null> {
    const { data, error } = await supabase.from(WORKSHOP_TABLE_NAME).select('*').eq('id', workshopId).maybeSingle();
    if (error) {
        console.error(`Failed to load workshop "${workshopId}":`, error.message);
        return null;
    }

    return data as WorkshopRow | null;
}

/**
 * Counts the audience of every occurrence of one room kind at once
 *
 * Note: The database aggregates all the counts in a single statement, so listing a hundred terms never costs a
 *       hundred count queries.
 * Note: An unavailable count must never take the whole list of occurrences down with it, so a failure is reported as
 *       no counted audience at all.
 */
async function countWorkshopParticipantsByWorkshop(
    supabase: SupabaseClient,
    workshopKind: WorkshopKind,
): Promise<ReadonlyMap<string, number>> {
    const { data, error } = await supabase.rpc('get_workshop_participant_counts', { target_room_kind: workshopKind });
    if (error) {
        console.error('Failed to count the participants of the listed workshops:', error.message);
        return new Map();
    }

    return new Map(
        ((data ?? []) as WorkshopParticipantCountRow[]).map(
            (participantCounts) =>
                [
                    participantCounts.workshop_id,
                    getNonNegativeWholeNumber(participantCounts.participant_count),
                ] as const,
        ),
    );
}

/**
 * Lists every occurrence of one room kind for the administration, together with both audiences each of them gathered:
 * the people who registered for it on the landing page of its event, and the people who really entered its room.
 *
 * Note: A room kind which is no event has no landing page registering anybody for it, so its registrations are not
 *       asked for at all rather than being counted as none.
 */
export async function loadWorkshopAdminSummaries(
    supabase: SupabaseClient,
    workshopKind: WorkshopKind,
): Promise<{ readonly workshops: readonly WorkshopAdminSummary[] | null; readonly errorMessage: string | null }> {
    const [workshopsResult, participantCountByWorkshopId, registeredParticipantCountByTermId] = await Promise.all([
        supabase
            .from(WORKSHOP_TABLE_NAME)
            .select(WORKSHOP_SUMMARY_COLUMNS)
            .eq('room_kind', workshopKind)
            .order('starts_at', { ascending: false }),
        countWorkshopParticipantsByWorkshop(supabase, workshopKind),
        getWorkshopKindCapabilities(workshopKind).isEvent
            ? loadRegisteredParticipantCountsByTermId()
            : Promise.resolve(null),
    ]);

    if (workshopsResult.error) {
        return { workshops: null, errorMessage: workshopsResult.error.message };
    }

    return {
        workshops: ((workshopsResult.data ?? []) as WorkshopSummaryRow[]).map((workshopRow) =>
            mapWorkshopAdminSummaryRow(
                workshopRow,
                participantCountByWorkshopId.get(workshopRow.id) ?? 0,
                registeredParticipantCountByTermId,
            ),
        ),
        errorMessage: null,
    };
}

type LoadedWorkshopPublicState = {
    readonly state: WorkshopPublicState | null;
    readonly errorMessage: string | null;
};

/**
 * Counts the participants whose browser talked to the room within the watching window
 *
 * Note: Every authenticated request refreshes `last_seen_at`, so an open room keeps itself in this count through its
 *       presence reports and state reloads, while a closed one falls out of it once the window passes.
 * Note: A room which does not show the count does not pay for it. Every state reload and every heartbeat of every
 *       participant would otherwise count the whole audience for nobody to read.
 * Note: An unavailable count must never take the whole room down with it, so a failure is reported as nobody watching.
 */
export async function countWatchingWorkshopParticipants(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<number> {
    if (!isWorkshopPanelOffered(workshopRow.room_kind, workshopRow.disabled_panels, 'watching-count')) {
        return 0;
    }

    const watchingSince = new Date(Date.now() - WORKSHOP_WATCHING_WINDOW_SECONDS * 1_000).toISOString();
    const { count, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select('id', { count: 'exact', head: true })
        .eq('workshop_id', workshopRow.id)
        .gte('last_seen_at', watchingSince);

    if (error) {
        console.error('Failed to count the participants watching a workshop:', error.message);
        return 0;
    }

    return (count ?? 0) + Math.max(0, workshopRow.artificial_watching_participant_count ?? 0);
}

type LoadedWorkshopReactionCounts = {
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly errorMessage: string | null;
};

/**
 * Loads the totals shown beside the reactions which a room currently offers
 *
 * Note: When the reactions panel is hidden, nobody can read these totals. Skipping the aggregation then keeps an
 *       unused panel from making every room refresh more expensive.
 */
async function loadWorkshopReactionCounts(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<LoadedWorkshopReactionCounts> {
    if (!isWorkshopPanelOffered(workshopRow.room_kind, workshopRow.disabled_panels, 'reactions')) {
        return { reactionCounts: [], errorMessage: null };
    }

    const { data, error } = await supabase.rpc('get_workshop_reaction_counts', {
        target_workshop_id: workshopRow.id,
    });
    if (error) {
        return { reactionCounts: [], errorMessage: error.message };
    }

    return {
        reactionCounts: ((data ?? []) as WorkshopReactionCountRow[]).map(mapWorkshopReactionCountRow),
        errorMessage: null,
    };
}

type LoadedWorkshopPolls<Poll extends WorkshopPoll = WorkshopPoll> = {
    readonly polls: readonly Poll[];
    readonly errorMessage: string | null;
};

type LoadedWorkshopPollRows = {
    readonly pollRows: readonly WorkshopPollRow[];
    readonly optionRowsByPollId: ReadonlyMap<string, readonly WorkshopPollOptionRow[]>;
    readonly voteCountByOptionId: ReadonlyMap<string, number>;
    readonly selectedOptionIds: ReadonlySet<string>;
    readonly attachedWorkshopsByPollId: ReadonlyMap<string, readonly WorkshopSummary[]>;
};

type WorkshopPollLoadScope = {
    /**
     * Whether this is the member view of the polls, which sees neither a hidden poll nor an unpublished occurrence a
     * poll is about
     */
    readonly isMemberVisibleOnly: boolean;

    /**
     * Whether the polls wanted are the ones asked about this room rather than the ones this room administers
     */
    readonly isAttachedToRoom: boolean;
    readonly maximalPollCount: number;
};

const EMPTY_LOADED_WORKSHOP_POLL_ROWS: LoadedWorkshopPollRows = {
    pollRows: [],
    optionRowsByPollId: new Map(),
    voteCountByOptionId: new Map(),
    selectedOptionIds: new Set(),
    attachedWorkshopsByPollId: new Map(),
};

/**
 * The occurrences every one of the given polls is about, read as the summaries the rest of the application already
 * describes a room with.
 */
async function loadWorkshopPollAttachedWorkshops(
    supabase: SupabaseClient,
    pollIds: readonly string[],
    isPublishedOnly: boolean,
): Promise<{
    readonly attachedWorkshopsByPollId: ReadonlyMap<string, readonly WorkshopSummary[]> | null;
    readonly errorMessage: string | null;
}> {
    const { data: attachmentData, error: attachmentError } = await supabase
        .from(WORKSHOP_POLL_WORKSHOP_TABLE_NAME)
        .select('poll_id, workshop_id')
        .in('poll_id', pollIds);
    if (attachmentError) {
        return { attachedWorkshopsByPollId: null, errorMessage: attachmentError.message };
    }

    const attachmentRows = (attachmentData ?? []) as readonly WorkshopPollWorkshopRow[];
    if (attachmentRows.length === 0) {
        return { attachedWorkshopsByPollId: new Map(), errorMessage: null };
    }

    let workshopQuery = supabase
        .from(WORKSHOP_TABLE_NAME)
        .select(WORKSHOP_SUMMARY_COLUMNS)
        .in('id', Array.from(new Set(attachmentRows.map((attachment) => attachment.workshop_id))))
        .order('starts_at', { ascending: true });
    if (isPublishedOnly) {
        workshopQuery = workshopQuery.eq('is_published', true);
    }

    const { data: workshopData, error: workshopError } = await workshopQuery;
    if (workshopError) {
        return { attachedWorkshopsByPollId: null, errorMessage: workshopError.message };
    }

    const workshopById = new Map<string, WorkshopSummary>(
        ((workshopData ?? []) as readonly WorkshopSummaryRow[]).map((workshopSummaryRow) => [
            workshopSummaryRow.id,
            mapWorkshopSummaryRow(workshopSummaryRow),
        ]),
    );
    const attachedWorkshopsByPollId = new Map<string, WorkshopSummary[]>();
    for (const attachment of attachmentRows) {
        const attachedWorkshop = workshopById.get(attachment.workshop_id);
        if (attachedWorkshop === undefined) {
            continue;
        }

        const attachedWorkshops = attachedWorkshopsByPollId.get(attachment.poll_id) ?? [];
        attachedWorkshops.push(attachedWorkshop);
        attachedWorkshopsByPollId.set(attachment.poll_id, attachedWorkshops);
    }

    attachedWorkshopsByPollId.forEach((attachedWorkshops) =>
        attachedWorkshops.sort((firstWorkshop, secondWorkshop) =>
            firstWorkshop.startsAt.localeCompare(secondWorkshop.startsAt),
        ),
    );

    return { attachedWorkshopsByPollId, errorMessage: null };
}

/**
 * The polls asked about one occurrence, which is the opposite direction of the attachment the community writes.
 */
async function loadWorkshopAttachedPollIds(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<{ readonly pollIds: readonly string[] | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(WORKSHOP_POLL_WORKSHOP_TABLE_NAME)
        .select('poll_id')
        .eq('workshop_id', workshopId);
    if (error) {
        return { pollIds: null, errorMessage: error.message };
    }

    return {
        pollIds: ((data ?? []) as readonly Pick<WorkshopPollWorkshopRow, 'poll_id'>[]).map(
            (attachment) => attachment.poll_id,
        ),
        errorMessage: null,
    };
}

async function loadWorkshopPollRows(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    voterEmail: string | null,
    scope: WorkshopPollLoadScope,
): Promise<{ readonly loadedPollRows: LoadedWorkshopPollRows | null; readonly errorMessage: string | null }> {
    let pollQuery = supabase.from(WORKSHOP_POLL_TABLE_NAME).select(WORKSHOP_POLL_COLUMNS);
    if (scope.isAttachedToRoom) {
        const { pollIds: attachedPollIds, errorMessage } = await loadWorkshopAttachedPollIds(supabase, workshopRow.id);
        if (attachedPollIds === null) {
            return { loadedPollRows: null, errorMessage };
        }
        if (attachedPollIds.length === 0) {
            return { loadedPollRows: EMPTY_LOADED_WORKSHOP_POLL_ROWS, errorMessage: null };
        }

        pollQuery = pollQuery.in('id', attachedPollIds);
    } else {
        pollQuery = pollQuery.eq('workshop_id', workshopRow.id);
    }
    if (scope.isMemberVisibleOnly) {
        pollQuery = pollQuery.eq('is_visible', true);
    }

    const pollQueryWithOrder = scope.isMemberVisibleOnly
        ? pollQuery.order('is_closed', { ascending: true }).order('created_at', { ascending: false })
        : pollQuery.order('created_at', { ascending: false });
    const { data: pollData, error: pollError } = await pollQueryWithOrder.limit(scope.maximalPollCount);
    if (pollError) {
        return { loadedPollRows: null, errorMessage: pollError.message };
    }

    const pollRows = (pollData ?? []) as readonly WorkshopPollRow[];
    const pollIds = pollRows.map((poll) => poll.id);
    if (pollIds.length === 0) {
        return { loadedPollRows: EMPTY_LOADED_WORKSHOP_POLL_ROWS, errorMessage: null };
    }

    const [optionsResult, voteCountsResult, selectedVotesResult, attachedWorkshopsResult] = await Promise.all([
        supabase
            .from(WORKSHOP_POLL_OPTION_TABLE_NAME)
            .select(WORKSHOP_POLL_OPTION_COLUMNS)
            .in('poll_id', pollIds)
            .order('sort_order', { ascending: true }),
        supabase.rpc('get_workshop_poll_option_vote_counts', { target_poll_ids: pollIds }),
        voterEmail === null
            ? Promise.resolve({ data: [] as readonly WorkshopParticipantPollVoteRow[], error: null })
            : supabase
                  .from(WORKSHOP_POLL_VOTE_TABLE_NAME)
                  .select('option_id')
                  .eq('voter_email', voterEmail)
                  .in('poll_id', pollIds),
        loadWorkshopPollAttachedWorkshops(supabase, pollIds, scope.isMemberVisibleOnly),
    ]);
    const firstError = optionsResult.error ?? voteCountsResult.error ?? selectedVotesResult.error;
    if (firstError) {
        return { loadedPollRows: null, errorMessage: firstError.message };
    }
    if (attachedWorkshopsResult.attachedWorkshopsByPollId === null) {
        return { loadedPollRows: null, errorMessage: attachedWorkshopsResult.errorMessage };
    }

    const optionRowsByPollId = new Map<string, WorkshopPollOptionRow[]>();
    for (const optionRow of (optionsResult.data ?? []) as readonly WorkshopPollOptionRow[]) {
        const optionRows = optionRowsByPollId.get(optionRow.poll_id) ?? [];
        optionRows.push(optionRow);
        optionRowsByPollId.set(optionRow.poll_id, optionRows);
    }

    return {
        loadedPollRows: {
            pollRows,
            optionRowsByPollId,
            voteCountByOptionId: new Map<string, number>(
                ((voteCountsResult.data ?? []) as readonly WorkshopPollVoteCountRow[]).map((voteCount) => [
                    voteCount.option_id,
                    getNonNegativeWholeNumber(voteCount.vote_count),
                ]),
            ),
            selectedOptionIds: new Set(
                ((selectedVotesResult.data ?? []) as readonly WorkshopParticipantPollVoteRow[]).map(
                    (vote) => vote.option_id,
                ),
            ),
            attachedWorkshopsByPollId: attachedWorkshopsResult.attachedWorkshopsByPollId,
        },
        errorMessage: null,
    };
}

function mapLoadedWorkshopPolls<Option extends WorkshopPollOption>(
    loadedPollRows: LoadedWorkshopPollRows,
    mapOption: (
        row: WorkshopPollOptionRow,
        voteCountByOptionId: ReadonlyMap<string, number>,
        selectedOptionIds: ReadonlySet<string>,
    ) => Option,
): readonly (Omit<WorkshopPoll, 'options'> & { readonly options: readonly Option[] })[] {
    return loadedPollRows.pollRows.map((pollRow) =>
        mapWorkshopPollRow(
            pollRow,
            (loadedPollRows.optionRowsByPollId.get(pollRow.id) ?? []).map((optionRow) =>
                mapOption(optionRow, loadedPollRows.voteCountByOptionId, loadedPollRows.selectedOptionIds),
            ),
            loadedPollRows.attachedWorkshopsByPollId.get(pollRow.id) ?? [],
        ),
    );
}

/**
 * Loads the compact, anonymous result of visible community polls. A community reads the polls it owns, while a
 * workshop reads the community polls attached to that occurrence. The count aggregation stays in PostgreSQL and the
 * participant-specific lookup contains only that participant's own selection, so no room response can infer who
 * anybody else voted for. One normalized e-mail identity has the same selection in the community and in every
 * attached workshop, while the poll itself remains owned and administered by the community.
 */
export async function loadWorkshopPolls(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    voterEmail: string | null,
): Promise<LoadedWorkshopPolls> {
    if (!isWorkshopPollVisibleInRoom(workshopRow.room_kind)) {
        return { polls: [], errorMessage: null };
    }

    const isAttachedToRoom = getWorkshopKindCapabilities(workshopRow.room_kind).isAttachedCommunityPollsShown;
    const normalizedVoterEmail = voterEmail === null ? null : normalizeWorkshopParticipantEmail(voterEmail);

    const { loadedPollRows, errorMessage } = await loadWorkshopPollRows(supabase, workshopRow, normalizedVoterEmail, {
        isMemberVisibleOnly: true,
        isAttachedToRoom,
        maximalPollCount: MAXIMAL_VISIBLE_WORKSHOP_POLL_COUNT,
    });
    if (loadedPollRows === null) {
        return { polls: [], errorMessage };
    }

    return {
        polls: mapLoadedWorkshopPolls(loadedPollRows, mapWorkshopPollOptionRow),
        errorMessage: null,
    };
}

/**
 * The same aggregate loader powers the administration, but it deliberately includes hidden polls and returns the
 * artificial component only to the signed-in dashboard.
 */
export async function loadWorkshopAdminPolls(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<LoadedWorkshopPolls<WorkshopAdminPoll>> {
    if (!getWorkshopKindCapabilities(workshopRow.room_kind).isPollsOffered) {
        return { polls: [], errorMessage: null };
    }

    const { loadedPollRows, errorMessage } = await loadWorkshopPollRows(supabase, workshopRow, null, {
        isMemberVisibleOnly: false,
        isAttachedToRoom: false,
        maximalPollCount: MAXIMAL_ADMIN_WORKSHOP_POLL_COUNT,
    });
    if (loadedPollRows === null) {
        return { polls: [], errorMessage };
    }

    return {
        polls: mapLoadedWorkshopPolls(loadedPollRows, mapWorkshopAdminPollOptionRow),
        errorMessage: null,
    };
}

/**
 * The community polls asked about one workshop occurrence, read for the administration of that occurrence.
 *
 * Note: A room which administers polls of its own is never the subject of one, so it reads nothing here instead of
 *       listing the same poll twice.
 */
export async function loadWorkshopAttachedAdminPolls(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<LoadedWorkshopPolls<WorkshopAdminPoll>> {
    if (!getWorkshopKindCapabilities(workshopRow.room_kind).isAttachedCommunityPollsShown) {
        return { polls: [], errorMessage: null };
    }

    const { loadedPollRows, errorMessage } = await loadWorkshopPollRows(supabase, workshopRow, null, {
        isMemberVisibleOnly: false,
        isAttachedToRoom: true,
        maximalPollCount: MAXIMAL_ADMIN_WORKSHOP_POLL_COUNT,
    });
    if (loadedPollRows === null) {
        return { polls: [], errorMessage };
    }

    return {
        polls: mapLoadedWorkshopPolls(loadedPollRows, mapWorkshopAdminPollOptionRow),
        errorMessage: null,
    };
}

/**
 * Loads one page of participants together with the activity totals used for its sortable columns.
 *
 * Note: The database applies the filters and sort before it limits the result, so a large workshop never needs to send
 * every participant to the browser just to display one page.
 */
export async function loadWorkshopAdminParticipantPage(
    supabase: SupabaseClient,
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<{ readonly page: WorkshopAdminParticipantPage | null; readonly errorMessage: string | null }> {
    const participantPageParameters = {
        target_workshop_id: workshopId,
        target_search_query: query.searchQuery,
        target_is_trusted: query.isTrusted,
        target_is_moderator: query.isModerator,
        target_is_interaction_banned: query.isInteractionBanned,
        target_registered_from: query.registeredFrom,
        target_registered_to: query.registeredTo,
        target_sort_by: query.sortBy,
        target_sort_direction: query.sortDirection,
        target_limit: query.pageSize,
        target_offset: (query.page - 1) * query.pageSize,
    };
    const { data, error } = await supabase.rpc(
        WORKSHOP_ADMIN_PARTICIPANT_PAGE_FUNCTION_NAME,
        participantPageParameters,
    );
    if (error) {
        return {
            page: null,
            errorMessage: reportSupabaseError(
                `\`${WORKSHOP_ADMIN_PARTICIPANT_PAGE_FUNCTION_NAME}\``,
                error,
                participantPageParameters,
            ),
        };
    }

    const participantRows = (data ?? []) as WorkshopAdminParticipantPageRow[];
    return {
        page: {
            participants: participantRows.map(mapWorkshopAdminParticipantPageRow),
            totalCount: getNonNegativeWholeNumber(participantRows[0]?.total_count),
        },
        errorMessage: null,
    };
}

/**
 * Loads the exact actions of one participant from their existing source records.
 *
 * Note: Registration and last activity are participant fields rather than action rows, so they are added as two
 * explicit timeline events next to comments, reactions, and votes. Shortened
 * material links are shareable, so they correctly belong to the material-wide
 * aggregate instead of this participant-attributed timeline.
 */
export async function loadWorkshopAdminParticipantTimeline(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participantId: string,
): Promise<{ readonly timeline: WorkshopAdminParticipantTimeline | null; readonly errorMessage: string | null }> {
    const [participantResult, commentsResult, reactionsResult, upvotesResult] = await Promise.all([
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select(WORKSHOP_ADMIN_PARTICIPANT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .eq('id', participantId)
            .maybeSingle(),
        loadAllSupabaseRows<WorkshopParticipantTimelineCommentRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_COMMENT_TABLE_NAME)
                .select('id, body, status, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
        loadAllSupabaseRows<WorkshopReactionRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_REACTION_TABLE_NAME)
                .select('id, emoji, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
        loadAllSupabaseRows<WorkshopCommentUpvoteRow>((fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_UPVOTE_TABLE_NAME)
                .select('id, comment_id, created_at')
                .eq('workshop_id', workshopRow.id)
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        ),
    ]);

    const firstErrorMessage =
        participantResult.error?.message ??
        commentsResult.errorMessage ??
        reactionsResult.errorMessage ??
        upvotesResult.errorMessage ??
        null;
    if (firstErrorMessage !== null) {
        return { timeline: null, errorMessage: firstErrorMessage };
    }

    if (participantResult.data === null) {
        return { timeline: null, errorMessage: null };
    }

    const participant = participantResult.data as WorkshopAdminParticipantRow;
    const commentRows = commentsResult.rows ?? [];
    const reactionRows = reactionsResult.rows ?? [];
    const upvoteRows = upvotesResult.rows ?? [];
    const upvotedCommentIds = Array.from(new Set(upvoteRows.map((upvote) => upvote.comment_id)));

    const upvotedCommentsResult = await loadWorkshopRowsByIds<WorkshopParticipantTimelineCommentReferenceRow>(
        upvotedCommentIds,
        (pageCommentIds) =>
            supabase
                .from(WORKSHOP_COMMENT_TABLE_NAME)
                .select('id, author_name, body')
                .eq('workshop_id', workshopRow.id)
                .in('id', pageCommentIds),
    );
    if (upvotedCommentsResult.errorMessage !== null) {
        return { timeline: null, errorMessage: upvotedCommentsResult.errorMessage };
    }

    const upvotedCommentById = new Map<string, WorkshopParticipantTimelineCommentReferenceRow>(
        (upvotedCommentsResult.rows ?? []).map((comment) => [comment.id, comment] as const),
    );
    const events: WorkshopParticipantTimelineEvent[] = [
        { kind: 'joined' as const, id: `joined-${participant.id}`, occurredAt: participant.connected_at },
        { kind: 'last-seen' as const, id: `last-seen-${participant.id}`, occurredAt: participant.last_seen_at },
        ...commentRows.map((comment): WorkshopParticipantTimelineEvent => ({
            kind: 'comment',
            id: comment.id,
            occurredAt: comment.created_at,
            body: comment.body,
            status: comment.status,
        })),
        ...reactionRows.map((reaction): WorkshopParticipantTimelineEvent => ({
            kind: 'reaction',
            id: reaction.id,
            occurredAt: reaction.created_at,
            emoji: reaction.emoji,
        })),
        ...upvoteRows.map((upvote): WorkshopParticipantTimelineEvent => {
            const comment = upvotedCommentById.get(upvote.comment_id);
            return {
                kind: 'upvote',
                id: upvote.id,
                occurredAt: upvote.created_at,
                commentId: upvote.comment_id,
                commentAuthorName: comment?.author_name ?? null,
                commentBody: comment?.body ?? null,
            };
        }),
    ].sort(
        (firstEvent, secondEvent) =>
            firstEvent.occurredAt.localeCompare(secondEvent.occurredAt) || firstEvent.id.localeCompare(secondEvent.id),
    );

    return {
        timeline: {
            participant: mapWorkshopAdminParticipantRow(participant, {
                participant_id: participant.id,
                comment_count: commentRows.length,
                reaction_count: reactionRows.length,
                upvote_count: upvoteRows.length,
            }),
            events,
        },
        errorMessage: null,
    };
}

/**
 * Loads the newest messages of a room with nothing but the moment they were written
 *
 * Note: The administration counts the matches of a regular expression in the browser, so a metric which is still being
 *       typed answers at once. A very busy room is sampled from its newest messages, because those are the ones a
 *       graph of it is read for.
 */
async function loadWorkshopAdminCommentSamples(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{
    readonly commentSamples: readonly WorkshopAdminCommentSample[] | null;
    readonly isCommentSampleComplete: boolean;
    readonly errorMessage: string | null;
}> {
    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('body, created_at')
        .eq('workshop_id', workshopRow.id)
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT + 1);

    if (error) {
        return { commentSamples: null, isCommentSampleComplete: false, errorMessage: error.message };
    }

    const rows = (data ?? []) as WorkshopAdminCommentSampleRow[];
    const isCommentSampleComplete = rows.length <= MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT;

    return {
        commentSamples: rows
            .slice(0, MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT)
            .map((row) => ({ occurredAt: row.created_at, body: row.body }))
            .reverse(),
        isCommentSampleComplete,
        errorMessage: null,
    };
}

/**
 * Loads compact workshop-wide timeline buckets and reaction totals for the overview and reactions sections.
 */
export async function loadWorkshopAdminAnalytics(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{ readonly analytics: WorkshopAdminAnalytics | null; readonly errorMessage: string | null }> {
    const bucketDurationSeconds = getWorkshopAdminTimelineBucketDurationSeconds(workshopRow);
    const timelineArguments = {
        target_workshop_id: workshopRow.id,
        target_bucket_seconds: bucketDurationSeconds,
    };
    const [timelineResult, reactionTimelineResult, reactionCountsResult, commentSampleResult] = await Promise.all([
        supabase.rpc('get_workshop_admin_timeline', timelineArguments),
        supabase.rpc('get_workshop_admin_reaction_timeline', timelineArguments),
        supabase.rpc('get_workshop_reaction_counts', { target_workshop_id: workshopRow.id }),
        loadWorkshopAdminCommentSamples(supabase, workshopRow),
    ]);
    const firstError =
        timelineResult.error ??
        reactionTimelineResult.error ??
        reactionCountsResult.error ??
        (commentSampleResult.errorMessage === null ? null : { message: commentSampleResult.errorMessage });
    if (firstError) {
        return { analytics: null, errorMessage: firstError.message };
    }

    const reactionCountsByBucket = groupWorkshopAdminReactionTimelineRows(
        (reactionTimelineResult.data ?? []) as WorkshopAdminReactionTimelineRow[],
    );

    return {
        analytics: {
            timelineStartsAt: workshopRow.starts_at,
            timelineEndsAt: getWorkshopAdminTimelineEndsAt(workshopRow),
            bucketDurationSeconds,
            timeline: ((timelineResult.data ?? []) as WorkshopAdminTimelinePointRow[]).map((row) =>
                mapWorkshopAdminTimelinePointRow(row, reactionCountsByBucket.get(row.bucket_starts_at) ?? {}),
            ),
            reactionCounts: ((reactionCountsResult.data ?? []) as WorkshopReactionCountRow[]).map(
                mapWorkshopReactionCountRow,
            ),
            commentSamples: commentSampleResult.commentSamples ?? [],
            isCommentSampleComplete: commentSampleResult.isCommentSampleComplete,
        },
        errorMessage: null,
    };
}

/**
 * Loads every participant which matches the administration filter for a file export.
 *
 * Note: The export keeps the exact same filter and sort as the participant table, while intentionally ignoring its
 * current page so a spreadsheet always contains the complete selected audience.
 */
export async function loadWorkshopAdminParticipantsForExport(
    supabase: SupabaseClient,
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<{
    readonly participants: readonly WorkshopAdminParticipant[] | null;
    readonly errorMessage: string | null;
}> {
    const exportQuery: WorkshopAdminParticipantQuery = {
        ...query,
        page: 1,
        pageSize: SUPABASE_ROW_PAGE_SIZE,
    };
    const firstPageResult = await loadWorkshopAdminParticipantPage(supabase, workshopId, exportQuery);
    if (firstPageResult.page === null) {
        return { participants: null, errorMessage: firstPageResult.errorMessage };
    }

    const participants = [...firstPageResult.page.participants];
    const totalPageCount = Math.ceil(firstPageResult.page.totalCount / exportQuery.pageSize);
    for (let currentPage = 2; currentPage <= totalPageCount; currentPage += 1) {
        const pageResult = await loadWorkshopAdminParticipantPage(supabase, workshopId, {
            ...exportQuery,
            page: currentPage,
        });
        if (pageResult.page === null) {
            return { participants: null, errorMessage: pageResult.errorMessage };
        }

        participants.push(...pageResult.page.participants);
    }

    return { participants, errorMessage: null };
}

/**
 * Loads all comments for a CSV export, without inheriting the short moderation list used by the interactive screen.
 */
export async function loadWorkshopAdminCommentsForExport(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<{ readonly comments: readonly WorkshopAdminComment[] | null; readonly errorMessage: string | null }> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopCommentRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select(WORKSHOP_COMMENT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(fromIndex, toIndex),
    );
    if (rows === null) {
        return { comments: null, errorMessage };
    }

    // Note: The exported file says who wrote a message and how the room saw it, never the invisible moderation state
    //       of its author, so the authors are read for their badge alone.
    const roomContext: WorkshopCommentRoomContext = {
        pinnedCommentId: workshopRow.pinned_comment_id,
        authorByParticipantId: await loadWorkshopCommentAuthors(supabase, workshopRow.id, rows),
        isModerationOffered: false,
    };

    return {
        comments: rows.map((row): WorkshopAdminComment => ({
            ...mapWorkshopCommentRow(row, false, roomContext),
            participantId: row.participant_id,
            isArtificial: row.is_artificial,
            realUpvoteCount: row.upvote_count,
            artificialUpvoteCount: row.artificial_upvote_count,
            parentComment: null,
        })),
        errorMessage: null,
    };
}

/**
 * Reads enough participant identity to make exported reactions understandable, including artificial reactions whose
 * participant is intentionally absent.
 */
async function loadWorkshopParticipantIdentities(
    supabase: SupabaseClient,
    workshopId: string,
    participantIds: readonly string[],
): Promise<{
    readonly identityByParticipantId: ReadonlyMap<string, WorkshopAdminParticipantIdentityRow> | null;
    readonly errorMessage: string | null;
}> {
    const { rows, errorMessage } = await loadWorkshopRowsByIds<WorkshopAdminParticipantIdentityRow>(
        participantIds,
        (pageParticipantIds) =>
            supabase
                .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                .select('id, fullname, email')
                .eq('workshop_id', workshopId)
                .in('id', pageParticipantIds),
    );
    if (rows === null) {
        return { identityByParticipantId: null, errorMessage };
    }

    return {
        identityByParticipantId: new Map(rows.map((participant) => [participant.id, participant] as const)),
        errorMessage: null,
    };
}

/**
 * Loads every reaction with the optional human identity which sent it, for the reactions CSV export.
 */
export async function loadWorkshopAdminReactionsForExport(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<
    | {
          readonly reactions: readonly {
              readonly id: string;
              readonly occurredAt: string;
              readonly emoji: string;
              readonly participantFullname: string | null;
              readonly participantEmail: string | null;
              readonly isArtificial: boolean;
          }[];
          readonly errorMessage: null;
      }
    | { readonly reactions: null; readonly errorMessage: string | null }
> {
    const { rows, errorMessage } = await loadAllSupabaseRows<WorkshopAdminReactionExportRow>((fromIndex, toIndex) =>
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id, participant_id, emoji, created_at, is_artificial')
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(fromIndex, toIndex),
    );
    if (rows === null) {
        return { reactions: null, errorMessage };
    }

    const participantIds = rows
        .map((reaction) => reaction.participant_id)
        .filter((participantId): participantId is string => participantId !== null);
    const { identityByParticipantId, errorMessage: identityErrorMessage } = await loadWorkshopParticipantIdentities(
        supabase,
        workshopId,
        participantIds,
    );
    if (identityByParticipantId === null) {
        return { reactions: null, errorMessage: identityErrorMessage };
    }

    return {
        reactions: rows.map((reaction) => {
            const participant =
                reaction.participant_id === null ? undefined : identityByParticipantId.get(reaction.participant_id);
            return {
                id: reaction.id,
                occurredAt: reaction.created_at,
                emoji: reaction.emoji,
                participantFullname: participant?.fullname ?? null,
                participantEmail: participant?.email ?? null,
                isArtificial: reaction.is_artificial,
            };
        }),
        errorMessage: null,
    };
}

/**
 * Loads all content blocks with their measured material-link clicks for the content CSV export.
 */
export async function loadWorkshopAdminContentForExport(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<{ readonly contentBlocks: readonly WorkshopContentBlock[] | null; readonly errorMessage: string | null }> {
    const [contentResult, contentLinkClickTotalsResult] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select(WORKSHOP_CONTENT_COLUMNS)
            .eq('workshop_id', workshopId)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        supabase.rpc('get_workshop_content_link_click_totals', { target_workshop_id: workshopId }),
    ]);
    const firstError = contentResult.error ?? contentLinkClickTotalsResult.error;
    if (firstError) {
        return { contentBlocks: null, errorMessage: firstError.message };
    }

    const linkClickCountByContentBlockId = new Map<string, number>(
        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
            (linkClickTotals) =>
                [
                    linkClickTotals.content_block_id,
                    getNonNegativeWholeNumber(linkClickTotals.link_click_count),
                ] as const,
        ),
    );
    return {
        contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
            mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
        ),
        errorMessage: null,
    };
}

/**
 * Lists the feedback from one workshop only for the administration.
 *
 * Feedback and participants stay separate source records, just as comments and reactions do. The small identity read
 * keeps this list attributable without ever exposing an e-mail address through the participant-facing state route.
 */
export async function loadWorkshopAdminFeedback(
    supabase: SupabaseClient,
    workshopId: string,
): Promise<{ readonly feedbacks: readonly WorkshopAdminFeedback[] | null; readonly errorMessage: string | null }> {
    const feedbackResult = await loadAllSupabaseRows<WorkshopFeedbackRow>(
        (fromIndex, toIndex) =>
            supabase
                .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                .select(WORKSHOP_FEEDBACK_COLUMNS)
                .eq('workshop_id', workshopId)
                .order('updated_at', { ascending: false })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex),
        `the feedback of workshop ${workshopId}`,
    );
    if (feedbackResult.rows === null) {
        return { feedbacks: null, errorMessage: feedbackResult.errorMessage };
    }

    const participantResult = await loadWorkshopRowsByIds<WorkshopFeedbackParticipantRow>(
        feedbackResult.rows.map((feedback) => feedback.participant_id),
        (participantIds) =>
            supabase
                .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                .select('id, fullname, email')
                .eq('workshop_id', workshopId)
                .in('id', participantIds),
    );
    if (participantResult.rows === null) {
        return { feedbacks: null, errorMessage: participantResult.errorMessage };
    }

    const participantById = new Map<string, WorkshopFeedbackParticipantRow>(
        participantResult.rows.map((participant) => [participant.id, participant] as const),
    );
    return {
        feedbacks: feedbackResult.rows
            .map((feedback) => mapWorkshopAdminFeedbackRow(feedback, participantById))
            .filter((feedback): feedback is WorkshopAdminFeedback => feedback !== null),
        errorMessage: null,
    };
}

/**
 * Loads the message pinned on top of a chat, whatever its age and moderation state
 *
 * Note: The pin belongs to the workshop, so the pinned message can be far outside the recent ones and still has to
 *       reach both the room and the administration.
 * Note: A pin which could not be loaded must never take the whole room down with it, so a failure is reported as
 *       nothing being pinned.
 */
async function loadPinnedWorkshopCommentRowOrNull(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
): Promise<WorkshopCommentRow | null> {
    if (workshopRow.pinned_comment_id === null) {
        return null;
    }

    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('id', workshopRow.pinned_comment_id)
        .eq('workshop_id', workshopRow.id)
        .maybeSingle();

    if (error) {
        console.error('Failed to load the pinned comment of a workshop:', error.message);
        return null;
    }

    return data as WorkshopCommentRow | null;
}

/**
 * Adds the pinned message to the loaded ones, so the room keeps a pin on top however old it is
 *
 * Note: Only a message the whole room sees can hold the top of the chat, so a pin which lost its approval is left out.
 */
function withPinnedWorkshopCommentRow(
    commentRows: readonly WorkshopCommentRow[],
    pinnedCommentRow: WorkshopCommentRow | null,
): readonly WorkshopCommentRow[] {
    if (
        pinnedCommentRow === null ||
        pinnedCommentRow.status !== 'approved' ||
        commentRows.some(({ id }) => id === pinnedCommentRow.id)
    ) {
        return commentRows;
    }

    return [...commentRows, pinnedCommentRow];
}

/**
 * Pins one message on top of a chat or releases the top of that chat again
 *
 * Note: The workshop remembers a single pin, so pinning a message releases the previously pinned one in the same write.
 * Note: Releasing the top only clears this very message, so it never drops a pin which another tab set meanwhile.
 */
export async function updatePinnedWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    isPinned: boolean,
): Promise<{ readonly errorMessage: string | null }> {
    const pinnedCommentQuery = supabase
        .from(WORKSHOP_TABLE_NAME)
        .update({ pinned_comment_id: isPinned ? commentId : null })
        .eq('id', workshopId);

    const { error } = await (isPinned ? pinnedCommentQuery : pinnedCommentQuery.eq('pinned_comment_id', commentId));
    if (error) {
        console.error('Failed to change the pinned comment of a workshop:', error.message);
        return { errorMessage: 'Pinned comment could not be changed' };
    }

    return { errorMessage: null };
}

/**
 * Chooses the one comment the host is answering over the stage, or leaves the stage without a question.
 *
 * Note: The database checks that a selected comment belongs to this room. The stage keeps no copied text: the selected
 *       comment remains the one source of the question in both chat and live presentation.
 */
export async function updateWorkshopStageComment(
    supabase: SupabaseClient,
    workshopId: string,
    stageCommentId: string | null,
): Promise<{ readonly errorMessage: string | null }> {
    const { error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .update({ stage_comment_id: stageCommentId })
        .eq('id', workshopId);
    if (error) {
        console.error('Failed to change the comment on a workshop stage:', error.message);
        return { errorMessage: 'Stage comment could not be changed' };
    }

    return { errorMessage: null };
}

export async function loadWorkshopPublicState(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    commentSort: WorkshopCommentSort,
): Promise<LoadedWorkshopPublicState> {
    const contentVisibilityCutoff = new Date().toISOString();
    const workshop = mapWorkshopRow(workshopRow);
    const isWorkshopPast = workshopRow.room_kind === 'workshop' && getWorkshopPhase(workshop) === 'past';

    // Note: The reactions which flew over the stage recently are replayed for somebody entering the room. A room
    //       without that panel therefore does not load them, exactly as it does not count them.
    const isReactionsPanelOffered = isWorkshopPanelOffered(
        workshopRow.room_kind,
        workshopRow.disabled_panels,
        'reactions',
    );
    const roomCapabilities = getWorkshopKindCapabilities(workshopRow.room_kind);
    const isStageOffered = roomCapabilities.isStageOffered;

    // Note: The membership decides which materials a member sees, so the room asks about it before it assembles what
    //       is visible. A room which does not offer the membership has nothing to unlock, and an answer which does
    //       not arrive keeps the paid materials hidden rather than letting them escape.
    let isPaidMember = false;
    if (roomCapabilities.isMembershipOffered) {
        const { membership, errorMessage: membershipErrorMessage } = await loadCommunityMembershipByEmail(
            supabase,
            participant.email,
        );
        if (membershipErrorMessage !== null) {
            console.error('Failed to load the community membership of a workshop participant:', membershipErrorMessage);
        }
        isPaidMember = membership !== null && isPaidCommunityMembershipStatus(membership.status);
    }

    // Note: A moderator is shown every message which waits for a decision, because making that decision is exactly
    //       what they are in the room for. Everybody else only ever sees the messages they wrote themselves.
    const isModerationOffered = isWorkshopParticipantModerating(participant);
    const pendingCommentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT);
    const commentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_VISIBLE_COMMENT_COUNT);
    // Note: A member who does not pay for the membership is never told that a material of the paid ones unlocks next,
    //       because that countdown would promise them something a purchase alone cannot open.
    const nextContentUnlockBaseQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select('unlock_at')
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .gt('unlock_at', contentVisibilityCutoff);
    const nextContentUnlockQuery = isPaidMember
        ? nextContentUnlockBaseQuery
        : nextContentUnlockBaseQuery.eq('is_paid_members_only', false);
    // Note: The materials are read as a paid member would read them, whoever is reading the room. Which of them reach
    //       this member and which are only named to them is then decided once, so the room cannot hide a material it
    //       says nothing about or name one it also hands over.
    const visibleContentQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select(WORKSHOP_CONTENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .lte('unlock_at', contentVisibilityCutoff)
        .order('sort_order', { ascending: true })
        .order('unlock_at', { ascending: true });
    const futureFollowUpContentQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select(WORKSHOP_CONTENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .eq('is_follow_up', true)
        .gt('unlock_at', contentVisibilityCutoff);

    const [
        contentResult,
        nextUnlockResult,
        futureFollowUpContentResult,
        feedbackResult,
        commentsResult,
        pendingCommentsResult,
        reactionsResult,
        reactionCountsResult,
        watchingParticipantCount,
        pinnedCommentRow,
        stageCommentResult,
        pollsResult,
    ] = await Promise.all([
        visibleContentQuery,
        (isWorkshopPast ? nextContentUnlockQuery.eq('is_follow_up', false) : nextContentUnlockQuery)
            .order('unlock_at', { ascending: true })
            .limit(1)
            .maybeSingle(),
        // A selected follow-up remains a normal material before the end, including its scheduled unlock. Once the
        // wrap-up starts it must be available for the stage link even if its ordinary unlock time is later; unrelated
        // scheduled materials keep their own timing.
        isWorkshopPast ? futureFollowUpContentQuery.maybeSingle() : Promise.resolve({ data: null, error: null }),
        workshopRow.room_kind === 'workshop'
            ? supabase
                  .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                  .select(WORKSHOP_FEEDBACK_COLUMNS)
                  .eq('workshop_id', workshopRow.id)
                  .eq('participant_id', participant.id)
                  .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        commentsQuery,
        isModerationOffered ? pendingCommentsQuery : pendingCommentsQuery.eq('participant_id', participant.id),
        isReactionsPanelOffered
            ? supabase
                  .from(WORKSHOP_REACTION_TABLE_NAME)
                  .select('id, emoji, created_at')
                  .eq('workshop_id', workshopRow.id)
                  .order('created_at', { ascending: false })
                  .limit(MAXIMAL_RECENT_REACTION_COUNT)
            : Promise.resolve({ data: [], error: null }),
        loadWorkshopReactionCounts(supabase, workshopRow),
        countWatchingWorkshopParticipants(supabase, workshopRow),
        loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow),
        isStageOffered && workshopRow.stage_comment_id !== null
            ? loadWorkshopCommentReference(supabase, workshopRow.id, workshopRow.stage_comment_id)
            : Promise.resolve({ comment: null, errorMessage: null }),
        loadWorkshopPolls(supabase, workshopRow, participant.email),
    ]);

    const stateQueryError =
        contentResult.error ??
        nextUnlockResult.error ??
        futureFollowUpContentResult.error ??
        feedbackResult.error ??
        commentsResult.error ??
        pendingCommentsResult.error ??
        reactionsResult.error;
    const errorMessage =
        stateQueryError?.message ??
        reactionCountsResult.errorMessage ??
        stageCommentResult.errorMessage ??
        pollsResult.errorMessage;
    if (errorMessage !== null) {
        return { state: null, errorMessage };
    }

    const rawContentBlocks = [
        ...((contentResult.data ?? []) as WorkshopContentRow[]),
        ...(futureFollowUpContentResult.data === null ? [] : [futureFollowUpContentResult.data as WorkshopContentRow]),
    ]
        .sort(
            (firstContentBlock, secondContentBlock) =>
                firstContentBlock.sort_order - secondContentBlock.sort_order ||
                Date.parse(firstContentBlock.unlock_at) - Date.parse(secondContentBlock.unlock_at),
        )
        .map(mapWorkshopContentRow);
    // Only what this member may read is prepared for them; a withheld material never has its links materialized,
    // because nothing of it but its title is going to leave the server.
    const { readableContentBlocks, paidMembersOnlyContentPreviews } = selectWorkshopContentForMember(rawContentBlocks, {
        isPaidMember,
        isMembershipOffered: roomCapabilities.isMembershipOffered,
    });
    // The recording of an ended workshop is decided here for the very same reason: a member who has not unlocked it
    // receives the teaser published for it instead of the stream, rather than the room merely not playing what it
    // still handed over.
    const { readableVideo, paidMembersOnlyVideo } = selectWorkshopVideoForMember(workshop, {
        isWorkshopPast,
        isPaidMember,
        isMembershipOffered: roomCapabilities.isMembershipOffered,
    });
    const materializedContentResults = await Promise.all(
        readableContentBlocks.map(async (contentBlock) => ({
            contentBlock,
            ...(await materializeWorkshopMaterialShortLinks(supabase, {
                workshopSlug: workshopRow.slug,
                workshopKind: workshopRow.room_kind,
                contentBlockId: contentBlock.id,
                bodyMarkdown: contentBlock.bodyMarkdown,
            })),
        })),
    );
    const materializationErrorMessage = materializedContentResults.find(
        (materializedContentResult) => materializedContentResult.errorMessage !== null,
    )?.errorMessage;
    if (materializationErrorMessage !== null && materializationErrorMessage !== undefined) {
        return { state: null, errorMessage: materializationErrorMessage };
    }
    const materializedContentBlocks = materializedContentResults.map((materializedContentResult) => ({
        ...materializedContentResult.contentBlock,
        bodyMarkdown: materializedContentResult.bodyMarkdown ?? materializedContentResult.contentBlock.bodyMarkdown,
    }));

    const commentRows = withPinnedWorkshopCommentRow(
        [
            ...((commentsResult.data ?? []) as WorkshopCommentRow[]),
            ...((pendingCommentsResult.data ?? []) as WorkshopCommentRow[]),
        ],
        pinnedCommentRow,
    );
    const commentIds = commentRows.map(({ id }) => id);
    let upvotedCommentIds = new Set<string>();

    if (commentIds.length > 0) {
        const { data: upvoteRows, error: upvoteError } = await supabase
            .from(WORKSHOP_UPVOTE_TABLE_NAME)
            .select('comment_id')
            .eq('workshop_id', workshopRow.id)
            .eq('participant_id', participant.id)
            .in('comment_id', commentIds);

        if (upvoteError) {
            return { state: null, errorMessage: upvoteError.message };
        }

        upvotedCommentIds = new Set((upvoteRows ?? []).map(({ comment_id }) => comment_id as string));
    }

    const authorByParticipantId = await loadWorkshopCommentAuthors(supabase, workshopRow.id, commentRows);
    const roomContext: WorkshopCommentRoomContext = {
        pinnedCommentId: workshopRow.pinned_comment_id,
        authorByParticipantId,
        isModerationOffered,
    };
    const materializedCommentResults = await Promise.all(
        commentRows.map(async (commentRow) => {
            const author =
                commentRow.participant_id === null
                    ? undefined
                    : authorByParticipantId.get(commentRow.participant_id);
            if (
                !areWorkshopCommentLinksEnabled({
                    isArtificial: commentRow.is_artificial,
                    isAuthorModerator: author?.isModerator ?? false,
                })
            ) {
                return { commentRow, bodyMarkdown: commentRow.body, errorMessage: null };
            }

            return {
                commentRow,
                ...(await materializeWorkshopCommentShortLinks(supabase, {
                    workshopSlug: workshopRow.slug,
                    workshopKind: workshopRow.room_kind,
                    commentId: commentRow.id,
                    bodyMarkdown: commentRow.body,
                })),
            };
        }),
    );
    const commentMaterializationErrorMessage = materializedCommentResults.find(
        (materializedCommentResult) => materializedCommentResult.errorMessage !== null,
    )?.errorMessage;
    if (commentMaterializationErrorMessage !== null && commentMaterializationErrorMessage !== undefined) {
        return { state: null, errorMessage: commentMaterializationErrorMessage };
    }
    const materializedCommentRows = materializedCommentResults.map((materializedCommentResult) => ({
        ...materializedCommentResult.commentRow,
        body: materializedCommentResult.bodyMarkdown ?? materializedCommentResult.commentRow.body,
    }));

    return {
        state: {
            serverTime: new Date().toISOString(),
            workshop: { ...workshop, ...readableVideo },
            participant,
            watchingParticipantCount,
            contentBlocks: materializedContentBlocks,
            nextContentUnlockAt: (nextUnlockResult.data?.unlock_at as string | undefined) ?? null,
            paidMembersOnlyContentPreviews,
            paidMembersOnlyVideo,
            feedback:
                feedbackResult.data === null
                    ? null
                    : mapWorkshopFeedbackRow(feedbackResult.data as WorkshopFeedbackRow),
            comments: sortWorkshopComments(
                materializedCommentRows.map((row) =>
                    mapWorkshopCommentRow(row, upvotedCommentIds.has(row.id), roomContext),
                ),
                commentSort,
            ),
            stageComment: stageCommentResult.comment,
            recentReactions: ((reactionsResult.data ?? []) as WorkshopReactionRow[]).map(mapWorkshopReactionRow),
            reactionCounts: reactionCountsResult.reactionCounts,
            polls: pollsResult.polls,
        },
        errorMessage: null,
    };
}

/**
 * Loads the comments answered by the listed ones, so moderation of a reply sees the question it answers
 *
 * Note: The listed comments are filtered by one moderation status, so an answered comment is almost never among them.
 * Note: Missing context must never take the whole administration down with it, so a failure is reported as no context.
 */
async function loadAnsweredWorkshopComments(
    supabase: SupabaseClient,
    workshopId: string,
    commentRows: readonly WorkshopCommentRow[],
): Promise<ReadonlyMap<string, WorkshopCommentReference>> {
    const answeredCommentIds = Array.from(
        new Set(
            commentRows
                .map((commentRow) => commentRow.parent_comment_id)
                .filter((parentCommentId): parentCommentId is string => parentCommentId !== null),
        ),
    );
    if (answeredCommentIds.length === 0) {
        return new Map();
    }

    const { data, error } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_REFERENCE_COLUMNS)
        .eq('workshop_id', workshopId)
        .in('id', answeredCommentIds);

    if (error) {
        console.error('Failed to load the answered comments of a workshop:', error.message);
        return new Map();
    }

    return new Map(
        ((data ?? []) as readonly WorkshopCommentReferenceRow[]).map(
            (commentRow) => [commentRow.id, mapWorkshopCommentReferenceRow(commentRow)] as const,
        ),
    );
}

type WorkshopAdminSnapshotOptions = {
    /**
     * Whether the currently opened administration section needs the list of moderated comments.
     */
    readonly isCommentsIncluded: boolean;
};

export async function loadWorkshopAdminSnapshot(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    commentStatus: WorkshopCommentStatus,
    options: WorkshopAdminSnapshotOptions = { isCommentsIncluded: true },
): Promise<{ readonly snapshot: WorkshopAdminSnapshot | null; readonly errorMessage: string | null }> {
    const [
        contentResult,
        commentsResult,
        commentsCountResult,
        participantCountResult,
        contentLinkClickTotalsResult,
        reactionsResult,
        artificialReactionsResult,
        pinnedCommentRow,
        stageCommentResult,
        pollsResult,
        attachedPollsResult,
    ] = await Promise.all([
        supabase
            .from(WORKSHOP_CONTENT_TABLE_NAME)
            .select(WORKSHOP_CONTENT_COLUMNS)
            .eq('workshop_id', workshopRow.id)
            .order('sort_order', { ascending: true })
            .order('unlock_at', { ascending: true }),
        options.isCommentsIncluded
            ? supabase
                  .from(WORKSHOP_COMMENT_TABLE_NAME)
                  .select(WORKSHOP_COMMENT_COLUMNS)
                  .eq('workshop_id', workshopRow.id)
                  .eq('status', commentStatus)
                  .order('created_at', { ascending: false })
                  .limit(MAXIMAL_ADMIN_COMMENT_LIST_COUNT)
            : Promise.resolve({ data: [], error: null }),
        supabase
            .from(WORKSHOP_COMMENT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase.rpc('get_workshop_content_link_click_totals', { target_workshop_id: workshopRow.id }),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id),
        supabase
            .from(WORKSHOP_REACTION_TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('workshop_id', workshopRow.id)
            .eq('is_artificial', true),
        options.isCommentsIncluded ? loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow) : Promise.resolve(null),
        getWorkshopKindCapabilities(workshopRow.room_kind).isStageOffered && workshopRow.stage_comment_id !== null
            ? loadWorkshopCommentReference(supabase, workshopRow.id, workshopRow.stage_comment_id)
            : Promise.resolve({ comment: null, errorMessage: null }),
        loadWorkshopAdminPolls(supabase, workshopRow),
        loadWorkshopAttachedAdminPolls(supabase, workshopRow),
    ]);

    const firstError =
        contentResult.error ??
        commentsResult.error ??
        commentsCountResult.error ??
        participantCountResult.error ??
        contentLinkClickTotalsResult.error ??
        reactionsResult.error ??
        artificialReactionsResult.error;
    if (firstError) {
        return { snapshot: null, errorMessage: firstError.message };
    }
    if (pollsResult.errorMessage !== null || attachedPollsResult.errorMessage !== null) {
        return { snapshot: null, errorMessage: pollsResult.errorMessage ?? attachedPollsResult.errorMessage };
    }
    if (stageCommentResult.errorMessage !== null) {
        return { snapshot: null, errorMessage: stageCommentResult.errorMessage };
    }

    const commentRows = (commentsResult.data ?? []) as WorkshopCommentRow[];
    const [answeredCommentById, authorByParticipantId] = await Promise.all([
        loadAnsweredWorkshopComments(supabase, workshopRow.id, commentRows),
        loadWorkshopCommentAuthors(supabase, workshopRow.id, commentRows),
    ]);

    // Note: The administration moderates every room, so it reads the authors of the listed messages as they are.
    const roomContext: WorkshopCommentRoomContext = {
        pinnedCommentId: workshopRow.pinned_comment_id,
        authorByParticipantId,
        isModerationOffered: true,
    };
    const comments = commentRows.map((row): WorkshopAdminComment => ({
        ...mapWorkshopCommentRow(row, false, roomContext),
        participantId: row.participant_id,
        isArtificial: row.is_artificial,
        realUpvoteCount: row.upvote_count,
        artificialUpvoteCount: row.artificial_upvote_count,
        parentComment: row.parent_comment_id === null ? null : (answeredCommentById.get(row.parent_comment_id) ?? null),
    }));
    const linkClickCountByContentBlockId = new Map<string, number>(
        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
            (linkClickTotals) =>
                [
                    linkClickTotals.content_block_id,
                    getNonNegativeWholeNumber(linkClickTotals.link_click_count),
                ] as const,
        ),
    );

    return {
        snapshot: {
            workshop: mapWorkshopRow(workshopRow),
            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
                mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
            ),
            polls: pollsResult.polls,
            attachedPolls: attachedPollsResult.polls,
            comments,
            pinnedComment: pinnedCommentRow === null ? null : mapWorkshopCommentReferenceRow(pinnedCommentRow),
            stageComment: stageCommentResult.comment,
            participants: [],
            participantCount: participantCountResult.count ?? 0,
            commentCount: commentsCountResult.count ?? 0,
            reactionCount: reactionsResult.count ?? 0,
            artificialReactionCount: artificialReactionsResult.count ?? 0,
        },
        errorMessage: null,
    };
}
