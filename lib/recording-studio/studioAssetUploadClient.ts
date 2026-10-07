'use client';

import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { RECORDING_STUDIO_AUTHORITY } from './recordingStudioAuthority';
import { commitRecordingStudioUpload } from './recordingStudioWork';
import {
    listStudioProjects,
    readStudioAssetUpload,
    saveStudioAsset,
    saveStudioAssetUpload,
} from './studioProjectStorage';
import {
    readStudioLocalRangeSource,
    resolveStudioPlayback,
    verifyStudioRemotePlayback,
    type StudioRangeSource,
} from './studioMediaSource';
import { readRecordingIndexReport } from './recordingStudioIndex';
import { prepareStudioUpload, removeStudioUploadPreparation } from './studioUploadPreparation';
import {
    STUDIO_UPLOAD_CONCURRENCY,
    STUDIO_UPLOAD_MAXIMUM_ATTEMPTS,
    STUDIO_UPLOAD_PART_BYTES,
    type StudioAssetRegistration,
    type StudioAssetUploadProgress,
    type StudioAssetUploadState,
} from './studioAssetUploadTypes';
import type { StudioAsset } from './studioProjectTypes';
import { reconcileStudioAssetCommit } from './studioAssetRecovery';

const UPLOAD_BASE_URL = '/api/admin/studio/assets';
type UploadPart = { readonly partNumber: number; readonly byteLength: number; readonly checksumSha256: string | null };
const jsonRequest = (value: unknown): RequestInit => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
});

export async function fingerprintStudioUpload(
    source: StudioRangeSource,
    signal: AbortSignal,
    onProgress: (bytes: number) => void,
) {
    const partChecksums: string[] = [];
    for (let start = 0; start < source.byteLength; start += STUDIO_UPLOAD_PART_BYTES) {
        signal.throwIfAborted();
        const end = Math.min(source.byteLength, start + STUDIO_UPLOAD_PART_BYTES);
        const bytes = await (await source.read(start, end, signal)).arrayBuffer();
        if (bytes.byteLength !== end - start)
            throw new Error('Místní zdroj vrátil jinou délku. Upload se nepřipojil k jiným bajtům.');
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
        partChecksums.push(btoa(String.fromCharCode(...Array.from(digest))));
        onProgress(end);
    }
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify({ byteLength: source.byteLength, partChecksums })),
    );
    return {
        partChecksums,
        sourceFingerprint: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''),
    };
}

async function putStudioPart(
    storageAssetId: string,
    partNumber: number,
    blob: Blob,
    checksum: string,
    signal: AbortSignal,
): Promise<void> {
    for (let attempt = 1; attempt <= STUDIO_UPLOAD_MAXIMUM_ATTEMPTS; attempt += 1) {
        signal.throwIfAborted();
        await RECORDING_STUDIO_AUTHORITY.assertCurrent();
        try {
            // Each retry obtains a new short-lived signature, retaining completed part numbers.
            const signature = await requestAdminJson<{ url: string; headers: Record<string, string> }>(
                `${UPLOAD_BASE_URL}/${storageAssetId}/parts/${partNumber}`,
                { method: 'POST', signal },
            );
            const url = new URL(signature.url);
            if (url.origin === window.location.origin)
                throw new Error('Upload must go directly to object storage, not the application origin.');
            const response = await fetch(signature.url, {
                method: 'PUT',
                body: blob,
                headers: signature.headers,
                signal,
                credentials: 'omit',
                mode: 'cors',
            });
            if (!response.ok) {
                await response.body?.cancel();
                throw new Error(`Object storage part failed (${response.status}).`);
            }
            const confirmed = response.headers.get('x-amz-checksum-sha256');
            if (!response.headers.get('ETag') || (confirmed !== null && confirmed !== checksum))
                throw new Error('S3 did not expose a matching part receipt. Check upload CORS headers.');
            await response.body?.cancel();
            return;
        } catch (error) {
            if (signal.aborted || attempt === STUDIO_UPLOAD_MAXIMUM_ATTEMPTS) throw error;
            await new Promise<void>((resolve, reject) => {
                const cancel = () => {
                    clearTimeout(timeout);
                    reject(signal.reason);
                };
                const timeout = setTimeout(() => {
                    signal.removeEventListener('abort', cancel);
                    resolve();
                }, attempt * 500);
                signal.addEventListener('abort', cancel, { once: true });
            });
        }
    }
}

