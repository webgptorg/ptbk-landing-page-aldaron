import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';

/**
 * As much of one poll answer as deciding who may read it needs to know
 */
export type ModeratedWorkshopPollOption = {
    readonly status: WorkshopSubmissionStatus;

    /**
     * The normalized e-mail of the member who wrote this answer, or `null` for a prepared choice and for an answer
     * whose writer is no longer known
     */
    readonly authorEmail: string | null;
};

/**
 * Who is reading the answers of a poll
 */
export type WorkshopPollOptionReader = {
    /**
     * The normalized e-mail which owns this reader's vote, or `null` when nobody is connected, as on a landing page
     */
    readonly normalizedVoterEmail: string | null;

    /**
     * Whether this reader decides about the answers waiting for moderation in this very poll
     */
    readonly isModerating: boolean;
};

/**
 * Whether one answer of a poll reaches the person reading it
 *
 * Note: This is the one rule which keeps a member-written answer private until it is approved. Because the total of a
 *       poll is added up from the answers it shows, an answer withheld here also keeps its vote out of everybody
 *       else's result, while the member who wrote it keeps seeing their own choice counted straight away.
 * Note: A rejected answer is gone for everybody, including the member who wrote it, exactly as a rejected chat message
 *       is.
 */
export function isWorkshopPollOptionReadableBy(
    option: ModeratedWorkshopPollOption,
    reader: WorkshopPollOptionReader,
): boolean {
    if (option.status === 'approved') {
        return true;
    }
    if (option.status === 'rejected') {
        return false;
    }

    return (
        reader.isModerating ||
        (option.authorEmail !== null && option.authorEmail === reader.normalizedVoterEmail)
    );
}
