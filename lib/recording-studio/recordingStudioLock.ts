import { RECORDING_STUDIO_LOCK } from './recordingStudioTypes';

let previousLockRequest: Promise<void> = Promise.resolve();

/** Let this tab finish releasing its previous studio before asking whether another tab holds the lock. */
export function runWithRecordingStudioLock(operation: (lock: Lock | null) => Promise<void>): Promise<void> {
    // React can mount the next studio before the previous effect's asynchronous cleanup has settled.
    // Serializing requests in this document avoids mistaking that cleanup for a competing browser tab.
    const request = previousLockRequest.catch(() => undefined).then(async () => {
        await navigator.locks.request(RECORDING_STUDIO_LOCK, { ifAvailable: true }, operation);
    });
    previousLockRequest = request;
    return request;
}
