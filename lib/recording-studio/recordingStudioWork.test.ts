import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RECORDING_STUDIO_AUTHORITY, RecordingStudioAuthorityKeeper } from './recordingStudioAuthority';
import { claimTestRecordingStudioAuthority } from './recordingStudioTestUtilities';
import { cancelRecordingStudioWork, commitRecordingStudioExport, isRecordingStudioWorkRunning, runRecordingStudioWork,
    setRecordingStudioWorkAccepted, settleRecordingStudioWork } from './recordingStudioWork';

beforeEach(async () => { await claimTestRecordingStudioAuthority(); setRecordingStudioWorkAccepted(true); });
afterEach(() => vi.restoreAllMocks());

describe('the one studio boundary for asynchronous editor and file work', () => {
    it('refuses new work immediately when handover closes the gate', async () => {
        setRecordingStudioWorkAccepted(false);
        let isStarted = false;
        expect(() => runRecordingStudioWork(async () => { isStarted = true; })).toThrow('Studio řídí jiná karta');
        expect(isStarted).toBe(false);
    });

    it('cancels a job but waits for its actual settlement before saying there is no work left', async () => {
        let finish!: () => void;
        const controller = new AbortController();
        const work = runRecordingStudioWork(() => new Promise<void>((resolve) => { finish = resolve; }), controller);
        const outcome = work.catch((error: unknown) => error);
        expect(isRecordingStudioWorkRunning()).toBe(true);
        cancelRecordingStudioWork();
        expect(controller.signal.aborted).toBe(true);
        expect(isRecordingStudioWorkRunning()).toBe(true);
        let isSettled = false;
        const settling = settleRecordingStudioWork().then(() => { isSettled = true; });
        await Promise.resolve();
        expect(isSettled).toBe(false);
        finish();
        expect(await outcome).toMatchObject({ name: 'AbortError' });
        await settling;
        expect(isRecordingStudioWorkRunning()).toBe(false);
    });

    it('rejects a late result after another generation was claimed, even before cancellation could be delivered', async () => {
        let finish!: () => void;
        const work = runRecordingStudioWork(() => new Promise<void>((resolve) => { finish = resolve; }));
        const outcome = work.catch((error: unknown) => error);
        const nextOwner = new RecordingStudioAuthorityKeeper();
        await claimTestRecordingStudioAuthority(nextOwner, 'other-owner');
        // The old document does not learn from a message here: native storage validation refuses it instead.
        await RECORDING_STUDIO_AUTHORITY.assertCurrent().catch(() => undefined);
        finish();
        expect(await outcome).toMatchObject({ name: 'RecordingStudioAuthorityLostError' });
        await settleRecordingStudioWork();
    });

    it('holds off revocation until a cancelled export has closed/aborted its output, then allows the next owner', async () => {
        let finish!: () => void;
        let reportStarted!: () => void;
        const started = new Promise<void>((resolve) => { reportStarted = resolve; });
        const controller = new AbortController();
        const exporting = commitRecordingStudioExport(async () => {
            reportStarted();
            await new Promise<void>((resolve) => { finish = resolve; });
            controller.signal.throwIfAborted();
        }, controller.signal);
        const outcome = exporting.catch((error: unknown) => error);
        await started;
        const nextOwner = new RecordingStudioAuthorityKeeper();
        const generation = RECORDING_STUDIO_AUTHORITY.heldAuthority!.generation;
        await expect(nextOwner.claim('next-owner', generation)).rejects.toThrow('nedokončila zápis');
        controller.abort();
        finish();
        expect(await outcome).toMatchObject({ name: 'AbortError' });
        expect(await nextOwner.claim('next-owner', generation)).not.toBeNull();
        await expect(nextOwner.assertCurrent()).resolves.toBeUndefined();
    });

    it('cancels before an admitted external effect starts without leaving an uncertainty marker', async () => {
        const controller = new AbortController();
        const originalTransaction = RECORDING_STUDIO_AUTHORITY.runTransaction.bind(RECORDING_STUDIO_AUTHORITY);
        vi.spyOn(RECORDING_STUDIO_AUTHORITY, 'runTransaction').mockImplementationOnce(async (stores, write) => {
            await originalTransaction(stores, write);
            controller.abort();
        });
        const output = vi.fn(async () => undefined);
        await expect(commitRecordingStudioExport(output, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
        expect(output).not.toHaveBeenCalled();
        const nextOwner = new RecordingStudioAuthorityKeeper();
        expect(await nextOwner.claim('next-owner', RECORDING_STUDIO_AUTHORITY.heldAuthority!.generation)).not.toBeNull();
    });
});
