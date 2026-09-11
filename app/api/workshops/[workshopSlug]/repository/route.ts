import { fetchWorkshopRepositoryProgress } from '@/lib/workshops/fetchWorkshopRepositoryProgress';
import { mapWorkshopRow } from '@/lib/workshops/workshopDatabase';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopRepositoryRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * How far the project of this workshop has come, read for the participants who are in its room
 *
 * Note: The room asks for this on its own rather than receiving it with its state, so a slow or unreachable GitHub
 *       delays nothing but the panel which is about GitHub. Every participant reads one and the same server-side
 *       answer, see `fetchWorkshopRepositoryProgress`, so a full room asks GitHub exactly as often as an empty one.
 */
export async function GET(request: NextRequest, context: WorkshopRepositoryRouteContext) {
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { workshopRow } = authenticatedRequest;
    const workshop = mapWorkshopRow(workshopRow);
    const isRepositoryOffered = getWorkshopKindCapabilities(workshop.kind).isRepositoryOffered;
    if (!isRepositoryOffered || workshop.repository === null) {
        return NextResponse.json({ error: 'Workshop repository not found' }, { status: 404 });
    }

    const progress = await fetchWorkshopRepositoryProgress(workshop.repository);
    return NextResponse.json({ progress }, { headers: { 'Cache-Control': 'no-store' } });
}
