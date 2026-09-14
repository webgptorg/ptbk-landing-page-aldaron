import { WORKSHOP_IS_DELETED_COLUMN_NAME } from '@/lib/workshops/workshopConstants';
import type { SupabaseErrorLike } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';

type WorkshopActiveStatusQueryResult = {
    readonly error: SupabaseErrorLike | null;
};

/**
 * A development server can temporarily point at a database which has not received the soft-delete migration yet.
 * Remembering that fact per client lets the rest of that request continue with the legacy read shape, while a
 * migrated database always keeps the active-occurrence condition in SQL.
 */
const IS_WORKSHOP_DELETED_COLUMN_AVAILABLE_BY_SUPABASE_CLIENT = new WeakMap<object, boolean>();

function isMissingWorkshopDeletedColumnError(error: SupabaseErrorLike | null): boolean {
    if (error === null || !error.message.includes(WORKSHOP_IS_DELETED_COLUMN_NAME)) {
        return false;
    }

    return error.code === '42703' || error.code === 'PGRST204';
}

/**
 * Runs a workshop read with its normal active-occurrence filter. Only an older database which explicitly says that
 * the new `is_deleted` column is absent is retried without that condition. Such a database cannot contain a soft
 * deleted occurrence yet, so its legacy result is still the complete active set until the migration is applied.
 */
export async function loadWorkshopQueryWithActiveStatus<Result extends WorkshopActiveStatusQueryResult>(
    supabase: SupabaseClient,
    loadQuery: (isActiveStatusFilterEnabled: boolean) => PromiseLike<Result>,
): Promise<Result> {
    const isActiveStatusFilterEnabled =
        IS_WORKSHOP_DELETED_COLUMN_AVAILABLE_BY_SUPABASE_CLIENT.get(supabase) !== false;
    const result = await loadQuery(isActiveStatusFilterEnabled);

    if (!isActiveStatusFilterEnabled || !isMissingWorkshopDeletedColumnError(result.error)) {
        return result;
    }

    IS_WORKSHOP_DELETED_COLUMN_AVAILABLE_BY_SUPABASE_CLIENT.set(supabase, false);
    return loadQuery(false);
}
