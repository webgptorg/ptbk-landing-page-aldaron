import { loadWorkshopPublicState } from '@/lib/workshops/workshopDatabase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import type { WorkshopCommentSort } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { scheduleWorkshopAgentWork } from '@/lib/workshops/agents/scheduleWorkshopAgentWork';

export const maxDuration = 60;

type WorkshopStateRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

export async function GET(request: NextRequest, context: WorkshopStateRouteContext) {
    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const requestedSort = request.nextUrl.searchParams.get('sort');
    const commentSort: WorkshopCommentSort = requestedSort === 'upvotes' ? 'upvotes' : 'recent';
    const { state, errorMessage } = await loadWorkshopPublicState(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
        commentSort,
    );

    if (state === null) {
        console.error('Failed to load workshop state:', errorMessage);
        return NextResponse.json({ error: 'Workshop state could not be loaded' }, { status: 500 });
    }

    scheduleWorkshopAgentWork(authenticatedRequest.workshopRow.id);
    return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
}
