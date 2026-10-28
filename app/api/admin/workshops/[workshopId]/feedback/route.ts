import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { joinAdminContactGroup } from '@/lib/admin/adminContactJoin';
import { loadAdminContactGroups } from '@/lib/admin/adminContactDatabase';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminFeedback } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopFeedbackRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * The private feedback reading of one workshop. It is deliberately separate from the polling snapshot so a growing
 * list of free-text answers is loaded only while an administrator is reading it.
 */
export async function GET(request: NextRequest, context: AdminWorkshopFeedbackRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (workshopData.workshopRow.room_kind !== 'workshop') {
        return NextResponse.json({ error: 'Feedback is only available for workshops' }, { status: 404 });
    }

    const [feedbackResult, contactGroupsResult] = await Promise.all([
        loadWorkshopAdminFeedback(workshopData.supabase, workshopId),
        loadAdminContactGroups(workshopData.supabase, {
            isLoadingAll: true,
            isWorkshopParticipationsIncluded: false,
        }),
    ]);
    if (feedbackResult.feedbacks === null) {
        return NextResponse.json({ error: feedbackResult.errorMessage ?? 'Feedback could not be loaded' }, { status: 500 });
    }
    if (contactGroupsResult.groups === null) {
        return NextResponse.json(
            { error: contactGroupsResult.errorMessage ?? 'Contact information could not be loaded' },
            { status: 500 },
        );
    }

    return NextResponse.json(
        {
            feedbacks: feedbackResult.feedbacks.map((feedback) =>
                joinAdminContactGroup(feedback, contactGroupsResult.groups ?? []),
            ),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
