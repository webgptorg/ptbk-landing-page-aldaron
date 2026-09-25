import type { EventDetails } from '@/lib/events/event';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { WorkshopAgentAdminState, WorkshopAgentWriteValues } from '@/lib/workshops/agents/workshopAgentTypes';
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
import type { WorkshopPollOptionModerationValues } from '@/lib/workshops/workshopPollOptionModeration';

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

    /** The address a term of an event held by somebody else leads to, which every other term leaves empty. */
    readonly externalUrl?: string | null;
    readonly youtubeVideoId?: string | null;

    /** The number of waiting-room seconds to skip when a paid member replays an ended workshop. */
    readonly recordingStartOffsetSeconds?: number;

    /**
     * The teaser of the recording which everybody who has not unlocked it watches once the term is over
     */
    readonly previewYoutubeVideoId?: string | null;

    /**
     * The public PDF, presentation file, or Markdown page participants receive as a shared workshop material.
     */
    readonly presentationUrl?: string | null;

    /**
     * The project this term is about, or `null` to disconnect the project it was about
     *
     * Note: The whole connection is written at once, so setting, changing, and unsetting it are one and the same
     *       request and branch selection or a deployment can never outlive the repository it belongs to.
     */
    readonly repository?: WorkshopRepositoryWriteValues | null;
    readonly allowedReactions?: readonly string[];
};

/**
 * The project of one term as its administration writes it, before the server reads the repository out of it
 */
export type WorkshopRepositoryWriteValues = {
    readonly startCommit?: string | null;
    readonly endCommit?: string | null;
    /**
     * The repository, written either as its address or as `owner/name`
     */
    readonly url: string;
    /** `null` follows the default branch; strings may use `*` to match branches. */
    readonly branch: string | readonly string[] | null;

    /** Every public address the project runs at, empty when it is published nowhere */
    readonly deploymentUrls: readonly string[];
};

/**
 * A new room always starts as one term of an event in time at an address of its own, so its creation says all of it.
 */
export type WorkshopCreateValues = WorkshopWriteValues & {
    readonly slug: string;
    readonly startsAt: string;
    readonly eventType: EventType;
    readonly locationKind: EventLocationKind;

    /**
     * The source occurrence whose existing community poll connections a duplicated workshop keeps.
     */
    readonly attachedPollsSourceWorkshopId?: string;
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
        externalUrl: event.externalUrl,
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
    readonly idempotencyKey?: string;
};

export type WorkshopQuickLinkPreview = {
    readonly title: string;
    readonly state: 'ready' | 'fallback';
    readonly message: string | null;
    readonly isExisting: boolean;
};

export type WorkshopPollCreateValues = {
    readonly question: string;
    readonly options: readonly string[];
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly isOtherOptionEnabled: boolean;

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
    readonly isOtherOptionEnabled: boolean;
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

function createJsonMutation(method: 'POST' | 'PATCH' | 'DELETE', body: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function createWorkshopAgentUrl(workshopId: string, suffix = ''): string {
    return createAdminApiUrl(`/${encodeURIComponent(workshopId)}/agents${suffix}`);
}

export function fetchAdminWorkshopAgents(workshopId: string): Promise<WorkshopAgentAdminState> {
    return requestAdminJson(createWorkshopAgentUrl(workshopId));
}

export function saveAdminWorkshopAgent(workshopId: string, agentId: string | null, values: WorkshopAgentWriteValues): Promise<{ readonly agentId: string }> {
    return requestAdminJson(
        createWorkshopAgentUrl(workshopId, agentId === null ? '' : `/${encodeURIComponent(agentId)}`),
        createJsonMutation(agentId === null ? 'POST' : 'PATCH', values),
    );
}

export function changeAdminWorkshopAgentAudioSession(workshopId: string, sessionId: string, isStarting: boolean): Promise<unknown> {
    return requestAdminJson(createWorkshopAgentUrl(workshopId, '/audio-session'), {
        ...createJsonMutation(isStarting ? 'POST' : 'DELETE', { sessionId }),
        keepalive: !isStarting,
    });
}

export function sendAdminWorkshopAgentAudio(workshopId: string, sessionId: string, sequence: number, audio: Blob, signal: AbortSignal): Promise<{ readonly transcript: string | null }> {
    const form = new FormData();
    form.append('audio', audio, 'workshop-audio');
    form.append('sessionId', sessionId);
    form.append('sequence', String(sequence));
    return requestAdminJson(createWorkshopAgentUrl(workshopId, '/audio'), { method: 'POST', body: form, signal });
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

/**
 * Soft-deletes one event occurrence. Its room history and its shared community polls remain stored on the server.
 */
export async function deleteAdminWorkshop(workshopId: string): Promise<void> {
    await requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}`), { method: 'DELETE' });
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

export function fetchAdminWorkshopQuickLinkPreview(
    workshopId: string,
    destination: string,
    signal: AbortSignal,
): Promise<WorkshopQuickLinkPreview> {
    const url = createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/link-preview`);
    const searchParameters = new URLSearchParams({ url: destination });
    return requestAdminJson<WorkshopQuickLinkPreview>(`${url}?${searchParameters}`, { signal });
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
): Promise<readonly WorkshopPollOptionWriteValues[]> {
    const result = await requestAdminJson<{ readonly options: readonly WorkshopPollOptionWriteValues[] }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.options;
}

export async function deleteAdminWorkshopPoll(workshopId: string, pollId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}`),
        { method: 'DELETE' },
    );
}

/**
 * Where one single answer of one poll is administered, which both its moderation and its artificial votes are under
 */
function createAdminWorkshopPollOptionUrl(workshopId: string, pollId: string, optionId: string): string {
    return createAdminApiUrl(
        `/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}/options/${encodeURIComponent(optionId)}`,
    );
}

/**
 * Decides about one answer a member wrote into a poll, or corrects its wording, see `workshopPollOptionUpdateSchema`
 */
export async function updateAdminWorkshopPollOption(
    workshopId: string,
    pollId: string,
    optionId: string,
    values: WorkshopPollOptionModerationValues,
): Promise<void> {
    await requestAdminJson(
        createAdminWorkshopPollOptionUrl(workshopId, pollId, optionId),
        createJsonMutation('PATCH', values),
    );
}

/**
 * Removes one answer a member wrote into a poll together with the votes cast for it.
 */
export async function deleteAdminWorkshopPollOption(
    workshopId: string,
    pollId: string,
    optionId: string,
): Promise<void> {
    await requestAdminJson(createAdminWorkshopPollOptionUrl(workshopId, pollId, optionId), { method: 'DELETE' });
}

export async function adjustAdminWorkshopPollOptionArtificialVotes(
    workshopId: string,
    pollId: string,
    optionId: string,
    artificialVoteAdjustment: number,
): Promise<void> {
    await requestAdminJson(
        `${createAdminWorkshopPollOptionUrl(workshopId, pollId, optionId)}/artificial-votes`,
        createJsonMutation('POST', { artificialVoteAdjustment }),
    );
}

export async function deleteAdminWorkshopComment(workshopId: string, commentId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`),
        { method: 'DELETE' },
    );
}

/**
 * Keeps the source comment in the chat and creates a new material from its
 * author and body in the administration of the same workshop.
 */
export async function convertAdminWorkshopCommentToMaterial(
    workshopId: string,
    commentId: string,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}/material`,
        ),
        { method: 'POST' },
    );
    return result.contentBlock;
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
