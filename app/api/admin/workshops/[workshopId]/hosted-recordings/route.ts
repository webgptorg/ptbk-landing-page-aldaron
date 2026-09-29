import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminHostedRecordingContext, HOSTED_RECORDING_REVISION_TABLE,
    isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { getHostedRecordingStorage } from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

type RouteContext = { readonly params: Promise<{ readonly workshopId: string }> };
const CREATE_SCHEMA = z.object({ liveStartAt: z.string().datetime({ offset: true }) });

export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const result = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE)
        .select('id, status, live_start_at, duration_seconds, validation_report, published_at, created_at')
        .eq('workshop_id', workshopId).order('created_at', { ascending: false }).limit(20);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ revisions: result.data, publishedRevisionId: authorized.workshop.hosted_recording_revision_id ?? null },
        { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const parsed = CREATE_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    try { getHostedRecordingStorage(); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Storage unavailable' }, { status: 503 }); }
    const result = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE)
        .insert({ workshop_id: workshopId, live_start_at: parsed.data.liveStartAt }).select('*').single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ revision: result.data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

/** Removing the current pointer is atomic; immutable media is retained for controlled cleanup. */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const { workshopId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const result = await authorized.supabase.rpc('remove_workshop_hosted_recording', { target_workshop_id: workshopId });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 409 });
    await broadcastWorkshopEvent(authorized.supabase, authorized.workshop, { kind: 'state-changed' });
    return NextResponse.json({ isRemoved: true });
}