/** Pure resumable multipart state machine. At most two bounded parts are active, never a media-body proxy. */
export async function transferStudioParts(
    source: StudioRangeSource,
    checksums: readonly string[],
    storedParts: readonly UploadPart[],
    signal: AbortSignal,
    putPart: (partNumber: number, blob: Blob, checksum: string) => Promise<void>,
    onProgress: (bytes: number) => void,
): Promise<void> {
    const existing = new Map(storedParts.map((part) => [part.partNumber, part]));
    if (
        storedParts.some(
            (part) =>
                part.partNumber < 1 ||
                part.partNumber > checksums.length ||
                part.byteLength !==
                    Math.min(
                        STUDIO_UPLOAD_PART_BYTES,
                        source.byteLength - (part.partNumber - 1) * STUDIO_UPLOAD_PART_BYTES,
                    ) ||
                part.checksumSha256 !== checksums[part.partNumber - 1],
        )
    )
        throw new Error('Resumed parts belong to different bytes or have invalid lengths.');
    let completed = storedParts.reduce((bytes, part) => bytes + part.byteLength, 0);
    let nextPart = 1;
    onProgress(completed);
    const controller = new AbortController();
    const cancel = () => controller.abort(signal.reason);
    signal.addEventListener('abort', cancel, { once: true });
    try {
        const workers = Array.from({ length: STUDIO_UPLOAD_CONCURRENCY }, async () => {
            try {
                for (;;) {
                    signal.throwIfAborted();
                    controller.signal.throwIfAborted();
                    const partNumber = nextPart++;
                    if (partNumber > checksums.length) return;
                    if (existing.has(partNumber)) continue;
                    const start = (partNumber - 1) * STUDIO_UPLOAD_PART_BYTES;
                    const end = Math.min(source.byteLength, start + STUDIO_UPLOAD_PART_BYTES);
                    const blob = await source.read(start, end, controller.signal);
                    // Recheck immediately before PUT: file handles may change while upload is in progress.
                    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
                    const checksum = btoa(String.fromCharCode(...Array.from(digest)));
                    if (blob.size !== end - start || checksum !== checksums[partNumber - 1])
                        throw new Error(
                            'Source changed after upload registration. Existing completed parts were not overwritten.',
                        );
                    await putPart(partNumber, blob, checksum);
                    completed += blob.size;
                    onProgress(completed);
                }
            } catch (error) {
                controller.abort(error);
                throw error;
            }
        });
        const outcomes = await Promise.allSettled(workers);
        const failed = outcomes.find((outcome) => outcome.status === 'rejected');
        if (failed?.status === 'rejected') throw failed.reason;
    } finally {
        signal.removeEventListener('abort', cancel);
    }
}

