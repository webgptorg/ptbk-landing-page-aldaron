import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { connectCommunityProjectDiscussion } from '@/lib/community-projects/communityProjectService';
import {
    isAuthenticatedCommunityRequest,
    getAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { communityProjectIdSchema } from '@/lib/community-projects/communityProjectSchemas';
import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopSessionToken,
    hashWorkshopSessionToken,
    setWorkshopSessionCookie,
} from '@/lib/workshops/workshopSession';
import { NextRequest, NextResponse } from 'next/server';

type CommunityProjectDiscussionConnectRouteContext = {
    readonly params: Promise<{ readonly projectId: string }>;
};

/**
 * This route intentionally lives below `/api/workshops/komunita`: that is the narrow cookie path of the permanent
 * room, which allows us to turn one verified community identity into a project-discussion session without sending
 * community cookies to unrelated workshop endpoints.
 */
export async function POST(request: NextRequest, context: CommunityProjectDiscussionConnectRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const { projectId } = await context.params;
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    const connectedDiscussion = await connectCommunityProjectDiscussion(projectId, authenticatedRequest.participant.id);
    if (connectedDiscussion.connection === null) {
        const isProjectMissing = connectedDiscussion.isProjectMissing;
        if (!isProjectMissing) {
            console.error('Failed to connect community project discussion:', connectedDiscussion.errorMessage);
        }
        return NextResponse.json(
            { error: isProjectMissing ? 'Projekt nebyl nalezen.' : 'Do diskuze projektu se nepodařilo připojit.' },
            { status: isProjectMissing ? 404 : 500 },
        );
    }

    const sessionToken = createWorkshopSessionToken();
    const { error: sessionError } = await authenticatedRequest.supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({ session_token_hash: hashWorkshopSessionToken(sessionToken) })
        .eq('id', connectedDiscussion.connection.discussionParticipantId)
        .eq('workshop_id', connectedDiscussion.connection.discussionWorkshopId);
    if (sessionError) {
        console.error('Failed to create community project discussion session:', sessionError.message);
        return NextResponse.json({ error: 'Do diskuze projektu se nepodařilo připojit.' }, { status: 500 });
    }

    const response = NextResponse.json({ discussionWorkshopSlug: connectedDiscussion.connection.discussionWorkshopSlug });
    setWorkshopSessionCookie(response, connectedDiscussion.connection.discussionWorkshopSlug, sessionToken);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
