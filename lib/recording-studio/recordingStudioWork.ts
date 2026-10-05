import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { RECORDING_STUDIO_AUTHORITY, RecordingStudioAuthorityLostError } from './recordingStudioAuthority';

type StudioWork = { readonly controller: AbortController; readonly settled: Promise<unknown> };
const RUNNING_WORK = new Set<StudioWork>();
let isAcceptingWork = false;

/** The page and its editor share this boundary; changing sections never creates a second owner. */
export function setRecordingStudioWorkAccepted(isAccepted: boolean): void {
    isAcceptingWork = isAccepted;
}

export function isRecordingStudioWorkRunning(): boolean {
    return RUNNING_WORK.size > 0;
}

export function assertRecordingStudioWorkAccepted(): void {
    if (!isAcceptingWork) throw new RecordingStudioAuthorityLostError();
    RECORDING_STUDIO_AUTHORITY.assertHeld();
}

/** Registers work before its first await, including time spent behind a native file/device picker. */
export function runRecordingStudioWork<Result>(operation: (signal: AbortSignal) => Promise<Result>, controller = new AbortController()): Promise<Result> {
    assertRecordingStudioWorkAccepted();
    const authority = RECORDING_STUDIO_AUTHORITY.heldAuthority!;
    const request = protectAdminMutation(async () => {
        controller.signal.throwIfAborted();
        const result = await operation(controller.signal);
        controller.signal.throwIfAborted();
        if (RECORDING_STUDIO_AUTHORITY.heldAuthority !== authority) throw new RecordingStudioAuthorityLostError();
        return result;
    });
    const work: StudioWork = { controller, settled: request };
    RUNNING_WORK.add(work);
    return request.finally(() => RUNNING_WORK.delete(work));
}

export function cancelRecordingStudioWork(): void {
    RUNNING_WORK.forEach(({ controller }) => controller.abort());
}

/** Cancellation is only a request. The lock remains held until each actual operation has settled. */
export async function settleRecordingStudioWork(): Promise<void> {
    while (RUNNING_WORK.size > 0) await Promise.allSettled(Array.from(RUNNING_WORK, ({ settled }) => settled));
}

/** Export destinations and publication are outside IndexedDB and hold off revocation until their commit ends. */
export function commitRecordingStudioWork<Result>(operation: () => Promise<Result>, signal?: AbortSignal): Promise<Result> {
    signal?.throwIfAborted();
    return RECORDING_STUDIO_AUTHORITY.commit(operation, signal);
}

/** Export promises settle only after their stream was closed or aborted and temporary resources were released. */
export async function commitRecordingStudioExport<Result>(operation: () => Promise<Result>, signal: AbortSignal): Promise<Result> {
    const outcome = await commitRecordingStudioWork(() => operation().then(
        (result) => ({ result }), (error: unknown) => ({ error }),
    ), signal);
    if ('error' in outcome) throw outcome.error;
    return outcome.result;
}

/** Upload cancellation occurs between acknowledged requests; a network failure retains the uncertainty marker. */
export async function commitRecordingStudioUpload<Result>(operation: () => Promise<Result>, signal: AbortSignal): Promise<Result> {
    const outcome = await commitRecordingStudioWork(async () => {
        try { return { result: await operation() }; }
        catch (error) {
            if (signal.aborted && error instanceof DOMException && error.name === 'AbortError') return { error };
            throw error;
        }
    }, signal);
    if ('error' in outcome) throw outcome.error;
    return outcome.result;
}
