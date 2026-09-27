import { afterEach, describe, expect, it, vi } from 'vitest';
import { acquireRecordingSource, getRecordingErrorMessage, releaseRecordingSource } from './recordingStudioDevices';
import { createRecordingSourceConfiguration } from './recordingStudioSourceConfiguration';
import type { RecordingSource } from './recordingStudioTypes';

class TestTrack extends EventTarget {
    public readyState = 'live';
    public readonly stop = vi.fn(() => { this.readyState = 'ended'; });
    public readonly label: string;
    public readonly deviceId: string;
    public readonly kind: 'audio' | 'video';

    public constructor(kind: 'audio' | 'video', label: string, deviceId: string) {
        super(); this.kind = kind; this.label = label; this.deviceId = deviceId;
    }

    public getSettings() { return { deviceId: this.deviceId, width: 640, height: 480, frameRate: 30 }; }
    public clone() { return new TestTrack(this.kind, this.label, this.deviceId); }
}

class TestStream {
    public constructor(private readonly tracks: TestTrack[]) {}
    public getTracks() { return this.tracks; }
    public getVideoTracks() { return this.tracks.filter((track) => track.kind === 'video'); }
    public getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
}

function createEnvironment(getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>) {
    const mediaDevices = { getUserMedia: vi.fn(getUserMedia), getDisplayMedia: vi.fn() };
    vi.stubGlobal('navigator', { mediaDevices });
    vi.stubGlobal('MediaStream', TestStream);
    return mediaDevices;
}

function createSource(kind: 'microphone' | 'camera', microphoneDeviceId = 'mic-device'): RecordingSource {
    const configuration = {
        ...createRecordingSourceConfiguration(kind), microphoneDeviceId,
        isAudioEnabled: true,
    };
    const microphoneTrack = new TestTrack('audio', 'USB microphone', microphoneDeviceId);
    return {
        ...configuration,
        microphoneLabel: microphoneTrack.label,
        stream: new TestStream(kind === 'camera' ? [new TestTrack('video', 'Desk camera', 'camera-device'), microphoneTrack] : [microphoneTrack]) as unknown as MediaStream,
    };
}