async function uploadStudioRangeAsset(
    asset: StudioAsset,
    projectId: string,
    source: StudioRangeSource,
    isIndexRebuilt: boolean,
    signal: AbortSignal,
    onProgress: (progress: StudioAssetUploadProgress) => void,
): Promise<StudioAsset> {
    const progress = (phase: StudioAssetUploadProgress['phase'], completedBytes = 0) =>
        onProgress({ phase, completedBytes, totalBytes: source.byteLength, filename: asset.label });
    progress('hashing');
    const fingerprint = await fingerprintStudioUpload(source, signal, (bytes) => progress('hashing', bytes));
    const previous = await readStudioAssetUpload<StudioAssetUploadState>(asset.id);
    if (
        previous &&
        (previous.sourceFingerprint !== fingerprint.sourceFingerprint || previous.byteLength !== source.byteLength)
    )
        throw new Error(
            'This source differs from the resumable upload. Cancel that upload explicitly before starting another.',
        );
    const state: StudioAssetUploadState = previous ?? {
        id: asset.id,
        storageAssetId: crypto.randomUUID(),
        ...fingerprint,
        byteLength: source.byteLength,
        isIndexRebuilt,
    };
    const registration: StudioAssetRegistration = {
        id: state.storageAssetId,
        clientAssetId: asset.id,
        projectId,
        filename: asset.label,
        byteLength: source.byteLength,
        contentType: asset.mimeType,
        bounds: { ...asset.bounds, components: [...asset.bounds.components] },
        ...fingerprint,
    };
    await saveStudioAssetUpload({ ...state, registration }, asset.id);
    await reconcileStudioAssetCommit();
    const created = await commitRecordingStudioUpload(
        () => requestAdminJson<{ status: string }>(UPLOAD_BASE_URL, jsonRequest(registration)),
        signal,
        { kind: 'studio-asset', assetId: state.storageAssetId, action: 'create' },
    );
    signal.throwIfAborted();
    let status = created.status;
    if (status === 'uploading') {
        const reconciled = await requestAdminJson<{ status: string; parts: readonly UploadPart[] }>(
            `${UPLOAD_BASE_URL}/${state.storageAssetId}`,
            { signal },
        );
        status = reconciled.status;
        if (status === 'uploading') {
            await transferStudioParts(
                source,
                state.partChecksums,
                reconciled.parts,
                signal,
                (partNumber, blob, checksum) => putStudioPart(state.storageAssetId, partNumber, blob, checksum, signal),
                (bytes) => progress('uploading', bytes),
            );
        }
    }
    signal.throwIfAborted();
    if (status !== 'verified') {
        progress('verifying', source.byteLength);
        await commitRecordingStudioUpload(
            () => requestAdminJson(`${UPLOAD_BASE_URL}/${state.storageAssetId}`, { method: 'POST' }),
            signal,
            { kind: 'studio-asset', assetId: state.storageAssetId, action: 'complete' },
        );
    }
    signal.throwIfAborted();
    progress('reading', source.byteLength);
    const remoteAsset: StudioAsset = { ...asset, location: { kind: 's3', storageAssetId: state.storageAssetId } };
    const resource = await resolveStudioPlayback(remoteAsset);
    try {
        await verifyStudioRemotePlayback(resource.url, asset, signal);
    } finally {
        resource.dispose();
    }
    signal.throwIfAborted();
    // A reusable asset can occur in several local recipes. Retain all of them before changing its shared location.
    for (const referencingProject of (await listStudioProjects()).filter((project) =>
        project.clips.some((clip) => clip.assetId === asset.id),
    )) {
        await requestAdminJson(`/api/admin/studio/projects/${referencingProject.id}/references`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetIds: [state.storageAssetId], isRetainOnly: true }),
        });
    }
    signal.throwIfAborted();
    // Native fenced transaction is the only location switch. Every original and cut remains unchanged.
    await saveStudioAsset(remoteAsset);
    await saveStudioAssetUpload(null, asset.id);
    await removeStudioUploadPreparation(asset.id).catch(() => undefined);
    return remoteAsset;
}

export async function uploadStudioAsset(
    asset: StudioAsset,
    projectId: string,
    signal: AbortSignal,
    onProgress: (progress: StudioAssetUploadProgress) => void,
): Promise<StudioAsset> {
    if (asset.location.kind === 's3') return asset;
    if (asset.original.kind === 'recording') {
        const location = asset.original;
        if (location.part.indexStatus !== 'indexed') {
            onProgress({ phase: 'preparing', completedBytes: 0, totalBytes: asset.byteLength, filename: asset.label });
            const source = await readStudioLocalRangeSource(asset);
            const report = await readRecordingIndexReport({
                size: source.byteLength,
                slice: (start, end) => ({
                    arrayBuffer: async () => (await source.read(start, end, signal)).arrayBuffer(),
                }),
            });
            if (report.status !== 'indexed') {
                const file = await prepareStudioUpload(asset, source, report.format, signal, (value) =>
                    onProgress({
                        phase: 'preparing',
                        completedBytes: value * asset.byteLength,
                        totalBytes: asset.byteLength,
                        filename: asset.label,
                    }),
                );
                return uploadStudioRangeAsset(
                    asset,
                    projectId,
                    {
                        byteLength: file.size,
                        read: async (start, end, operationSignal) => {
                            operationSignal.throwIfAborted();
                            return file.slice(start, end);
                        },
                    },
                    true,
                    signal,
                    onProgress,
                );
            }
        }
    }
    return uploadStudioRangeAsset(asset, projectId, await readStudioLocalRangeSource(asset), false, signal, onProgress);
}

/** Pause/interruption keeps multipart receipts. Cancellation is separate and never deletes verified objects. */
export async function cancelStudioAssetUpload(assetId: string, signal: AbortSignal): Promise<void> {
    const state = await readStudioAssetUpload<StudioAssetUploadState>(assetId);
    if (!state) {
        await removeStudioUploadPreparation(assetId);
        return;
    }
    await reconcileStudioAssetCommit();
    await commitRecordingStudioUpload(
        () => requestAdminJson(`${UPLOAD_BASE_URL}/${state.storageAssetId}`, { method: 'DELETE' }),
        signal,
        { kind: 'studio-asset', assetId: state.storageAssetId, action: 'cancel' },
    );
    await saveStudioAssetUpload(null, assetId);
    await removeStudioUploadPreparation(assetId);
}
