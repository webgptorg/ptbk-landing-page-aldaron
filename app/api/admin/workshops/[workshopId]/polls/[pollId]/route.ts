import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_POLL_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopPollAttachmentErrorResponseOrNull } from '@/lib/workshops/workshopPollAttachmentErrors';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopPollUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopPollRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly pollId: string }>;
};

export async function PATCH(request: NextRequest, context: AdminWorkshopPollRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid poll update' },
            { status: 400 },
        );
    }

    const { workshopId, pollId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const { data: updatedPollId, error } = await workshopData.supabase.rpc('update_community_workshop_poll', {
        target_workshop_id: workshopData.workshopRow.id,
        target_poll_id: pollId,
        target_question: parsedResult.data.question,
        target_options: parsedResult.data.options,
        target_is_closed: parsedResult.data.isClosed,
        target_is_visible: parsedResult.data.isVisible,
        target_is_other_option_enabled: parsedResult.data.isOtherOptionEnabled,
        target_attached_workshop_ids: parsedResult.data.attachedWorkshopIds,
    });
    if (error) {
        if (error.code === 'P0001' && error.message === 'WORKSHOP_POLL_NOT_FOUND') {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }
        const attachmentErrorResponse = getWorkshopPollAttachmentErrorResponseOrNull(error);
        if (attachmentErrorResponse !== null) {
            return attachmentErrorResponse;
        }
        if (error.code === '22023') {
            return NextResponse.json({ error: 'Invalid poll update' }, { status: 400 });
        }

        console.error('Failed to update a community poll:', error.message);
        return NextResponse.json({ error: 'Poll could not be updated' }, { status: 500 });
    }
    if (updatedPollId === null) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId: updatedPollId });
}

export async function DELETE(request: NextRequest, context: AdminWorkshopPollRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, pollId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const { data: deletedPoll, error } = await workshopData.supabase
        .from(WORKSHOP_POLL_TABLE_NAME)
        .delete()
        .eq('id', pollId)
        .eq('workshop_id', workshopData.workshopRow.id)
        .select('id')
        .maybeSingle();
    if (error) {
        console.error('Failed to delete a community poll:', error.message);
        return NextResponse.json({ error: 'Poll could not be deleted' }, { status: 500 });
    }
    if (deletedPoll === null) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId: deletedPoll.id });
}
