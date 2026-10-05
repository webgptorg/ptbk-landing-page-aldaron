import {
    getStudioAssetContext,
    isStudioOperationLeased,
    STUDIO_MEDIA_ASSET_TABLE,
    STUDIO_MEDIA_REFERENCE_TABLE,
    studioControlResponse,
} from '@/lib/recording-studio/studioAssetServer';
import {
    abortHostedRecordingUpload,
    completeHostedRecordingUpload,
    listHostedRecordingParts,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { verifyStudioStoredAsset } from '@/lib/recording-studio/studioAssetS3';
import { STUDIO_UPLOAD_PART_BYTES } from '@/lib/recording-studio/studioAssetUploadTypes';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;
type RouteContext = { readonly params: Promise<{ readonly assetId: string }> };

export async function GET(request: NextRequest, route: RouteContext) {
    const context = await getStudioAssetContext(request, (await route.params).assetId);
    if ('response' in context) return context.response;
    const asset = context.asset!;
    if (asset.status === 'verified') return studioControlResponse({ status: 'verified', parts: [] });
    if (asset.status !== 'uploading')
        return studioControlResponse({
            status: asset.status,
            isOperationLeased: isStudioOperationLeased(asset),
            parts: [],
        });
    try {
        return studioControlResponse({
            status: asset.status,
            parts: await listHostedRecordingParts(asset.object_key, asset.upload_id!),
        });
    } catch {
        return studioControlResponse(
            { error: 'Object storage parts could not be reconciled. The local source remains available.' },
            503,
        );
    }
}

export async function POST(request: NextRequest, route: RouteContext) {
    const context = await getStudioAssetContext(request, (await route.params).assetId);
    if ('response' in context) return context.response;
    const asset = context.asset!;
    if (asset.status === 'verified') return studioControlResponse({ status: 'verified' });
    if (!['uploading', 'completing'].includes(asset.status) || !asset.upload_id)
        return studioControlResponse({ error: 'Upload cannot be completed.' }, 409);
    if (asset.status === 'completing' && isStudioOperationLeased(asset))
        return studioControlResponse({ error: 'Verification is already running. Retry shortly.' }, 409);
    const token = crypto.randomUUID();
    let claim = context.database
        .from(STUDIO_MEDIA_ASSET_TABLE)
        .update({
            status: 'completing',
            operation_token: token,
            operation_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', asset.id)
        .eq('status', asset.status);
    claim =
        asset.operation_token === null
            ? claim.is('operation_token', null)
            : claim.eq('operation_token', asset.operation_token);
    const claimed = await claim.select('id').maybeSingle();
    if (claimed.error || !claimed.data)
        return studioControlResponse({ error: 'Completion was claimed by another request.' }, 409);
    try {
        // Validate each immutable expected part, including its exact length, before completing the object.
        // A lost completion response is recoverable via the object HEAD/checksum verification below.
        try {
            const parts = await listHostedRecordingParts(asset.object_key, asset.upload_id);
            if (
                parts.length !== asset.part_checksums.length ||
                parts.some(
                    (part, index) =>
                        part.partNumber !== index + 1 ||
                        part.byteLength !==
                            Math.min(STUDIO_UPLOAD_PART_BYTES, asset.byte_length - index * STUDIO_UPLOAD_PART_BYTES) ||
                        part.checksumSha256 !== asset.part_checksums[index],
                )
            )
                throw new Error('Uploaded part lengths/checksums do not match the source.');
            await completeHostedRecordingUpload(
                asset.object_key,
                asset.upload_id,
                asset.byte_length,
                asset.part_checksums,
            );
        } catch (error) {
            // Fail closed unless storage independently proves the full immutable object is already complete.
            await verifyStudioStoredAsset(asset).catch(() => {
                throw error;
            });
        }
        await verifyStudioStoredAsset(asset);
        const result = await context.database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .update({
                status: 'verified',
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                operation_token: null,
                operation_started_at: null,
            })
            .eq('id', asset.id)
            .eq('status', 'completing')
            .eq('operation_token', token)
            .select('id')
            .maybeSingle();
        if (result.error || !result.data)
            return studioControlResponse({ error: 'Completion lease changed; source conversion was refused.' }, 409);
        return studioControlResponse({ status: 'verified' });
    } catch (error) {
        await context.database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .update({
                status: 'uploading',
                operation_token: null,
                operation_started_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', asset.id)
            .eq('status', 'completing')
            .eq('operation_token', token);
        return studioControlResponse({ error: error instanceof Error ? error.message : 'Verification failed.' }, 422);
    }
}

export async function DELETE(request: NextRequest, route: RouteContext) {
    const context = await getStudioAssetContext(request, (await route.params).assetId);
    if ('response' in context) return context.response;
    const asset = context.asset!;
    if (!['uploading', 'cancelled'].includes(asset.status))
        return studioControlResponse(
            { error: 'This object is being finalized or already verified. Local sources remain unchanged.' },
            409,
        );
    if (asset.status === 'uploading') {
        const result = await context.database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', asset.id)
            .eq('status', 'uploading')
            .select('id')
            .maybeSingle();
        if (result.error || !result.data)
            return studioControlResponse({ error: 'Completion won the cancellation race; refresh its state.' }, 409);
    }
    // No project can adopt a cancelled object. Retaining pending registration references would leak it forever.
    const references = await context.database.from(STUDIO_MEDIA_REFERENCE_TABLE).delete().eq('asset_id', asset.id);
    if (references.error)
        return studioControlResponse({ error: 'Cancellation is registered; reference cleanup needs a retry.' }, 503);
    try {
        if (asset.upload_id) await abortHostedRecordingUpload(asset.object_key, asset.upload_id);
    } catch {
        return studioControlResponse(
            { error: 'Cancellation is registered; storage abort will be retried by cleanup.' },
            503,
        );
    }
    return studioControlResponse({ isCancelled: true });
}
