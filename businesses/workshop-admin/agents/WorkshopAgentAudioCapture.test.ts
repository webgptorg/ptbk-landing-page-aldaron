/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopAgentAudioCapture } from './WorkshopAgentAudioCapture';
import { WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS } from '@/lib/workshops/agents/workshopAgentTypes';

const { sessionMock, uploadMock } = vi.hoisted(() => ({ sessionMock: vi.fn(), uploadMock: vi.fn() }));
vi.mock('@/businesses/workshop-admin/workshopAdminApiClient', () => ({ changeAdminWorkshopAgentAudioSession: sessionMock, sendAdminWorkshopAgentAudio: uploadMock }));

class RecordedStream {
    constructor(private readonly tracks: readonly { readonly kind: string }[]) {}
    getTracks() { return this.tracks; }
    getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
}

class ChunkRecorder {
    static instances: ChunkRecorder[] = [];
    static isTypeSupported(mimeType: string) { return mimeType === 'audio/webm'; }
    state = 'inactive';
    mimeType = 'audio/webm';
    ondataavailable: ((event: { readonly data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(readonly stream: RecordedStream) { ChunkRecorder.instances.push(this); }
    start() { this.state = 'recording'; }
    stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['independent-audio-file']) });
        this.onstop?.();
    }
}

describe('live workshop browser audio', () => {
    const audioTrack = { kind: 'audio', stop: vi.fn(), addEventListener: vi.fn() };
    const videoTrack = { kind: 'video', stop: vi.fn(), addEventListener: vi.fn() };
    const displayMock = vi.fn();
    let capture: WorkshopAgentAudioCapture;
    const onStop = vi.fn();
    const onTranscript = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        ChunkRecorder.instances = [];
        vi.stubGlobal('MediaRecorder', ChunkRecorder);
        vi.stubGlobal('MediaStream', RecordedStream);
        displayMock.mockResolvedValue(new RecordedStream([audioTrack, videoTrack]));
        vi.stubGlobal('navigator', { mediaDevices: { getDisplayMedia: displayMock, getUserMedia: displayMock } });
        sessionMock.mockResolvedValue({});
        uploadMock.mockResolvedValue({ transcript: 'We are writing a test.' });
        capture = new WorkshopAgentAudioCapture({ workshopId: 'room', onStop, onTranscript });
    });
    afterEach(() => { capture.stop(); vi.unstubAllGlobals(); vi.useRealTimers(); });

    it('records only audio and restarts the recorder to make every upload independently decodable', async () => {
        await capture.start('tab');
        expect(displayMock).toHaveBeenCalledWith({ video: true, audio: true });
        expect(ChunkRecorder.instances[0]!.stream.getTracks()).toEqual([audioTrack]);
        await vi.advanceTimersByTimeAsync(WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS * 2);
        expect(ChunkRecorder.instances).toHaveLength(3);
        expect(uploadMock.mock.calls.map((arguments_) => arguments_[2])).toEqual([0, 1]);
        expect(uploadMock.mock.calls[0]![3].type).toBe('audio/webm');
        expect(onTranscript).toHaveBeenCalledWith('We are writing a test.');
        capture.stop();
        expect(audioTrack.stop).toHaveBeenCalled();
        expect(videoTrack.stop).toHaveBeenCalled();
        expect(sessionMock).toHaveBeenLastCalledWith('room', expect.any(String), false);
        await vi.advanceTimersByTimeAsync(WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS * 2);
        expect(uploadMock).toHaveBeenCalledTimes(2);
    });

    it('releases tracks without opening a server session when tab audio is not shared', async () => {
        displayMock.mockResolvedValue(new RecordedStream([videoTrack]));
        await capture.start('tab');
        expect(sessionMock).not.toHaveBeenCalled();
        expect(videoTrack.stop).toHaveBeenCalled();
        expect(onStop).toHaveBeenCalledWith(expect.stringContaining('nesdílí zvuk'));
    });

    it('stops an in-flight upload and ignores its late transcript', async () => {
        let resolveUpload!: (value: { transcript: string }) => void;
        uploadMock.mockReturnValue(new Promise((resolve) => { resolveUpload = resolve; }));
        await capture.start('microphone');
        await vi.advanceTimersByTimeAsync(WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS);
        capture.stop();
        expect(uploadMock.mock.calls[0]![4].aborted).toBe(true);
        resolveUpload({ transcript: 'Late speech' });
        await vi.advanceTimersByTimeAsync(1);
        expect(onTranscript).not.toHaveBeenCalled();
    });

    it('releases a server session which finished starting after its UI was closed', async () => {
        let resolveSession!: (value: unknown) => void;
        sessionMock.mockReturnValueOnce(new Promise((resolve) => { resolveSession = resolve; }));
        const start = capture.start('tab');
        await vi.advanceTimersByTimeAsync(1);
        capture.stop();
        resolveSession({});
        await start;
        expect(sessionMock).toHaveBeenLastCalledWith('room', expect.any(String), false);
        expect(ChunkRecorder.instances).toHaveLength(0);
    });

    it('stops capture after a transcription failure', async () => {
        uploadMock.mockRejectedValue(new Error('Transcription failed'));
        await capture.start('tab');
        await vi.advanceTimersByTimeAsync(WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS);
        expect(onStop).toHaveBeenCalledWith('Transcription failed');
        expect(audioTrack.stop).toHaveBeenCalled();
        expect(videoTrack.stop).toHaveBeenCalled();
    });
});
