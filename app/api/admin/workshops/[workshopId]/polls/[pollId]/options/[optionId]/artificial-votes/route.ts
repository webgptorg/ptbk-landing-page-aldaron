import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopPollOptionArtificialVoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopPollOptionArtificialVotesRouteContext = {
    readonly params: Promise<{ readonly workshopId: string; readonly pollId: string; readonly optionId: string }>;
};

/**
 * Changes only the explicitly seeded aggregate of a choice. No imaginary member is written, so the poll's ordinary
 * one-choice-per-member rule and its anonymous member result remain intact.
 */
export async function POST(
    request: NextRequest,
    context: AdminWorkshopPollOptionArtificialVotesRouteContext,
) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollOptionArtificialVoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: 'Artificial vote adjustment must be a non-zero whole number' },
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

    const { data: artificialVoteCount, error } = await workshopData.supabase.rpc(
        'adjust_community_workshop_poll_option_artificial_votes',
        {
            target_workshop_id: workshopData.workshopRow.id,
            target_poll_id: pollId,
            target_option_id: optionId,
            target_adjustment: parsedResult.data.artificialVoteAdjustment,
        },
    );
    if (error) {
        if (error.code === 'P0001' && error.message === 'WORKSHOP_POLL_OPTION_NOT_FOUND') {
            return NextResponse.json({ error: 'Poll option not found' }, { status: 404 });
        }
        if (error.code === '22023') {
            return NextResponse.json({ error: 'Artificial vote adjustment is outside the supported range' }, { status: 400 });
        }

        console.error('Failed to adjust artificial community poll votes:', error.message);
        return NextResponse.json({ error: 'Artificial poll votes could not be changed' }, { status: 500 });
    }
    if (artificialVoteCount === null) {
        return NextResponse.json({ error: 'Poll option not found' }, { status: 404 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, { kind: 'state-changed' });
    return NextResponse.json({ pollId, optionId, artificialVoteCount });
}
