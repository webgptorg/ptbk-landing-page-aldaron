import { mapWorkshopRow } from '@/lib/workshops/workshopDatabase';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { watchWorkshopRepository } from '@/lib/workshops/workshopRepositoryMonitor';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { NextRequest, NextResponse } from 'next/server';
import { fetchWorkshopRepositoryHistory } from '@/lib/workshops/fetchWorkshopRepositoryHistory';

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

    if (request.nextUrl.searchParams.has('page')) {
        const page = Number(request.nextUrl.searchParams.get('page'));
        if (!Number.isSafeInteger(page) || page < 1) {
            return NextResponse.json({ error: 'Invalid history page' }, { status: 400 });
        }
        try {
            const progress = await fetchWorkshopRepositoryHistory(workshop.repository, {
                page, isExpanded: request.nextUrl.searchParams.get('expanded') === 'true',
            });
            return NextResponse.json({ progress }, { headers: { 'Cache-Control': 'no-store' } });
        } catch {
            return NextResponse.json({ error: 'Historii commitů se nepodařilo načíst.' }, { status: 502 });
        }
    }
    const progress = await watchWorkshopRepository({
        repository: workshop.repository,
        room: {
            room_kind: workshopRow.room_kind,
            slug: workshopRow.slug,
        },
        supabase: authenticatedRequest.supabase,
    });
    return NextResponse.json({ progress }, { headers: { 'Cache-Control': 'no-store' } });
}
