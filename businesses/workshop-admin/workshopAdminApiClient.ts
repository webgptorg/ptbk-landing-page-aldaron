import type { EventDetails } from '@/lib/events/event';
import type { EventLocationKind } from '@/lib/events/eventLocation';
import type { EventType } from '@/lib/events/eventTypes';
import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type {
    WorkshopAdminAnalytics,
    WorkshopAdminFeedback,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopKind,
} from '@/lib/workshops/workshopTypes';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import {
    serializeWorkshopAdminParticipantQuery,
    type WorkshopAdminParticipantQuery,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import type { WorkshopAdminExportKind } from '@/lib/workshops/workshopAdminExports';

/**
 * The settings of a room as its administration writes them
 *
 * Note: A setting which the kind of the room does not have is left out instead of being sent as an empty value, so a
 *       calm room never receives a schedule, a stage, or reactions it could not offer anyway, and the only room of its
 *       kind never receives the address it was given once and for all.
 */
export type WorkshopWriteValues = {
    readonly title: string;
    readonly description: string;
    readonly isPublished: boolean;
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly artificialWatchingParticipantCount?: number;
    readonly slug?: string;
    readonly startsAt?: string;
    readonly endsAt?: string | null;
    readonly eventType?: EventType;
    readonly locationKind?: EventLocationKind;
    readonly locationLabel?: string;
    readonly priceCzk?: number;
    readonly maximumParticipantCount?: number | null;
    readonly youtubeVideoId?: string | null;

    /**
     * The teaser of the recording which everybody who has not unlocked it watches once the term is over
     */
    readonly previewYoutubeVideoId?: string | null;

    /**
     * The project this term is about, or `null` to disconnect the project it was about
     *
     * Note: The whole connection is written at once, so setting, changing, and unsetting it are one and the same
     *       request and a branch or a deployment can never outlive the repository it belongs to.
     */
    readonly repository?: WorkshopRepositoryWriteValues | null;
    readonly allowedReactions?: readonly string[];
};

/**
 * The project of one term as its administration writes it, before the server reads the repository out of it
 */
export type WorkshopRepositoryWriteValues = {
    /**
     * The repository, written either as its address or as `owner/name`
     */
    readonly url: string;
    readonly branch: string | null;
    readonly deploymentUrl: string | null;
};

/**
 * A new room always starts as one term of an event in time at an address of its own, so its creation says all of it.
 */
export type WorkshopCreateValues = WorkshopWriteValues & {
    readonly slug: string;
    readonly startsAt: string;
    readonly eventType: EventType;
    readonly locationKind: EventLocationKind;
};

/**
 * The event of one term as its administration writes it
 *
 * Note: The form of the administration edits the very same shape every page reads, so a field added to an event is
 *       written, stored, and listed without a second description of it anywhere.
 */
export function createWorkshopEventWriteValues(event: EventDetails) {
    return {
        eventType: event.type,
        locationKind: event.locationKind,
        locationLabel: event.locationLabel,
        priceCzk: event.priceCzk,
        maximumParticipantCount: event.maximumParticipantCount,
    };
}

export type WorkshopContentWriteValues = {
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;
    readonly isFollowUp: boolean;
    readonly isPaidMembersOnly: boolean;
};

export type WorkshopPollCreateValues = {
    readonly question: string;
    readonly options: readonly string[];
    readonly isClosed: boolean;
    readonly isVisible: boolean;

    /**
     * The workshop occurrences this poll is about, which the community administers together with the poll itself
     */
    readonly attachedWorkshopIds: readonly string[];
};

export type WorkshopPollOptionWriteValues = {
    readonly id?: string;
    readonly label: string;
};

export type WorkshopPollUpdateValues = {
    readonly question: string;
    readonly options: readonly WorkshopPollOptionWriteValues[];
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly attachedWorkshopIds: readonly string[];
};

export type WorkshopArtificialCommentValues = {
    readonly authorName: string;
    readonly body: string;
};

export type WorkshopArtificialReactionValues = {
    readonly emoji: string;
};

function createAdminApiUrl(
    path: string,
    additionalParameters: Readonly<Record<string, string | undefined>> = {},
): string {
    return appendSearchParameters(`/api/admin/workshops${path}`, additionalParameters);
}

/**
 * Note: The session of the administration is a cookie, so every request carries it on its own
 */
async function requestAdminJson<ResponseBody>(url: string, requestOptions?: RequestInit): Promise<ResponseBody> {
    const response = await fetch(url, { ...requestOptions, cache: 'no-store' });
    const body = (await response.json().catch(() => ({}))) as ResponseBody & { readonly error?: unknown };
    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Admin request failed');
    }
    return body;
}

