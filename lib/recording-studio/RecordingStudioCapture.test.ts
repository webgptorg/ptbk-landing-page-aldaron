import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioCapture } from './RecordingStudioCapture';
import type { RecordingSource, StudioRecording } from './recordingStudioTypes';

const STORAGE = vi.hoisted(() => ({ append: vi.fn(), save: vi.fn() }));
vi.mock('./recordingStudioStorage', () => ({ appendRecordingChunk: STORAGE.append, saveStudioRecording: STORAGE.save }));

class TestRecorder {
    static readonly instances: TestRecorder[] = [];
    static isTypeSupported = () => true;
    public state = 'inactive';
    public mimeType = 'video/webm';
    public ondataavailable: ((event: { data: Blob }) => void) | null = null;
    public onstop: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public start = vi.fn(() => { this.state = 'recording'; });
    public stop = vi.fn(() => {
        this.state = 'inactive';
        queueMicrotask(() => { this.emit('tail'); this.onstop?.(); });
    });
    public constructor() { TestRecorder.instances.push(this); }
    public emit(content: string) { this.ondataavailable?.({ data: new Blob([content]) }); }
}

function makeSource(id: string): RecordingSource {
    const track = Object.assign(new EventTarget(), { readyState: 'live', getSettings: () => ({ width: 640, height: 480, frameRate: 30 }) });
    return { id, kind: 'camera', label: id, stream: { getVideoTracks: () => [track], getAudioTracks: () => [], getTracks: () => [track] } as unknown as MediaStream };
}

describe('multi-source capture barriers and durable failure handling', () => {
    beforeEach(() => { TestRecorder.instances.length = 0; vi.stubGlobal('MediaRecorder', TestRecorder); STORAGE.append.mockReset().mockResolvedValue(undefined); STORAGE.save.mockReset().mockResolvedValue(undefined); });
    afterEach(() => vi.unstubAllGlobals());

    it('starts/stops every source together and waits for the last data event and its disk write', async () => {
        const onProgress = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress, onStopping: vi.fn() });
        await capture.start([makeSource('one'), makeSource('two')]);
        expect(TestRecorder.instances.map((recorder) => recorder.state)).toEqual(['recording', 'recording']);
        let release!: () => void;
        STORAGE.append.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
        const finish = vi.fn();
        const completion = capture.stop().then(finish);
        expect(TestRecorder.instances.map((recorder) => recorder.stop.mock.calls.length)).toEqual([1, 1]);
        await vi.waitFor(() => expect(STORAGE.append).toHaveBeenCalledTimes(1));
        expect(finish).not.toHaveBeenCalled();
        release();
        await completion;
        const result = finish.mock.calls[0][0] as StudioRecording;
        expect(result.status).toBe('complete');
        expect(result.tracks.map((track) => [track.byteLength, track.chunkCount])).toEqual([[4, 1], [4, 1]]);
        expect(STORAGE.append.mock.calls.map((call) => [call[1], call[2]])).toEqual([['one', 0], ['two', 0]]);
    });

    it('stops all sources when a device disconnects', async () => {
        const sources = [makeSource('one'), makeSource('two')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start(sources);
        sources[1].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        const result = await capture.finished;
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('two');
    });

    it('keeps only acknowledged bytes after a quota failure and never writes beyond the gap', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), makeSource('two')]);
        TestRecorder.instances[0].emit('good');
        await vi.waitFor(() => expect(STORAGE.append).toHaveBeenCalledTimes(1));
        STORAGE.append.mockRejectedValueOnce(new DOMException('Full', 'QuotaExceededError'));
        TestRecorder.instances[1].emit('lost');
        TestRecorder.instances[0].emit('also lost');
        const result = await capture.finished;
        expect(STORAGE.append).toHaveBeenCalledTimes(2);
        expect(result?.tracks.map((track) => track.byteLength)).toEqual([4, 0]);
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('plné');
        expect(TestRecorder.instances.every((recorder) => recorder.stop.mock.calls.length === 1)).toBe(true);
    });

    it('releases a partially started batch when a later recorder fails to start', async () => {
        const source = makeSource('two');
        Object.defineProperty(source.stream.getTracks()[0], 'readyState', { value: 'ended' });
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), source]);
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(TestRecorder.instances[0].state).toBe('inactive');
        expect(TestRecorder.instances[1].start).not.toHaveBeenCalled();
    });
});
