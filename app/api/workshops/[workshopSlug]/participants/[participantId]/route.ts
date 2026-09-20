import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    getUnofferedWorkshopParticipantModerationFieldNames,
    isWorkshopParticipantModeratedBy,
} from '@/lib/workshops/workshopModeration';
import {
    findModeratedWorkshopParticipant,
    updateModeratedWorkshopParticipant,
} from '@/lib/workshops/workshopParticipantModeration';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getModeratingWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopParticipantUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopParticipantModerationRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly participantId: string }>;
};

/**
 * Trusts one participant of the room or takes their interactions away, straight from the chat
 *
 * Note: Appointing another moderator is refused here, so the moderators of a room are only ever appointed by the
 *       administration.
 */
export async function PATCH(request: NextRequest, context: WorkshopParticipantModerationRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopParticipantUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Změna účastníka není platná.' }, { status: 400 });
    }

    const { workshopSlug, participantId } = await context.params;
    const moderatingRequest = await getModeratingWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(moderatingRequest)) {
        return moderatingRequest;
    }

    const unofferedFieldNames = getUnofferedWorkshopParticipantModerationFieldNames('moderator', parsedResult.data);
    if (unofferedFieldNames.length > 0) {
        return NextResponse.json({ error: 'Moderátory může jmenovat jen administrace workshopu.' }, { status: 403 });
    }

    const moderatedParticipant = await findModeratedWorkshopParticipant(
        moderatingRequest.supabase,
        moderatingRequest.workshopRow.id,
        participantId,
    );
    if (moderatedParticipant.errorMessage !== null) {
        console.error('Failed to read a moderated workshop participant:', moderatedParticipant.errorMessage);
        return NextResponse.json({ error: 'Účastníka se nepodařilo načíst.' }, { status: 500 });
    }
    if (moderatedParticipant.participant === null) {
        return NextResponse.json({ error: 'Účastník nebyl nalezen.' }, { status: 404 });
    }
    if (!isWorkshopParticipantModeratedBy('moderator', moderatedParticipant.participant)) {
        return NextResponse.json(
            { error: 'Jiného moderátora může měnit jen administrace workshopu.' },
            { status: 403 },
        );
    }

    const { participant, errorMessage } = await updateModeratedWorkshopParticipant(
        moderatingRequest.supabase,
        moderatingRequest.workshopRow.id,
        participantId,
        parsedResult.data,
    );
    if (errorMessage !== null) {
        console.error('Failed to moderate a workshop participant from the room:', errorMessage);
        return NextResponse.json({ error: 'Účastníka se nepodařilo změnit.' }, { status: 500 });
    }
    if (participant === null) {
        return NextResponse.json({ error: 'Účastník nebyl nalezen.' }, { status: 404 });
    }

    // Promotion also approves pending submissions, so refresh their statuses and the author's pending count together.
    await broadcastWorkshopEvent(moderatingRequest.supabase, moderatingRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json(participant, { headers: { 'Cache-Control': 'no-store' } });
}
