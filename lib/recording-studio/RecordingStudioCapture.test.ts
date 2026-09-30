import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioCapture } from './RecordingStudioCapture';
import { createRecordingEditRecipe, getRecordingSelection, getRecordingUnavailableRanges } from './recordingStudioSessionTime';
import { RECORDING_INDEX_REPAIR_COMMAND } from './recordingStudioIndex';
import { createIndexedMatroskaBlob, createUnindexedMatroskaBlob } from './recordingStudioTestUtilities';
import { RECORDING_MAX_PENDING_BYTES, type RecordingSource, type StudioRecording } from './recordingStudioTypes';

const STORAGE = vi.hoisted(() => ({ append: vi.fn(), save: vi.fn(), readPart: vi.fn() }));
const MEDIA = vi.hoisted(() => ({ inspect: vi.fn() }));
const REINDEX = vi.hoisted(() => ({ canRebuild: vi.fn() }));
vi.mock('./recordingStudioStorage', () => ({ appendRecordingChunk: STORAGE.append, saveStudioRecording: STORAGE.save, readRecordingPart: STORAGE.readPart,
    createStudioRecording: async (recording: StudioRecording) => { await STORAGE.save(recording); return recording; } }));
vi.mock('./recordingStudioMedia', () => ({ inspectRecordingBlob: MEDIA.inspect }));
vi.mock('./recordingStudioReindex', () => ({ canRebuildRecordingIndex: REINDEX.canRebuild }));

class TestRecorder {
    static readonly instances: TestRecorder[] = [];
    static failStartAt = -1;
    static isTypeSupported = (_mimeType: string) => true;
    public state = 'inactive';
    public mimeType: string;
    public ondataavailable: ((event: { data: Blob }) => void) | null = null;
    public onstop: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public start = vi.fn(() => {
        if (TestRecorder.instances.indexOf(this) === TestRecorder.failStartAt) throw new Error('Synthetic recorder start failure');
        this.state = 'recording';
    });
    public stop = vi.fn(() => {
        this.state = 'inactive';
        queueMicrotask(() => { this.emit('tail'); this.onstop?.(); });
    });
    public constructor(_stream: MediaStream, options?: MediaRecorderOptions) { this.mimeType = options?.mimeType ?? 'video/webm'; TestRecorder.instances.push(this); }
    public emit(content: string) { this.ondataavailable?.({ data: new Blob([content]) }); }
}

