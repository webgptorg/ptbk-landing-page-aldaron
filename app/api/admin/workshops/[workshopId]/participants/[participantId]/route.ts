import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { deleteCommunityParticipantWithProjectVotes } from '@/lib/community-projects/communityProjectService';
import { WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopParticipantUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { updateModeratedWorkshopParticipant } from '@/lib/workshops/workshopParticipantModeration';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopParticipantRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly participantId: string }>;
};

export async function PATCH(request: NextRequest, context: AdminWorkshopParticipantRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopParticipantUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Participant update is invalid' }, { status: 400 });
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    // Note: The administration may write every moderation state there is, including who moderates the room itself.
    const { participant, errorMessage } = await updateModeratedWorkshopParticipant(
        workshopData.supabase,
        workshopId,
        participantId,
        parsedResult.data,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    if (participant === null) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json(participant);
}

export async function DELETE(request: NextRequest, context: AdminWorkshopParticipantRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const { workshopId, participantId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    let deletedParticipantId: string;
    if (workshopData.workshopRow.room_kind === 'community') {
        const deletedCommunityParticipant = await deleteCommunityParticipantWithProjectVotes(participantId);
        if (deletedCommunityParticipant.participantId === null) {
            if (!deletedCommunityParticipant.isParticipantMissing) {
                console.error(
                    'Failed to delete a community participant and reconcile their project votes:',
                    deletedCommunityParticipant.errorMessage,
                );
            }

            return NextResponse.json(
                {
                    error: deletedCommunityParticipant.isParticipantMissing
                        ? 'Participant not found'
                        : 'Participant could not be deleted',
                },
                { status: deletedCommunityParticipant.isParticipantMissing ? 404 : 500 },
            );
        }

        deletedParticipantId = deletedCommunityParticipant.participantId;
    } else {
        const { data, error } = await workshopData.supabase
            .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
            .delete()
            .eq('id', participantId)
            .eq('workshop_id', workshopId)
            .select('id')
            .maybeSingle();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (data === null) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        deletedParticipantId = data.id;
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ participantId: deletedParticipantId });
}
