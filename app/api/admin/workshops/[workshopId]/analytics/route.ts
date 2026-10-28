import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { loadWorkshopAdminAnalytics } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopAnalyticsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * Delivers compact activity buckets which can power both the overview and the reactions section.
 */
export async function GET(request: NextRequest, context: AdminWorkshopAnalyticsRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { analytics, errorMessage } = await loadWorkshopAdminAnalytics(workshopData.supabase, workshopData.workshopRow);
    if (analytics === null) {
        return NextResponse.json({ error: errorMessage ?? 'Workshop analytics could not be loaded' }, { status: 500 });
    }

    return NextResponse.json(analytics, { headers: { 'Cache-Control': 'no-store' } });
}
