import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkshopAgentJob } from './workshopAgentTypes';

const { roomMock, contextMock, replyMock, shortLinksMock, broadcastMock, completionMock } = vi.hoisted(() => ({
    roomMock: vi.fn(), contextMock: vi.fn(), replyMock: vi.fn(), shortLinksMock: vi.fn(), broadcastMock: vi.fn(), completionMock: vi.fn(),
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ findWorkshopById: roomMock, getWorkshopDatabaseOrNull: vi.fn() }));
vi.mock('@/lib/workshops/workshopMaterialLinks', () => ({ ensureWorkshopCommentShortLinks: shortLinksMock }));
vi.mock('@/lib/workshops/workshopRealtime', () => ({ broadcastWorkshopEvent: broadcastMock }));
vi.mock('./workshopAgentContext', () => ({ loadWorkshopAgentContext: contextMock }));
vi.mock('./workshopAgentRuntime', () => ({ generateWorkshopAgentReply: replyMock }));
import { processWorkshopAgentJob } from './workshopAgentWorker';

const JOB: WorkshopAgentJob = {
    id: 'job', workshop_id: 'room', agent_id: 'agent', agent_name: 'Jana', book_source: 'Private Book',
    source_body: 'A question', trigger_comment_id: 'comment', transcript_id: null, lease_token: 'lease',
};
const SUPABASE = { rpc: completionMock } as unknown as SupabaseClient;

describe('Book agent job processing', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        roomMock.mockResolvedValue({ id: 'room', slug: 'room', room_kind: 'community', is_published: true, is_deleted: false, disabled_panels: [] });
        contextMock.mockResolvedValue('{}');
        replyMock.mockResolvedValue('Try a smaller example.');
        completionMock.mockResolvedValue({ data: 'reply', error: null });
    });

    it('skips a cancelled capture without spending a model request or publishing a message', async () => {
        contextMock.mockResolvedValue(null);
        completionMock.mockResolvedValue({ data: null, error: null });
        await processWorkshopAgentJob(SUPABASE, JOB);
        expect(replyMock).not.toHaveBeenCalled();
        expect(completionMock).toHaveBeenCalledWith('finish_workshop_agent_job', {
            target_job_id: JOB.id, target_lease_token: JOB.lease_token, target_body: null, target_error_code: null,
        });
        expect(broadcastMock).not.toHaveBeenCalled();
    });

    it('prepares ordinary chat links and refreshes the room only for a committed reply', async () => {
        await processWorkshopAgentJob(SUPABASE, JOB);
        expect(shortLinksMock).toHaveBeenCalledWith(SUPABASE, {
            workshopSlug: 'room', workshopKind: 'community', commentId: 'reply', bodyMarkdown: 'Try a smaller example.',
        });
        expect(broadcastMock).toHaveBeenCalledWith(SUPABASE, expect.objectContaining({ id: 'room' }), { kind: 'state-changed' });
    });

    it('discards output when moderation or configuration changed during generation', async () => {
        completionMock.mockResolvedValue({ data: null, error: null });
        await processWorkshopAgentJob(SUPABASE, JOB);
        expect(shortLinksMock).not.toHaveBeenCalled();
        expect(broadcastMock).not.toHaveBeenCalled();
    });

    it('records a retryable error without persisting provider diagnostics', async () => {
        replyMock.mockRejectedValue(new Error('Diagnostic containing private Book or credentials'));
        await processWorkshopAgentJob(SUPABASE, JOB);
        expect(completionMock).toHaveBeenCalledWith('finish_workshop_agent_job', {
            target_job_id: JOB.id, target_lease_token: JOB.lease_token, target_body: null, target_error_code: 'generation_failed',
        });
        expect(broadcastMock).not.toHaveBeenCalled();
    });
});
