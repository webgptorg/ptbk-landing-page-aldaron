import { RECORDING_STORAGE_RESERVE_BYTES, type RecordingPersistence, type RecordingStorageEstimate } from './recordingStudioTypes';

export const RECORDING_STORAGE_REFRESH_MILLISECONDS = 5_000;
export const RECORDING_ESTIMATE_MAX_AGE_MILLISECONDS = 15_000;
const ESTIMATE_TIMEOUT_MILLISECONDS = 3_000;
const PREDICTABLE_HEADROOM_BYTES = 10 * 1024 ** 3;

export const UNKNOWN_RECORDING_STORAGE: RecordingStorageEstimate = {
    headroomBytes: null, quotaBytes: null, usageBytes: null, measuredAt: null, status: 'unsupported',
};

/** A failed or hanging API must never leave an older estimate looking current. */
export async function estimateRecordingStorage(storage: Pick<StorageManager, 'estimate'> | undefined = navigator.storage): Promise<RecordingStorageEstimate> {
    if (!storage?.estimate) return UNKNOWN_RECORDING_STORAGE;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
        const estimate = await Promise.race([
            storage.estimate(),
            new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Storage estimate timed out')), ESTIMATE_TIMEOUT_MILLISECONDS); }),
        ]);
        if (!Number.isSafeInteger(estimate.quota) || !Number.isSafeInteger(estimate.usage) || estimate.quota! < 0 || estimate.usage! < 0) {
            return { ...UNKNOWN_RECORDING_STORAGE, status: 'failed' };
        }
        return {
            quotaBytes: estimate.quota!, usageBytes: estimate.usage!, headroomBytes: Math.max(0, estimate.quota! - estimate.usage!),
            measuredAt: Date.now(), status: 'available',
        };
    } catch {
        return { ...UNKNOWN_RECORDING_STORAGE, status: 'failed' };
    } finally { clearTimeout(timeout); }
}

export function isRecordingEstimateFresh(estimate: RecordingStorageEstimate, now = Date.now()): boolean {
    return estimate.status === 'available' && estimate.measuredAt !== null && now >= estimate.measuredAt &&
        now - estimate.measuredAt <= RECORDING_ESTIMATE_MAX_AGE_MILLISECONDS;
}

/** This is a warning signature, not browser identification or a measured disk capacity. */
export function hasPredictableRecordingHeadroom(estimate: RecordingStorageEstimate): boolean {
    return estimate.headroomBytes !== null && Math.abs(estimate.headroomBytes - PREDICTABLE_HEADROOM_BYTES) < 1024;
}

export function isRecordingOriginStorageLow(estimate: RecordingStorageEstimate): boolean {
    return isRecordingEstimateFresh(estimate) && estimate.headroomBytes !== null && estimate.headroomBytes < RECORDING_STORAGE_RESERVE_BYTES;
}

export async function readRecordingPersistence(storage = navigator.storage): Promise<RecordingPersistence> {
    if (!storage?.persisted || !storage?.persist) return 'unsupported';
    try { return await storage.persisted() ? 'granted' : 'not-granted'; }
    catch { return 'failed'; }
}

/** Explicit user action. Persistence protects against eviction; it requests no byte quota. */
export async function requestRecordingPersistence(storage = navigator.storage): Promise<RecordingPersistence> {
    if (!storage?.persist) return 'unsupported';
    try { return await storage.persist() ? 'granted' : 'denied'; }
    catch { return 'failed'; }
}

/** Shared by capture, deletion and export; never confuse capture-device errors with storage permission errors. */
export function getRecordingStorageErrorMessage(error: unknown, isCaptureFailure = true): string {
    const name = error instanceof Error ? error.name : '';
    const explanation = name === 'QuotaExceededError' ? 'Úložiště je plné nebo byla vyčerpána kvóta.' :
        name === 'NotAllowedError' || name === 'SecurityError' ? 'Oprávnění k úložišti chybí nebo bylo odebráno.' :
        name === 'NotFoundError' ? 'Soubor záznamu už není dostupný.' :
        'Přístup k úložišti selhal; příčinou může být plný či odpojený disk.';
    return `${explanation}${isCaptureFailure ? ' Všechny stopy se zastavují.' : ''} Již uložené části zůstávají k obnově a exportu.`;
}
