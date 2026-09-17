import type { WorkshopCommentRow } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { autoApproveMock, authenticateMock, broadcastMock } = vi.hoisted(() => ({
    autoApproveMock: vi.fn(), authenticateMock: vi.fn(), broadcastMock: vi.fn(),
}));
vi.mock('@/lib/workshops/workshopAutoApproval', () => ({ autoApproveWorkshopSubmission: autoApproveMock }));
vi.mock('@/lib/workshops/workshopRealtime', () => ({ broadcastWorkshopEvent: broadcastMock }));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: authenticateMock,
    isAuthenticatedWorkshopRequest: (value: unknown) => !(value instanceof NextResponse),
}));

import { POST } from './route';

const PARTICIPANT = { id: 'participant-id', fullname: 'Jana', email: 'jana@example.com', isTrusted: false, isModerator: false, isInteractionBanned: false };
const COMMENT: WorkshopCommentRow = {
    id: 'comment-id', participant_id: PARTICIPANT.id, author_name: PARTICIPANT.fullname,
    body: 'Uložená otázka', status: 'pending', parent_comment_id: null, upvote_count: 0,
    artificial_upvote_count: 0, is_artificial: false, created_at: '2026-09-17T10:00:00Z',
};
const WORKSHOP = { id: 'workshop-id', slug: 'example-workshop', room_kind: 'workshop', disabled_panels: [], pinned_comment_id: null };
const CONTEXT = { params: Promise.resolve({ workshopSlug: WORKSHOP.slug }) };

function createRequest(body: unknown = { body: '  Nová otázka  ', parentCommentId: null }): NextRequest {
    return new NextRequest(`https://example.com/api/workshops/${WORKSHOP.slug}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
}

describe('automatic approval when posting chat messages', () => {
    const singleMock = vi.fn();
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertMock = vi.fn(() => ({ select: selectMock }));
    const supabase = { from: vi.fn(() => ({ insert: insertMock })) };

    beforeEach(() => {
        vi.clearAllMocks();
        singleMock.mockResolvedValue({ data: COMMENT, error: null });
        autoApproveMock.mockResolvedValue(false);
        authenticateMock.mockResolvedValue({ supabase, participant: PARTICIPANT, workshopRow: WORKSHOP });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });
    afterEach(() => vi.restoreAllMocks());

    it.each(['workshop', 'community', 'project'])('approves persisted content and broadcasts the changed %s room', async (roomKind) => {
        const workshop = { ...WORKSHOP, room_kind: roomKind };
        authenticateMock.mockResolvedValue({ supabase, participant: PARTICIPANT, workshopRow: workshop });
        autoApproveMock.mockImplementation(async () => {
            expect(singleMock).toHaveBeenCalledTimes(1);
            return true;
        });

        const response = await POST(createRequest(), CONTEXT);

        expect(response.status).toBe(201);
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ body: 'Nová otázka', status: 'pending' }));
        expect(autoApproveMock).toHaveBeenCalledWith(supabase, PARTICIPANT, {
            kind: 'comment', id: COMMENT.id, status: 'pending', content: { body: COMMENT.body },
        });
        expect(await response.json()).toMatchObject({ comment: { body: COMMENT.body, status: 'approved' } });
        expect(broadcastMock).toHaveBeenCalledWith(supabase, workshop, { kind: 'state-changed' });
    });

    it('returns the saved pending message when AI defers or is unavailable', async () => {
        const response = await POST(createRequest(), CONTEXT);
        expect(response.status).toBe(201);
        expect(await response.json()).toMatchObject({ comment: { status: 'pending' } });
        expect(broadcastMock).not.toHaveBeenCalled();
    });

    it('preserves immediate trusted approval when the AI path makes no change', async () => {
        authenticateMock.mockResolvedValue({ supabase, participant: { ...PARTICIPANT, isTrusted: true }, workshopRow: WORKSHOP });
        singleMock.mockResolvedValue({ data: { ...COMMENT, status: 'approved' }, error: null });
        const response = await POST(createRequest(), CONTEXT);
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }));
        expect(await response.json()).toMatchObject({ comment: { status: 'approved' } });
        expect(broadcastMock).toHaveBeenCalledTimes(1);
    });

    it('does not review a rate-limited submission which was never saved', async () => {
        singleMock.mockResolvedValue({ data: null, error: { message: 'WORKSHOP_COMMENT_RATE_LIMITED' } });
        expect((await POST(createRequest(), CONTEXT)).status).toBe(429);
        expect(autoApproveMock).not.toHaveBeenCalled();
        expect(broadcastMock).not.toHaveBeenCalled();
    });

    it('does not review invalid or unauthenticated submissions', async () => {
        expect((await POST(createRequest({ body: '' }), CONTEXT)).status).toBe(400);
        authenticateMock.mockResolvedValue(NextResponse.json({ error: 'Sign in' }, { status: 401 }));
        expect((await POST(createRequest(), CONTEXT)).status).toBe(401);
        expect(insertMock).not.toHaveBeenCalled();
        expect(autoApproveMock).not.toHaveBeenCalled();
    });
});
