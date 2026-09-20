import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import type { workshopParticipantUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopParticipantUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { scheduleWorkshopAgentWork } from '@/lib/workshops/agents/scheduleWorkshopAgentWork';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';

type WorkshopParticipantUpdateValues = z.infer<typeof workshopParticipantUpdateSchema>;

/**
 * The moderation state of one participant after it was written
 */
export type ModeratedWorkshopParticipant = {
    readonly participantId: string;
    readonly isInteractionBanned: boolean;
    readonly isTrusted: boolean;
    readonly isModerator: boolean;
};

type ModeratedWorkshopParticipantRow = {
    readonly id: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

const MODERATED_WORKSHOP_PARTICIPANT_COLUMNS = 'id, is_interaction_banned, is_trusted, is_moderator';

function mapModeratedWorkshopParticipantRow(row: ModeratedWorkshopParticipantRow): ModeratedWorkshopParticipant {
    return {
        participantId: row.id,
        isInteractionBanned: row.is_interaction_banned,
        isTrusted: row.is_trusted,
        isModerator: row.is_moderator,
    };
}

/**
 * Reads the moderation state one participant of one room carries right now
 *
 * Note: This is what a moderating role is judged against before it writes, so a moderator of the room learns that they
 *       may not touch a fellow moderator instead of silently changing them.
 */
export async function findModeratedWorkshopParticipant(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string,
): Promise<{ readonly participant: ModeratedWorkshopParticipant | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select(MODERATED_WORKSHOP_PARTICIPANT_COLUMNS)
        .eq('id', participantId)
        .eq('workshop_id', workshopId)
        .maybeSingle();

    if (error) {
        return { participant: null, errorMessage: error.message };
    }

    return {
        participant: data === null ? null : mapModeratedWorkshopParticipantRow(data as ModeratedWorkshopParticipantRow),
        errorMessage: null,
    };
}

/**
 * Writes the moderation state of one participant of one room and reads it back
 *
 * Note: The administration and a moderator of the room write exactly the same state, only what each of them may write
 *       differs, so both of them come here and the difference stays in `workshopModeration` alone.
 * Note: The participant is looked for inside its own workshop, so no request can moderate somebody of another room.
 * Note: The database promotion trigger approves their pending submissions in this very transaction. Newly approved
 *       comments use the existing durable agent queue, just as individually approved comments do.
 */
export async function updateModeratedWorkshopParticipant(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string,
    values: WorkshopParticipantUpdateValues,
): Promise<{ readonly participant: ModeratedWorkshopParticipant | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update(createWorkshopParticipantUpdateDatabaseValues(values))
        .eq('id', participantId)
        .eq('workshop_id', workshopId)
        .select(MODERATED_WORKSHOP_PARTICIPANT_COLUMNS)
        .maybeSingle();

    if (error) {
        return { participant: null, errorMessage: error.message };
    }

    const participant = data === null ? null : mapModeratedWorkshopParticipantRow(data as ModeratedWorkshopParticipantRow);
    if (participant !== null && getWorkshopParticipantSubmissionStatus(participant) === 'approved') {
        scheduleWorkshopAgentWork(workshopId);
    }

    return {
        participant,
        errorMessage: null,
    };
}
