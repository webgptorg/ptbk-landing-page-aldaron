import type { CommunityMembershipAdminRecord } from '@/lib/community-membership/communityMembershipDatabase';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    getCommunityMembershipDatabaseOrNullMock,
    loadCommunityMembershipAdminPageMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getCommunityMembershipDatabaseOrNullMock: vi.fn(),
    loadCommunityMembershipAdminPageMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    getCommunityMembershipDatabaseOrNull: getCommunityMembershipDatabaseOrNullMock,
    loadCommunityMembershipAdminPage: loadCommunityMembershipAdminPageMock,
}));

import { GET } from './route';

const MEMBERSHIP: CommunityMembershipAdminRecord = {
    id: 'membership-1',
    email: 'jana@example.com',
    fullname: 'Jana Nováková',
    planId: 'membership',
    status: 'active',
    monthlyPriceCzk: 199,
    discountCode: null,
    discountPercent: 0,
    stripeCustomerId: 'cus_Example',
    stripeSubscriptionId: 'sub_Example',
    stripeCheckoutSessionId: 'cs_Example',
    isTestPayment: false,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    activatedAt: '2026-08-30T10:00:00.000Z',
    canceledAt: null,
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z',
};

function createRequest(): NextRequest {
    return new NextRequest(
        'https://promptbook.studio/api/admin/community/memberships?membershipStatus=active&membershipTest=false',
    );
}

describe('admin community memberships', () => {
    beforeEach(() => {
        getUnauthorizedResponseOrNullMock.mockReset();
        getCommunityMembershipDatabaseOrNullMock.mockReset();
        loadCommunityMembershipAdminPageMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
    });

    it('refuses an unauthenticated request before it reaches payment data', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await GET(createRequest());

        expect(response.status).toBe(401);
        expect(getCommunityMembershipDatabaseOrNullMock).not.toHaveBeenCalled();
        expect(loadCommunityMembershipAdminPageMock).not.toHaveBeenCalled();
    });

    it('returns a filtered page of private memberships to an administrator', async () => {
        const supabase = {};
        getCommunityMembershipDatabaseOrNullMock.mockReturnValue(supabase);
        loadCommunityMembershipAdminPageMock.mockResolvedValue({
            page: { memberships: [MEMBERSHIP], totalCount: 1 },
            errorMessage: null,
        });

        const response = await GET(createRequest());

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ memberships: [MEMBERSHIP], totalCount: 1 });
        expect(loadCommunityMembershipAdminPageMock).toHaveBeenCalledWith(supabase, {
            searchQuery: '',
            status: 'active',
            isTestPayment: false,
            sortBy: 'updatedAt',
            sortDirection: 'DESCENDING',
            page: 1,
            pageSize: 50,
        }, 'vyvojari');
    });
});
