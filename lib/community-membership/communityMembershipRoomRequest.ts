import { isCommunityEmailVerificationRequired } from '@/lib/community-membership/communityMembershipIdentity';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import type { CommunityId } from '@/businesses/community/config';
import { getPaidCommunityIdForRoom } from '@/lib/community-membership/communityMembershipScope';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedMembershipRoomRequest = AuthenticatedWorkshopRequest & {
    readonly communityId: CommunityId;
    readonly requiresEmailVerification: boolean;
};

/** The room, rather than the browser, determines which community's subscription may be accessed. */
export async function getAuthenticatedMembershipRoomRequest(
    request: NextRequest,
    workshopSlug: string,
): Promise<AuthenticatedMembershipRoomRequest | NextResponse> {
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { workshopRow } = authenticatedRequest;
    const communityId = getPaidCommunityIdForRoom(workshopRow.room_kind, workshopRow.slug, workshopRow.community_slugs);
    return communityId === null
        ? NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotOfferedInRoom }, { status: 404 })
        : {
            ...authenticatedRequest,
            communityId,
            requiresEmailVerification: isCommunityEmailVerificationRequired(request, authenticatedRequest.participant.email),
        };
}

export function isAuthenticatedMembershipRoomRequest(
    value: AuthenticatedMembershipRoomRequest | NextResponse,
): value is AuthenticatedMembershipRoomRequest {
    return !(value instanceof NextResponse);
}
