import {
    WORKSHOP_SUBMISSION_STATUS_VALUES,
    type WorkshopParticipant,
    type WorkshopSubmissionStatus,
} from '@/lib/workshops/workshopTypes';

/**
 * Recognizes the shared moderation lifecycle of a participant submission without tying project routes to chat-only
 * naming.
 */
export function isWorkshopSubmissionStatus(value: string | null): value is WorkshopSubmissionStatus {
    return value !== null && WORKSHOP_SUBMISSION_STATUS_VALUES.includes(value as WorkshopSubmissionStatus);
}

/**
 * Where one thing a participant submits starts its life
 *
 * Note: A moderator submits into the room they moderate, so their own contribution never waits for the moderation they
 *       would do themselves. Chat messages, community projects, and the answers members write into a poll all use this
 *       exact policy, so trust can never approve one kind of submission differently from another.
 * Note: Pending contributions may subsequently be approved by the shared server-side AI review. This function only
 *       decides their initial status and must never predict an AI decision for the browser.
 * Note: This is deliberately free of anything a server alone can do, because the room itself asks the same question to
 *       tell a member in advance whether what they are about to write waits for a decision.
 */
export function getWorkshopParticipantSubmissionStatus(
    participant: Pick<WorkshopParticipant, 'isInteractionBanned' | 'isTrusted' | 'isModerator'>,
): WorkshopSubmissionStatus {
    if (participant.isInteractionBanned) {
        return 'rejected';
    }

    return participant.isTrusted || participant.isModerator ? 'approved' : 'pending';
}
