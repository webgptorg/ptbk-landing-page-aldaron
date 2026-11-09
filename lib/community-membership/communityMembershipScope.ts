import {
    COMMUNITIES,
    DEFAULT_COMMUNITY_ID,
    getCommunityByRoomSlug,
    type CommunityId,
} from '@/businesses/community/config';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * The community whose paid plan is offered in this room. A shared event keeps its existing Developers membership
 * and a Promptbook-only event follows the Promptbook offering. Unlisted and historical events keep their old scope.
 */
export function getPaidCommunityIdForRoom(
    kind: WorkshopKind,
    slug: string,
    communityIds: readonly string[] | null | undefined,
): CommunityId | null {
    if (!getWorkshopKindCapabilities(kind).isMembershipOffered) {
        return null;
    }

    const community = kind === 'community'
        ? getCommunityByRoomSlug(slug)
        : communityIds?.length === 1 && communityIds[0] === 'promptbook'
            ? COMMUNITIES.promptbook
            : COMMUNITIES[DEFAULT_COMMUNITY_ID];

    return community?.hasPaidMembership === true ? community.id : null;
}
