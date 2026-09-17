import { describe, expect, it } from 'vitest';
import { getWorkshopCommentProvenance } from './workshopCommentOrigin';
import { mapWorkshopCommentRow, type WorkshopCommentRow } from './workshopDatabase';

describe('private comment provenance', () => {
    it('keeps agent identity and execution details out of participant state', () => {
        const row: WorkshopCommentRow = {
            id: 'comment', participant_id: null, parent_comment_id: null, author_name: 'Jana', body: 'A question',
            status: 'approved', upvote_count: 0, artificial_upvote_count: 0, is_artificial: true, origin: 'agent',
            agent_id: 'agent-id', agent_job_id: 'job-id', created_at: '2026-09-17T12:00:00Z',
        };
        const publicComment = mapWorkshopCommentRow(row, false, { pinnedCommentId: null, authorByParticipantId: new Map(), isModerationOffered: false });
        expect(publicComment).not.toHaveProperty('origin');
        expect(publicComment).not.toHaveProperty('agentId');
        expect(publicComment).not.toHaveProperty('agentJobId');
        expect(publicComment.authorName).toBe('Jana');
        expect(getWorkshopCommentProvenance(row)).toEqual({ origin: 'agent', agentId: 'agent-id', agentJobId: 'job-id' });
    });
});
