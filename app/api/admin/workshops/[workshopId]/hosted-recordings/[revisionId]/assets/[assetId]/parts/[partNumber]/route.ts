import { createHash } from 'node:crypto';
import { getAdminHostedRecordingContext, getHostedRecordingAsset, getHostedRecordingRevision,
    HOSTED_RECORDING_REVISION_TABLE,
    isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { HOSTED_RECORDING_PART_BYTES, uploadHostedRecordingPart } from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string;
    readonly assetId: string; readonly partNumber: string }> };

/** Each request is independently authorized, bounded and checksummed before it reaches private object storage. */
export async function PUT(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId, assetId, partNumber: writtenPartNumber } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    const asset = revision ? await getHostedRecordingAsset(authorized.supabase, revisionId, assetId) : null;
    if (!asset || !revision) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    if (!['draft', 'failed'].includes(revision.status) || asset.status !== 'uploading')
        return NextResponse.json({ error: 'Upload is locked' }, { status: 409 });
    const partNumber = Number(writtenPartNumber);
    const partCount = Math.ceil(asset.byte_length / HOSTED_RECORDING_PART_BYTES);
    const expectedBytes = partNumber < partCount ? HOSTED_RECORDING_PART_BYTES :
        asset.byte_length - (partCount - 1) * HOSTED_RECORDING_PART_BYTES;
    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > partCount ||
        Number(request.headers.get('content-length')) !== expectedBytes || !request.body) {
        return NextResponse.json({ error: 'Invalid chunk size or number' }, { status: 400 });
    }
    const bytes = new Uint8Array(expectedBytes);
    const reader = request.body.getReader();
    let offset = 0;
    try {
        while (true) {
            const result = await reader.read();
            if (result.done) break;
            if (offset + result.value.byteLength > expectedBytes) throw new Error('Chunk exceeds its declared size.');
            bytes.set(result.value, offset);
            offset += result.value.byteLength;
        }
        if (offset !== expectedBytes) throw new Error('Chunk is incomplete.');
        const checksum = createHash('sha256').update(bytes).digest('base64');
        if (request.headers.get('x-chunk-sha256') !== checksum) throw new Error('Chunk checksum mismatch.');
        await uploadHostedRecordingPart(asset.object_key, asset.upload_id, partNumber, bytes);
        const touched = await authorized.supabase.from(HOSTED_RECORDING_REVISION_TABLE).update({
            updated_at: new Date().toISOString(),
        }).eq('id', revisionId).in('status', ['draft', 'failed']).select('id').maybeSingle();
        if (touched.error || !touched.data) throw new Error('The recording revision changed during upload.');
        return NextResponse.json({ uploadedPartNumber: partNumber }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Chunk upload failed' }, { status: 422 });
    } finally { reader.releaseLock(); }
}
