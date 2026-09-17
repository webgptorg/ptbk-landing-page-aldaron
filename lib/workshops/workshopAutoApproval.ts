import {
    reviewWorkshopSubmissionForAutoApproval,
    type WorkshopAutoApprovalContent,
} from '@/lib/workshops/workshopAutoApprovalReview';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import type { WorkshopParticipant, WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

type WorkshopAutoApprovalParticipant = Pick<
    WorkshopParticipant,
    'id' | 'isInteractionBanned' | 'isTrusted' | 'isModerator'
>;

type WorkshopAutoApprovalSubmission = WorkshopAutoApprovalContent & {
    readonly id: string;
    readonly status: WorkshopSubmissionStatus;
};

/**
 * The single approval path for saved chat messages, member-written poll answers and community projects.
 * Trusted/moderator submissions bypass AI, and a banned participant can never gain approval through it.
 * The database compares the reviewed content and checks the author's current ban under a lock before approving;
 * an edit, deletion or human decision made while the model was answering always wins.
 */
export async function autoApproveWorkshopSubmission(
    supabase: SupabaseClient,
    participant: WorkshopAutoApprovalParticipant,
    submission: WorkshopAutoApprovalSubmission,
): Promise<boolean> {
    if (submission.status !== 'pending' || getWorkshopParticipantSubmissionStatus(participant) !== 'pending') {
        return false;
    }

    const approval = await reviewWorkshopSubmissionForAutoApproval(submission);
    if (approval === null) {
        return false;
    }

    try {
        const { data: isApproved, error } = await supabase.rpc('approve_workshop_submission_automatically', {
            target_submission_kind: submission.kind,
            target_submission_id: submission.id,
            target_participant_id: participant.id,
            expected_content: submission.content,
            target_model: approval.model,
        });
        if (error !== null) {
            throw new Error('Automatic approval could not be saved');
        }

        return isApproved === true;
    } catch {
        console.warn('Automatic submission approval could not be saved; manual moderation remains available.');
        return false;
    }
}
