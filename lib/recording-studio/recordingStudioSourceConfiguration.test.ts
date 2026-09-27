import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    clearRecordingSourceConfigurations, createRecordingSourceConfiguration, loadRecordingSourceConfigurations, normalizeRecordingSourceConfigurations,
    RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, RECORDING_SOURCE_CONFIGURATION_VERSION, saveRecordingSourceConfigurations,
} from './recordingStudioSourceConfiguration';

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
});
