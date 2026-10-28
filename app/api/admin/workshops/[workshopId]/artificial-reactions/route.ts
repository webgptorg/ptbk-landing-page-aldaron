import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import { createWorkshopReaction } from '@/lib/workshops/workshopDatabase';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { workshopArtificialReactionSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type AdminWorkshopArtificialReactionsRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

export async function POST(request: NextRequest, context: AdminWorkshopArtificialReactionsRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopArtificialReactionSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Artificial reaction must contain 1 to 16 characters' }, { status: 400 });
    }

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) {
        return workshopData.response;
    }

    const createdReaction = await createWorkshopReaction(
        workshopData.supabase,
        workshopId,
        null,
        parsedResult.data.emoji,
    );
    if (createdReaction.reaction === null) {
        console.error('Failed to send an artificial workshop reaction:', createdReaction.errorMessage);
        return NextResponse.json({ error: 'Artificial reaction could not be sent' }, { status: 500 });
    }

    await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, {
        kind: 'reaction',
        reaction: createdReaction.reaction,
        reactionCount: createdReaction.reactionCount,
    });
    return NextResponse.json(
        { reaction: createdReaction.reaction, reactionCount: createdReaction.reactionCount },
        { status: 201 },
    );
}
