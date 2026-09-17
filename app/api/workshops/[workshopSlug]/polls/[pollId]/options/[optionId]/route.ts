import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { getUnofferedWorkshopPollOptionModerationFieldNames } from '@/lib/workshops/workshopModeration';
import { moderateWorkshopPollOption } from '@/lib/workshops/workshopPollOptionModeration';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getModeratingWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopPollOptionUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopPollOptionRouteContext = {
    readonly params: Promise<{
        readonly workshopSlug: string;
        readonly pollId: string;
        readonly optionId: string;
    }>;
};

/**
 * Decides about one member-written poll answer straight from the room, so a moderator never leaves the poll they are
 * moderating.
 *
 * Note: A poll belongs to the room which administers it. An occurrence the poll is merely about shows and votes on it,
 *       so a moderator there is refused here exactly as the database refuses it.
 */
export async function PATCH(request: NextRequest, context: WorkshopPollOptionRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollOptionUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Změna vlastní odpovědi není platná.' }, { status: 400 });
    }

    const { workshopSlug, pollId, optionId } = await context.params;
    const moderatingRequest = await getModeratingWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(moderatingRequest)) {
        return moderatingRequest;
    }
    if (!getWorkshopKindCapabilities(moderatingRequest.workshopRow.room_kind).isPollsOffered) {
        return NextResponse.json({ error: 'Ankety se spravují v komunitě.' }, { status: 404 });
    }

    const unofferedFieldNames = getUnofferedWorkshopPollOptionModerationFieldNames('moderator', parsedResult.data);
    if (unofferedFieldNames.length > 0) {
        return NextResponse.json(
            { error: `Moderátor nemůže měnit: ${unofferedFieldNames.join(', ')}.` },
            { status: 403 },
        );
    }

    const moderationResult = await moderateWorkshopPollOption(
        moderatingRequest.supabase,
        moderatingRequest.workshopRow.id,
        pollId,
        optionId,
        parsedResult.data,
    );
    if (!moderationResult.isSuccessful) {
        if (moderationResult.errorKind === 'not-found') {
            return NextResponse.json({ error: 'Vlastní odpověď nebyla nalezena.' }, { status: 404 });
        }
        if (moderationResult.errorKind === 'invalid') {
            return NextResponse.json({ error: 'Změna vlastní odpovědi není platná.' }, { status: 400 });
        }

        console.error('Failed to moderate a poll answer from the room:', moderationResult.errorMessage);
        return NextResponse.json({ error: 'Vlastní odpověď se nepodařilo změnit.' }, { status: 500 });
    }

    await broadcastWorkshopEvent(moderatingRequest.supabase, moderatingRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json(
        { pollId, optionId: moderationResult.optionId },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
