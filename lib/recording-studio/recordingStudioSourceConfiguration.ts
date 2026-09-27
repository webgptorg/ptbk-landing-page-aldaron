import type { RecordingSource, RecordingSourceConfiguration, RecordingSourceKind } from './recordingStudioTypes';

export const RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY = 'promptbook.recording-studio.source-configurations';
const RECORDING_SOURCE_CONFIGURATION_VERSION = 1;
const SAFE_SOURCE_ID = /^[a-zA-Z0-9_-]{1,120}$/;

type RecordingSourceConfigurationEnvelope = {
    readonly schemaVersion: number;
    readonly configurations: readonly unknown[];
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRecordingSourceKind(value: unknown): value is RecordingSourceKind {
    return value === 'camera' || value === 'screen' || value === 'microphone';
}

function readOptionalLabel(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.slice(0, 200) : null;
}

function migrateSourceConfiguration(value: unknown, schemaVersion: number): RecordingSourceConfiguration | null {
    if (!isObject(value) || typeof value.id !== 'string' || !SAFE_SOURCE_ID.test(value.id) ||
        !isRecordingSourceKind(value.kind) || typeof value.label !== 'string') return null;

    if (schemaVersion === 0) {
        // Older source cards never recorded their audio intent. Keep them explicitly silent rather than changing
        // an existing camera setup into a microphone request during restoration.
        return {
            id: value.id,
            kind: value.kind,
            label: value.label.slice(0, 200),
            cameraDeviceId: typeof value.deviceId === 'string' && value.kind === 'camera' ? value.deviceId : '',
            cameraDeviceLabel: null,
            microphoneDeviceId: typeof value.deviceId === 'string' && value.kind === 'microphone' ? value.deviceId : '',
            microphoneDeviceLabel: null,
            isAudioEnabled: value.kind === 'camera' ? value.isAudioEnabled === true : true,
        };
    }

    if (schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION ||
        typeof value.cameraDeviceId !== 'string' || typeof value.microphoneDeviceId !== 'string' ||
        typeof value.isAudioEnabled !== 'boolean') return null;

    return {
        id: value.id,
        kind: value.kind,
        label: value.label.slice(0, 200),
        cameraDeviceId: value.cameraDeviceId,
        cameraDeviceLabel: readOptionalLabel(value.cameraDeviceLabel),
        microphoneDeviceId: value.microphoneDeviceId,
        microphoneDeviceLabel: readOptionalLabel(value.microphoneDeviceLabel),
        isAudioEnabled: value.isAudioEnabled,
    };
}

export function normalizeRecordingSourceConfigurations(value: unknown): RecordingSourceConfiguration[] {
    if (!isObject(value) || !Array.isArray(value.configurations) ||
        (value.schemaVersion !== 0 && value.schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION)) return [];
    const configurations = value.configurations
        .map((configuration) => migrateSourceConfiguration(configuration, value.schemaVersion as number))
        .filter((configuration): configuration is RecordingSourceConfiguration => configuration !== null);
    const seenIds = new Set<string>();
    return configurations.filter((configuration) => {
        if (seenIds.has(configuration.id)) return false;
        seenIds.add(configuration.id);
        return true;
    });
}

export function loadRecordingSourceConfigurations(): RecordingSourceConfiguration[] {
    try {
        const stored = window.localStorage.getItem(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY);
        return stored ? normalizeRecordingSourceConfigurations(JSON.parse(stored)) : [];
    } catch {
        return [];
    }
}

export function saveRecordingSourceConfigurations(configurations: readonly RecordingSourceConfiguration[]): void {
    window.localStorage.setItem(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, JSON.stringify({
        schemaVersion: RECORDING_SOURCE_CONFIGURATION_VERSION,
        configurations,
    }));
}

export function createRecordingSourceConfiguration(kind: RecordingSourceKind): RecordingSourceConfiguration {
    return {
        id: crypto.randomUUID(), kind,
        label: { camera: 'Kamera', screen: 'Obrazovka', microphone: 'Mikrofon' }[kind],
        cameraDeviceId: '', cameraDeviceLabel: null,
        microphoneDeviceId: '', microphoneDeviceLabel: null,
        isAudioEnabled: true,
    };
}

export function toRecordingSourceConfiguration(source: RecordingSource): RecordingSourceConfiguration {
    return {
        id: source.id, kind: source.kind, label: source.label,
        cameraDeviceId: source.cameraDeviceId, cameraDeviceLabel: source.cameraDeviceLabel,
        microphoneDeviceId: source.microphoneDeviceId, microphoneDeviceLabel: source.microphoneDeviceLabel,
        isAudioEnabled: source.isAudioEnabled,
    };
}
