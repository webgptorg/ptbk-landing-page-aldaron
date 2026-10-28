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

    const isCommunityRoom = workshopData.workshopRow.room_kind === 'community';
    const membershipStatusesResult = isCommunityRoom
        ? await loadCommunityMembershipStatusesByEmails(
              workshopData.supabase,
              page.participants.map((participant) => participant.email),
          )
        : { statusesByEmail: new Map<string, StoredCommunityMembershipStatus>(), errorMessage: null };
    if (membershipStatusesResult.errorMessage !== null) {
        return NextResponse.json({ error: membershipStatusesResult.errorMessage }, { status: 500 });
    }

    return NextResponse.json(
        {
            ...page,
            participants: page.participants.map((participant) => {
                const participantWithContactGroup = joinAdminContactGroup(participant, contactGroupsResult.groups ?? []);

                return isCommunityRoom
                    ? {
                          ...participantWithContactGroup,
                          communityMembershipStatus: getCommunityMembershipStatusByEmail(
                              membershipStatusesResult.statusesByEmail,
                              participant.email,
                          ),
                      }
                    : participantWithContactGroup;
            }),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
