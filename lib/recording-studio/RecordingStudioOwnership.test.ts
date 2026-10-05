import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioOwnership, type RecordingStudioOwnershipDelegate, type RecordingStudioOwnershipEnvironment } from './RecordingStudioOwnership';
import { createRecordingStudioOwnershipMessage, type RecordingStudioOwnershipMessage, type RecordingStudioOwnershipMessageContent } from './recordingStudioOwnershipMessages';
import type { RecordingStudioAuthorityRecord } from './recordingStudioAuthority';

const CONTROLLERS: RecordingStudioOwnership[] = [];
const EMPTY_REPORT = { stoppedRecording: null, unsavedEditDetail: null, unsettledOperationCount: 0 };
const OWNER_STATE = { phase: 'idle' as const, recordedSeconds: 0, isFileWorkRunning: false, isEditUnsaved: false };

function createController({ isOtherLockHeld = false, generation = 0 }: { isOtherLockHeld?: boolean; generation?: number } = {}) {
    let record: RecordingStudioAuthorityRecord = { generation, ownerInstanceId: generation === 0 ? null : 'other-owner', claimedAt: null };
    let receive: ((message: RecordingStudioOwnershipMessage) => void) | null = null;
    const posted: RecordingStudioOwnershipMessageContent[] = [];
    const lockModes: string[] = [];
    const claim = vi.fn(async (instanceId: string, expected: number, signal?: AbortSignal) => {
        signal?.throwIfAborted();
        if (record.generation !== expected) return null;
        record = { generation: expected + 1, ownerInstanceId: instanceId, claimedAt: 0 };
        return { generation: record.generation, instanceId };
    });
    const delegate: RecordingStudioOwnershipDelegate = {
        activate: vi.fn(async () => undefined), describeState: () => OWNER_STATE,
        settleWork: vi.fn(async () => ({ outcome: 'settled' as const, report: EMPTY_REPORT })), resumeWork: vi.fn(),
        abandonWork: vi.fn(async () => undefined), deactivate: vi.fn(), shutDown: vi.fn(async () => undefined),
    };
    const environment: RecordingStudioOwnershipEnvironment = {
        authority: { read: async () => record, claim, surrender: vi.fn(), subscribeToLoss: () => () => undefined, assertCurrent: async () => undefined },
        readLockState: async () => ({ isHeld: isOtherLockHeld, isAwaited: true }),
        openChannel: () => ({ post: (message) => posted.push(message), subscribe: (listener) => { receive = listener; return () => { receive = null; }; }, close: () => undefined }),
        runWithLock: async (request, operation) => {
            lockModes.push(request.mode);
            const preparation = await operation.prepare();
            if (request.mode === 'wait' && isOtherLockHeld) {
                if (!request.signal.aborted) await new Promise<void>((resolve) => request.signal.addEventListener('abort', () => resolve(), { once: true }));
                return;
            }
            const lock = isOtherLockHeld ? null : { name: 'promptbook-recording-studio', mode: 'exclusive' } as Lock;
            await operation.run(lock, preparation);
        },
    };
    const controller = new RecordingStudioOwnership(delegate, environment);
    CONTROLLERS.push(controller);
    return { controller, delegate, claim, posted, lockModes, send: (message: RecordingStudioOwnershipMessageContent) => receive?.(createRecordingStudioOwnershipMessage(message)) };
}

afterEach(async () => {
    CONTROLLERS.splice(0).forEach((controller) => controller.dispose());
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
});

describe('addressed studio ownership and confirmations', () => {
    it('keeps a deactivated page inactive until an explicit request, including when no lock is held', async () => {
        vi.useFakeTimers();
        const fixture = createController();
        fixture.controller.start(false);
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.controller.getSnapshot().status).toBe('inactive');
        expect(fixture.lockModes).toEqual([]);
        expect(fixture.claim).not.toHaveBeenCalled();
        fixture.controller.prepareTakeover(); fixture.controller.requestTakeover();
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.controller.getSnapshot().status).toBe('active');
        expect(fixture.lockModes).toEqual(['wait']);
        expect(fixture.delegate.activate).toHaveBeenCalledOnce();
    });

    it('does not automatically reacquire after a suspended old owner was refreshed following revocation', async () => {
        vi.useFakeTimers();
        const fixture = createController({ generation: 2 });
        fixture.controller.start(true, { generation: 1, instanceId: 'old-document' });
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.controller.getSnapshot()).toMatchObject({ status: 'inactive', inactivity: { reason: 'revoked' } });
        expect(fixture.claim).not.toHaveBeenCalled();
    });

    it('never steals a legacy owner without storage fencing', async () => {
        vi.useFakeTimers();
        const fixture = createController({ isOtherLockHeld: true });
        fixture.controller.start();
        await vi.advanceTimersByTimeAsync(0);
        fixture.controller.requestTakeover();
        await vi.advanceTimersByTimeAsync(5_001);
        expect(fixture.controller.getSnapshot().takeover.phase).toBe('stalled');
        fixture.controller.forceTakeover();
        expect(fixture.controller.getSnapshot().takeover).toMatchObject({ phase: 'failed', failure: { kind: 'error' } });
        expect(fixture.lockModes).not.toContain('steal');
        expect(fixture.claim).not.toHaveBeenCalled();
    });

    it('bounds an unconfirmed revocation and never activates the requesting page', async () => {
        vi.useFakeTimers();
        const fixture = createController({ isOtherLockHeld: true, generation: 1 });
        fixture.controller.start();
        await vi.advanceTimersByTimeAsync(0);
        fixture.controller.requestTakeover();
        await vi.advanceTimersByTimeAsync(5_001);
        fixture.claim.mockImplementation((_instanceId, _generation, signal) => new Promise((_resolve, reject) => {
            signal!.addEventListener('abort', () => reject(signal!.reason), { once: true });
        }));
        fixture.controller.forceTakeover();
        await vi.advanceTimersByTimeAsync(8_001);
        expect(fixture.controller.getSnapshot()).toMatchObject({ status: 'inactive', takeover: {
            phase: 'failed', failure: { kind: 'revocation-unconfirmed' },
        } });
        expect(fixture.delegate.activate).not.toHaveBeenCalled();
    });

    it('does not stop for a cancelled queued request, an unrelated confirmation or duplicate messages', async () => {
        vi.useFakeTimers();
        const fixture = createController();
        fixture.controller.start();
        await vi.advanceTimersByTimeAsync(0);
        const address = { requestId: 'request-1', fromInstanceId: 'requester', toInstanceId: fixture.controller.instanceId };
        const request = { type: 'handover-request' as const, ...address, generation: 1, sentAt: Date.now(), isUnsavedEditDiscardAllowed: false };
        fixture.send(request);
        fixture.send(request);
        expect(fixture.posted.filter(({ type }) => type === 'handover-accepted')).toHaveLength(1);
        fixture.send({ type: 'handover-confirm', ...address, fromInstanceId: 'unrelated', generation: 1 });
        fixture.send({ type: 'handover-cancel', ...address });
        await vi.advanceTimersByTimeAsync(0);
        fixture.send({ type: 'handover-confirm', ...address, generation: 1 });
        fixture.send(request);
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.delegate.settleWork).not.toHaveBeenCalled();
        expect(fixture.delegate.deactivate).not.toHaveBeenCalled();
        expect(fixture.controller.getSnapshot().status).toBe('active');
        expect(fixture.posted.filter(({ type }) => type === 'handover-rejected')).toHaveLength(1);
    });
});
