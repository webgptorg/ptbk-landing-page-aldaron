import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminWorkshopDataOrResponse } from '@/lib/workshops/workshopAdminRequest';
import {
    loadWorkshopParticipantTrustSummary,
    saveWorkshopAutomaticParticipantTrust,
    trustAllWorkshopParticipants,
} from '@/lib/workshops/workshopParticipantTrustPolicy';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { scheduleWorkshopAgentWork } from '@/lib/workshops/agents/scheduleWorkshopAgentWork';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type AdminWorkshopParticipantTrustRouteContext = {
    readonly params: Promise<{ readonly workshopId: string }>;
};

const AUTOMATIC_TRUST_SETTING_SCHEMA = z.object({ isAutomaticTrustEnabled: z.boolean() }).strict();
const BULK_TRUST_CONFIRMATION_SCHEMA = z.object({ eligibilityToken: z.string().regex(/^[a-f0-9]{32}$/) }).strict();

export async function GET(request: NextRequest, context: AdminWorkshopParticipantTrustRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData.response;

    try {
        const summary = await loadWorkshopParticipantTrustSummary(workshopData.supabase, workshopId);
        return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, context: AdminWorkshopParticipantTrustRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const parsed = AUTOMATIC_TRUST_SETTING_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Automatic trust setting is invalid' }, { status: 400 });

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData.response;

    try {
        const summary = await saveWorkshopAutomaticParticipantTrust(
            workshopData.supabase,
            workshopId,
            parsed.data.isAutomaticTrustEnabled,
        );
        return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest, context: AdminWorkshopParticipantTrustRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) return unauthorizedResponse;

    const parsed = BULK_TRUST_CONFIRMATION_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Bulk trust confirmation is invalid' }, { status: 400 });

    const { workshopId } = await context.params;
    const workshopData = await getAdminWorkshopDataOrResponse(workshopId);
    if ('response' in workshopData) return workshopData.response;

    try {
        const result = await trustAllWorkshopParticipants(
            workshopData.supabase,
            workshopId,
            parsed.data.eligibilityToken,
        );
        if (result.isStale) {
            const summary = await loadWorkshopParticipantTrustSummary(workshopData.supabase, workshopId);
            return NextResponse.json({ kind: 'stale', summary });
        }

        if (result.changedCount > 0) {
            try {
                scheduleWorkshopAgentWork(workshopId);
            } catch (error) {
                console.error('Failed to schedule agents after bulk participant trust:', error);
            }
            try {
                await broadcastWorkshopEvent(workshopData.supabase, workshopData.workshopRow, {
                    kind: 'state-changed',
                });
            } catch (error) {
                // The committed role change stays the source of truth; the room also refreshes periodically.
                console.error('Failed to notify a workshop after bulk participant trust:', error);
            }
        }
        // The role change has already committed. A later read failure must not make the client mistake that
        // successful mutation for a failed one or invite it to retry the same sensitive action.
        const summary = await loadWorkshopParticipantTrustSummary(workshopData.supabase, workshopId).catch((error) => {
            console.error('Failed to refresh workshop participant trust counts after promotion:', error);
            return null;
        });
        return NextResponse.json({ kind: 'completed', changedCount: result.changedCount, summary });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
