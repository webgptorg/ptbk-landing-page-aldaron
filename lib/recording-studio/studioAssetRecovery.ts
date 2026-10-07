'use client';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { RECORDING_STUDIO_AUTHORITY } from './recordingStudioAuthority';
import { readRecordingDatabaseAsIs, readRequest, STUDIO_UPLOAD_STORE } from './recordingStudioDatabase';
import type { StudioAssetUploadState } from './studioAssetUploadTypes';

/** No source pointer changes here. Unknown disk/publication operations retain their existing fail-closed behavior. */
export async function reconcileStudioAssetCommit(): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.reconcileAssetCommit(async (recovery) => {
        try {
            const address = `/api/admin/studio/assets/${encodeURIComponent(recovery.assetId)}`;
            const result = await requestAdminJson<{ status: string; isOperationLeased?: boolean }>(address);
            if (recovery.action === 'create') {
                if (['uploading', 'completing', 'verified', 'cancelled'].includes(result.status)) return true;
                if (result.status !== 'allocating' || result.isOperationLeased !== false) return false;
                const states = await readRecordingDatabaseAsIs(async (database) =>
                    database.objectStoreNames.contains(STUDIO_UPLOAD_STORE)
                        ? readRequest<StudioAssetUploadState[]>(
                              database.transaction(STUDIO_UPLOAD_STORE).objectStore(STUDIO_UPLOAD_STORE).getAll(),
                          )
                        : [],
                );
                const registration = states?.find((state) => state.storageAssetId === recovery.assetId)?.registration;
                if (!registration) return false;
                // Reconcile this same immutable server identity. No source pointer or browser generation changes here.
                const resumed = await requestAdminJson<{ status: string }>('/api/admin/studio/assets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registration),
                });
                return ['uploading', 'verified', 'completing'].includes(resumed.status);
            }
            if (recovery.action === 'cancel') {
                if (result.status !== 'cancelled') return false;
                const cancelled = await requestAdminJson<{ isCancelled: boolean }>(address, { method: 'DELETE' });
                return cancelled.isCancelled === true;
            }
            if (['verified', 'cancelled'].includes(result.status)) return true;
            if (
                result.status === 'uploading' ||
                (result.status === 'completing' && result.isOperationLeased === false)
            ) {
                const completed = await requestAdminJson<{ status: string }>(address, { method: 'POST' });
                return completed.status === 'verified';
            }
            return false;
        } catch {
            return false;
        }
    });
}
