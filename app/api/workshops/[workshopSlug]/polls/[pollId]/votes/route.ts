import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadWorkshopPolls,
    saveWorkshopPollVote,
} from '@/lib/workshops/workshopDatabase';
import { isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopPollVoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopPollVoteRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly pollId: string }>;
};

/**
 * Records one member's choice in a community poll from either its owner room or an occurrence it is attached to. The
 * database makes the normalized e-mail the one voter identity, so changing an option in either room changes the one
 * shared choice rather than adding another secret vote.
 */
export async function POST(request: NextRequest, context: WorkshopPollVoteRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollVoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Invalid poll vote' }, { status: 400 });
    }

    const { workshopSlug, pollId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (!isWorkshopPollVisibleInRoom(authenticatedRequest.workshopRow.room_kind)) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const voteResult = await saveWorkshopPollVote(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
        pollId,
        parsedResult.data,
    );
    if (!voteResult.isSuccessful) {
        if (voteResult.errorKind === 'not-found') {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }
        if (voteResult.errorKind === 'closed') {
            return NextResponse.json({ error: 'Poll has already ended' }, { status: 409 });
        }
        if (voteResult.errorKind === 'invalid-vote') {
            return NextResponse.json({ error: 'This poll does not accept another option' }, { status: 409 });
        }

        console.error('Failed to save a workshop poll vote:', voteResult.errorMessage);
        return NextResponse.json({ error: 'Poll vote could not be saved' }, { status: 500 });
    }

    const { polls, errorMessage } = await loadWorkshopPolls(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    const updatedPoll = polls.find((currentPoll) => currentPoll.id === pollId);
    if (updatedPoll === undefined) {
        return NextResponse.json({ error: 'Poll could not be loaded' }, { status: 500 });
    }

    await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json({ poll: updatedPoll }, { headers: { 'Cache-Control': 'no-store' } });
}
