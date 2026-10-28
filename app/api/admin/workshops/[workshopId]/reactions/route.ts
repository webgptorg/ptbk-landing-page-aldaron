import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { WORKSHOP_REACTION_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopReactionsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function DELETE(request: NextRequest, context: AdminWorkshopReactionsRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { error } = await workshopData.supabase
        .from(WORKSHOP_REACTION_TABLE_NAME)
        .delete()
        .eq('workshop_id', workshopId);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ success: true });
}
