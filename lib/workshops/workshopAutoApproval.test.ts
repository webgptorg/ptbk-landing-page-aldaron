import type { WorkshopAutoApprovalContent } from '@/lib/workshops/workshopAutoApprovalReview';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { reviewMock } = vi.hoisted(() => ({ reviewMock: vi.fn() }));
vi.mock('@/lib/workshops/workshopAutoApprovalReview', () => ({ reviewWorkshopSubmissionForAutoApproval: reviewMock }));

import { autoApproveWorkshopSubmission } from '@/lib/workshops/workshopAutoApproval';

const PARTICIPANT = { id: 'participant-id', isInteractionBanned: false, isTrusted: false, isModerator: false };
const SUBMISSION = { id: 'submission-id', status: 'pending' as const, kind: 'comment' as const, content: { body: 'Děkuji!' } };
const CONTENTS: readonly WorkshopAutoApprovalContent[] = [
    { kind: 'comment', content: { body: 'Kde najdu prezentaci?' } },
    { kind: 'poll-option', content: { question: 'Co probereme příště?', label: 'Testování' } },
    { kind: 'project', content: { title: 'Můj projekt', description: 'Nástroj na testování', url: 'https://example.com', previewImageUrl: null } },
];

describe('shared approval of persisted participant submissions', () => {
    const rpcMock = vi.fn();
    const supabase = { rpc: rpcMock } as unknown as SupabaseClient;

    beforeEach(() => {
        reviewMock.mockReset().mockResolvedValue({ model: 'review-model' });
        rpcMock.mockReset().mockResolvedValue({ data: true, error: null });
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => vi.restoreAllMocks());

    it.each(CONTENTS)('uses the same atomic approval path for $kind', async (content) => {
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, { ...SUBMISSION, ...content })).toBe(true);
        expect(rpcMock).toHaveBeenCalledWith('approve_workshop_submission_automatically', {
            target_submission_kind: content.kind,
            target_submission_id: SUBMISSION.id,
            target_participant_id: PARTICIPANT.id,
            expected_content: content.content,
            target_model: 'review-model',
        });
    });

    it.each([
        { ...PARTICIPANT, isTrusted: true },
        { ...PARTICIPANT, isModerator: true },
        { ...PARTICIPANT, isInteractionBanned: true },
        { ...PARTICIPANT, isInteractionBanned: true, isTrusted: true, isModerator: true },
    ])('does not review or change submissions already decided by the participant policy (%j)', async (participant) => {
        expect(await autoApproveWorkshopSubmission(supabase, participant, SUBMISSION)).toBe(false);
        expect(reviewMock).not.toHaveBeenCalled();
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it.each(['approved', 'rejected'] as const)('never reviews or overrides an already %s submission', async (status) => {
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, { ...SUBMISSION, status })).toBe(false);
        expect(reviewMock).not.toHaveBeenCalled();
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('leaves unavailable or uncertain reviews entirely to manual moderation', async () => {
        reviewMock.mockResolvedValue(null);
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, SUBMISSION)).toBe(false);
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it.each([false, null, 'true'])('does not report approval when the database declined it (%s)', async (isApproved) => {
        rpcMock.mockResolvedValue({ data: isApproved, error: null });
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, SUBMISSION)).toBe(false);
        expect(rpcMock).toHaveBeenCalledTimes(1);
    });

    it('keeps the successful submission request successful when saving approval fails', async () => {
        rpcMock.mockResolvedValue({ data: null, error: { message: 'private database details' } });
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, SUBMISSION)).toBe(false);
        rpcMock.mockRejectedValue(new Error('connection lost'));
        expect(await autoApproveWorkshopSubmission(supabase, PARTICIPANT, SUBMISSION)).toBe(false);
        expect(console.warn).toHaveBeenCalledWith('Automatic submission approval could not be saved; manual moderation remains available.');
    });
});
