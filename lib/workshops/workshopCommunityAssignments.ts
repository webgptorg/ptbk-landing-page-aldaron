import { COMMUNITY_IDS, DEFAULT_COMMUNITY_ID, type CommunityId } from '@/businesses/community/config';

/** Older event data predates community assignment and belongs to the original community. */
export function getWorkshopCommunityIds(
    communityIds?: readonly CommunityId[],
): readonly CommunityId[] {
    return communityIds ?? [DEFAULT_COMMUNITY_ID];
}

export function canPublishWorkshopToCommunity(eventType: string | null | undefined, communityId: CommunityId): boolean {
    return eventType !== 'ai-supervize-mini' || communityId !== 'promptbook';
}

export function getWorkshopCommunityChoices(
    eventType: string,
    communityIds: readonly CommunityId[],
): readonly CommunityId[] {
    return COMMUNITY_IDS.filter(
        (communityId) => communityIds.includes(communityId) && canPublishWorkshopToCommunity(eventType, communityId),
    );
}
