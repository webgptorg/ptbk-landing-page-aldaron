'use client';

import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';

/**
 * Whether the room knows that the member reading it pays for the community membership.
 *
 * Note: Every surface which shows a paying member something else than a member who does not pay asks this one
 *       question, so the badge in the header and the material list below it can never disagree about one member.
 * Note: A membership which is still being loaded and a room which offers no membership at all are both answered the
 *       same way as a member who never bought one, because none of them is somebody the room may treat as paying.
 */
export function useIsPaidCommunityMember(): boolean {
    const membership = useCommunityMembershipRoom()?.membership ?? null;

    return membership !== null && isPaidCommunityMembershipStatus(membership.status);
}
