import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import { NextRequest, NextResponse } from 'next/server';

type CommunityMembershipRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * What the connected member is told about their own membership.
 *
 * Note: A member is described to themselves alone. The room asks under its own session, which is what proves which
 *       address the answer is about. The room also determines the community whose membership is returned.
 */
export async function GET(request: NextRequest, context: CommunityMembershipRouteContext) {
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedMembershipRoomRequest(request, workshopSlug);
    if (!isAuthenticatedMembershipRoomRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    if (authenticatedRequest.requiresEmailVerification) {
        return NextResponse.json(
            { ...createCommunityMembershipRoomState(null, null), requiresEmailVerification: true },
            { headers: { 'Cache-Control': 'no-store' } },
        );
    }

    const { membership, errorMessage } = await loadCommunityMembershipByEmail(
        authenticatedRequest.supabase,
        authenticatedRequest.participant.email,
        authenticatedRequest.communityId,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    return NextResponse.json(createCommunityMembershipRoomState(membership, getStripeConfigurationOrNull()), {
        headers: { 'Cache-Control': 'no-store' },
    });
}
