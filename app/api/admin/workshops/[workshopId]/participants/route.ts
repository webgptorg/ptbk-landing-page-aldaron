import { getCommunityByRoomSlug, type CommunityId } from '@/businesses/community/config';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { joinAdminContactGroup } from '@/lib/admin/adminContactJoin';
import { loadAdminContactGroups } from '@/lib/admin/adminContactDatabase';
import {
    getCommunityMembershipStatusByEmail,
    loadCommunityMembershipStatusesByEmails,
} from '@/lib/community-membership/communityMembershipDatabase';
import type { StoredCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminParticipantPage } from '@/lib/workshops/workshopDatabase';
import { parseWorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import { normalizeWorkshopParticipantEmail } from '@/lib/workshops/workshopParticipantEmail';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * Serves one filtered and sorted page instead of the entire audience of a workshop.
 */
export async function GET(request: NextRequest, context: AdminWorkshopParticipantsRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const query = parseWorkshopAdminParticipantQuery(request.nextUrl.searchParams);
    const [participantPageResult, contactGroupsResult] = await Promise.all([
        loadWorkshopAdminParticipantPage(workshopData.supabase, workshopId, query),
        loadAdminContactGroups(workshopData.supabase, {
            isLoadingAll: true,
            isWorkshopParticipationsIncluded: false,
        }),
    ]);
    const { page, errorMessage } = participantPageResult;
    if (page === null) {
        return NextResponse.json({ error: errorMessage ?? 'Participants could not be loaded' }, { status: 500 });
    }
    if (contactGroupsResult.groups === null) {
        return NextResponse.json(
            { error: contactGroupsResult.errorMessage ?? 'Contact information could not be loaded' },
            { status: 500 },
        );
    }

    const community = workshopData.workshopRow.room_kind === 'community'
        ? getCommunityByRoomSlug(workshopData.workshopRow.slug)
        : undefined;
    const emails = Array.from(new Set(page.participants.map(({ email }) => normalizeWorkshopParticipantEmail(email))));
    const [membershipStatusesResult, participationsResult] = await Promise.all([
        community?.hasPaidMembership
            ? loadCommunityMembershipStatusesByEmails(workshopData.supabase, emails, community.id)
            : { statusesByEmail: new Map<string, StoredCommunityMembershipStatus>(), errorMessage: null },
        community !== undefined && emails.length > 0
            ? workshopData.supabase.rpc('get_community_participations_by_email', { participant_emails: emails })
            : { data: [], error: null },
    ]);
    const participationError = membershipStatusesResult.errorMessage ?? participationsResult.error?.message;
    if (participationError) {
        return NextResponse.json({ error: participationError }, { status: 500 });
    }
    const communityIdsByEmail = new Map<string, CommunityId[]>();
    for (const row of (participationsResult.data ?? []) as readonly { email: string; room_slug: string }[]) {
        const relatedCommunity = getCommunityByRoomSlug(row.room_slug);
        if (relatedCommunity !== undefined) {
            const communityIds = communityIdsByEmail.get(row.email) ?? [];
            communityIds.push(relatedCommunity.id);
            communityIdsByEmail.set(row.email, communityIds);
        }
    }

    return NextResponse.json(
        {
            ...page,
            participants: page.participants.map((participant) => {
                const participantWithContactGroup = joinAdminContactGroup(participant, contactGroupsResult.groups ?? []);

                return community !== undefined
                    ? {
                          ...participantWithContactGroup,
                          participatingCommunityIds:
                              communityIdsByEmail.get(normalizeWorkshopParticipantEmail(participant.email)) ?? [],
                          ...(community.hasPaidMembership && {
                              communityMembershipStatus: getCommunityMembershipStatusByEmail(
                                  membershipStatusesResult.statusesByEmail,
                                  participant.email,
                              ),
                          }),
                      }
                    : participantWithContactGroup;
            }),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
