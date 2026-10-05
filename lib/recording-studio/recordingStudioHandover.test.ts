import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminSaveQueue, AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { discardPendingAdminEditorSaves, getPendingAdminEditorSaves, registerAdminSaveQueue } from '@/lib/admin/adminPendingSaves';
import type { RecordingStudioCapture } from './RecordingStudioCapture';
import { settleRecordingStudioHandover } from './recordingStudioHandover';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import { cancelRecordingStudioWork, settleRecordingStudioWork } from './recordingStudioWork';

vi.mock('./recordingStudioWork', () => ({ cancelRecordingStudioWork: vi.fn(), settleRecordingStudioWork: vi.fn(async () => undefined) }));
const EDITOR_CLEANUPS: (() => void)[] = [];

afterEach(() => {
    discardPendingAdminEditorSaves();
    EDITOR_CLEANUPS.splice(0).forEach((cleanup) => cleanup());
    vi.clearAllMocks();
});

function createHandover(isUnsavedEditDiscardAllowed = false) {
    const recording = { ...createTestStudioRecording(), status: 'interrupted' as const, errorMessage: 'Explicit handover' };
    const capture = { stop: vi.fn(async () => recording), finalizationSaveError: null as string | null };
    const request = { isUnsavedEditDiscardAllowed, reportStage: vi.fn(), isCancelled: vi.fn(() => false) };
    const setAccepted = vi.fn();
    const releaseDevices = vi.fn();
    const runtime = { activationSettlement: null, startSettlement: null as Promise<unknown> | null, capture: capture as unknown as RecordingStudioCapture };
    return { capture, request, setAccepted, releaseDevices, runtime,
        settle: () => settleRecordingStudioHandover(runtime, request, setAccepted, releaseDevices) };
}

function registerEditor(save: () => Promise<boolean>) {
    const queue = new AdminSaveQueue('saved');
    EDITOR_CLEANUPS.push(registerAdminSaveQueue(queue));
    queue.update('draft', save);
    return queue;
}

describe('the responsive studio handover cleanup', () => {
    it('makes no change when the requester cancelled before stopping began', async () => {
        const handover = createHandover();
        handover.request.isCancelled.mockReturnValue(true);
        expect(await handover.settle()).toMatchObject({ outcome: 'refused', reason: 'cancelled' });
        expect(handover.capture.stop).not.toHaveBeenCalled();
        expect(handover.setAccepted).not.toHaveBeenCalled();
        expect(handover.releaseDevices).not.toHaveBeenCalled();
    });

    it('waits for Start and Stop, settles jobs, and flushes editor saves before a clean release', async () => {
        const handover = createHandover();
        let finishStart!: () => void;
        handover.runtime.startSettlement = new Promise<void>((resolve) => { finishStart = resolve; });
        const save = vi.fn(async () => true);
        registerEditor(save);
        const settlement = handover.settle();
        await vi.waitFor(() => expect(handover.capture.stop).toHaveBeenCalledOnce());
        expect(handover.releaseDevices).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
        finishStart();
        expect(await settlement).toMatchObject({ outcome: 'settled', report: { stoppedRecording: { status: 'interrupted' }, unsavedEditDetail: null, unsettledOperationCount: 0 } });
        expect(cancelRecordingStudioWork).toHaveBeenCalledOnce();
        expect(settleRecordingStudioWork).toHaveBeenCalledOnce();
        expect(handover.releaseDevices).toHaveBeenCalledOnce();
        expect(save).toHaveBeenCalledOnce();
        expect(handover.setAccepted.mock.calls.every(([isAccepted]) => isAccepted === false)).toBe(true);
    });

    it('refuses a failed checkpoint and reports its exact reason to the requester', async () => {
        const handover = createHandover();
        handover.capture.finalizationSaveError = 'Final checkpoint could not be committed';
        expect(await handover.settle()).toEqual({ outcome: 'refused', reason: 'cleanup-failed', detail: 'Final checkpoint could not be committed' });
    });

    it('keeps invalid and failed drafts instead of reporting a clean handover', async () => {
        const handover = createHandover();
        const queue = registerEditor(async () => { throw new AdminSaveValidationError('Invalid trim range'); });
        expect(await handover.settle()).toEqual({ outcome: 'refused', reason: 'unsaved-edits', detail: 'Invalid trim range' });
        expect(queue.getSnapshot().isDirty).toBe(true);
        expect(getPendingAdminEditorSaves()).toContain(queue);
    });

    it('reports explicitly discarded edits and removes their stale queued save', async () => {
        const handover = createHandover(true);
        const save = vi.fn(async () => { throw new Error('Failed editor save'); });
        const queue = registerEditor(save);
        expect(await handover.settle()).toMatchObject({ outcome: 'settled', report: { unsavedEditDetail: 'Failed editor save' } });
        expect(queue.getSnapshot().isDirty).toBe(false);
        await queue.flush(true);
        expect(save).toHaveBeenCalledOnce();
    });
});
