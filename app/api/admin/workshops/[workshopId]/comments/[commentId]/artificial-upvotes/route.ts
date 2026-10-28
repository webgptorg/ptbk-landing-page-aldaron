import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getDisplayedWorkshopCommentUpvoteCount } from '@/lib/workshops/workshopCommentValues';
import { MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT, WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopCommentArtificialUpvoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopArtificialUpvotesRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly commentId: string }>;
};

type WorkshopCommentUpvoteRow = {
    readonly id: string;
    readonly upvote_count: number;
    readonly artificial_upvote_count: number;
};

export async function POST(request: NextRequest, context: AdminWorkshopArtificialUpvotesRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentArtificialUpvoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Artificial upvote adjustment must be a non-zero whole number' }, { status: 400 });
    }

    const { workshopId, commentId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const { data: currentComment, error: currentCommentError } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, upvote_count, artificial_upvote_count')
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .maybeSingle();
    if (currentCommentError) {
        return NextResponse.json({ error: 'Artificial upvotes could not be loaded' }, { status: 500 });
    }
    if (currentComment === null) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const typedCurrentComment = currentComment as WorkshopCommentUpvoteRow;
    const nextArtificialUpvoteCount =
        typedCurrentComment.artificial_upvote_count + parsedResult.data.artificialUpvoteAdjustment;
    if (
        !Number.isSafeInteger(nextArtificialUpvoteCount) ||
        Math.abs(nextArtificialUpvoteCount) > MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT
    ) {
        return NextResponse.json({ error: 'Artificial upvote adjustment is outside the supported range' }, { status: 400 });
    }

    // Do not depend on a PostgREST RPC cache for this critical admin action.
    // The compare-and-set condition preserves an administrator's change when
    // two tabs submit an adjustment at the same time.
    const { data: updatedComment, error: updateError } = await workshopData.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .update({ artificial_upvote_count: nextArtificialUpvoteCount })
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .eq('artificial_upvote_count', typedCurrentComment.artificial_upvote_count)
        .select('id, upvote_count, artificial_upvote_count')
        .maybeSingle();
    if (updateError) {
        console.error('Failed to adjust artificial workshop upvotes:', updateError.message);
        return NextResponse.json({ error: 'Artificial upvotes could not be changed' }, { status: 500 });
    }
    if (updatedComment === null) {
        return NextResponse.json({ error: 'Artificial upvotes changed in another tab. Try again.' }, { status: 409 });
    }

    const typedUpdatedComment = updatedComment as WorkshopCommentUpvoteRow;

    const upvoteCount = getDisplayedWorkshopCommentUpvoteCount(
        typedUpdatedComment.upvote_count,
        typedUpdatedComment.artificial_upvote_count,
    );
    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, {
        kind: 'upvote',
        commentId: typedUpdatedComment.id,
        upvoteCount,
    });
    return NextResponse.json({
        commentId: typedUpdatedComment.id,
        upvoteCount,
        artificialUpvoteCount: typedUpdatedComment.artificial_upvote_count,
    });
}
