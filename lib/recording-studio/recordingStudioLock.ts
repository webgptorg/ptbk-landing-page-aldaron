import { RECORDING_STUDIO_LOCK } from './recordingStudioTypes';

/**
 * How a tab asks the browser for the studio
 *
 * Note: Opening the studio only ever takes a lock nobody holds. Waiting in the queue and taking the lock away are
 *       both reserved for a takeover the administrator has confirmed, and taking it away does not stop the tab it is
 *       taken from, which is why that tab has already lost its right to write by then.
 */
export type RecordingStudioLockRequest =
    | { readonly mode: 'if-available' }
    | { readonly mode: 'wait'; readonly signal: AbortSignal }
    | { readonly mode: 'steal' };

export type RecordingStudioLockOperation<Preparation> = {
    /**
     * What this tab has to know before it asks for the lock
     *
     * Note: It runs once this document's own previous hold has ended and before the browser is asked. Rejecting here
     *       asks for nothing at all.
     */
    readonly prepare: () => Promise<Preparation>;
    /** Runs while the lock is held; `lock` is `null` when the studio was only wanted if it was free, and it was not. */
    readonly run: (lock: Lock | null, preparation: Preparation) => Promise<void>;
};

/** What the browser itself knows about the studio lock, which no tab can get wrong by being slow or asleep. */
export type RecordingStudioLockState = {
    readonly isHeld: boolean;
    /** Whether a tab is waiting in the queue for it, as a tab which is taking the studio over does. */
    readonly isAwaited: boolean;
};

let previousLockOperation: Promise<void> = Promise.resolve();

function createLockOptions(request: RecordingStudioLockRequest): LockOptions {
    if (request.mode === 'if-available') return { ifAvailable: true };
    if (request.mode === 'wait') return { signal: request.signal };
    return { steal: true };
}

/** Let this tab finish releasing its previous studio before asking whether another tab holds the lock. */
export function runWithRecordingStudioLock<Preparation>(request: RecordingStudioLockRequest, operation: RecordingStudioLockOperation<Preparation>): Promise<void> {
    let operationSettled: Promise<void> = Promise.resolve();
    // React can mount the next studio before the previous effect's asynchronous cleanup has settled.
    // Serializing requests in this document avoids mistaking that cleanup for a competing browser tab.
    const lockRequest = previousLockOperation.then(async () => {
        const preparation = await operation.prepare();
        await navigator.locks.request(RECORDING_STUDIO_LOCK, createLockOptions(request), (lock) => {
            const running = operation.run(lock, preparation);
            operationSettled = running.then(() => undefined, () => undefined);
            return running;
        });
    });
    // A lock which is taken away rejects its request at once, while the operation which held it is still winding down.
    previousLockOperation = lockRequest.then(() => undefined, () => operationSettled);
    return lockRequest;
}

export async function readRecordingStudioLockState(): Promise<RecordingStudioLockState | null> {
    if (typeof navigator.locks.query !== 'function') return null;
    try {
        const { held = [], pending = [] } = await navigator.locks.query();
        return {
            isHeld: held.some(({ name }) => name === RECORDING_STUDIO_LOCK),
            isAwaited: pending.some(({ name }) => name === RECORDING_STUDIO_LOCK),
        };
    } catch {
        return null;
    }
}
