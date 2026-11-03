import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageMeetingCapture } from './MessageMeetingCapture';
import { listRecordingParts, loadRecordingPart, localRecordingFile } from './messageRecordingStorage';
import { RECORDING_PART_MS } from './messageRecordingTypes';
import * as storage from './messageRecordingStorage';
class Track extends EventTarget { stop = vi.fn(); }
class Recorder {
    static instances: Recorder[] = [];
    static isTypeSupported = () => true;
    state = 'inactive'; ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null; onerror: (() => void) | null = null;
    timer?: ReturnType<typeof setInterval>;
    constructor() { Recorder.instances.push(this); }
    start(ms: number) { this.state = 'recording'; this.ondataavailable?.({ data: new Blob(['HEADER|']) }); this.timer = setInterval(() => this.ondataavailable?.({ data: new Blob(['audio|']) }), ms); }
    stop() { this.state = 'inactive'; clearInterval(this.timer); queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(['FINAL']) }); this.onstop?.(); }); }
}
let track: Track, held: boolean;
beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    track = new Track(); held = false; Recorder.instances = [];
    const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
    vi.stubGlobal('document', document); vi.stubGlobal('MediaRecorder', Recorder);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track], getAudioTracks: () => [track] })) },
        locks: { request: async (_name: string, _options: unknown, run: (lock: unknown) => Promise<void>) => {
            if (held) return run(null); held = true; try { await run({}); } finally { held = false; }
        } },
    });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('meeting capture recovery boundaries', () => {
    it('waits for final recorder bytes and persistence before closing and releasing the microphone', async () => {
        const recorder = new MessageMeetingCapture({ changed: vi.fn(), failed: vi.fn() });
        await recorder.start('new', 'Stop ordering');
        const id = recorder.currentPart!.id;
        await recorder.stop();
        const part = (await loadRecordingPart(id))!;
        expect(part.status).toBe('complete');
        expect(await (await localRecordingFile(part))!.text()).toBe('HEADER|FINAL');
        expect(track.stop).toHaveBeenCalledOnce(); expect(held).toBe(false);
        await recorder.stop(true);
        expect((await loadRecordingPart(id))!.status).toBe('complete');
    });
    it('rotates independently playable parts and resumes an interrupted meeting with the same group and a new file', async () => {
        const recorder = new MessageMeetingCapture({ changed: vi.fn(), failed: vi.fn() });
        await recorder.start('new', 'Rotation'); const group = recorder.currentPart!.recordingId;
        await vi.advanceTimersByTimeAsync(RECORDING_PART_MS + 50);
        // Drain actual IndexedDB completion tasks, which are not fake timers.
        for (let i = 0; i < 2500 && Recorder.instances.length < 2; i++) await new Promise(resolve => setImmediate(resolve));
        expect(Recorder.instances.length).toBe(2);
        await recorder.stop(true);
        await recorder.start('new', 'Rotation', group); await recorder.stop();
        const parts = (await listRecordingParts()).filter(part => part.recordingId === group);
        expect(parts.length).toBeGreaterThanOrEqual(3);
        for (const part of parts) {
            const file = (await localRecordingFile(part))!;
            expect(await file.text()).toMatch(/^HEADER\|.*FINAL$/);
        }
        expect(parts.some(part => part.status === 'interrupted')).toBe(true);
        expect(new Set(parts.map(part => part.id)).size).toBe(parts.length);
    });
    it('prevents a second tab from recording and preserves bytes after microphone loss', async () => {
        const failed = vi.fn(), recorder = new MessageMeetingCapture({ changed: vi.fn(), failed });
        await recorder.start('new', 'Lost mic'); const id = recorder.currentPart!.id;
        const other = new MessageMeetingCapture({ changed: vi.fn(), failed: vi.fn() });
        await expect(other.start('new', 'Other')).rejects.toThrow('jiná záložka');
        track.dispatchEvent(new Event('ended')); await recorder.stop();
        const part = (await loadRecordingPart(id))!;
        expect(part.status).toBe('interrupted'); expect(part.chunkCount).toBeGreaterThan(0);
        expect(failed).toHaveBeenCalledOnce(); expect(held).toBe(false);
    });
    it('stops on storage failure and retains the delivered original tail for emergency download', async () => {
        const failed = vi.fn(), recorder = new MessageMeetingCapture({ changed: vi.fn(), failed });
        vi.spyOn(storage, 'saveRecordingChunk').mockRejectedValueOnce(new Error('QuotaExceededError'));
        await recorder.start('new', 'Full storage');
        for (let i = 0; i < 100 && !failed.mock.calls.length; i++) await new Promise(resolve => setImmediate(resolve));
        await recorder.stop();
        expect(failed).toHaveBeenCalledOnce(); expect(recorder.isActive).toBe(false);
        expect(await new Blob(recorder.unsaved).text()).toBe('HEADER|FINAL');
        expect((await loadRecordingPart(recorder.currentPart!.id))!.status).toBe('interrupted');
        expect(held).toBe(false);
    });
});
