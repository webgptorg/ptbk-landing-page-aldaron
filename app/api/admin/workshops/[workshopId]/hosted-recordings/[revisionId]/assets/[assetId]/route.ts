import { getAdminHostedRecordingContext, getHostedRecordingAsset, getHostedRecordingRevision,
    HOSTED_RECORDING_ASSET_TABLE, HOSTED_RECORDING_REVISION_TABLE,
    isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { abortHostedRecordingUpload, completeHostedRecordingUpload,
    deleteHostedRecordingObjects } from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string;
    readonly assetId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId, assetId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    const asset = revision ? await getHostedRecordingAsset(authorized.supabase, revisionId, assetId) : null;
    if (!asset || !revision) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    if (!['draft', 'failed'].includes(revision.status)) return NextResponse.json({ error: 'Revision is locked' }, { status: 409 });
    if (asset.status === 'complete') return NextResponse.json({ isComplete: true });
    if (asset.status === 'completing' &&
        Date.now() - Date.parse(asset.completion_started_at ?? '') < 2 * 60 * 1000) {
        return NextResponse.json({ error: 'Upload completion is still running. Retry shortly.' }, { status: 409 });
    }
    if (asset.status === 'uploading') {
        const claimed = await authorized.supabase.from(HOSTED_RECORDING_ASSET_TABLE)
            .update({ status: 'completing', completion_started_at: new Date().toISOString() })
            .eq('id', asset.id).eq('status', 'uploading')
            .select('id').maybeSingle();
        if (claimed.error || !claimed.data) {
            return NextResponse.json({ error: claimed.error?.message ?? 'Upload is being completed' }, { status: 409 });
        }
    }
    try {
        await completeHostedRecordingUpload(asset.object_key, asset.upload_id, asset.byte_length);
        const result = await authorized.supabase.from(HOSTED_RECORDING_ASSET_TABLE)
            .update({ status: 'complete', completion_started_at: null })
            .eq('id', asset.id).eq('status', 'completing');
        if (result.error) throw new Error(result.error.message);
        return NextResponse.json({ isComplete: true });
    } catch (error) {
        await authorized.supabase.from(HOSTED_RECORDING_ASSET_TABLE)
            .update({ status: 'uploading', completion_started_at: null })
            .eq('id', asset.id).eq('status', 'completing');
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload incomplete' }, { status: 422 });
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId, assetId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    const asset = revision ? await getHostedRecordingAsset(authorized.supabase, revisionId, assetId) : null;
    if (!asset || !revision) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    if (!['draft', 'failed'].includes(revision.status)) return NextResponse.json({ error: 'Revision is locked' }, { status: 409 });
    if (asset.status === 'completing') {
        return NextResponse.json({ error: 'This file is completing; retry or cancel the revision.' }, { status: 409 });
    }
    const locked = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE)
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', revisionId).in('status', ['draft', 'failed']).select('id').maybeSingle();
    if (locked.error || !locked.data) {
        return NextResponse.json({ error: locked.error?.message ?? 'Revision changed before deletion' }, { status: 409 });
    }
    try {
        if (asset.status === 'uploading') await abortHostedRecordingUpload(asset.object_key, asset.upload_id);
        else await deleteHostedRecordingObjects([asset.object_key]);
        const result = await authorized.supabase.from(HOSTED_RECORDING_ASSET_TABLE).delete().eq('id', assetId);
        if (result.error) throw new Error(result.error.message);
        return NextResponse.json({ isDeleted: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Deletion failed' }, { status: 500 });
    } finally {
        await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE).update({
            status: 'draft', validation_report: null, player_metadata: null, duration_seconds: null,
            updated_at: new Date().toISOString(),
        }).eq('id', revisionId).eq('status', 'processing');
    }
}
