import {
    MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS,
    getContentUnlockRefreshDelay,
    isWorkshopRealtimeEvent,
    sortWorkshopComments,
} from '@/lib/workshops/workshopClientState';
import { getDisplayedWorkshopCommentUpvoteCount } from '@/lib/workshops/workshopCommentValues';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

function createComment(id: string, upvoteCount: number, createdAt: string): WorkshopComment {
    return {
        id,
        authorName: 'Účastník',
        body: `Komentář ${id}`,
        status: 'approved',
        upvoteCount,
        isUpvotedByParticipant: false,
        createdAt,
        isAuthorModerator: false,
        isArtificial: false,
        moderatedAuthor: null,
        parentCommentId: null,
        isPinned: false,
    };
}

describe('workshop comment ordering', () => {
    const COMMENTS = [
        createComment('older-popular', 10, '2026-08-20T17:00:00.000Z'),
        createComment('newer', 1, '2026-08-20T17:05:00.000Z'),
        createComment('newer-popular', 10, '2026-08-20T17:03:00.000Z'),
    ];

    it('orders comments from newest to oldest', () => {
        expect(sortWorkshopComments(COMMENTS, 'recent').map(({ id }) => id)).toEqual([
            'newer',
            'newer-popular',
            'older-popular',
        ]);
    });

    it('orders by upvotes and uses recency as the deterministic tie breaker', () => {
        expect(sortWorkshopComments(COMMENTS, 'upvotes').map(({ id }) => id)).toEqual([
            'newer-popular',
            'older-popular',
            'newer',
        ]);
    });
});

describe('workshop comment upvote totals', () => {
    it('keeps real and artificial counts distinct while never rendering a negative total', () => {
        expect(getDisplayedWorkshopCommentUpvoteCount(8, 5)).toBe(13);
        expect(getDisplayedWorkshopCommentUpvoteCount(8, -5)).toBe(3);
        expect(getDisplayedWorkshopCommentUpvoteCount(0, -5)).toBe(0);
    });
});

describe('workshop realtime events', () => {
    it('accepts each complete server event', () => {
        expect(isWorkshopRealtimeEvent({ kind: 'state-changed' })).toBe(true);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'reaction',
                reaction: { id: 'reaction-1', emoji: '👏', createdAt: '2026-08-20T17:00:00.000Z' },
                reactionCount: 7,
            }),
        ).toBe(true);
        expect(isWorkshopRealtimeEvent({ kind: 'upvote', commentId: 'comment-1', upvoteCount: 7 })).toBe(true);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'stage-comment',
                stageComment: {
                    id: 'comment-1',
                    authorName: 'Jana Nováková',
                    body: 'Jak agent nasadit?',
                },
            }),
        ).toBe(true);
        expect(isWorkshopRealtimeEvent({ kind: 'stage-comment', stageComment: null })).toBe(true);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'repository-commit',
                commit: {
                    sha: '6dcb09b5b57875f334f61aebed695e2e4193db5b',
                    message: 'Přidat oznámení commitů',
                    authorName: 'Pavol Hejný',
                    committedAt: '2026-08-20T17:00:00.000Z',
                },
            }),
        ).toBe(true);
    });

    it('rejects malformed broadcast payloads before they reach the UI', () => {
        expect(isWorkshopRealtimeEvent({ kind: 'reaction' })).toBe(false);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'reaction',
                reaction: { id: 'reaction-1', emoji: '👏', createdAt: '2026-08-20T17:00:00.000Z' },
            }),
        ).toBe(false);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'reaction',
                reaction: { id: 'reaction-1', emoji: '👏', createdAt: '2026-08-20T17:00:00.000Z' },
                reactionCount: -1,
            }),
        ).toBe(false);
        expect(isWorkshopRealtimeEvent({ kind: 'upvote', commentId: 'comment-1', upvoteCount: -1 })).toBe(false);
        expect(isWorkshopRealtimeEvent({ kind: 'stage-comment', stageComment: { id: 'comment-1' } })).toBe(false);
        expect(
            isWorkshopRealtimeEvent({
                kind: 'repository-commit',
                commit: { sha: 'commit-1', message: 'Commit', authorName: 'Pavol', committedAt: 123 },
            }),
        ).toBe(false);
        expect(isWorkshopRealtimeEvent({ kind: 'unknown' })).toBe(false);
    });
});

describe('content unlock timer', () => {
    it('uses server time so an incorrect participant clock cannot delay content', () => {
        expect(
            getContentUnlockRefreshDelay(
                '2026-08-20T17:30:10.000Z',
                '2026-08-20T17:30:00.000Z',
                Date.parse('2032-01-01T00:00:00.000Z'),
            ),
        ).toBe(10_250);
    });

    it('refreshes immediately when the unlock time already passed', () => {
        expect(
            getContentUnlockRefreshDelay(
                '2026-08-20T17:29:00.000Z',
                '2026-08-20T17:30:00.000Z',
                Date.parse('2026-08-20T17:30:00.000Z'),
            ),
        ).toBe(0);
    });

    it('caps dates beyond the browser timeout range instead of creating a refresh loop', () => {
        expect(
            getContentUnlockRefreshDelay(
                '2027-08-20T17:30:00.000Z',
                '2026-08-20T17:30:00.000Z',
                Date.parse('2026-08-20T17:30:00.000Z'),
            ),
        ).toBe(MAXIMAL_BROWSER_TIMEOUT_MILLISECONDS);
    });
});
