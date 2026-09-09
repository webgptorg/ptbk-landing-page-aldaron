import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import type {
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopCommentStatus,
    WorkshopFeedback,
    WorkshopParticipant,
    WorkshopPoll,
    WorkshopPublicState,
    WorkshopReaction,
} from '@/lib/workshops/workshopTypes';

/**
 * What the room sends when a participant writes into the chat
 *
 * Note: A `parentCommentId` turns the message into a reply below that very comment.
 */
export type WorkshopCommentValues = {
    readonly body: string;
    readonly parentCommentId: string | null;
};

/**
 * What a moderator changes about one message of the chat, see `workshopCommentUpdateSchema`
 */
export type WorkshopCommentModerationValues = {
    readonly status?: Exclude<WorkshopCommentStatus, 'pending'>;
    readonly body?: string;
    readonly isPinned?: boolean;
};

/**
 * What a moderator changes about one author of the chat, see `workshopParticipantUpdateSchema`
 *
 * Note: A moderator never appoints another moderator, so nothing here can carry that.
 */
export type WorkshopAuthorModerationValues = {
    readonly isTrusted?: boolean;
    readonly isInteractionBanned?: boolean;
};

/**
 * One heartbeat of an open room, see `workshopPresenceSchema`
 *
 * Note: How the room was attended is measured by `workshopAttendance`, so the browser says what it observed and the
 *       server decides nothing about it.
 */
export type WorkshopPresenceValues = {
    readonly activeDurationSeconds: number;
    readonly isActivelyAttending: boolean;
};

/**
 * One independently persisted step of post-workshop feedback.
 */
export type WorkshopFeedbackValues = {
    readonly rating?: number;
    readonly whatWasGood?: string;
    readonly whatWasBad?: string;
    readonly note?: string;
};

export class WorkshopApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'WorkshopApiError';
    }
}

async function readResponseJson<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as { readonly error?: unknown } & ResponseBody;
    if (!response.ok) {
        throw new WorkshopApiError(
            typeof body.error === 'string' ? body.error : 'Požadavek se nepovedl.',
            response.status,
        );
    }
    return body;
}

function getWorkshopApiUrl(workshopSlug: string, path: string): string {
    return `/api/workshops/${encodeURIComponent(workshopSlug)}/${path}`;
}

export async function connectToWorkshop(
    workshopSlug: string,
    values: { readonly fullname: string; readonly email: string },
): Promise<{ readonly state: WorkshopPublicState | null }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'connect'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function changeWorkshopParticipantFullname(
    workshopSlug: string,
    fullname: string,
): Promise<{ readonly participant: WorkshopParticipant }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'participant'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname }),
    });
    return readResponseJson(response);
}

export async function fetchWorkshopState(
    workshopSlug: string,
    commentSort: WorkshopCommentSort,
): Promise<WorkshopPublicState> {
    const searchParameters = new URLSearchParams({ sort: commentSort });
    const response = await fetch(`${getWorkshopApiUrl(workshopSlug, 'state')}?${searchParameters}`, {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readResponseJson(response);
}

/**
 * Reads how far the project of this workshop has come
 *
 * Note: This is asked for on its own rather than with the state of the room, because it is read from GitHub instead of
 *       from the room itself, and a slow answer of GitHub must not hold up the chat, the materials, or the stage.
 */
export async function fetchWorkshopRepositoryProgress(
    workshopSlug: string,
): Promise<{ readonly progress: WorkshopRepositoryProgress | null }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'repository'), {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readResponseJson(response);
}

export async function submitWorkshopComment(
    workshopSlug: string,
    values: WorkshopCommentValues,
): Promise<{ readonly comment: WorkshopComment }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'comments'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function upvoteWorkshopComment(
    workshopSlug: string,
    commentId: string,
): Promise<{ readonly commentId: string; readonly upvoteCount: number; readonly isUpvotedByParticipant: boolean }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, `comments/${encodeURIComponent(commentId)}/upvotes`), {
        method: 'POST',
        credentials: 'same-origin',
    });
    return readResponseJson(response);
}

/**
 * Chooses one option of a community poll. Repeating the request with another option changes the participant's own
 * choice, and the returned compact poll makes the optimistic room state authoritative again.
 */
export async function voteOnWorkshopPoll(
    workshopSlug: string,
    pollId: string,
    optionId: string,
): Promise<{ readonly poll: WorkshopPoll }> {
    const response = await fetch(
        getWorkshopApiUrl(workshopSlug, `polls/${encodeURIComponent(pollId)}/votes`),
        {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId }),
        },
    );
    return readResponseJson(response);
}

/**
 * Moderates one message of the chat as the moderator of this very room
 */
export async function moderateWorkshopComment(
    workshopSlug: string,
    commentId: string,
    values: WorkshopCommentModerationValues,
): Promise<{ readonly commentId: string; readonly status: WorkshopCommentStatus; readonly body: string }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, `comments/${encodeURIComponent(commentId)}`), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

/**
 * Trusts the author of a message or takes their interactions away, as the moderator of this very room
 */
export async function moderateWorkshopAuthor(
    workshopSlug: string,
    participantId: string,
    values: WorkshopAuthorModerationValues,
): Promise<{ readonly participantId: string; readonly isTrusted: boolean; readonly isInteractionBanned: boolean }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, `participants/${encodeURIComponent(participantId)}`), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function sendWorkshopReaction(
    workshopSlug: string,
    emoji: string,
): Promise<{ readonly reaction: WorkshopReaction; readonly reactionCount: number }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'reactions'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
    });
    return readResponseJson(response);
}

export async function saveWorkshopFeedback(
    workshopSlug: string,
    values: WorkshopFeedbackValues,
): Promise<{ readonly feedback: WorkshopFeedback }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'feedback'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function reportWorkshopPresence(
    workshopSlug: string,
    values: WorkshopPresenceValues,
): Promise<{ readonly watchingParticipantCount: number }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'presence'), {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}
