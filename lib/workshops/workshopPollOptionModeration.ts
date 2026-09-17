import type { workshopPollOptionUpdateSchema } from '@/lib/workshops/workshopSchemas';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';

export type WorkshopPollOptionModerationValues = z.infer<typeof workshopPollOptionUpdateSchema>;

type WorkshopPollOptionErrorKind = 'not-found' | 'duplicate' | 'invalid' | 'database';

export type WorkshopPollOptionModerationResult =
    | { readonly isSuccessful: true; readonly optionId: string }
    | {
          readonly isSuccessful: false;
          readonly errorKind: WorkshopPollOptionErrorKind;
          readonly errorMessage: string;
      };

const WORKSHOP_POLL_OPTION_ERROR_KIND_BY_DATABASE_MESSAGE: Readonly<
    Record<string, Exclude<WorkshopPollOptionErrorKind, 'database'>>
> = {
    WORKSHOP_POLL_OPTION_NOT_FOUND: 'not-found',
    WORKSHOP_POLL_OPTION_DUPLICATE: 'duplicate',
    WORKSHOP_POLL_OPTION_INVALID: 'invalid',
};

function createFailedWorkshopPollOptionResult(error: PostgrestError): WorkshopPollOptionModerationResult {
    return {
        isSuccessful: false,
        errorKind: WORKSHOP_POLL_OPTION_ERROR_KIND_BY_DATABASE_MESSAGE[error.message] ?? 'database',
        errorMessage: error.message,
    };
}

/**
 * Decides about one member-written poll answer and corrects its wording.
 *
 * Note: The administration and a moderator of the room moderate exactly the same way; only what each of them may write
 *       differs, and that difference stays in `workshopModeration` alone, exactly as it does for a chat message.
 * Note: The database owns the whole rule: the answer has to belong to this poll, the poll to this community, and the
 *       answer has to be one a member wrote, because a prepared choice is only ever edited together with its poll.
 */
export async function moderateWorkshopPollOption(
    supabase: SupabaseClient,
    workshopId: string,
    pollId: string,
    optionId: string,
    values: WorkshopPollOptionModerationValues,
): Promise<WorkshopPollOptionModerationResult> {
    const { data: moderatedOptionId, error } = await supabase.rpc('moderate_community_workshop_poll_option', {
        target_workshop_id: workshopId,
        target_poll_id: pollId,
        target_option_id: optionId,
        target_status: values.status ?? null,
        target_label: values.label ?? null,
    });
    if (error) {
        return createFailedWorkshopPollOptionResult(error);
    }
    if (moderatedOptionId === null) {
        return { isSuccessful: false, errorKind: 'not-found', errorMessage: 'WORKSHOP_POLL_OPTION_NOT_FOUND' };
    }

    return { isSuccessful: true, optionId: moderatedOptionId as string };
}

/**
 * Removes one member-written poll answer together with the votes cast for it.
 */
export async function deleteWorkshopPollOption(
    supabase: SupabaseClient,
    workshopId: string,
    pollId: string,
    optionId: string,
): Promise<WorkshopPollOptionModerationResult> {
    const { data: deletedOptionId, error } = await supabase.rpc('delete_community_workshop_poll_option', {
        target_workshop_id: workshopId,
        target_poll_id: pollId,
        target_option_id: optionId,
    });
    if (error) {
        return createFailedWorkshopPollOptionResult(error);
    }
    if (deletedOptionId === null) {
        return { isSuccessful: false, errorKind: 'not-found', errorMessage: 'WORKSHOP_POLL_OPTION_NOT_FOUND' };
    }

    return { isSuccessful: true, optionId: deletedOptionId as string };
}
