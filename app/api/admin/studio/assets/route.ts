import { STUDIO_ASSET_REGISTRATION_SCHEMA } from '@/lib/recording-studio/studioAssetUploadTypes';
import {
    getStudioAssetContext,
    isStudioOperationLeased,
    readStudioControlJson,
    STUDIO_MEDIA_ASSET_TABLE,
    studioControlResponse,
} from '@/lib/recording-studio/studioAssetServer';
import {
    beginHostedRecordingUpload,
    getHostedRecordingStorage,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
    const context = await getStudioAssetContext(request);
    if ('response' in context) return context.response;
    try {
        getHostedRecordingStorage();
        return studioControlResponse({ isConfigured: true });
    } catch {
        return studioControlResponse({
            isConfigured: false,
            error: 'S3-compatible storage is not configured. Local recording and editing are available.',
        });
    }
}
export async function POST(request: NextRequest) {
    const context = await getStudioAssetContext(request);
    if ('response' in context) return context.response;
    let isMutationStarted = false;
    try {
        const registration = STUDIO_ASSET_REGISTRATION_SCHEMA.parse(await readStudioControlJson(request));
        const fingerprint = createHash('sha256')
            .update(JSON.stringify({ byteLength: registration.byteLength, partChecksums: registration.partChecksums }))
            .digest('hex');
        if (fingerprint !== registration.sourceFingerprint)
            return studioControlResponse({ error: 'Source fingerprint does not match its checksum manifest.' }, 400);
        getHostedRecordingStorage();
        const previous = await context.database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .select('*')
            .eq('id', registration.id)
            .maybeSingle();
        if (previous.error) throw new Error(previous.error.message);
        const existing = previous.data;
        if (
            existing &&
            (existing.client_asset_id !== registration.clientAssetId ||
                existing.filename !== registration.filename ||
                existing.content_type !== registration.contentType ||
                Number(existing.byte_length) !== registration.byteLength ||
                existing.source_fingerprint !== registration.sourceFingerprint ||
                JSON.stringify(existing.part_checksums) !== JSON.stringify(registration.partChecksums) ||
                !isDeepStrictEqual(existing.media_bounds, registration.bounds))
        )
            return studioControlResponse(
                { error: 'Source identity changed. This upload cannot resume different bytes.' },
                409,
            );
        if (existing && ['cancelled', 'deleting'].includes(existing.status))
            return studioControlResponse({ error: 'Upload was cancelled. Start a new upload identity.' }, 409);
        if (existing && existing.status !== 'allocating') {
            isMutationStarted = true;
            const references = await context.database.rpc('retain_studio_media_project_reference', {
                target_project_id: registration.projectId,
                target_asset_id: registration.id,
            });
            if (references.error) throw new Error(references.error.message);
            return studioControlResponse({ id: registration.id, status: existing.status });
        }
        if (existing && isStudioOperationLeased(existing))
            return studioControlResponse({ error: 'Object allocation is still running. Retry shortly.' }, 409);
        const operationToken = crypto.randomUUID();
        const operation = {
            operation_token: operationToken,
            operation_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        isMutationStarted = true;
        if (existing) {
            const claim = await context.database
                .from(STUDIO_MEDIA_ASSET_TABLE)
                .update(operation)
                .eq('id', registration.id)
                .eq('status', 'allocating')
                .eq('operation_token', existing.operation_token)
                .select('id')
                .maybeSingle();
            if (claim.error || !claim.data)
                return studioControlResponse({ error: 'Object allocation changed. Retry.' }, 409);
        } else {
            const inserted = await context.database
                .from(STUDIO_MEDIA_ASSET_TABLE)
                .insert({
                    id: registration.id,
                    client_asset_id: registration.clientAssetId,
                    object_key: `studio-assets/${registration.id}`,
                    filename: registration.filename,
                    content_type: registration.contentType,
                    byte_length: registration.byteLength,
                    source_fingerprint: registration.sourceFingerprint,
                    part_checksums: registration.partChecksums,
                    media_bounds: registration.bounds,
                    status: 'allocating',
                    ...operation,
                });
            if (inserted.error)
                return studioControlResponse(
                    { error: 'Object allocation is already in progress. Retry the same identity.' },
                    409,
                );
        }
        const uploadId = await beginHostedRecordingUpload(
            `studio-assets/${registration.id}`,
            registration.contentType,
            { 'source-fingerprint': registration.sourceFingerprint },
        );
        const updated = await context.database
            .from(STUDIO_MEDIA_ASSET_TABLE)
            .update({
                status: 'uploading',
                upload_id: uploadId,
                operation_token: null,
                operation_started_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', registration.id)
            .eq('status', 'allocating')
            .eq('operation_token', operationToken)
            .select('id')
            .maybeSingle();
        if (updated.error || !updated.data)
            throw new Error('Upload allocation lost its lease; no editor source changed.');
        const referenced = await context.database.rpc('retain_studio_media_project_reference', {
            target_project_id: registration.projectId,
            target_asset_id: registration.id,
        });
        if (referenced.error) throw new Error(referenced.error.message);
        return studioControlResponse({ id: registration.id, status: 'uploading' });
    } catch (error) {
        return studioControlResponse(
            { error: error instanceof Error ? error.message : 'Upload allocation failed.' },
            // An allocation may have reached storage despite a lost response. Keep the browser's persisted
            // recovery fence for operational failures; malformed metadata/preflight failures have no effect.
            isMutationStarted ? 503 : 400,
        );
    }
}
