import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { loadAdminCommunityProjects } from '@/lib/community-projects/communityProjectDatabase';
import { getWorkshopDatabaseOrNull, createWorkshopDatabaseUnavailableResponse } from '@/lib/workshops/workshopDatabase';
import { isWorkshopSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Lists one moderation queue of community projects for the administration. The regular community API never returns
 * rejected cards, while this route deliberately does so an administrator can audit every decision.
 */
export async function GET(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const requestedStatus = request.nextUrl.searchParams.get('status');
    if (requestedStatus !== null && !isWorkshopSubmissionStatus(requestedStatus)) {
        return NextResponse.json({ error: 'Neplatný stav projektu.' }, { status: 400 });
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const { projects, errorMessage } = await loadAdminCommunityProjects(supabase, requestedStatus ?? 'pending');
    if (projects === null) {
        console.error('Failed to load community projects for administration:', errorMessage);
        return NextResponse.json({ error: 'Projekty se nepodařilo načíst.' }, { status: 500 });
    }

    return NextResponse.json({ projects }, { headers: { 'Cache-Control': 'no-store' } });
}
