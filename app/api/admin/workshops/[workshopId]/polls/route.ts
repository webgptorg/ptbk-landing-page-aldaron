import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopPollAttachmentErrorResponseOrNull } from '@/lib/workshops/workshopPollAttachmentErrors';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopPollCreateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopPollsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

/**
 * Creates a complete poll through the database transaction which writes its choices as well. This is deliberately an
 * admin-session route: a moderator of the chat can guide the discussion, but cannot create an organisation-wide poll.
 */
export async function POST(request: NextRequest, context: AdminWorkshopPollsRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Invalid poll' },
            { status: 400 },
        );
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }
    if (!getWorkshopKindCapabilities(workshopData.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const { data: pollId, error } = await workshopData.supabase.rpc('create_community_workshop_poll', {
        target_workshop_id: workshopData.workshopRow.id,
        target_question: parsedResult.data.question,
        target_options: parsedResult.data.options,
        target_is_closed: parsedResult.data.isClosed,
        target_is_visible: parsedResult.data.isVisible,
        target_is_other_option_enabled: parsedResult.data.isOtherOptionEnabled,
        target_attached_workshop_ids: parsedResult.data.attachedWorkshopIds,
    });
    if (error || pollId === null) {
        const attachmentErrorResponse = getWorkshopPollAttachmentErrorResponseOrNull(error);
        if (attachmentErrorResponse !== null) {
            return attachmentErrorResponse;
        }

        console.error('Failed to create a community poll:', error?.message ?? 'No poll ID returned');
        return NextResponse.json({ error: error?.message ?? 'Poll could not be created' }, { status: 500 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId }, { status: 201 });
}
