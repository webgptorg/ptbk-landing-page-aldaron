import { isCommunityEmailVerificationRequired } from '@/lib/community-membership/communityMembershipIdentity';
import { writeCommunityArticleSessionCookie } from '@/lib/community-membership/communityArticleSessionCookie';
import { loadWorkshopPublicState } from '@/lib/workshops/workshopDatabase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { readWorkshopSessionToken } from '@/lib/workshops/workshopSession';
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
        !isCommunityEmailVerificationRequired(request, authenticatedRequest.participant.email),
    );

    if (state === null) {
        console.error('Failed to load workshop state:', errorMessage);
        return NextResponse.json({ error: 'Workshop state could not be loaded' }, { status: 500 });
    }

    scheduleWorkshopAgentWork(authenticatedRequest.workshopRow.id);
    const response = NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
    if (authenticatedRequest.workshopRow.room_kind === 'community') {
        writeCommunityArticleSessionCookie(response, workshopSlug, readWorkshopSessionToken(request, workshopSlug));
    }
    return response;
}
