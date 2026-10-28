import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { moderateCommunityProject } from '@/lib/community-projects/communityProjectModeration';
import {
    communityProjectIdSchema,
    communityProjectModerationSchema,
} from '@/lib/community-projects/communityProjectSchemas';
import { getWorkshopDatabaseOrNull, createWorkshopDatabaseUnavailableResponse } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

type AdminCommunityProjectRouteContext = {
    readonly params: Promise<{ readonly projectId: string }>;
};

/**
 * Uses the same project moderation service as a community moderator, behind the separate administrator session.
 */
export async function PATCH(request: NextRequest, context: AdminCommunityProjectRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { projectId } = await context.params;
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectModerationSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Rozhodnutí o projektu není platné.' }, { status: 400 });
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const { project, errorMessage } = await moderateCommunityProject(supabase, projectId, parsedResult.data.status);
    if (errorMessage !== null) {
        console.error('Failed to moderate community project from administration:', errorMessage);
        return NextResponse.json({ error: 'Projekt se nepodařilo změnit.' }, { status: 500 });
    }
    if (project === null) {
        return NextResponse.json({ error: 'Projekt nebyl nalezen.' }, { status: 404 });
    }

    return NextResponse.json(project, { headers: { 'Cache-Control': 'no-store' } });
}
