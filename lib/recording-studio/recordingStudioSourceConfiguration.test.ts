import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    areRecordingSourceConfigurationsEqual, clearRecordingSourceConfigurations, createRecordingSourceConfiguration,
    getRecordingSourceConfigurationRestore, loadRecordingSourceConfigurations, normalizeRecordingSourceConfigurations,
    RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, RECORDING_SOURCE_CONFIGURATION_VERSION, saveRecordingSourceConfigurations,
    UNKNOWN_LEGACY_DEVICE_ID,
} from './recordingStudioSourceConfiguration';
import { reconcileRecordingSourcesForConfiguration } from './recordingStudioDevices';
import type { RecordingSource, RecordingSourceConfiguration, RecordingTrack, StudioRecording } from './recordingStudioTypes';

function createLiveRecordingSource(configuration: RecordingSourceConfiguration, displaySourceLabel = configuration.displaySourceLabel): RecordingSource {
    const videoTrack = { kind: 'video', readyState: 'live', muted: false } as unknown as MediaStreamTrack;
    const stream = {
        getTracks: () => [videoTrack],
        getVideoTracks: () => [videoTrack],
        getAudioTracks: () => [],
    } as unknown as MediaStream;
    return { ...configuration, displaySourceLabel, stream, microphoneLabel: null };
}

