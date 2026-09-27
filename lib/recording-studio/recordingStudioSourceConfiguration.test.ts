import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createRecordingSourceConfiguration, loadRecordingSourceConfigurations, normalizeRecordingSourceConfigurations,
    RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, saveRecordingSourceConfigurations,
} from './recordingStudioSourceConfiguration';

describe('recording source preferences', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('defaults only a newly added camera to a selected microphone and retains standalone audio', () => {
        expect(createRecordingSourceConfiguration('camera').isAudioEnabled).toBe(true);
        expect(createRecordingSourceConfiguration('microphone').isAudioEnabled).toBe(true);
        expect(createRecordingSourceConfiguration('screen').isAudioEnabled).toBe(true);
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
        } });
        const configuration = {
            ...createRecordingSourceConfiguration('camera'),
            cameraDeviceId: 'camera-device', cameraDeviceLabel: 'Desk camera',
            microphoneDeviceId: 'microphone-device', microphoneDeviceLabel: 'USB microphone',
        };
        saveRecordingSourceConfigurations([configuration]);
        expect(JSON.parse(storage.get(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY)!)).toEqual({ schemaVersion: 1, configurations: [configuration] });
        expect(loadRecordingSourceConfigurations()).toEqual([configuration]);
    });

    it('ignores malformed entries, duplicate source IDs, corrupted JSON, and unsupported versions', () => {
        const configurations = normalizeRecordingSourceConfigurations({
            schemaVersion: 1,
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
