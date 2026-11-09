import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createPortalSessionMock,
    getAuthenticatedMembershipRoomRequestMock,
    getCrossSiteResponseOrNullMock,
    getStripeGatewayOrNullMock,
    isAuthenticatedMembershipRoomRequestMock,
    loadCommunityMembershipByEmailMock,
} = vi.hoisted(() => ({
    createPortalSessionMock: vi.fn(),
    getAuthenticatedMembershipRoomRequestMock: vi.fn(),
    getCrossSiteResponseOrNullMock: vi.fn(),
    getStripeGatewayOrNullMock: vi.fn(),
    isAuthenticatedMembershipRoomRequestMock: vi.fn(),
    loadCommunityMembershipByEmailMock: vi.fn(),
}));

vi.mock('@/lib/api/getCrossSiteResponseOrNull', () => ({
    getCrossSiteResponseOrNull: getCrossSiteResponseOrNullMock,
}));
vi.mock('@/lib/community-membership/communityMembershipRoomRequest', () => ({
    getAuthenticatedMembershipRoomRequest: getAuthenticatedMembershipRoomRequestMock,
    isAuthenticatedMembershipRoomRequest: isAuthenticatedMembershipRoomRequestMock,
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    loadCommunityMembershipByEmail: loadCommunityMembershipByEmailMock,
}));
vi.mock('@/lib/payments/stripeGateway', () => ({
    getStripeGatewayOrNull: getStripeGatewayOrNullMock,
}));

import { POST } from './route';

const SUPABASE = {};
const COMMUNITY_WORKSHOP_ROW = {
    id: 'workshop-community',
    room_kind: 'community',
    slug: 'komunita',
    title: 'Komunita',
    description: '',
    starts_at: '2026-08-01T10:00:00.000Z',
    ends_at: null,
    is_published: true,
    event_type: null,
    location_kind: null,
    location_label: '',
    price_czk: null,
    maximum_participant_count: null,
} as unknown as WorkshopRow;
const ONLINE_WORKSHOP_ROW = {
    ...COMMUNITY_WORKSHOP_ROW,
    id: 'workshop-1',
    room_kind: 'workshop',
    slug: 'produkcni-kod-s-ai-agenty',
    title: 'Produkční kód s AI agenty',
    event_type: 'online-workshop',
    location_kind: 'online',
    price_czk: 0,
} as unknown as WorkshopRow;

function createAuthenticatedRequest(workshopRow: WorkshopRow) {
    return { participant: { email: 'jana@example.com' }, supabase: SUPABASE, workshopRow,
        communityId: 'vyvojari', requiresEmailVerification: false };
}

const MEMBERSHIP: CommunityMembershipRecord = {
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
    isCancellationScheduled: false,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    activatedAt: '2026-08-30T10:00:00.000Z',
    canceledAt: null,
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z',
};
const PORTAL_SESSION = { url: 'https://billing.stripe.com/p/session/test_Example' };
const GATEWAY = {
    stripe: { billingPortal: { sessions: { create: createPortalSessionMock } } },
};

function createRequest(workshopSlug: string): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/workshops/${workshopSlug}/membership/portal`, {
        method: 'POST',
        headers: { 'sec-fetch-site': 'same-origin' },
    });
}

function createRouteContext(workshopSlug: string) {
    return { params: Promise.resolve({ workshopSlug }) };
}

describe('community membership Stripe portal endpoint', () => {
    beforeEach(() => {
        createPortalSessionMock.mockReset();
        getAuthenticatedMembershipRoomRequestMock.mockReset();
        getCrossSiteResponseOrNullMock.mockReset();
        getStripeGatewayOrNullMock.mockReset();
        isAuthenticatedMembershipRoomRequestMock.mockReset();
        loadCommunityMembershipByEmailMock.mockReset();

        getCrossSiteResponseOrNullMock.mockReturnValue(null);
        getAuthenticatedMembershipRoomRequestMock.mockResolvedValue(createAuthenticatedRequest(COMMUNITY_WORKSHOP_ROW));
        isAuthenticatedMembershipRoomRequestMock.mockReturnValue(true);
        getStripeGatewayOrNullMock.mockReturnValue(GATEWAY);
        loadCommunityMembershipByEmailMock.mockResolvedValue({ membership: MEMBERSHIP, errorMessage: null });
        createPortalSessionMock.mockResolvedValue(PORTAL_SESSION);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('refuses to open the portal before the room member verifies their e-mail when verification is enabled', async () => {
        getAuthenticatedMembershipRoomRequestMock.mockResolvedValue({
            ...createAuthenticatedRequest(COMMUNITY_WORKSHOP_ROW),
            requiresEmailVerification: true,
        });

        const response = await POST(createRequest('komunita'), createRouteContext('komunita'));

        expect(response.status).toBe(403);
        expect(loadCommunityMembershipByEmailMock).not.toHaveBeenCalled();
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('opens a short-lived portal for the signed-in member and returns to their community room', async () => {
        const response = await POST(createRequest('komunita'), createRouteContext('komunita'));

        expect(response.status).toBe(200);
        expect(createPortalSessionMock).toHaveBeenCalledWith({
            customer: 'cus_Example',
            return_url: 'https://promptbook.studio/cs/komunity/vyvojari',
        });
        expect(await response.json()).toEqual({ portalUrl: PORTAL_SESSION.url });
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('returns a member who opened the portal from a workshop room into that very workshop', async () => {
        getAuthenticatedMembershipRoomRequestMock.mockResolvedValue(createAuthenticatedRequest(ONLINE_WORKSHOP_ROW));

        const response = await POST(
            createRequest(ONLINE_WORKSHOP_ROW.slug),
            createRouteContext(ONLINE_WORKSHOP_ROW.slug),
        );

        expect(response.status).toBe(200);
        expect(createPortalSessionMock).toHaveBeenCalledWith({
            customer: 'cus_Example',
            return_url: 'https://promptbook.studio/cs/online-workshop/participant?workshop=produkcni-kod-s-ai-agenty',
        });
    });

    it('refuses a cross-site request before it can reach a member or Stripe', async () => {
        getCrossSiteResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 }),
        );

        const response = await POST(createRequest('komunita'), createRouteContext('komunita'));

        expect(response.status).toBe(403);
        expect(getAuthenticatedMembershipRoomRequestMock).not.toHaveBeenCalled();
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('leaves a room which does not offer the membership answering for itself', async () => {
        getAuthenticatedMembershipRoomRequestMock.mockResolvedValue(
            NextResponse.json({ error: 'Membership not offered' }, { status: 404 }),
        );
        isAuthenticatedMembershipRoomRequestMock.mockReturnValue(false);

        const response = await POST(createRequest('projekt-1'), createRouteContext('projekt-1'));

        expect(response.status).toBe(404);
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('does not create a portal for an unpaid membership or one without a Stripe customer', async () => {
        loadCommunityMembershipByEmailMock.mockResolvedValue({
            membership: { ...MEMBERSHIP, stripeCustomerId: null },
            errorMessage: null,
        });

        const response = await POST(createRequest('komunita'), createRouteContext('komunita'));

        expect(response.status).toBe(409);
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('answers with a usable error when Stripe cannot create the portal', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        createPortalSessionMock.mockRejectedValue(new Error('Customer portal is not configured'));

        const response = await POST(createRequest('komunita'), createRouteContext('komunita'));

        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({
            error: 'Správu plateb ve Stripe se teď nepodařilo otevřít. Zkuste to prosím znovu.',
        });
    });
});
