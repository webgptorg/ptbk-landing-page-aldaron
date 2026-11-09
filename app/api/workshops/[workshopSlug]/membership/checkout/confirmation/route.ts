import { DEFAULT_COMMUNITY_ID } from '@/businesses/community/config';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { activateCommunityMembershipFromCheckoutSession } from '@/lib/community-membership/communityMembershipActivation';
import {
    COMMUNITY_MEMBERSHIP_METADATA_KEYS,
    isStripeCheckoutSessionId,
} from '@/lib/community-membership/communityMembershipCheckout';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import { normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

type CommunityMembershipCheckoutConfirmationRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Confirms the checkout a member is returning from, so a paid membership is theirs the moment their browser comes
 * back rather than whenever the webhook of the gate is delivered.
 *
 * Note: Nothing here trusts the address the browser returned with. The gate is asked what really happened to that
 *       checkout, and a checkout belonging to somebody else is refused however it was reached.
 */
export async function POST(request: NextRequest, context: CommunityMembershipCheckoutConfirmationRouteContext) {
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

    const body = await readJsonObjectOrNull(request);
    const checkoutSessionId = body?.checkoutSessionId;
    if (!isStripeCheckoutSessionId(checkoutSessionId)) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 400 });
    }

    const gateway = getStripeGatewayOrNull();
    if (gateway === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentGateUnavailable }, { status: 503 });
    }

    const { participant, supabase, communityId } = authenticatedRequest;
    let checkoutSession;
    try {
        checkoutSession = await gateway.stripe.checkout.sessions.retrieve(checkoutSessionId);
    } catch (error) {
        console.error('Failed to read the community membership checkout session:', error);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 502 });
    }

    const checkoutMemberEmail = checkoutSession.metadata?.[COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberEmail] ?? null;
    const checkoutCommunityId = checkoutSession.metadata?.[COMMUNITY_MEMBERSHIP_METADATA_KEYS.communityId] ??
        DEFAULT_COMMUNITY_ID;
    if (checkoutMemberEmail !== normalizeCommunityMemberEmail(participant.email) || checkoutCommunityId !== communityId) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 403 });
    }

    const { membership, errorMessage } = await activateCommunityMembershipFromCheckoutSession(
        gateway,
        supabase,
        checkoutSession,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 500 });
    }
    if (membership === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 404 });
    }

    return NextResponse.json(createCommunityMembershipRoomState(membership, gateway.configuration), {
        headers: { 'Cache-Control': 'no-store' },
    });
}