function createJsonMutation(method: 'POST' | 'PATCH', body: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export async function fetchAdminWorkshopList(
    workshopKind: WorkshopKind = 'workshop',
): Promise<readonly WorkshopAdminSummary[]> {
    const result = await requestAdminJson<{ readonly workshops: readonly WorkshopAdminSummary[] }>(
        createAdminApiUrl('', { kind: workshopKind }),
    );
    return result.workshops;
}

export async function fetchAdminWorkshopSnapshot(
    workshopId: string,
    commentStatus: WorkshopCommentStatus = 'pending',
    isCommentsIncluded = true,
): Promise<WorkshopAdminSnapshot> {
    return requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`, {
            commentStatus,
            includeComments: String(isCommentsIncluded),
        }),
    );
}

export async function fetchAdminWorkshopParticipantPage(
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<WorkshopAdminParticipantPage> {
    const queryParameters = Object.fromEntries(serializeWorkshopAdminParticipantQuery(query).entries());
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants`, queryParameters));
}

export async function fetchAdminWorkshopParticipantTimeline(
    workshopId: string,
    participantId: string,
): Promise<WorkshopAdminParticipantTimeline> {
    return requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}/timeline`,
        ),
    );
}

export async function fetchAdminWorkshopAnalytics(workshopId: string): Promise<WorkshopAdminAnalytics> {
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/analytics`));
}

export async function fetchAdminWorkshopFeedback(workshopId: string): Promise<readonly WorkshopAdminFeedback[]> {
    const result = await requestAdminJson<{ readonly feedbacks: readonly WorkshopAdminFeedback[] }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/feedback`),
    );
    return result.feedbacks;
}

/**
 * Builds a download URL for one workshop administration section.
 */
export function buildAdminWorkshopExportUrl(
    workshopId: string,
    exportKind: WorkshopAdminExportKind,
    participantQuery?: WorkshopAdminParticipantQuery,
): string {
    const exportParameters =
        participantQuery === undefined
            ? {}
            : Object.fromEntries(serializeWorkshopAdminParticipantQuery(participantQuery).entries());

    delete exportParameters.page;
    delete exportParameters.pageSize;

    return createAdminApiUrl(
        `/${encodeURIComponent(workshopId)}/exports/${encodeURIComponent(exportKind)}`,
        exportParameters,
    );
}

export async function createAdminWorkshop(values: WorkshopCreateValues): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl(''),
        createJsonMutation('POST', values),
    );
    return result.workshop;
}

export async function updateAdminWorkshop(workshopId: string, values: WorkshopWriteValues): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.workshop;
}

export async function createAdminWorkshopContent(
    workshopId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content`),
        createJsonMutation('POST', values),
    );
    return result.contentBlock;
}

export async function updateAdminWorkshopContent(
    workshopId: string,
    contentId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.contentBlock;
}

export async function deleteAdminWorkshopContent(workshopId: string, contentId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`),
        { method: 'DELETE' },
    );
}

export async function createAdminWorkshopPoll(workshopId: string, values: WorkshopPollCreateValues): Promise<string> {
    const result = await requestAdminJson<{ readonly pollId: string }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls`),
        createJsonMutation('POST', values),
    );
    return result.pollId;
}

/**
 * Writes every mutable part of a community poll through its transactional administrative boundary.
 */
