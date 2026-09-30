'use client';

import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { HostedRecordingAssetRole, HostedRecordingValidationReport } from './hostedRecordingValidation';
import { HOSTED_RECORDING_PART_BYTES } from './hostedRecordingConstants';

const MAXIMUM_PART_ATTEMPTS = 3;

function createRevisionUrl(workshopId: string, revisionId?: string): string {
    const base = `/api/admin/workshops/${encodeURIComponent(workshopId)}/hosted-recordings`;
    return revisionId ? `${base}/${encodeURIComponent(revisionId)}` : base;
}

function createJsonRequest(method: string, value: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) };
}

export async function createHostedRecordingRevision(workshopId: string, liveStartAt: string): Promise<string> {
    const result = await requestAdminJson<{ readonly revision: { readonly id: string } }>(
        createRevisionUrl(workshopId), createJsonRequest('POST', { liveStartAt }));
    return result.revision.id;
}

export type HostedRecordingUploadFile = {
    readonly role: HostedRecordingAssetRole;
    readonly file: File;
    /** The immutable export name can differ from an OPFS temporary file handle. */
    readonly filename?: string;
    readonly sourceId?: string | null;
};

function getContentType(asset: HostedRecordingUploadFile): string {
    const filename = asset.filename ?? asset.file.name;
    if (['editor', 'application', 'camera'].includes(asset.role)) {
        return ['video/mp4', 'video/webm'].includes(asset.file.type) ? asset.file.type :
            filename.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/webm';
    }
    if (asset.role.startsWith('subtitle-')) {
        const lowerFilename = filename.toLowerCase();
        return lowerFilename.endsWith('.vtt') ? 'text/vtt' :
            lowerFilename.endsWith('.json') ? 'application/json' :
                lowerFilename.endsWith('.srt') ? 'application/x-subrip' : asset.file.type;
    }
    return 'application/json';
}

async function uploadPartWithRetry(url: string, bytes: ArrayBuffer, checksum: string, signal: AbortSignal): Promise<void> {
    for (let attempt = 1; attempt <= MAXIMUM_PART_ATTEMPTS; attempt += 1) {
        signal.throwIfAborted();
        try {
            const response = await fetch(url, { method: 'PUT', body: bytes, signal,
                headers: { 'Content-Type': 'application/octet-stream', 'X-Chunk-SHA256': checksum } });
            if (response.ok) return;
            const body = await response.json().catch(() => null) as { error?: string } | null;
            if (response.status === 401 || response.status === 403 || response.status === 409)
                throw new Error(body?.error ?? 'Upload was denied.');
            if (attempt === MAXIMUM_PART_ATTEMPTS) throw new Error(body?.error ?? `Chunk upload failed (${response.status}).`);
        } catch (error) {
            if (signal.aborted || attempt === MAXIMUM_PART_ATTEMPTS) throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 700));
    }
}

/** One file at a time, one 8 MiB chunk in memory, with repeatable S3 part numbers. */
export async function uploadHostedRecordingAsset(workshopId: string, revisionId: string, asset: HostedRecordingUploadFile,
    signal: AbortSignal, onProgress: (completedBytes: number, totalBytes: number) => void): Promise<string> {
    return protectAdminMutation(async () => {
        const assetBase = `${createRevisionUrl(workshopId, revisionId)}/assets`;
        const created = await requestAdminJson<{ readonly asset: { readonly id: string; readonly status: string } }>(assetBase,
            createJsonRequest('POST', { role: asset.role, sourceId: asset.sourceId ?? null,
                filename: asset.filename ?? asset.file.name,
                contentType: getContentType(asset), byteLength: asset.file.size }));
        const assetUrl = `${assetBase}/${encodeURIComponent(created.asset.id)}`;
        if (created.asset.status === 'complete') {
            onProgress(asset.file.size, asset.file.size);
            return created.asset.id;
        }
        if (created.asset.status === 'completing') {
            await requestAdminJson(assetUrl, { method: 'POST', signal });
            onProgress(asset.file.size, asset.file.size);
            return created.asset.id;
        }
        const uploaded = await requestAdminJson<{ readonly parts: readonly {
            readonly partNumber: number; readonly byteLength: number; readonly checksumSha256: string | null;
        }[] }>(`${assetUrl}/parts`);
        const uploadedParts = new Map(uploaded.parts.map((part) => [part.partNumber, part]));
        let completedBytes = 0;
        for (let offset = 0, partNumber = 1; offset < asset.file.size; offset += HOSTED_RECORDING_PART_BYTES, partNumber += 1) {
            signal.throwIfAborted();
            const bytes = await asset.file.slice(offset, offset + HOSTED_RECORDING_PART_BYTES).arrayBuffer();
            const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
            const checksum = btoa(String.fromCharCode(...Array.from(digest)));
            const existingPart = uploadedParts.get(partNumber);
            if (existingPart?.byteLength !== bytes.byteLength || existingPart.checksumSha256 !== checksum) {
                await uploadPartWithRetry(`${assetUrl}/parts/${partNumber}`, bytes, checksum, signal);
            }
            completedBytes += bytes.byteLength;
            onProgress(completedBytes, asset.file.size);
        }
        signal.throwIfAborted();
        await requestAdminJson(assetUrl, { method: 'POST', signal });
        return created.asset.id;
    });
}

export async function validateHostedRecordingRevision(workshopId: string, revisionId: string):
    Promise<HostedRecordingValidationReport> {
    return protectAdminMutation(async () => {
        const response = await fetch(createRevisionUrl(workshopId, revisionId), {
            ...createJsonRequest('POST', { action: 'verify' }), cache: 'no-store',
        });
        const result = await response.json().catch(() => ({})) as {
            readonly report?: HostedRecordingValidationReport; readonly error?: string;
        };
        if ((response.ok || response.status === 422) && result.report) return result.report;
        throw new Error(result.error ?? `Recording verification failed (${response.status}).`);
    });
}

export async function publishHostedRecordingRevision(workshopId: string, revisionId: string): Promise<void> {
    await requestAdminJson(createRevisionUrl(workshopId, revisionId), createJsonRequest('POST', { action: 'publish' }));
}

export async function cancelHostedRecordingRevision(workshopId: string, revisionId: string): Promise<void> {
    await requestAdminJson(createRevisionUrl(workshopId, revisionId), createJsonRequest('POST', { action: 'cancel' }));
}

export async function removeHostedRecording(workshopId: string): Promise<void> {
    await requestAdminJson(createRevisionUrl(workshopId), { method: 'DELETE' });
}
