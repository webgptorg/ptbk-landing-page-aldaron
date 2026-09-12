import { isGithubCommit } from '@/lib/github/githubCommitFeed';
import type { WorkshopReaction, WorkshopRealtimeEvent } from '@/lib/workshops/workshopTypes';

export { sortWorkshopComments } from '@/lib/workshops/workshopCommentValues';

export const MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS = 2_147_000_000;
const CONTENT_UNLOCK_REFRESH_PADDING_MILLISECONDS = 250;

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null;
}

function isWorkshopReaction(value: unknown): value is WorkshopReaction {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.emoji === 'string' &&
        typeof value.createdAt === 'string'
    );
}

function isWorkshopCommentReference(value: unknown): boolean {
    return isObject(value) && typeof value.id === 'string' && typeof value.authorName === 'string' && typeof value.body === 'string';
}

export function isWorkshopRealtimeEvent(value: unknown): value is WorkshopRealtimeEvent {
    if (!isObject(value) || typeof value.kind !== 'string') {
        return false;
    }

    if (value.kind === 'state-changed') {
        return true;
    }

    if (value.kind === 'reaction') {
        return (
            isWorkshopReaction(value.reaction) &&
            typeof value.reactionCount === 'number' &&
            Number.isSafeInteger(value.reactionCount) &&
            value.reactionCount >= 0
        );
    }

    if (value.kind === 'stage-comment') {
        return value.stageComment === null || isWorkshopCommentReference(value.stageComment);
    }

    if (value.kind === 'repository-commit') {
        return isGithubCommit(value.commit);
    }

    return (
        value.kind === 'upvote' &&
        typeof value.commentId === 'string' &&
        typeof value.upvoteCount === 'number' &&
        Number.isSafeInteger(value.upvoteCount) &&
        value.upvoteCount >= 0
    );
}

export function getContentUnlockRefreshDelay(
    unlockAt: string,
    serverTime: string,
    clientTimeMilliseconds: number,
): number {
    const serverClockOffsetMilliseconds = Date.parse(serverTime) - clientTimeMilliseconds;
    const unlockDelayMilliseconds =
        Date.parse(unlockAt) -
        (clientTimeMilliseconds + serverClockOffsetMilliseconds) +
        CONTENT_UNLOCK_REFRESH_PADDING_MILLISECONDS;

    return Math.min(MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS, Math.max(0, unlockDelayMilliseconds));
}
