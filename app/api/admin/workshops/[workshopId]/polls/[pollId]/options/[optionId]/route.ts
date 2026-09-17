import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import {
    deleteWorkshopPollOption,
    moderateWorkshopPollOption,
    type WorkshopPollOptionModerationResult,
} from '@/lib/workshops/workshopPollOptionModeration';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopPollOptionUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopPollOptionRouteContext = {
    readonly params: Promise<{
        readonly workshopId: string;
        readonly pollId: string;
        readonly optionId: string;
    }>;
};

/**
 * Says why one member-written answer could not be moderated, in the words of the administration
 */
function createFailedPollOptionResponse(
    result: Extract<WorkshopPollOptionModerationResult, { readonly isSuccessful: false }>,
): NextResponse {
    if (result.errorKind === 'not-found') {
        return NextResponse.json({ error: 'Poll option not found' }, { status: 404 });
    }
    if (result.errorKind === 'duplicate') {
        return NextResponse.json({ error: 'Another answer of this poll already says that' }, { status: 409 });
    }
    if (result.errorKind === 'invalid') {
        return NextResponse.json({ error: 'Invalid poll option update' }, { status: 400 });
    }

    console.error('Failed to moderate a member-written community poll answer:', result.errorMessage);
    return NextResponse.json({ error: 'Poll option could not be changed' }, { status: 500 });
}

/**
 * Approves, rejects, or corrects one answer a member wrote into a community poll.
 */
export async function PATCH(request: NextRequest, context: AdminWorkshopPollOptionRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollOptionUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid poll option update' },
            { status: 400 },
        );
    }

    const { workshopId, pollId, optionId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    // Note: The administration may moderate an answer every way there is, so nothing of the request is held back here.
    const moderationResult = await moderateWorkshopPollOption(
        workshopData.supabase,
        workshopData.workshopRow.id,
        pollId,
        optionId,
        parsedResult.data,
    );
    if (!moderationResult.isSuccessful) {
        return createFailedPollOptionResponse(moderationResult);
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId, optionId: moderationResult.optionId });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopPollOptionRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, pollId, optionId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const deletionResult = await deleteWorkshopPollOption(
        workshopData.supabase,
        workshopData.workshopRow.id,
        pollId,
        optionId,
    );
    if (!deletionResult.isSuccessful) {
        return createFailedPollOptionResponse(deletionResult);
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId, optionId: deletionResult.optionId });
}
