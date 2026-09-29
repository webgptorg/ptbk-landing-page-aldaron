import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getAdminHostedRecordingContext, getHostedRecordingAssets, getHostedRecordingRevision,
    HOSTED_RECORDING_ASSET_TABLE, isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { beginHostedRecordingUpload, createHostedRecordingObjectKey, HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES } from
    '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES } from '@/lib/workshops/hostedRecording/hostedRecordingConstants';
import { HOSTED_RECORDING_ASSET_ROLES, HOSTED_RECORDING_VIDEO_ROLES } from
    '@/lib/workshops/hostedRecording/hostedRecordingValidation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string }> };
const ASSET_SCHEMA = z.object({
    role: z.enum(HOSTED_RECORDING_ASSET_ROLES), sourceId: z.string().min(1).max(120).nullable().default(null),
    filename: z.string().min(1).max(255).refine((value) => !/[\\/\x00-\x1f]/.test(value), 'Invalid filename'),
    contentType: z.string().min(1).max(100), byteLength: z.number().int().positive(),
});

export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    if (!await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId))
        return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    const assets = await getHostedRecordingAssets(authorized.supabase, revisionId);
    return NextResponse.json({ assets: assets.map(({ object_key, upload_id, ...asset }) => asset) },
        { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { workshopId, revisionId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    if (!revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    if (!['draft', 'failed'].includes(revision.status)) return NextResponse.json({ error: 'Revision is locked' }, { status: 409 });
    const parsed = ASSET_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const { role, filename, contentType, byteLength, sourceId } = parsed.data;
    const isVideo = HOSTED_RECORDING_VIDEO_ROLES.includes(role as typeof HOSTED_RECORDING_VIDEO_ROLES[number]);
    if (byteLength > (isVideo ? HOSTED_RECORDING_MAXIMUM_MEDIA_BYTES : HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES) ||
        (isVideo ? !['video/mp4', 'video/webm'].includes(contentType) :
            role.startsWith('subtitle-') ? !['text/vtt', 'application/x-subrip', 'text/plain', 'application/json'].includes(contentType) :
                contentType !== 'application/json')) {
        return NextResponse.json({ error: 'Unsupported file size or content type' }, { status: 400 });
    }
    const existingAssets = await getHostedRecordingAssets(authorized.supabase, revisionId);
    const existingAsset = existingAssets.find((candidate) => candidate.role === role);
    if (existingAsset) {
        if (existingAsset.filename !== filename || existingAsset.content_type !== contentType ||
            existingAsset.byte_length !== byteLength || existingAsset.source_id !== sourceId) {
            return NextResponse.json({ error: 'This role already has a different file. Remove it before replacing it.' },
                { status: 409 });
        }
        return NextResponse.json({ asset: { id: existingAsset.id, role, status: existingAsset.status,
            byte_length: existingAsset.byte_length } }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const assetId = crypto.randomUUID();
    const objectKey = createHostedRecordingObjectKey(workshopId, revisionId, assetId);
    let uploadId: string;
    try { uploadId = await beginHostedRecordingUpload(objectKey, contentType); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload could not start' }, { status: 503 }); }
    const result = await authorized.supabase.from(HOSTED_RECORDING_ASSET_TABLE).insert({
        id: assetId, revision_id: revisionId, role, source_id: sourceId, filename,
        content_type: contentType, byte_length: byteLength, object_key: objectKey, upload_id: uploadId,
    }).select('id, role, status, byte_length').single();
    if (result.error) {
        const { abortHostedRecordingUpload } = await import('@/lib/workshops/hostedRecording/hostedRecordingStorage');
        await abortHostedRecordingUpload(objectKey, uploadId).catch(() => undefined);
        return NextResponse.json({ error: result.error.message }, { status: result.error.code === '23505' ? 409 : 500 });
    }
    return NextResponse.json({ asset: result.data }, { status: 201 });
}
