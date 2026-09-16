import { COMMUNITY_PATH } from '@/businesses/community/config';
import { createRequestSiteUrl } from '@/lib/api/createRequestSiteUrl';
import { createLocalEventLinkOrNull } from '@/lib/events/eventLinks';
import { mapWorkshopSummaryRow, type WorkshopRow } from '@/lib/workshops/workshopDatabase';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import type { NextRequest } from 'next/server';

/**
 * Where a member acting on their membership belongs, which is the very room they acted from.
 *
 * Note: A member who pays for the membership in a workshop room comes back into that workshop rather than into the
 *       community, because leaving the room they were watching is not what buying a membership is for. A room without
 *       a public address of this application leads to the community, which is where the membership is always at home,
 *       so a term held by somebody else never becomes the destination a payment gate returns a member to.
 */
export function createCommunityMembershipRoomPath(workshop: WorkshopSummary): string {
    return workshop.kind === 'community' ? COMMUNITY_PATH : (createLocalEventLinkOrNull(workshop) ?? COMMUNITY_PATH);
}

/**
 * The very same address as an absolute one, which is what the payment gate returns a member to.
 */
export function createCommunityMembershipRoomUrl(request: NextRequest, workshopRow: WorkshopRow): string {
    return createRequestSiteUrl(request, createCommunityMembershipRoomPath(mapWorkshopSummaryRow(workshopRow)));
}
