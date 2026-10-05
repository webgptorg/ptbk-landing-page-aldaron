import { discardPendingAdminEditorSaves, flushAdminEditorSaves, getPendingAdminEditorSaves } from '@/lib/admin/adminPendingSaves';
import type { RecordingStudioCapture } from './RecordingStudioCapture';
import type { RecordingStudioOwnershipDelegate, RecordingStudioWorkSettlement } from './RecordingStudioOwnership';
import { cancelRecordingStudioWork, settleRecordingStudioWork } from './recordingStudioWork';

const HANDOVER_INTERRUPTION_MESSAGE = 'Záznam byl zastaven při převzetí studia v jiné kartě. Potvrzené části zůstávají zachované.';
const MAXIMUM_HANDOVER_DETAIL_LENGTH = 2_000;

type HandoverRuntime = {
    readonly activationSettlement: Promise<void> | null;
    readonly startSettlement: Promise<unknown> | null;
    readonly capture: RecordingStudioCapture | null;
};

/** Shares Stop's real recorder barrier and persistence queue; never recovers a take still owned by another tab. */
export async function settleRecordingStudioHandover(runtime: HandoverRuntime,
    request: Parameters<RecordingStudioOwnershipDelegate['settleWork']>[0],
    setWorkAccepted: (isAccepted: boolean) => void, releaseDevices: () => void): Promise<RecordingStudioWorkSettlement> {
    const { isCancelled, reportStage, isUnsavedEditDiscardAllowed } = request;
    if (isCancelled()) return { outcome: 'refused', reason: 'cancelled', detail: null };
    setWorkAccepted(false);
    await runtime.activationSettlement;
    setWorkAccepted(false);
    if (isCancelled()) return { outcome: 'refused', reason: 'cancelled', detail: null };
    reportStage('cancelling-work');
    cancelRecordingStudioWork();
    reportStage('stopping-recording');
    const capture = runtime.capture;
    const stoppedRecording = await capture?.stop(HANDOVER_INTERRUPTION_MESSAGE) ?? null;
    await runtime.startSettlement;
    releaseDevices();
    await settleRecordingStudioWork();
    if (capture?.finalizationSaveError) return { outcome: 'refused', reason: 'cleanup-failed', detail: capture.finalizationSaveError };
    reportStage('saving-edits');
    const isSaved = await flushAdminEditorSaves();
    const unsavedEditDetail = isSaved ? null : getPendingAdminEditorSaves().map((queue) =>
        queue.getSnapshot().errorMessage ?? 'Změny editoru nejsou uložené.').join(' ').slice(0, MAXIMUM_HANDOVER_DETAIL_LENGTH);
    if (!isSaved && !isUnsavedEditDiscardAllowed) return { outcome: 'refused', reason: 'unsaved-edits', detail: unsavedEditDetail };
    if (!isSaved) discardPendingAdminEditorSaves();
    return { outcome: 'settled', report: { stoppedRecording: stoppedRecording ? {
        id: stoppedRecording.id, title: stoppedRecording.title, status: stoppedRecording.status === 'complete' ? 'complete' : 'interrupted', errorMessage: stoppedRecording.errorMessage,
    } : null, unsavedEditDetail, unsettledOperationCount: 0 } };
}