describe('recording device acquisition', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('requests camera and selected/default microphone together for a new sound-enabled camera', async () => {
        const constraints: MediaStreamConstraints[] = [];
        const mediaDevices = createEnvironment(async (request) => {
            constraints.push(request);
            return new TestStream([new TestTrack('video', 'Desk camera', 'camera-device'), new TestTrack('audio', 'USB microphone', 'mic-device')]) as unknown as MediaStream;
        });
        const configuration = { ...createRecordingSourceConfiguration('camera'), cameraDeviceId: 'camera-device', microphoneDeviceId: 'mic-device' };
        const source = await acquireRecordingSource(configuration);
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
        expect(constraints[0]).toMatchObject({ video: { deviceId: { exact: 'camera-device' } }, audio: { deviceId: { exact: 'mic-device' } } });
        expect(source.stream.getAudioTracks()).toHaveLength(1);
        expect(source.microphoneLabel).toBe('USB microphone');
    });

    it('does not request any microphone for an intentional video-only camera', async () => {
        const mediaDevices = createEnvironment(async (request) => {
            expect(request.audio).toBe(false);
            return new TestStream([new TestTrack('video', 'Desk camera', 'camera-device')]) as unknown as MediaStream;
        });
        const source = await acquireRecordingSource({ ...createRecordingSourceConfiguration('camera'), isAudioEnabled: false });
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
        expect(source.stream.getAudioTracks()).toHaveLength(0);
    });

    it('keeps a standalone microphone as an independent audio source', async () => {
        const mediaDevices = createEnvironment(async (request) => {
            expect(request.video).toBe(false);
            return new TestStream([new TestTrack('audio', 'USB microphone', 'mic-device')]) as unknown as MediaStream;
        });
        const source = await acquireRecordingSource({ ...createRecordingSourceConfiguration('microphone'), microphoneDeviceId: 'mic-device' });
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
        expect(source.kind).toBe('microphone');
        expect(source.stream.getAudioTracks()).toHaveLength(1);
    });

    it('clones a shared microphone for the camera file and never stops the independent source', async () => {
        const mediaDevices = createEnvironment(async (request) => {
            expect(request.audio).toBe(false);
            return new TestStream([new TestTrack('video', 'Desk camera', 'camera-device')]) as unknown as MediaStream;
        });
        const microphoneSource = createSource('microphone');
        const ownerTrack = microphoneSource.stream.getAudioTracks()[0] as unknown as TestTrack;
        const cameraConfiguration = {
            ...createRecordingSourceConfiguration('camera'), microphoneDeviceId: 'mic-device',
        };
        const cameraSource = await acquireRecordingSource(cameraConfiguration, [microphoneSource]);
        const clonedTrack = cameraSource.stream.getAudioTracks()[0] as unknown as TestTrack;
        expect(clonedTrack).not.toBe(ownerTrack);
        expect(ownerTrack.stop).not.toHaveBeenCalled();
        releaseRecordingSource(cameraSource);
        expect(clonedTrack.stop).toHaveBeenCalledOnce();
        expect(ownerTrack.stop).not.toHaveBeenCalled();
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
    });

    it('clones camera audio into a later standalone file without duplicating its recorded mix', async () => {
        const mediaDevices = createEnvironment(async () => { throw new Error('Should reuse the live selected microphone.'); });
        const cameraSource = createSource('camera');
        const ownerTrack = cameraSource.stream.getAudioTracks()[0] as unknown as TestTrack;
        const microphoneSource = await acquireRecordingSource({ ...createRecordingSourceConfiguration('microphone'), microphoneDeviceId: 'mic-device' }, [cameraSource]);
        const clonedTrack = microphoneSource.stream.getAudioTracks()[0] as unknown as TestTrack;
        expect(clonedTrack).not.toBe(ownerTrack);
        releaseRecordingSource(microphoneSource);
        expect(clonedTrack.stop).toHaveBeenCalledOnce();
        expect(ownerTrack.stop).not.toHaveBeenCalled();
        expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
    });

    it('keeps an explicitly silent camera preference when source kind changes and changes back', async () => {
        const configuration = { ...createRecordingSourceConfiguration('camera'), isAudioEnabled: false };
        expect(configuration.isAudioEnabled).toBe(false);
        const mediaDevices = createEnvironment(async (request) => {
            expect(request.audio).toBe(false);
            return new TestStream([new TestTrack('video', 'Desk camera', 'camera-device')]) as unknown as MediaStream;
        });
        await acquireRecordingSource(configuration);
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
    });

    it('does not mistake screen-share audio for a reusable microphone', async () => {
        const mediaDevices = createEnvironment(async (request) => {
            expect(request.audio).toEqual({});
            return new TestStream([new TestTrack('video', 'Desk camera', 'camera-device'), new TestTrack('audio', 'USB microphone', 'mic-device')]) as unknown as MediaStream;
        });
        const screenConfiguration = createRecordingSourceConfiguration('screen');
        const screenSource: RecordingSource = {
            ...screenConfiguration, microphoneLabel: null,
            stream: new TestStream([new TestTrack('video', 'Shared tab', 'screen'), new TestTrack('audio', 'Tab audio', 'tab-audio')]) as unknown as MediaStream,
        };
        const cameraSource = await acquireRecordingSource(createRecordingSourceConfiguration('camera'), [screenSource]);
        expect(cameraSource.microphoneLabel).toBe('USB microphone');
        expect(mediaDevices.getUserMedia).toHaveBeenCalledOnce();
    });

    it('explains denied, absent, busy and unsupported input requests separately', () => {
        const cameraConfiguration = { ...createRecordingSourceConfiguration('camera'), isAudioEnabled: true };
        expect(getRecordingErrorMessage(new DOMException('', 'NotAllowedError'), cameraConfiguration)).toContain('zamítl přístup ke kameře či mikrofonu');
        expect(getRecordingErrorMessage(new DOMException('', 'NotFoundError'), cameraConfiguration)).toContain('Kamera nebo mikrofon nejsou dostupné');
        expect(getRecordingErrorMessage(new DOMException('', 'NotReadableError'), cameraConfiguration)).toContain('jiná aplikace');
        expect(getRecordingErrorMessage(new TypeError('constraints'), cameraConfiguration)).toContain('nepodporuje požadovaná omezení');
        expect(getRecordingErrorMessage(new DOMException('', 'NotFoundError'), createRecordingSourceConfiguration('microphone'))).toContain('Není dostupný žádný mikrofon');
    });
});