export async function updateAdminWorkshopPoll(
    workshopId: string,
    pollId: string,
    values: WorkshopPollUpdateValues,
): Promise<string> {
    const result = await requestAdminJson<{ readonly pollId: string }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.pollId;
}

export async function deleteAdminWorkshopPoll(workshopId: string, pollId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}`),
        { method: 'DELETE' },
    );
}

export async function adjustAdminWorkshopPollOptionArtificialVotes(
    workshopId: string,
    pollId: string,
    optionId: string,
    artificialVoteAdjustment: number,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}/options/${encodeURIComponent(optionId)}/artificial-votes`,
        ),
        createJsonMutation('POST', { artificialVoteAdjustment }),
    );
}

export async function deleteAdminWorkshopComment(workshopId: string, commentId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`),
        { method: 'DELETE' },
    );
}

async function updateAdminWorkshopComment(
    workshopId: string,
    commentId: string,
    values: {
        readonly status?: Exclude<WorkshopCommentStatus, 'pending'>;
        readonly body?: string;
        readonly isPinned?: boolean;
    },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`),
        createJsonMutation('PATCH', values),
    );
}

export async function moderateAdminWorkshopComment(
    workshopId: string,
    commentId: string,
    status: Exclude<WorkshopCommentStatus, 'pending'>,
): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { status });
}

/**
 * Corrects the text of a message which is already in the chat, for example to fix a typo or add information
 */
export async function editAdminWorkshopCommentBody(workshopId: string, commentId: string, body: string): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { body });
}

/**
 * Holds one message on top of the chat for the whole room, or releases the top again
 *
 * Note: A pinned message is approved together with pinning it, so the room really sees what is held on its top.
 */
export async function pinAdminWorkshopComment(workshopId: string, commentId: string, isPinned: boolean): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { isPinned });
}

export async function createAdminWorkshopArtificialComment(
    workshopId: string,
    values: WorkshopArtificialCommentValues,
): Promise<string> {
    const result = await requestAdminJson<{ readonly commentId: string }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments`),
        createJsonMutation('POST', values),
    );
    return result.commentId;
}

/**
 * Changes the comment shared over the live stage. Passing `null` returns the stage to the stream alone.
 */
export async function setAdminWorkshopStageComment(workshopId: string, commentId: string | null): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/stage-comment`),
        createJsonMutation('POST', { commentId }),
    );
}

export async function adjustAdminWorkshopCommentArtificialUpvotes(
    workshopId: string,
    commentId: string,
    artificialUpvoteAdjustment: number,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}/artificial-upvotes`,
        ),
        createJsonMutation('POST', { artificialUpvoteAdjustment }),
    );
}

export async function sendAdminWorkshopArtificialReaction(
    workshopId: string,
    values: WorkshopArtificialReactionValues,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/artificial-reactions`),
        createJsonMutation('POST', values),
    );
}

export async function clearAdminWorkshopReactions(workshopId: string): Promise<void> {
    await requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/reactions`), {
        method: 'DELETE',
    });
}

async function updateAdminWorkshopParticipant(
    workshopId: string,
    participantId: string,
    values: {
        readonly isInteractionBanned?: boolean;
        readonly isTrusted?: boolean;
        readonly isModerator?: boolean;
    },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`),
        createJsonMutation('PATCH', values),
    );
}

export async function updateAdminWorkshopParticipantInteractionBan(
    workshopId: string,
    participantId: string,
    isInteractionBanned: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isInteractionBanned });
}

export async function updateAdminWorkshopParticipantTrusted(
    workshopId: string,
    participantId: string,
    isTrusted: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isTrusted });
}

/**
 * Appoints one participant as a moderator of the room, or dismisses them again
 *
 * Note: Only the administration does this. A moderator of the room can trust and ban, but never hand their own
 *       moderation on.
 */
export async function updateAdminWorkshopParticipantModerator(
    workshopId: string,
    participantId: string,
    isModerator: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isModerator });
}

export async function deleteAdminWorkshopParticipant(workshopId: string, participantId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`),
        { method: 'DELETE' },
    );
}
