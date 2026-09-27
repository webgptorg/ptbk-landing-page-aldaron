import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioCapture } from './RecordingStudioCapture';
import { RECORDING_MAX_PENDING_BYTES, type RecordingSource, type StudioRecording } from './recordingStudioTypes';

const STORAGE = vi.hoisted(() => ({ append: vi.fn(), save: vi.fn() }));
vi.mock('./recordingStudioStorage', () => ({ appendRecordingChunk: STORAGE.append, saveStudioRecording: STORAGE.save, createStudioRecording: async (recording: StudioRecording) => { await STORAGE.save(recording); return recording; } }));

class TestRecorder {
    static readonly instances: TestRecorder[] = [];
    static isTypeSupported = (_mimeType: string) => true;
    public state = 'inactive';
    public mimeType: string;
    public ondataavailable: ((event: { data: Blob }) => void) | null = null;
    public onstop: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public start = vi.fn(() => { this.state = 'recording'; });
    public stop = vi.fn(() => {
        this.state = 'inactive';
        queueMicrotask(() => { this.emit('tail'); this.onstop?.(); });
    });
    public constructor(_stream: MediaStream, options?: MediaRecorderOptions) { this.mimeType = options?.mimeType ?? 'video/webm'; TestRecorder.instances.push(this); }
    public emit(content: string) { this.ondataavailable?.({ data: new Blob([content]) }); }
}

function makeSource(id: string, isAudioIncluded = false): RecordingSource {
    const videoTrack = Object.assign(new EventTarget(), { readyState: 'live', label: id, getSettings: () => ({ width: 640, height: 480, frameRate: 30 }) });
    const audioTrack = Object.assign(new EventTarget(), { kind: 'audio', readyState: 'live', muted: false, label: 'Fixture microphone', getSettings: () => ({ deviceId: 'fixture-mic' }) });
    const audioTracks = isAudioIncluded ? [audioTrack] : [];
    return {
        id, kind: 'camera', label: id, cameraDeviceId: '', cameraDeviceLabel: null,
        microphoneDeviceId: isAudioIncluded ? 'fixture-mic' : '', microphoneDeviceLabel: isAudioIncluded ? 'Fixture microphone' : null,
        displaySurface: null, displaySourceLabel: null, isCaptureEnabled: true,
        isAudioEnabled: isAudioIncluded, microphoneLabel: isAudioIncluded ? 'Fixture microphone' : null,
        stream: { getVideoTracks: () => [videoTrack], getAudioTracks: () => audioTracks, getTracks: () => [videoTrack, ...audioTracks] } as unknown as MediaStream,
    };
}