describe('recording source preferences', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('defaults only a newly added camera to a selected microphone and retains standalone audio', () => {
        expect(createRecordingSourceConfiguration('camera').isAudioEnabled).toBe(true);
        expect(createRecordingSourceConfiguration('microphone').isAudioEnabled).toBe(true);
        expect(createRecordingSourceConfiguration('screen').isAudioEnabled).toBe(true);
        expect(createRecordingSourceConfiguration('screen').isCaptureEnabled).toBe(true);
    });

    it('keeps a prior explicit silent-camera choice silent when migrating older saved configurations', () => {
        const migrated = normalizeRecordingSourceConfigurations({
            schemaVersion: 0,
            configurations: [
                { id: 'silent-camera', kind: 'camera', label: 'Studio camera' },
                { id: 'audio-camera', kind: 'camera', label: 'Camera with audio', isAudioEnabled: true, deviceId: 'camera-id' },
            ],
        });
        expect(migrated.map(({ isAudioEnabled }) => isAudioEnabled)).toEqual([false, true]);
        expect(migrated[1].cameraDeviceId).toBe('camera-id');
    });

    it('stores only versioned serializable preferences and restores device labels and IDs', () => {
        const storage = new Map<string, string>();
        vi.stubGlobal('window', { localStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
        } });
        const configuration = {
            ...createRecordingSourceConfiguration('camera', 'Desk camera with sound'),
            cameraDeviceId: 'camera-device', cameraDeviceLabel: 'Desk camera',
            microphoneDeviceId: 'microphone-device', microphoneDeviceLabel: 'USB microphone',
        };
        saveRecordingSourceConfigurations([configuration]);
        expect(JSON.parse(storage.get(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY)!)).toEqual({ schemaVersion: RECORDING_SOURCE_CONFIGURATION_VERSION, configurations: [configuration] });
        expect(loadRecordingSourceConfigurations()).toEqual([configuration]);
        clearRecordingSourceConfigurations();
        expect(storage.has(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY)).toBe(false);
    });

    it('migrates earlier preferences and preserves screen intent without restoring permission', () => {
        const storage = new Map<string, string>();
        vi.stubGlobal('window', { localStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
        } });
        const oldConfiguration = {
            id: 'screen-source', kind: 'screen', label: 'Window: presentation.pdf', cameraDeviceId: '', cameraDeviceLabel: null,
            microphoneDeviceId: '', microphoneDeviceLabel: null, isAudioEnabled: true,
        };
        storage.set(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, configurations: [oldConfiguration] }));
        expect(loadRecordingSourceConfigurations()).toEqual([{
            ...oldConfiguration, displaySurface: null, displaySourceLabel: 'Window: presentation.pdf', isCaptureEnabled: true,
        }]);
        expect((JSON.parse(storage.get(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY)!) as { schemaVersion: number }).schemaVersion).toBe(RECORDING_SOURCE_CONFIGURATION_VERSION);
    });

    it('ignores malformed entries, duplicate source IDs, corrupted JSON, and unsupported versions', () => {
        const configurations = normalizeRecordingSourceConfigurations({
            schemaVersion: RECORDING_SOURCE_CONFIGURATION_VERSION,
            configurations: [
                { ...createRecordingSourceConfiguration('camera'), isAudioEnabled: false },
                { ...createRecordingSourceConfiguration('camera'), id: 'bad-id', microphoneDeviceId: 3 },
            ],
        });
        expect(configurations).toHaveLength(1);
        expect(normalizeRecordingSourceConfigurations({ schemaVersion: 99, configurations: [] })).toEqual([]);
        vi.stubGlobal('window', { localStorage: { getItem: () => '{broken JSON' } });
        expect(loadRecordingSourceConfigurations()).toEqual([]);
    });

    it('restores a complete take snapshot in order without changing the snapshot objects', () => {
        const screenConfiguration = { ...createRecordingSourceConfiguration('screen', 'Demo okno'), id: 'screen-source', displaySurface: 'window' as const, displaySourceLabel: 'Demo.pdf' };
        const microphoneConfiguration = { ...createRecordingSourceConfiguration('microphone', 'Záložní mikrofon'), id: 'microphone-source', microphoneDeviceId: 'usb-mic', microphoneDeviceLabel: 'USB mikrofon' };
        const recording = {
            id: 'take-a', title: 'Záznam A', createdAt: new Date(0).toISOString(), status: 'complete', durationSeconds: 10,
            trim: null, errorMessage: null, sourceConfiguration: [screenConfiguration, microphoneConfiguration],
            tracks: [
                { id: 'screen-source', kind: 'screen', label: 'Demo okno', mimeType: 'video/webm', byteLength: 1, chunkCount: 1, startOffsetSeconds: 0, durationSeconds: 10, width: 1920, height: 1080, frameRate: 30, isAudioIncluded: false },
                { id: 'microphone-source', kind: 'microphone', label: 'Záložní mikrofon', mimeType: 'audio/webm', byteLength: 1, chunkCount: 1, startOffsetSeconds: 0, durationSeconds: 10, width: null, height: null, frameRate: null, isAudioIncluded: true },
            ],
        } satisfies StudioRecording;

        const restore = getRecordingSourceConfigurationRestore(recording);

        expect(restore).toEqual({ configurations: [screenConfiguration, microphoneConfiguration], isLegacyIncomplete: false });
        expect(restore.configurations).not.toBe(recording.sourceConfiguration);
        expect(areRecordingSourceConfigurationsEqual(restore.configurations, recording.sourceConfiguration!)).toBe(true);
        expect(recording.sourceConfiguration).toEqual([screenConfiguration, microphoneConfiguration]);
    });

    it('keeps complete stored entries and reconstructs only missing legacy tracks', () => {
        const savedCameraConfiguration = { ...createRecordingSourceConfiguration('camera', 'Studio kamera'), id: 'camera-source', cameraDeviceId: 'stored-camera', cameraDeviceLabel: 'Studio Cam', isAudioEnabled: false };
        const recording = {
            id: 'partial-take', title: 'Částečný záznam', createdAt: new Date(0).toISOString(), status: 'complete', durationSeconds: 5,
            trim: null, errorMessage: null, sourceConfiguration: [savedCameraConfiguration],
            tracks: [
                { id: 'camera-source', kind: 'camera', label: 'Studio kamera', mimeType: 'video/webm', byteLength: 1, chunkCount: 1, startOffsetSeconds: 0, durationSeconds: 5, width: 1920, height: 1080, frameRate: 30, isAudioIncluded: false },
                { id: 'legacy-microphone', kind: 'microphone', label: 'Náhradní USB mikrofon', mimeType: 'audio/webm', byteLength: 1, chunkCount: 1, startOffsetSeconds: 0, durationSeconds: 5, width: null, height: null, frameRate: null, isAudioIncluded: true },
            ],
        } satisfies StudioRecording;

        const restore = getRecordingSourceConfigurationRestore(recording);

        expect(restore.isLegacyIncomplete).toBe(true);
        expect(restore.configurations[0]).toEqual(savedCameraConfiguration);
        expect(restore.configurations[1]).toMatchObject({ id: 'legacy-microphone', kind: 'microphone', label: 'Náhradní USB mikrofon', microphoneDeviceId: UNKNOWN_LEGACY_DEVICE_ID, microphoneDeviceLabel: 'Náhradní USB mikrofon' });
    });

    it('reconstructs only stored legacy track details and blocks guessed device identities', () => {
        const track = (id: string, kind: RecordingTrack['kind'], label: string, isAudioIncluded: boolean, audioSourceLabel: string | null = null): RecordingTrack => ({
            id, kind, label, mimeType: kind === 'microphone' ? 'audio/webm' : 'video/webm', byteLength: 1, chunkCount: 1,
            startOffsetSeconds: 0, durationSeconds: 10, width: kind === 'microphone' ? null : 1920,
            height: kind === 'microphone' ? null : 1080, frameRate: kind === 'microphone' ? null : 30,
            isAudioIncluded, audioSourceLabel,
        });
        const recording = {
            id: 'legacy-take', title: 'Starší záznam', createdAt: new Date(0).toISOString(), status: 'complete', durationSeconds: 10,
            trim: null, errorMessage: null,
            tracks: [track('camera-source', 'camera', 'Kamera z jednací místnosti', true, 'USB mikrofon'),
                track('screen-source', 'screen', 'Prezentace ze sdílené plochy', false)],
        } satisfies StudioRecording;

        const restore = getRecordingSourceConfigurationRestore(recording);

        expect(restore.isLegacyIncomplete).toBe(true);
        expect(restore.configurations).toMatchObject([
            { id: 'camera-source', kind: 'camera', label: 'Kamera z jednací místnosti', cameraDeviceId: UNKNOWN_LEGACY_DEVICE_ID, cameraDeviceLabel: null, microphoneDeviceId: UNKNOWN_LEGACY_DEVICE_ID, microphoneDeviceLabel: 'USB mikrofon', isAudioEnabled: true },
            { id: 'screen-source', kind: 'screen', label: 'Prezentace ze sdílené plochy', displaySurface: null, displaySourceLabel: null, cameraDeviceId: '', microphoneDeviceId: '', isAudioEnabled: false },
        ]);
    });

    it('treats a reordered setup as a replacement', () => {
        const first = createRecordingSourceConfiguration('camera', 'Přední kamera');
        const second = createRecordingSourceConfiguration('microphone', 'Mikrofon');
        expect(areRecordingSourceConfigurationsEqual([first, second], [first, second])).toBe(true);
        expect(areRecordingSourceConfigurationsEqual([first, second], [second, first])).toBe(false);
    });

    it('retains only live sources matching the saved logical configuration and releases the rest', () => {
        const cameraConfiguration = { ...createRecordingSourceConfiguration('camera', 'Kamera A'), isAudioEnabled: false, cameraDeviceId: 'camera-a' };
        const microphoneConfiguration = createRecordingSourceConfiguration('microphone', 'Mikrofon B');
        const cameraSource = createLiveRecordingSource(cameraConfiguration);
        const unrelatedSource = createLiveRecordingSource({ ...microphoneConfiguration, id: 'other-microphone' });

        const result = reconcileRecordingSourcesForConfiguration([cameraConfiguration], [cameraSource, unrelatedSource]);

        expect(result.retainedSources.map(({ id }) => id)).toEqual([cameraConfiguration.id]);
        expect(result.releasedSources).toEqual([unrelatedSource]);
    });

    it('does not treat a saved display label as an identity for a different live window', () => {
        const configuration = { ...createRecordingSourceConfiguration('screen', 'Saved window'), displaySurface: 'window' as const, displaySourceLabel: 'Saved.pdf' };
        const liveSource = createLiveRecordingSource(configuration, 'Other.pdf');

        const result = reconcileRecordingSourcesForConfiguration([configuration], [liveSource]);

        expect(result.retainedSources).toEqual([]);
        expect(result.releasedSources).toEqual([liveSource]);
    });

    it('keeps legacy reconstruction stable and card IDs unique when old track metadata repeats an ID', () => {
        const repeatedTrack: RecordingTrack = {
            id: 'same-track', kind: 'camera', label: 'Kamera', mimeType: 'video/webm', byteLength: 1, chunkCount: 1,
            startOffsetSeconds: 0, durationSeconds: 1, width: 1920, height: 1080, frameRate: 30, isAudioIncluded: false,
        };
        const recording = {
            id: 'legacy-duplicate', title: 'Starší záznam', createdAt: new Date(0).toISOString(), status: 'complete', durationSeconds: 1,
            trim: null, errorMessage: null, tracks: [repeatedTrack, repeatedTrack],
        } satisfies StudioRecording;

        const firstRestore = getRecordingSourceConfigurationRestore(recording);
        const retryRestore = getRecordingSourceConfigurationRestore(recording);

        expect(new Set(firstRestore.configurations.map(({ id }) => id)).size).toBe(2);
        expect(retryRestore.configurations).toEqual(firstRestore.configurations);
    });
});
