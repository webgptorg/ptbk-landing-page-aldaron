import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { createCommunityMembershipRoomUrl } from '@/lib/community-membership/communityMembershipRoomPath';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { isCommunityMembershipSubscriptionManageable } from '@/lib/community-membership/communityMembershipTypes';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

type CommunityMembershipPortalRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Creates a short-lived Stripe Customer Portal address for the connected member's own paid membership.
 *
 * Note: The customer id remains server-only. A portal URL is safe to return because Stripe makes it short-lived and
 *       scoped to that customer, while this endpoint still requires the narrowly scoped session of the room it is
 *       opened from, which is also the room Stripe returns the member to.
 */
export async function POST(
    request: NextRequest,
    context: CommunityMembershipPortalRouteContext,
): Promise<NextResponse> {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedMembershipRoomRequest(request, workshopSlug);
    if (!isAuthenticatedMembershipRoomRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (authenticatedRequest.requiresEmailVerification) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.emailVerificationRequired }, { status: 403 });
    }

    const gateway = getStripeGatewayOrNull();
    if (gateway === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCannotBeManaged }, { status: 503 });
    }

    const { participant, supabase, workshopRow, communityId } = authenticatedRequest;
    const membershipResult = await loadCommunityMembershipByEmail(supabase, participant.email, communityId);
    if (membershipResult.errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    const membership = membershipResult.membership;
    if (!isCommunityMembershipSubscriptionManageable(membership) || membership.stripeCustomerId === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipCannotBeManaged }, { status: 409 });
    }

    let portalSession;
    try {
        portalSession = await gateway.stripe.billingPortal.sessions.create({
            customer: membership.stripeCustomerId,
            return_url: createCommunityMembershipRoomUrl(request, workshopRow),
        });
    } catch (error) {
        console.error('Failed to open the community membership Stripe portal:', error);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipPortalNotOpened }, { status: 502 });
    }

    return NextResponse.json(
        { portalUrl: portalSession.url },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
