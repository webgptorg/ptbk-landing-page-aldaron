import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAdminHostedRecordingContext, getHostedRecordingAssets, getHostedRecordingRevision,
    HOSTED_RECORDING_REVISION_TABLE, isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { abortHostedRecordingUpload, deleteHostedRecordingObjects } from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { validateHostedRecordingAssets } from '@/lib/workshops/hostedRecording/hostedRecordingValidation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 300;
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string }> };
const ACTION_SCHEMA = z.object({ action: z.enum(['verify', 'publish', 'cancel']) });

export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    if (!revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    const assets = await getHostedRecordingAssets(authorized.supabase, revisionId);
    return NextResponse.json({ revision, assets: assets.map(({ object_key, upload_id, ...asset }) => asset) },
        { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    if (!revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    const parsed = ACTION_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    if (parsed.data.action === 'verify') {
        if (!['draft', 'failed'].includes(revision.status)) return NextResponse.json({ error: 'Revision cannot be verified now' }, { status: 409 });
        const lock = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE)
            .update({ status: 'processing', updated_at: new Date().toISOString() })
            .eq('id', revisionId).in('status', ['draft', 'failed']).select('id').maybeSingle();
        if (lock.error || !lock.data) return NextResponse.json({ error: lock.error?.message ?? 'Revision is already processing' }, { status: 409 });
        let report;
        let playerMetadata;
        try {
            const assets = await getHostedRecordingAssets(authorized.supabase, revisionId);
            ({ report, playerMetadata } = await validateHostedRecordingAssets(assets, revision.live_start_at));
            if (report.isValid && playerMetadata) {
                const workshopStartMilliseconds = Date.parse(authorized.workshop.starts_at);
                const workshopEndMilliseconds = authorized.workshop.ends_at === null ? null :
                    Date.parse(authorized.workshop.ends_at);
                const isAnyLiveSegmentOverlapping = playerMetadata.liveSegments.some((segment) => {
                    const segmentStartMilliseconds = Date.parse(segment.startsAt);
                    const segmentEndMilliseconds = segmentStartMilliseconds +
                        (segment.endSeconds - segment.startSeconds) * 1000;
                    return segmentEndMilliseconds > workshopStartMilliseconds &&
                        (workshopEndMilliseconds === null || segmentStartMilliseconds < workshopEndMilliseconds);
                });
                if (!isAnyLiveSegmentOverlapping) {
                    report = { ...report, isValid: false,
                        errors: [...report.errors, 'Hosted session time does not overlap the workshop.'] };
                    playerMetadata = null;
                }
            }
        } catch (error) {
            report = { isValid: false, errors: [error instanceof Error ? error.message : 'Recording validation failed'],
                warnings: [], durationSeconds: null, tracks: [] };
            playerMetadata = null;
        }
        const result = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE).update({
            status: report.isValid ? 'ready' : 'failed', duration_seconds: report.durationSeconds,
            validation_report: report, player_metadata: report.isValid ? playerMetadata : null,
            updated_at: new Date().toISOString(),
        }).eq('id', revisionId).eq('status', 'processing');
        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
        return NextResponse.json({ report, status: report.isValid ? 'ready' : 'failed' }, { status: report.isValid ? 200 : 422 });
    }
    if (parsed.data.action === 'publish') {
        if (revision.status !== 'ready' || !revision.validation_report?.isValid || !revision.player_metadata)
            return NextResponse.json({ error: 'Validate the recording before publication' }, { status: 409 });
        const result = await authorized.supabase.rpc('publish_workshop_hosted_recording', { target_revision_id: revisionId });
        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 409 });
        await broadcastWorkshopEvent(authorized.supabase, authorized.workshop, { kind: 'state-changed' });
        return NextResponse.json({ isPublished: true, revisionId });
    }
    if (!['draft', 'failed', 'ready'].includes(revision.status))
        return NextResponse.json({ error: 'A published revision cannot be cancelled' }, { status: 409 });
    const cancelled = await authorized.supabase.rpc('cancel_workshop_hosted_recording', {
        target_revision_id: revisionId,
    });
    if (cancelled.error || cancelled.data !== true) {
        return NextResponse.json({ error: cancelled.error?.message ?? 'Revision changed before cancellation' }, { status: 409 });
    }
    const assets = await getHostedRecordingAssets(authorized.supabase, revisionId);
    try {
        await Promise.all(assets.filter((asset) => asset.status !== 'complete')
            .map((asset) => abortHostedRecordingUpload(asset.object_key, asset.upload_id).catch(() => undefined)));
        await deleteHostedRecordingObjects(assets.map((asset) => asset.object_key));
        return NextResponse.json({ isCancelled: true });
    } catch (error) {
        console.error('Cancelled recording awaits storage cleanup:', error);
        return NextResponse.json({ isCancelled: true, isCleanupPending: true });
    }
}
