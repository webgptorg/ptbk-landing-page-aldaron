import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { joinAdminContactGroup } from '@/lib/admin/adminContactJoin';
import { loadAdminContactGroups } from '@/lib/admin/adminContactDatabase';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminParticipantTimeline } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantTimelineRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly participantId: string }>;
};

/**
 * Serves the full event history only after an administrator opens a participant's detail.
 */
export async function GET(request: NextRequest, context: AdminWorkshopParticipantTimelineRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const [participantTimelineResult, contactGroupsResult] = await Promise.all([
        loadWorkshopAdminParticipantTimeline(workshopData.supabase, workshopData.workshopRow, participantId),
        loadAdminContactGroups(workshopData.supabase),
    ]);
    const { timeline, errorMessage } = participantTimelineResult;
    if (timeline === null) {
        return errorMessage === null
            ? NextResponse.json({ error: 'Participant not found' }, { status: 404 })
            : NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    if (contactGroupsResult.groups === null) {
        return NextResponse.json(
            { error: contactGroupsResult.errorMessage ?? 'Contact information could not be loaded' },
            { status: 500 },
        );
    }

    return NextResponse.json(
        {
            ...timeline,
            participant: joinAdminContactGroup(timeline.participant, contactGroupsResult.groups ?? []),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
