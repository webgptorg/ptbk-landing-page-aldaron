import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { updatePinnedWorkshopComment } from '@/lib/workshops/workshopDatabase';
import type { workshopCommentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import type { WorkshopCommentStatus } from '@/lib/workshops/workshopTypes';
import { createWorkshopCommentUpdateDatabaseValues, getWorkshopCommentPinChange } from '@/lib/workshops/workshopValues';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import { scheduleWorkshopAgentWork } from './agents/scheduleWorkshopAgentWork';

type WorkshopCommentUpdateValues = z.infer<typeof workshopCommentUpdateSchema>;

/**
 * One message of a chat after it was moderated
 */
export type ModeratedWorkshopComment = {
    readonly commentId: string;
    readonly status: WorkshopCommentStatus;
    readonly body: string;
};

type ModeratedWorkshopCommentRow = {
    readonly id: string;
    readonly status: WorkshopCommentStatus;
    readonly body: string;
};

type LoadedModeratedWorkshopComment = {
    readonly data: ModeratedWorkshopCommentRow | null;
    readonly error: { readonly message: string } | null;
};

const MODERATED_WORKSHOP_COMMENT_COLUMNS = 'id, status, body';

/**
 * Writes the changed fields of a comment and reads it back, or only reads it when nothing but its pin changes
 *
 * Note: Reading the comment back proves that it belongs to this very workshop before its pin is moved.
 */
async function loadModeratedWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    commentDatabaseValues: Readonly<Record<string, unknown>>,
): Promise<LoadedModeratedWorkshopComment> {
    const commentTable = supabase.from(WORKSHOP_COMMENT_TABLE_NAME);

    if (Object.keys(commentDatabaseValues).length === 0) {
        return await commentTable
            .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
            .eq('id', commentId)
            .eq('workshop_id', workshopId)
            .maybeSingle();
    }

    return await commentTable
        .update(commentDatabaseValues)
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
        .maybeSingle();
}

/**
 * Moderates one message of one chat: its decision, its text, and the top of the chat it holds
 *
 * Note: The administration and a moderator of the room moderate exactly the same way, only what each of them may write
 *       differs, so both of them come here and the difference stays in `workshopModeration` alone.
 * Note: A comment which belongs to no such workshop is reported as no comment at all rather than as a failure.
 */
export async function moderateWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    values: WorkshopCommentUpdateValues,
): Promise<{ readonly comment: ModeratedWorkshopComment | null; readonly errorMessage: string | null }> {
    const { data, error } = await loadModeratedWorkshopComment(
        supabase,
        workshopId,
        commentId,
        createWorkshopCommentUpdateDatabaseValues(values),
    );
    if (error) {
        return { comment: null, errorMessage: error.message };
    }
    if (data === null) {
        return { comment: null, errorMessage: null };
    }

    const pinChange = getWorkshopCommentPinChange(values);
    if (pinChange !== null) {
        const { errorMessage } = await updatePinnedWorkshopComment(supabase, workshopId, commentId, pinChange);
        if (errorMessage !== null) {
            return { comment: null, errorMessage };
        }
    }

    if (data.status === 'approved') scheduleWorkshopAgentWork(workshopId);
    return { comment: { commentId: data.id, status: data.status, body: data.body }, errorMessage: null };
}