describe('multi-source capture barriers and durable failure handling', () => {
    beforeEach(() => { TestRecorder.instances.length = 0; vi.stubGlobal('MediaRecorder', TestRecorder); STORAGE.append.mockReset().mockResolvedValue(undefined); STORAGE.save.mockReset().mockResolvedValue(undefined); });
    afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

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

    it('records a sound-enabled camera into one supported video/audio file and saves audio metadata', async () => {
        const source = makeSource('camera with microphone', true);
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([source]);
        expect(TestRecorder.instances[0].mimeType).toBe('video/webm;codecs=vp9,opus');
        const result = await capture.stop();
        expect(result?.tracks[0]).toMatchObject({ isAudioIncluded: true, audioSourceLabel: 'Fixture microphone' });
        expect(result?.sourceConfiguration?.[0]).toMatchObject({ isAudioEnabled: true, microphoneDeviceId: 'fixture-mic' });
    });

    it('refuses to start a configured camera when its required microphone track is missing', async () => {
        const source = makeSource('camera with missing microphone', true);
        source.stream.getAudioTracks = () => [];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([source]);
        expect(TestRecorder.instances).toHaveLength(0);
        expect(await capture.finished).toBeNull();
        expect(capture.failureMessage).toContain('Požadovaná zvuková stopa mikrofonu');
    });

    it('falls through to a browser-supported MP4 audio/video codec combination', async () => {
        vi.spyOn(TestRecorder, 'isTypeSupported').mockImplementation((mimeType) => mimeType === 'video/mp4');
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera with microphone', true)]);
        expect(TestRecorder.instances[0].mimeType).toBe('video/mp4');
        await capture.stop();
    });

    it('stops and preserves the session when a required microphone track is muted', async () => {
        const source = makeSource('camera with microphone', true);
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([source, makeSource('another camera')]);
        source.stream.getAudioTracks()[0].dispatchEvent(new Event('mute'));
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('přestal posílat zvuk');
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
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

    it('checks every source before starting any recorder when a configured camera is disconnected', async () => {
        const source = makeSource('two');
        Object.defineProperty(source.stream.getTracks()[0], 'readyState', { value: 'ended' });
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), source]);
        const result = await capture.finished;
        expect(result).toBeNull();
        expect(capture.failureMessage).toContain('už neposkytuje obraz');
        expect(TestRecorder.instances).toHaveLength(0);
    });

    it.each(['NotAllowedError', 'UnknownError', 'NotReadableError'])('stops every source on a storage %s, retaining acknowledged bytes', async (name) => {
        const onPendingBytes = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onPendingBytes });
        await capture.start([makeSource('one'), makeSource('two'), makeSource('three')]);
        TestRecorder.instances[0].emit('saved');
        await vi.waitFor(() => expect(onPendingBytes).toHaveBeenLastCalledWith(0));
        STORAGE.append.mockRejectedValueOnce(new DOMException('storage failure', name));
        TestRecorder.instances[1].emit('missing');
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.tracks.map((track) => track.byteLength)).toEqual([5, 0, 0]);
        expect(result?.captureEndSeconds).toBeGreaterThanOrEqual(0);
        expect(TestRecorder.instances.every((recorder) => recorder.stop.mock.calls.length === 1)).toBe(true);
        expect(onPendingBytes).toHaveBeenLastCalledWith(0);
    });

    it('bounds retained data before adding a delayed chunk and drains the earlier queue', async () => {
        let release!: () => void;
        STORAGE.append.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
        const onPendingBytes = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onPendingBytes });
        await capture.start([makeSource('one'), makeSource('two')]);
        const large = new Blob(['virtual size only']);
        Object.defineProperty(large, 'size', { value: RECORDING_MAX_PENDING_BYTES });
        TestRecorder.instances[0].ondataavailable?.({ data: large });
        await vi.waitFor(() => expect(STORAGE.append).toHaveBeenCalledOnce());
        TestRecorder.instances[1].emit('over the buffer');
        release();
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.tracks.map((track) => track.byteLength)).toEqual([RECORDING_MAX_PENDING_BYTES, 0]);
        expect(Math.max(...onPendingBytes.mock.calls.map(([bytes]) => bytes))).toBe(RECORDING_MAX_PENDING_BYTES);
        expect(STORAGE.append).toHaveBeenCalledOnce();
    });

    it('simulates ten hours and >10 GiB across three sources without 32-bit counter rollover (not a real soak)', async () => {
        let clock = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clock);
        let releasePending!: () => void;
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onPendingBytes: (bytes) => { if (bytes === 0) releasePending?.(); } });
        await capture.start([makeSource('one'), makeSource('two'), makeSource('three')]);
        const part = new Blob(['virtual size only']);
        Object.defineProperty(part, 'size', { value: 32 * 1024 ** 2 });
        for (let index = 0; index < 600; index += 1) {
            clock = (index + 1) * 60_000;
            const drained = new Promise<void>((resolve) => { releasePending = resolve; });
            TestRecorder.instances[index % 3].ondataavailable?.({ data: part });
            await drained;
        }
        const result = await capture.stop();
        expect(result?.status).toBe('complete');
        expect(result?.durationSeconds).toBe(36_000);
        expect(result?.tracks.every((track) => track.byteLength === 200 * part.size + 4)).toBe(true);
    });

    it('does not call a failed final checkpoint complete', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one')]);
        STORAGE.save.mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
        const result = await capture.stop();
        expect(result?.status).toBe('interrupted');
        expect(result?.tracks[0].byteLength).toBe(4);
    });

    it('reports a denied storage destination before capture starts', async () => {
        STORAGE.save.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one')]);
        expect(await capture.finished).toBeNull();
        expect(capture.failureMessage).toContain('Oprávnění k úložišti');
        expect(TestRecorder.instances[0].start).not.toHaveBeenCalled();
    });

    it('never calls the session complete when a recorder supplied no media', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), makeSource('two')]);
        TestRecorder.instances[1].ondataavailable = null;
        const result = await capture.stop();
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('two');
        expect(result?.tracks.map((track) => track.byteLength)).toEqual([4, 0]);
    });
});
