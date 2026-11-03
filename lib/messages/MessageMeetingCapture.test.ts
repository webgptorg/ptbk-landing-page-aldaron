import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageMeetingCapture } from './MessageMeetingCapture';
import { listRecordingParts, loadRecordingPart, localRecordingFile } from './messageRecordingStorage';
import { RECORDING_PART_MS } from './messageRecordingTypes';
import { readStudioRecording, listStudioRecordings, readRecordingTrack } from '@/lib/recording-studio/recordingStudioStorage';
import * as storage from './messageRecordingStorage';
import { LEGACY_MESSAGE_CAPTURE_LOCK } from './messageRecordingStudio';
class Track extends EventTarget { stop = vi.fn(); }
class Recorder {
    static instances: Recorder[] = [];
    static isTypeSupported = () => true;
    state = 'inactive'; ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null; onerror: (() => void) | null = null;
    timer?: ReturnType<typeof setInterval>;
    constructor() { Recorder.instances.push(this); }
    start(ms: number) { this.state = 'recording'; this.ondataavailable?.({ data: new Blob(['HEADER|']) }); this.timer = setInterval(() => { if (this.state === 'recording') this.ondataavailable?.({ data: new Blob(['audio|']) }); }, ms); }
    pause() { this.state = 'paused'; }
    resume() { this.state = 'recording'; }
    requestData() { this.ondataavailable?.({ data: new Blob(['FLUSH|']) }); }
    stop() { this.state = 'inactive'; clearInterval(this.timer); queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(['FINAL']) }); this.onstop?.(); }); }
}
let track: Track, held: boolean;
const heldLocks = new Set<string>();
const captures: MessageMeetingCapture[] = [];
const createCapture = (events: ConstructorParameters<typeof MessageMeetingCapture>[0]) => { const capture = new MessageMeetingCapture(events); captures.push(capture); return capture; };
beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'] });
    track = new Track(); held = false; heldLocks.clear(); Recorder.instances = [];
    const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
    vi.stubGlobal('document', document); vi.stubGlobal('MediaRecorder', Recorder);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track], getAudioTracks: () => [track] })) },
        locks: { request: async (name: string, _options: unknown, run: (lock: unknown) => Promise<void>) => {
            if (heldLocks.has(name)) return run(null); heldLocks.add(name); held = true;
            try { await run({}); } finally { heldLocks.delete(name); held = heldLocks.size > 0; }
        } },
    });
});
afterEach(async () => { for (const capture of captures.splice(0)) await capture.stop(true).catch(() => undefined); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('meeting capture recovery boundaries', () => {
    it('does not migrate or race an older recorder still running in another tab', async () => {
        heldLocks.add(LEGACY_MESSAGE_CAPTURE_LOCK);
        const recorder = createCapture({ changed: vi.fn(), failed: vi.fn() });
        await expect(recorder.start('new', 'Old tab still capturing')).rejects.toThrow('původní rekordér');
        expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
        heldLocks.delete(LEGACY_MESSAGE_CAPTURE_LOCK);
        await recorder.start('new', 'After old tab finished'); await recorder.stop();
        expect((await loadRecordingPart(recorder.currentPart!.id))!.status).toBe('complete');
    });
    it('releases microphone and studio ownership when the encoder refuses to start', async () => {
        const recorder = createCapture({ changed: vi.fn(), failed: vi.fn() });
        const start = vi.spyOn(Recorder.prototype, 'start').mockImplementationOnce(() => { throw new Error('Encoder unavailable'); });
        await expect(recorder.start('new', 'Failed encoder')).rejects.toThrow('Encoder unavailable');
        expect(held).toBe(false); expect(track.stop).toHaveBeenCalledOnce(); expect(recorder.isActive).toBe(false);
        start.mockRestore();
        await recorder.start('new', 'Retry encoder'); await recorder.stop();
        expect((await loadRecordingPart(recorder.currentPart!.id))!.status).toBe('complete');
    });
    it('waits for final recorder bytes and persistence before closing and releasing the microphone', async () => {
        const recorder = createCapture({ changed: vi.fn(), failed: vi.fn() });
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
    it('keeps pauses in one file, freezes its clock, never rotates and preserves it when a new meeting starts', async () => {
        const recorder = createCapture({ changed: vi.fn(), failed: vi.fn() });
        await recorder.start('new', 'First meeting', undefined, 'Test agent');
        const firstId = recorder.currentPart!.id;
        await vi.advanceTimersByTimeAsync(4_000);
        await recorder.pause();
        const pausedAt = recorder.elapsedSeconds;
        await vi.advanceTimersByTimeAsync(20_000);
        expect(recorder.elapsedSeconds).toBe(pausedAt);
        recorder.resume();
        await vi.advanceTimersByTimeAsync(RECORDING_PART_MS + 50);
        expect(Recorder.instances).toHaveLength(1);
        await recorder.stop();
        const first = (await loadRecordingPart(firstId))!;
        const bytes = await (await localRecordingFile(first))!.text();
        expect(bytes).toMatch(/^HEADER\|.*FINAL$/);
        const backup = (await readStudioRecording(firstId))!;
        expect(backup.title).toContain('Messages recording · Test agent');
        expect(backup.tracks).toHaveLength(1);
        expect(await (await readRecordingTrack(backup.id, backup.tracks[0])).text()).toBe(bytes);
        await recorder.start('new', 'Second meeting'); await recorder.stop();
        expect(recorder.currentPart!.id).not.toBe(firstId);
        expect(await (await localRecordingFile((await loadRecordingPart(firstId))!))!.text()).toBe(bytes);
        expect((await listStudioRecordings()).filter(recording => [firstId, recorder.currentPart!.id].includes(recording.id))).toHaveLength(2);
    });
    it('continues after a hidden-tab delay without the old foreground watchdog stopping the recorder', async () => {
        const failed = vi.fn(), recorder = createCapture({ changed: vi.fn(), failed });
        await recorder.start('new', 'Background');
        Object.assign(document, { visibilityState: 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
        clearInterval(Recorder.instances[0].timer);
        await vi.advanceTimersByTimeAsync(90_000);
        expect(recorder.isActive).toBe(true); expect(failed).not.toHaveBeenCalled();
        Object.assign(document, { visibilityState: 'visible' });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(recorder.isActive).toBe(true);
        await recorder.stop();
    });
    it('prevents a second tab from recording and preserves bytes after microphone loss', async () => {
        const failed = vi.fn(), recorder = createCapture({ changed: vi.fn(), failed });
        await recorder.start('new', 'Lost mic'); const id = recorder.currentPart!.id;
        const other = createCapture({ changed: vi.fn(), failed: vi.fn() });
        await expect(other.start('new', 'Other')).rejects.toThrow('jiná záložka');
        track.dispatchEvent(new Event('ended')); await recorder.stop();
        const part = (await loadRecordingPart(id))!;
        expect(part.status).toBe('interrupted'); expect(part.chunkCount).toBeGreaterThan(0);
        expect(failed).toHaveBeenCalledOnce(); expect(held).toBe(false);
    });
    it('stops on storage failure and retains the delivered original tail for emergency download', async () => {
        const failed = vi.fn(), recorder = createCapture({ changed: vi.fn(), failed });
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
