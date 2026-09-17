import type { WorkshopPoll } from '@/lib/workshops/workshopTypes';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    broadcastWorkshopEventMock,
    getAuthenticatedWorkshopRequestMock,
    getCrossSiteResponseOrNullMock,
    getWorkshopInteractionBanResponseOrNullMock,
    isAuthenticatedWorkshopRequestMock,
    isWorkshopPollVisibleInRoomMock,
    loadWorkshopPollsMock,
    saveWorkshopPollVoteMock,
} = vi.hoisted(() => ({
    broadcastWorkshopEventMock: vi.fn(),
    getAuthenticatedWorkshopRequestMock: vi.fn(),
    getCrossSiteResponseOrNullMock: vi.fn(),
    getWorkshopInteractionBanResponseOrNullMock: vi.fn(),
    isAuthenticatedWorkshopRequestMock: vi.fn(),
    isWorkshopPollVisibleInRoomMock: vi.fn(),
    loadWorkshopPollsMock: vi.fn(),
    saveWorkshopPollVoteMock: vi.fn(),
}));

vi.mock('@/lib/api/getCrossSiteResponseOrNull', () => ({
    getCrossSiteResponseOrNull: getCrossSiteResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    loadWorkshopPolls: loadWorkshopPollsMock,
    saveWorkshopPollVote: saveWorkshopPollVoteMock,
}));
vi.mock('@/lib/workshops/workshopKindCapabilities', () => ({
    isWorkshopPollVisibleInRoom: isWorkshopPollVisibleInRoomMock,
}));
vi.mock('@/lib/workshops/workshopParticipantInteraction', () => ({
    getWorkshopInteractionBanResponseOrNull: getWorkshopInteractionBanResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopRealtime', () => ({
    broadcastWorkshopEvent: broadcastWorkshopEventMock,
}));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: getAuthenticatedWorkshopRequestMock,
    isAuthenticatedWorkshopRequest: isAuthenticatedWorkshopRequestMock,
}));

import { POST } from './route';

const WORKSHOP_SLUG = 'online-workshop-git-ai-2026-09-07';
const POLL_ID = '5a7eb2ad-2583-4e98-9640-50bc773e5fde';
const SELECTED_OPTION_ID = 'a6e2cc54-33d1-4476-a5c0-1c401245c1f2';
const SUPABASE = {};
const WORKSHOP_ROW = { id: 'workshop-id', room_kind: 'workshop', slug: WORKSHOP_SLUG };
const PARTICIPANT = { id: 'participant-id', email: 'jana@example.com', isInteractionBanned: false };
const POLL: WorkshopPoll = {
    id: POLL_ID,
    question: 'Které téma chcete probrat?',
    isClosed: false,
    isVisible: true,
    isOtherOptionEnabled: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    options: [
        {
            id: SELECTED_OPTION_ID,
            label: 'Git workflow',
            sortOrder: 0,
            voteCount: 1,
            isVotedByParticipant: true,
            isCreatedByParticipant: false,
            status: 'approved',
        },
    ],
    attachedWorkshops: [],
};
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopSlug: WORKSHOP_SLUG, pollId: POLL_ID }) };

function createRequest(body: unknown = { optionId: SELECTED_OPTION_ID }): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/workshops/${WORKSHOP_SLUG}/polls/${POLL_ID}/votes`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('workshop-attached community poll voting endpoint', () => {
    beforeEach(() => {
        broadcastWorkshopEventMock.mockReset();
        getAuthenticatedWorkshopRequestMock.mockReset();
        getCrossSiteResponseOrNullMock.mockReset();
        getWorkshopInteractionBanResponseOrNullMock.mockReset();
        isAuthenticatedWorkshopRequestMock.mockReset();
        isWorkshopPollVisibleInRoomMock.mockReset();
        loadWorkshopPollsMock.mockReset();
        saveWorkshopPollVoteMock.mockReset();

        getCrossSiteResponseOrNullMock.mockReturnValue(null);
        getAuthenticatedWorkshopRequestMock.mockResolvedValue({
            supabase: SUPABASE,
            workshopRow: WORKSHOP_ROW,
            participant: PARTICIPANT,
        });
        isAuthenticatedWorkshopRequestMock.mockReturnValue(true);
        isWorkshopPollVisibleInRoomMock.mockReturnValue(true);
        getWorkshopInteractionBanResponseOrNullMock.mockReturnValue(null);
        saveWorkshopPollVoteMock.mockResolvedValue({ isSuccessful: true });
        loadWorkshopPollsMock.mockResolvedValue({ polls: [POLL], errorMessage: null });
    });

    it('writes the attached-room choice as the member e-mail’s shared vote and returns its selected state', async () => {
        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ poll: POLL });
        expect(saveWorkshopPollVoteMock).toHaveBeenCalledWith(
            SUPABASE,
            WORKSHOP_ROW,
            PARTICIPANT,
            POLL_ID,
            { optionId: SELECTED_OPTION_ID },
        );
        expect(loadWorkshopPollsMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, PARTICIPANT);
        expect(broadcastWorkshopEventMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, { kind: 'state-changed' });
    });

    it('creates and votes for a member-written other option through the same shared endpoint', async () => {
        const response = await POST(createRequest({ otherOptionLabel: 'Bezpečnost' }), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(saveWorkshopPollVoteMock).toHaveBeenCalledWith(
            SUPABASE,
            WORKSHOP_ROW,
            PARTICIPANT,
            POLL_ID,
            { otherOptionLabel: 'Bezpečnost' },
        );
        expect(broadcastWorkshopEventMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, { kind: 'state-changed' });
    });

    it('does not let a workshop vote on a poll which is not attached to it', async () => {
        saveWorkshopPollVoteMock.mockResolvedValue({
            isSuccessful: false,
            errorKind: 'not-found',
            errorMessage: 'WORKSHOP_POLL_NOT_ATTACHED',
        });

        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(404);
        expect(loadWorkshopPollsMock).not.toHaveBeenCalled();
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });

    it('keeps a concurrently closed poll closed for an attached workshop too', async () => {
        saveWorkshopPollVoteMock.mockResolvedValue({
            isSuccessful: false,
            errorKind: 'closed',
            errorMessage: 'WORKSHOP_POLL_CLOSED',
        });

        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(409);
        expect(loadWorkshopPollsMock).not.toHaveBeenCalled();
    });
});
