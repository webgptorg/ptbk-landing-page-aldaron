import { getAdminHostedRecordingContext, getHostedRecordingAsset, getHostedRecordingRevision,
    isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { listHostedRecordingParts } from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string;
    readonly assetId: string }> };

/** A matching file can resume after a browser reload without trusting its name or size alone. */
export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId, assetId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    const asset = revision ? await getHostedRecordingAsset(authorized.supabase, revisionId, assetId) : null;
    if (!asset || !revision) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    if (!['draft', 'failed'].includes(revision.status)) {
        return NextResponse.json({ error: 'Upload is locked' }, { status: 409 });
    }
    if (asset.status === 'complete') return NextResponse.json({ parts: [], isComplete: true },
        { headers: { 'Cache-Control': 'no-store' } });
    try {
        const parts = await listHostedRecordingParts(asset.object_key, asset.upload_id);
        return NextResponse.json({ parts, isComplete: false }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'Upload parts are unavailable' }, { status: 503 });
    }
}
