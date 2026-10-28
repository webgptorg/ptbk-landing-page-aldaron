import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadWorkshopCommentReference,
    updateWorkshopStageComment,
} from '@/lib/workshops/workshopDatabase';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopStageCommentSchema } from '@/lib/workshops/workshopSchemas';
import type { WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopStageCommentRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * Selects the one comment everyone sees above the live stream, or clears it when the host is ready for the next one.
 */
export async function POST(request: NextRequest, context: AdminWorkshopStageCommentRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopStageCommentSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Stage comment must name a comment or be cleared' }, { status: 400 });
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isStageOffered) {
        return NextResponse.json({ error: 'This room has no stage' }, { status: 400 });
    }

    const { commentId } = parsedResult.data;
    let stageComment: WorkshopCommentReference | null = null;
    if (commentId !== null) {
        const loadedComment = await loadWorkshopCommentReference(workshopData.supabase, workshopId, commentId);
        if (loadedComment.errorMessage !== null) {
            console.error('Failed to load the comment selected for a workshop stage:', loadedComment.errorMessage);
            return NextResponse.json({ error: 'Stage comment could not be selected' }, { status: 500 });
        }
        if (loadedComment.comment === null) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        stageComment = loadedComment.comment;
    }

    const { errorMessage } = await updateWorkshopStageComment(workshopData.supabase, workshopId, commentId);
    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, {
        kind: 'stage-comment',
        stageComment,
    });
    return NextResponse.json({ stageComment });
}
