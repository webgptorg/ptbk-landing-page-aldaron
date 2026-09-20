import type { WorkshopAdminParticipant } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    joinAdminContactGroupMock,
    loadAdminContactGroupsMock,
    getCommunityMembershipStatusByEmailMock,
    loadCommunityMembershipStatusesByEmailsMock,
    getAdminWorkshopDataOrResponseMock,
    loadWorkshopAdminParticipantPageMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    joinAdminContactGroupMock: vi.fn(),
    loadAdminContactGroupsMock: vi.fn(),
    getCommunityMembershipStatusByEmailMock: vi.fn(),
    loadCommunityMembershipStatusesByEmailsMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    loadWorkshopAdminParticipantPageMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/admin/adminContactJoin', () => ({
    joinAdminContactGroup: joinAdminContactGroupMock,
}));
vi.mock('@/lib/admin/adminContactDatabase', () => ({
    loadAdminContactGroups: loadAdminContactGroupsMock,
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    getCommunityMembershipStatusByEmail: getCommunityMembershipStatusByEmailMock,
    loadCommunityMembershipStatusesByEmails: loadCommunityMembershipStatusesByEmailsMock,
}));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({
    getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    loadWorkshopAdminParticipantPage: loadWorkshopAdminParticipantPageMock,
}));

import { GET } from './route';

const PARTICIPANT: WorkshopAdminParticipant = {
    pendingSubmissionCount: 0,
    id: 'participant-1',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    connectedAt: '2026-08-30T10:00:00.000Z',
    lastSeenAt: '2026-08-30T11:00:00.000Z',
    isInteractionBanned: false,
    isTrusted: false,
    isModerator: false,
    activeDurationSeconds: 60,
    commentCount: 0,
    reactionCount: 0,
    upvoteCount: 0,
};

const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: 'community-id' }) };

function createRequest(): NextRequest {
    return new NextRequest('https://promptbook.studio/api/admin/workshops/community-id/participants');
}

describe('admin community participants membership projection', () => {
    beforeEach(() => {
        getUnauthorizedResponseOrNullMock.mockReset();
        joinAdminContactGroupMock.mockReset();
        loadAdminContactGroupsMock.mockReset();
        getCommunityMembershipStatusByEmailMock.mockReset();
        loadCommunityMembershipStatusesByEmailsMock.mockReset();
        getAdminWorkshopDataOrResponseMock.mockReset();
        loadWorkshopAdminParticipantPageMock.mockReset();

        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        joinAdminContactGroupMock.mockImplementation((participant) => ({ ...participant, contactGroup: null }));
        loadAdminContactGroupsMock.mockResolvedValue({ groups: [], errorMessage: null });
        loadWorkshopAdminParticipantPageMock.mockResolvedValue({
            page: { participants: [PARTICIPANT], totalCount: 1 },
            errorMessage: null,
        });
    });

    it('adds the membership state to each community participant in one batched membership lookup', async () => {
        const supabase = {};
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({
            supabase,
            workshopRow: { room_kind: 'community' },
        });
        const statusesByEmail = new Map([['jana@example.com', 'active']]);
        loadCommunityMembershipStatusesByEmailsMock.mockResolvedValue({ statusesByEmail, errorMessage: null });
        getCommunityMembershipStatusByEmailMock.mockReturnValue('active');

        const response = await GET(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        const responseBody = (await response.json()) as { readonly participants: unknown };
        expect(responseBody.participants).toEqual([
            { ...PARTICIPANT, contactGroup: null, communityMembershipStatus: 'active' },
        ]);
        expect(loadCommunityMembershipStatusesByEmailsMock).toHaveBeenCalledWith(supabase, ['jana@example.com']);
        expect(getCommunityMembershipStatusByEmailMock).toHaveBeenCalledWith(statusesByEmail, 'jana@example.com');
    });

    it('does not fetch paid membership information for an ordinary workshop participant list', async () => {
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({
            supabase: {},
            workshopRow: { room_kind: 'workshop' },
        });

        const response = await GET(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(loadCommunityMembershipStatusesByEmailsMock).not.toHaveBeenCalled();
    });

    it('rejects a request before querying either participant or payment data when the administrator is not signed in', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await GET(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(loadWorkshopAdminParticipantPageMock).not.toHaveBeenCalled();
        expect(loadCommunityMembershipStatusesByEmailsMock).not.toHaveBeenCalled();
    });
});
