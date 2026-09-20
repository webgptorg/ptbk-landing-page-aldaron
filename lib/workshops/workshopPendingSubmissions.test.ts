import { loadWorkshopPendingSubmissionCounts, mapWorkshopCommentRow, type WorkshopCommentRow } from './workshopDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('private participant pending counts', () => {
    afterEach(() => vi.restoreAllMocks());

    it('deduplicates and batches authors without truncating a large administrative export', async () => {
        const participantIds = Array.from({ length: 1001 }, (_, index) => `participant-${index}`);
        const query = vi.fn(async (_name: string, values: { target_participant_ids: readonly string[] }) => ({
            data: values.target_participant_ids.map((participantId) => ({
                participant_id: participantId,
                pending_submission_count: participantId === 'participant-0' ? '23' : 0,
            })),
            error: null,
        }));
        const result = await loadWorkshopPendingSubmissionCounts(
            { rpc: query } as unknown as SupabaseClient, 'room', [...participantIds, 'participant-0'],
        );
        expect(result?.size).toBe(1001);
        expect(result?.get('participant-0')).toBe(23);
        expect(result?.get('participant-1000')).toBe(0);
        expect(query).toHaveBeenCalledTimes(2);
        expect(query.mock.calls.map(([, values]) => values.target_participant_ids.length)).toEqual([1000, 1]);
        expect(query).toHaveBeenLastCalledWith('get_workshop_pending_submission_counts', {
            target_workshop_id: 'room', target_participant_ids: ['participant-1000'],
        });
    });

    it('avoids empty requests and leaves a failed count unknown instead of claiming zero', async () => {
        const query = vi.fn().mockResolvedValue({ data: null, error: { message: 'Unavailable' } });
        const supabase = { rpc: query } as unknown as SupabaseClient;
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(await loadWorkshopPendingSubmissionCounts(supabase, 'room', [])).toEqual(new Map());
        expect(query).not.toHaveBeenCalled();
        expect(await loadWorkshopPendingSubmissionCounts(supabase, 'room', ['participant'])).toBeNull();
    });

    it('exposes author counts only in the moderating projection of a chat message', () => {
        const author = { participantId: 'author', pendingSubmissionCount: 8, isTrusted: false, isModerator: false, isInteractionBanned: false };
        const comment = { participant_id: author.participantId } as WorkshopCommentRow;
        const roomContext = { pinnedCommentId: null, authorByParticipantId: new Map([[author.participantId, author]]) };
        expect(mapWorkshopCommentRow(comment, false, { ...roomContext, isModerationOffered: false }).moderatedAuthor).toBeNull();
        expect(mapWorkshopCommentRow(comment, false, { ...roomContext, isModerationOffered: true }).moderatedAuthor?.pendingSubmissionCount).toBe(8);
    });
});