function makeSource(id: string, isAudioIncluded = false): RecordingSource {
    const videoTrack = Object.assign(new EventTarget(), { kind: 'video', readyState: 'live', muted: false, label: id, stop: vi.fn(), getSettings: () => ({ width: 640, height: 480, frameRate: 30 }) });
    const audioTrack = Object.assign(new EventTarget(), { kind: 'audio', readyState: 'live', muted: false, label: 'Fixture microphone', stop: vi.fn(), getSettings: () => ({ deviceId: 'fixture-mic' }) });
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
    beforeEach(() => {
        TestRecorder.instances.length = 0; TestRecorder.failStartAt = -1; vi.stubGlobal('MediaRecorder', TestRecorder);
        STORAGE.append.mockReset().mockResolvedValue(undefined); STORAGE.save.mockReset().mockResolvedValue(undefined);
        STORAGE.readPart.mockReset().mockResolvedValue(new Blob(['encoded']));
        REINDEX.canRebuild.mockReset().mockResolvedValue(true);
        MEDIA.inspect.mockReset().mockImplementation(async (_blob: Blob, track: { durationSeconds: number; kind: string; isAudioIncluded: boolean }) => {
            const durationSeconds = Math.max(0.001, track.durationSeconds);
            const components = track.kind === 'microphone' ? [{ kind: 'audio', firstTimestampSeconds: 0, endTimestampSeconds: durationSeconds }]
                : [{ kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds: durationSeconds },
                    ...(track.isAudioIncluded ? [{ kind: 'audio', firstTimestampSeconds: 0, endTimestampSeconds: durationSeconds }] : [])];
            return { firstTimestampSeconds: 0, availableStartTimestampSeconds: 0, endTimestampSeconds: durationSeconds, components };
        });
    });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

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
        expect(STORAGE.append.mock.calls.map((call) => [call[1], call[2]])).toEqual(result.tracks.map((track) => [track.parts?.[0].id, 0]));
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

    it('keeps each appended camera part\'s audio setting when an explicit replacement is video-only', async () => {
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start([makeSource('camera', true)]);
        const original = await first.stop();
        expect(original?.status).toBe('complete');
        const second = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), existingRecording: original! });
        await second.start([makeSource('camera', false)]);
        const appended = await second.stop();
        expect(appended?.status).toBe('complete');
        expect(appended?.tracks[0].parts?.map((part) => part.isAudioIncluded)).toEqual([true, false]);
        expect(appended?.tracks[0].parts?.map((part) => part.frameRate)).toEqual([30, 30]);
        expect(MEDIA.inspect.mock.calls.map((call) => call[1].isAudioIncluded)).toEqual([true, false]);
    });

    it('rejects reusing a source identity for another kind during append', async () => {
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start([makeSource('camera')]);
        const original = await first.stop();
        const second = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), existingRecording: original!, isSourceSetChangeAllowed: true });
        await second.start([{ ...makeSource('camera'), kind: 'screen' }]);
        expect(await second.finished).toBeNull();
        expect(second.failureMessage).toContain('stejnou identitou');
        expect(original?.status).toBe('complete');
    });

    it('rejects duplicate source identities before recording any data', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera'), makeSource('camera')]);
        expect(await capture.finished).toBeNull();
        expect(capture.failureMessage).toContain('duplicitní identitu');
        expect(TestRecorder.instances).toHaveLength(0);
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

    it('stops only the affected track when a required microphone is muted and keeps the others recording', async () => {
        const source = makeSource('camera with microphone', true);
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([source, makeSource('another camera')]);
        source.stream.getAudioTracks()[0].dispatchEvent(new Event('mute'));
        await vi.waitFor(() => expect(TestRecorder.instances[0].state).toBe('inactive'));
        expect(TestRecorder.instances[1].state).toBe('recording');
        expect(capture.currentPhase).toBe('recording');
        expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ impact: 'recording-continues', sourceId: 'camera with microphone' }));
        expect(onFailure.mock.calls[0][0].message).toContain('přestal posílat zvuk');
        const result = await capture.stop();
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('ostatní stopy nahrávají dál');
        expect(result?.tracks.map((track) => track.parts?.length)).toEqual([1, 1]);
    });

    it('stops the whole take when the last remaining source is lost', async () => {
        const onFailure = vi.fn();
        const sources = [makeSource('one'), makeSource('two')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start(sources);
        sources[0].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        await vi.waitFor(() => expect(TestRecorder.instances[0].state).toBe('inactive'));
        sources[1].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        const result = await capture.finished;
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('poslední nahrávaný zdroj');
        expect(onFailure.mock.calls.map((call) => call[0].impact)).toEqual(['recording-continues', 'recording-stopped']);
    });

    it('interrupts a screen recording when the browser temporarily mutes its video track', async () => {
        const cameraFixture = makeSource('VS Code on another Space');
        const source: RecordingSource = { ...cameraFixture, kind: 'screen', displaySurface: 'window' };
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([source]);
        const videoTrack = source.stream.getVideoTracks()[0] as MediaStreamTrack & { muted: boolean };
        videoTrack.muted = true;
        videoTrack.dispatchEvent(new Event('mute'));
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('dočasně přestal poskytovat obraz');
        expect(result?.errorMessage).toContain('nejde o běžnou pauzu');
        expect(TestRecorder.instances[0].state).toBe('inactive');
    });

    it('keeps recording the remaining sources when one device disconnects and announces the loss', async () => {
        const onFailure = vi.fn();
        const sources = [makeSource('one'), makeSource('two')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start(sources);
        sources[1].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        await vi.waitFor(() => expect(TestRecorder.instances[1].state).toBe('inactive'));
        expect(TestRecorder.instances[0].state).toBe('recording');
        expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({
            impact: 'recording-continues', sourceId: 'two', sourceLabel: 'two',
            message: expect.stringContaining('byl odpojen') as unknown as string,
        }));
        const result = await capture.stop();
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('two');
        expect(result?.tracks.map((track) => track.id)).toEqual(['one', 'two']);
    });

    it('pauses and resumes a take which is missing a lost source, without recording it again', async () => {
        const sources = [makeSource('one'), makeSource('two')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start(sources);
        sources[1].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        await vi.waitFor(() => expect(TestRecorder.instances[1].state).toBe('inactive'));
        await capture.pause();
        expect(capture.currentPhase).toBe('paused');
        capture.resume();
        expect(capture.currentPhase).toBe('recording');
        const result = await capture.stop();
        expect(result?.tracks.map((track) => track.parts?.length)).toEqual([2, 1]);
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

    it('does not call a failed final checkpoint complete, and announces that last failure too', async () => {
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([makeSource('one')]);
        STORAGE.save.mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
        const result = await capture.stop();
        expect(result?.status).toBe('interrupted');
        expect(result?.tracks[0].byteLength).toBe(4);
        expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ impact: 'recording-stopped' }));
        expect(onFailure.mock.calls[0][0].message).toContain('plné');
    });

    it('reports a denied storage destination before capture starts', async () => {
        STORAGE.save.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one')]);
        expect(await capture.finished).toBeNull();
        expect(capture.failureMessage).toContain('Oprávnění k úložišti');
        expect(TestRecorder.instances).toHaveLength(0);
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

    it('closes every source at the same global pause boundary and excludes paused wall time', async () => {
        let clockMilliseconds = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clockMilliseconds);
        const phases: string[] = [];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onPhaseChange: (phase) => phases.push(phase) });
        await capture.start([makeSource('camera', true), makeSource('screen'), makeSource('microphone')]);
        clockMilliseconds = 1_000;
        await Promise.all([capture.pause(), capture.pause()]);
        expect(capture.currentPhase).toBe('paused');
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
        expect(capture.elapsedRecordingSeconds).toBe(1);
        clockMilliseconds = 6_000;
        expect(capture.elapsedRecordingSeconds).toBe(1);
        capture.resume();
        expect(TestRecorder.instances.slice(3).every((recorder) => recorder.state === 'recording')).toBe(true);
        clockMilliseconds = 8_000;
        const result = await capture.stop();
        expect(result?.status).toBe('complete');
        expect(result?.durationSeconds).toBe(3);
        expect(result?.tracks.every((track) => track.parts?.length === 2)).toBe(true);
        expect(result?.tracks.every((track) => track.parts?.[1].sessionStartSeconds === 1)).toBe(true);
        expect(result?.tracks.every((track) => track.parts?.[1].durationSeconds === 2)).toBe(true);
        expect(result?.tracks[0].isAudioIncluded).toBe(true);
        expect(phases).toContain('pausing');
        expect(phases).toContain('paused');
        expect(phases).toContain('resuming');
    });

    it('releases a recorder still gathering when its stop event never confirms the pause', async () => {
        const sources = [makeSource('camera'), makeSource('stalled screen')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start(sources);
        const stalledRecorder = TestRecorder.instances[1];
        stalledRecorder.stop = vi.fn();
        vi.useFakeTimers();
        const pause = capture.pause();
        await vi.advanceTimersByTimeAsync(15_000);
        await pause;
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('stalled screen');
        expect(stalledRecorder.stop).toHaveBeenCalledTimes(2);
        expect(sources[1].stream.getTracks()[0].stop).toHaveBeenCalledOnce();
    });

    it('moves the shared pause boundary to committed media timestamps and exposes a shorter source as a gap', async () => {
        let clockMilliseconds = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clockMilliseconds);
        const bounds = (endTimestampSeconds: number) => ({ firstTimestampSeconds: 0, availableStartTimestampSeconds: 0,
            endTimestampSeconds, components: [{ kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds }] });
        MEDIA.inspect.mockResolvedValueOnce(bounds(1.4)).mockResolvedValueOnce(bounds(1.1));
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera'), makeSource('screen')]);
        clockMilliseconds = 1_000;
        await capture.pause();
        expect(capture.elapsedRecordingSeconds).toBe(1.4);
        clockMilliseconds = 5_000;
        expect(capture.elapsedRecordingSeconds).toBe(1.4);
        capture.resume();
        clockMilliseconds = 6_000;
        const result = (await capture.stop())!;
        expect(result.durationSeconds).toBeCloseTo(2.4, 3);
        expect(result.tracks.every((track) => track.parts?.[1].sessionStartSeconds === 1.4)).toBe(true);
        expect(getRecordingUnavailableRanges(result.tracks[1], 2.4)).toContainEqual({ startSeconds: 1.1, endSeconds: 1.4 });
    });

    it('appends a new take under the same project ID and preserves a custom trim', async () => {
        let clockMilliseconds = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clockMilliseconds);
        const sources = [makeSource('camera'), makeSource('screen'), makeSource('microphone')];
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start(sources);
        clockMilliseconds = 4_000;
        const original = await first.stop();
        expect(original?.status).toBe('complete');
        const edited = { ...original!, trim: { startSeconds: 1, endSeconds: 3 } };
        const appended = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), existingRecording: edited });
        clockMilliseconds = 10_000;
        await appended.start(sources);
        clockMilliseconds = 12_000;
        const result = await appended.stop();
        expect(result?.id).toBe(original?.id);
        expect(result?.tracks.map((track) => track.id)).toEqual(original?.tracks.map((track) => track.id));
        expect(result?.takes).toHaveLength(2);
        expect(result?.tracks.every((track) => track.parts?.length === 2)).toBe(true);
        expect(result?.tracks.every((track) => track.parts?.[1].sessionStartSeconds === 4)).toBe(true);
        expect(result?.trim).toEqual({ startSeconds: 1, endSeconds: 3 });
        expect(result?.durationSeconds).toBe(6);
    });

    it('extends a full-session selection and leaves explicit source changes as lane gaps', async () => {
        let clockMilliseconds = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clockMilliseconds);
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start([makeSource('camera'), makeSource('former microphone')]);
        clockMilliseconds = 2_000;
        const original = await first.stop();
        const appended = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(),
            existingRecording: { ...original!, trim: { startSeconds: 0, endSeconds: 2 } }, isSourceSetChangeAllowed: true });
        clockMilliseconds = 5_000;
        await appended.start([makeSource('camera'), makeSource('new screen')]);
        clockMilliseconds = 7_000;
        const result = (await appended.stop())!;
        expect(result.tracks.map((track) => track.id)).toEqual(['camera', 'former microphone', 'new screen']);
        expect(result.trim).toEqual({ startSeconds: 0, endSeconds: 4 });
        expect(getRecordingSelection(result)).toEqual({ startSeconds: 0, endSeconds: 4 });
        expect(getRecordingUnavailableRanges(result.tracks[1], 4)).toEqual([{ startSeconds: 2, endSeconds: 4 }]);
        expect(getRecordingUnavailableRanges(result.tracks[2], 4)).toEqual([{ startSeconds: 0, endSeconds: 2 }]);
    });

    it('extends a legacy full-session recipe whose trim field is absent', async () => {
        let clockMilliseconds = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => clockMilliseconds);
        const source = makeSource('camera');
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start([source]);
        clockMilliseconds = 2_000;
        const original = (await first.stop())!;
        const previous = { ...original, editRecipe: createRecordingEditRecipe(original) };
        const appended = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), existingRecording: previous });
        clockMilliseconds = 4_000;
        await appended.start([source]);
        clockMilliseconds = 6_000;
        const result = (await appended.stop())!;

        expect(result.trim).toEqual({ startSeconds: 0, endSeconds: 4 });
        expect(result.editRecipe?.selection).toEqual(result.trim);
    });

    it('leaves a complete project untouched when a new take has no supported recorder codec', async () => {
        const first = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await first.start([makeSource('camera')]);
        const original = (await first.stop())!;
        STORAGE.save.mockClear();
        vi.spyOn(TestRecorder, 'isTypeSupported').mockReturnValue(false);
        const append = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), existingRecording: original });
        await append.start([makeSource('camera')]);
        expect(await append.finished).toBeNull();
        expect(STORAGE.save).not.toHaveBeenCalled();
        expect(original.status).toBe('complete');
    });

    it('stops from a pending pause only after every recorder flushes and never resumes a subset', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera', true), makeSource('screen'), makeSource('microphone')]);
        let releaseCamera!: () => void;
        const camera = TestRecorder.instances[0];
        camera.stop = vi.fn(() => {
            camera.state = 'inactive';
            releaseCamera = () => { camera.emit('tail'); camera.onstop?.(); };
        });
        const pause = capture.pause();
        const stop = capture.stop();
        expect(capture.currentPhase).toBe('stopping');
        expect(TestRecorder.instances).toHaveLength(3);
        await vi.waitFor(() => expect(releaseCamera).toBeTypeOf('function'));
        releaseCamera();
        await pause;
        const result = await stop;
        expect(result?.status).toBe('complete');
        expect(result?.tracks.every((track) => track.parts?.length === 1 && track.parts[0].byteLength > 0)).toBe(true);
        expect(TestRecorder.instances).toHaveLength(3);
    });

    it('releases a source whose recorder refuses Stop instead of leaving it active during pause', async () => {
        const source = makeSource('camera');
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([source, makeSource('screen')]);
        TestRecorder.instances[0].stop = vi.fn(() => { throw new Error('Synthetic stop failure'); });
        await capture.pause();
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('další záznam byl přerušen');
        expect(source.stream.getVideoTracks()[0].stop).toHaveBeenCalledOnce();
        expect(TestRecorder.instances[1].state).toBe('inactive');
    });

    it('interrupts the whole session when a recorder cannot resume its next aligned segment', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera', true), makeSource('screen'), makeSource('microphone')]);
        await capture.pause();
        TestRecorder.failStartAt = 4;
        capture.resume();
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('Synthetic recorder start failure');
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
        expect(result?.tracks.every((track) => track.parts?.[0].byteLength === 4)).toBe(true);
    });

    it('records the checked seek index of every closed part without announcing the ordinary live container', async () => {
        STORAGE.readPart.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.canRebuild.mockResolvedValue(true);
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([makeSource('camera'), makeSource('screen')]);
        const result = await capture.stop();
        expect(result?.status).toBe('complete');
        expect(result?.tracks.map((track) => track.parts?.[0].indexStatus)).toEqual(['unindexed', 'unindexed']);
        // One answer per container is enough, and a rebuildable index is nothing to wake anybody up for.
        expect(REINDEX.canRebuild).toHaveBeenCalledTimes(1);
        // Measuring a closed part and checking its index share one read of its committed chunks.
        expect(STORAGE.readPart).toHaveBeenCalledTimes(2);
        expect(onFailure).not.toHaveBeenCalled();
    });

    it('announces a missing index which this browser cannot rebuild, while keeping the take complete', async () => {
        STORAGE.readPart.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.canRebuild.mockResolvedValue(false);
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([makeSource('screen')]);
        const result = await capture.stop();
        expect(onFailure).toHaveBeenCalledWith(expect.objectContaining({ impact: 'recording-kept', sourceId: 'screen', sourceLabel: 'screen' }));
        expect(onFailure.mock.calls[0][0].message).toContain(RECORDING_INDEX_REPAIR_COMMAND);
        expect(result?.status).toBe('complete');
        expect(result?.errorMessage).toBeNull();
        expect(result?.tracks[0].parts?.[0].indexStatus).toBe('unindexed');
    });

    it('announces a part whose container cannot be checked at all', async () => {
        STORAGE.readPart.mockRejectedValue(new Error('Část média „part-one“ není úplná.'));
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([makeSource('camera')]);
        const result = await capture.stop();
        const indexFailure = onFailure.mock.calls.map(([failure]) => failure).find((failure) => failure.impact === 'recording-kept');
        expect(indexFailure?.message).toContain('Část média „part-one“ není úplná.');
        expect(indexFailure?.message).toContain(RECORDING_INDEX_REPAIR_COMMAND);
        // Measuring the part reads the same media, so its own failure still interrupts the take.
        expect(result?.errorMessage).not.toContain(RECORDING_INDEX_REPAIR_COMMAND);
    });

    it('leaves an already indexed container alone and never probes a rebuild for it', async () => {
        STORAGE.readPart.mockResolvedValue(createIndexedMatroskaBlob());
        const onFailure = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn(), onFailure });
        await capture.start([makeSource('camera')]);
        const result = await capture.stop();
        expect(result?.tracks[0].parts?.[0].indexStatus).toBe('indexed');
        expect(REINDEX.canRebuild).not.toHaveBeenCalled();
        expect(onFailure).not.toHaveBeenCalled();
    });

    it('checks the index of each part a pause closes, not only the last one', async () => {
        STORAGE.readPart.mockResolvedValue(createUnindexedMatroskaBlob());
        REINDEX.canRebuild.mockResolvedValue(true);
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('camera')]);
        await capture.pause();
        capture.resume();
        const result = await capture.stop();
        expect(result?.tracks[0].parts?.map((part) => part.indexStatus)).toEqual(['unindexed', 'unindexed']);
    });

    it('does not start recorders after Stop arrives during the initial storage checkpoint', async () => {
        let releaseStorage!: () => void;
        STORAGE.save.mockImplementationOnce(() => new Promise<void>((resolve) => { releaseStorage = resolve; }));
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        const starting = capture.start([makeSource('camera')]);
        await vi.waitFor(() => expect(releaseStorage).toBeTypeOf('function'));
        const stopping = capture.stop('Studio bylo zavřeno během přípravy.');
        releaseStorage();
        await starting;
        const result = await stopping;
        expect(TestRecorder.instances).toHaveLength(0);
        expect(result?.status).toBe('interrupted');
    });
});
