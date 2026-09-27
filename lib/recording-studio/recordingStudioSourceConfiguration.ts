import { readBrowserLocalStorageItem, removeBrowserLocalStorageItem, writeBrowserLocalStorageItem } from '@/lib/browser/browserStorage';
import type { RecordingDisplaySurface, RecordingSource, RecordingSourceConfiguration, RecordingSourceKind, StudioRecording } from './recordingStudioTypes';

export const RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY = 'promptbook.recording-studio.source-configurations';
export const RECORDING_SOURCE_CONFIGURATION_VERSION = 2;
export const UNKNOWN_LEGACY_DEVICE_ID = '__recording-device-not-saved__';
const SAFE_SOURCE_ID = /^[a-zA-Z0-9_-]{1,120}$/;
const MAX_SOURCE_LABEL_LENGTH = 200;

export type RecordingSourceConfigurationRestore = {
    readonly configurations: readonly RecordingSourceConfiguration[];
    readonly isLegacyIncomplete: boolean;
};

export function isUnknownLegacyDeviceId(deviceId: string): boolean {
    return deviceId === UNKNOWN_LEGACY_DEVICE_ID;
}

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

function isRecordingDisplaySurface(value: unknown): value is RecordingDisplaySurface {
    return value === 'browser' || value === 'window' || value === 'monitor';
}

function readOptionalLabel(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_SOURCE_LABEL_LENGTH) : null;
}

function readSourceLabel(value: unknown, kind: RecordingSourceKind): string {
    return (readOptionalLabel(value) ?? { camera: 'Kamera', screen: 'Sdílení obrazovky', microphone: 'Mikrofon' }[kind]);
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
            label: readSourceLabel(value.label, value.kind),
            cameraDeviceId: typeof value.deviceId === 'string' && value.kind === 'camera' ? value.deviceId : '',
            cameraDeviceLabel: null,
            microphoneDeviceId: typeof value.deviceId === 'string' && value.kind === 'microphone' ? value.deviceId : '',
            microphoneDeviceLabel: null,
            displaySurface: null,
            displaySourceLabel: value.kind === 'screen' ? readOptionalLabel(value.label) : null,
            isCaptureEnabled: true,
            isAudioEnabled: value.kind === 'camera' ? value.isAudioEnabled === true : true,
        };
    }

    if (schemaVersion !== 1 && schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION) return null;
    if (typeof value.cameraDeviceId !== 'string' || typeof value.microphoneDeviceId !== 'string' ||
        typeof value.isAudioEnabled !== 'boolean') return null;

    if (schemaVersion === 1) {
        return {
            id: value.id,
            kind: value.kind,
            label: readSourceLabel(value.label, value.kind),
            cameraDeviceId: value.cameraDeviceId,
            cameraDeviceLabel: readOptionalLabel(value.cameraDeviceLabel),
            microphoneDeviceId: value.microphoneDeviceId,
            microphoneDeviceLabel: readOptionalLabel(value.microphoneDeviceLabel),
            displaySurface: null,
            displaySourceLabel: value.kind === 'screen' ? readOptionalLabel(value.label) : null,
            isCaptureEnabled: true,
            isAudioEnabled: value.isAudioEnabled,
        };
    }

    if (value.isCaptureEnabled !== true && value.isCaptureEnabled !== false ||
        (value.displaySurface !== null && !isRecordingDisplaySurface(value.displaySurface)) ||
        (value.displaySourceLabel !== null && typeof value.displaySourceLabel !== 'string')) return null;

    return {
        id: value.id,
        kind: value.kind,
        label: readSourceLabel(value.label, value.kind),
        cameraDeviceId: value.cameraDeviceId,
        cameraDeviceLabel: readOptionalLabel(value.cameraDeviceLabel),
        microphoneDeviceId: value.microphoneDeviceId,
        microphoneDeviceLabel: readOptionalLabel(value.microphoneDeviceLabel),
        displaySurface: isRecordingDisplaySurface(value.displaySurface) ? value.displaySurface : null,
        displaySourceLabel: readOptionalLabel(value.displaySourceLabel),
        isCaptureEnabled: value.isCaptureEnabled,
        isAudioEnabled: value.isAudioEnabled,
    };
}

export function normalizeRecordingSourceConfigurations(value: unknown): RecordingSourceConfiguration[] {
    if (!isObject(value) || !Array.isArray(value.configurations) ||
        (value.schemaVersion !== 0 && value.schemaVersion !== 1 && value.schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION)) return [];
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
        const stored = readBrowserLocalStorageItem(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY);
        if (!stored) return [];
        const envelope = JSON.parse(stored) as RecordingSourceConfigurationEnvelope;
        if (envelope.schemaVersion !== 0 && envelope.schemaVersion !== 1 && envelope.schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION) return [];
        const configurations = normalizeRecordingSourceConfigurations(envelope);
        if (envelope.schemaVersion !== RECORDING_SOURCE_CONFIGURATION_VERSION) saveRecordingSourceConfigurations(configurations);
        return configurations;
    } catch {
        return [];
    }
}

export function saveRecordingSourceConfigurations(configurations: readonly RecordingSourceConfiguration[]): void {
    writeBrowserLocalStorageItem(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY, JSON.stringify({
        schemaVersion: RECORDING_SOURCE_CONFIGURATION_VERSION,
        configurations,
    }));
}

export function clearRecordingSourceConfigurations(): void {
    removeBrowserLocalStorageItem(RECORDING_SOURCE_CONFIGURATION_STORAGE_KEY);
}

export function createRecordingSourceConfiguration(kind: RecordingSourceKind, label?: string): RecordingSourceConfiguration {
    return {
        id: crypto.randomUUID(), kind,
        label: label ?? { camera: 'Kamera', screen: 'Sdílení obrazovky', microphone: 'Mikrofon' }[kind],
        cameraDeviceId: '', cameraDeviceLabel: null,
        microphoneDeviceId: '', microphoneDeviceLabel: null,
        displaySurface: null,
        displaySourceLabel: null,
        isCaptureEnabled: true,
        isAudioEnabled: true,
    };
}

export function toRecordingSourceConfiguration(source: RecordingSource): RecordingSourceConfiguration {
    return {
        id: source.id, kind: source.kind, label: source.label,
        cameraDeviceId: source.cameraDeviceId, cameraDeviceLabel: source.cameraDeviceLabel,
        microphoneDeviceId: source.microphoneDeviceId, microphoneDeviceLabel: source.microphoneDeviceLabel,
        displaySurface: source.displaySurface, displaySourceLabel: source.displaySourceLabel,
        isCaptureEnabled: source.isCaptureEnabled,
        isAudioEnabled: source.isAudioEnabled,
    };
}

function getLegacySourceId(recording: StudioRecording, trackId: string, trackIndex: number): string {
    if (SAFE_SOURCE_ID.test(trackId)) return trackId;
    return `legacy-${recording.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'recording'}-${trackIndex + 1}`;
}

function createLegacyTrackConfiguration(recording: StudioRecording, trackIndex: number, sourceId?: string): RecordingSourceConfiguration {
    const track = recording.tracks[trackIndex];
    const isCameraAudioEnabled = track.kind === 'camera' && track.isAudioIncluded;
    const isMicrophoneSource = track.kind === 'microphone';
    return {
        id: sourceId ?? getLegacySourceId(recording, track.id, trackIndex),
        kind: track.kind,
        label: readSourceLabel(track.label, track.kind),
        cameraDeviceId: track.kind === 'camera' ? UNKNOWN_LEGACY_DEVICE_ID : '',
        cameraDeviceLabel: null,
        microphoneDeviceId: isMicrophoneSource || isCameraAudioEnabled ? UNKNOWN_LEGACY_DEVICE_ID : '',
        microphoneDeviceLabel: isMicrophoneSource ? readOptionalLabel(track.label) : readOptionalLabel(track.audioSourceLabel),
        displaySurface: null,
        // Track labels are retained as source labels, but they do not identify an authorized window or screen.
        displaySourceLabel: null,
        isCaptureEnabled: true,
        isAudioEnabled: track.isAudioIncluded,
    };
}

/** Uses a recorded snapshot when available; older tracks recover only metadata that was actually saved. */
export function getRecordingSourceConfigurationRestore(recording: StudioRecording): RecordingSourceConfigurationRestore {
    const savedConfigurations = normalizeRecordingSourceConfigurations({
        schemaVersion: RECORDING_SOURCE_CONFIGURATION_VERSION,
        configurations: recording.sourceConfiguration ?? [],
    });
    const configurationsById = new Map<string, RecordingSourceConfiguration>(
        savedConfigurations.map((configuration): [string, RecordingSourceConfiguration] => [configuration.id, configuration]),
    );
    let isLegacyIncomplete = false;
    const seenSourceIds = new Set<string>();
    const configurations = recording.tracks.map((track, trackIndex) => {
        const sourceId = getLegacySourceId(recording, track.id, trackIndex);
        const isSourceIdRepeated = seenSourceIds.has(sourceId);
        let uniqueSourceId = isSourceIdRepeated ? `legacy-${recording.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 72) || 'recording'}-${trackIndex + 1}` : sourceId;
        let duplicateIndex = 2;
        while (seenSourceIds.has(uniqueSourceId)) uniqueSourceId = `${uniqueSourceId.slice(0, 116)}-${duplicateIndex++}`;
        seenSourceIds.add(uniqueSourceId);
        const savedConfiguration = isSourceIdRepeated ? undefined : configurationsById.get(track.id);
        if (!isSourceIdRepeated && savedConfiguration && savedConfiguration.kind === track.kind) return { ...savedConfiguration };
        isLegacyIncomplete = true;
        return createLegacyTrackConfiguration(recording, trackIndex, uniqueSourceId);
    });
    if (savedConfigurations.length !== recording.tracks.length) isLegacyIncomplete = true;
    return { configurations, isLegacyIncomplete };
}

export function areRecordingSourceConfigurationsEqual(
    first: readonly RecordingSourceConfiguration[],
    second: readonly RecordingSourceConfiguration[],
): boolean {
    if (first.length !== second.length) return false;
    return first.every((configuration, index) => {
        const candidate = second[index];
        return candidate !== undefined &&
            configuration.id === candidate.id && configuration.kind === candidate.kind &&
            configuration.label === candidate.label && configuration.cameraDeviceId === candidate.cameraDeviceId &&
            configuration.cameraDeviceLabel === candidate.cameraDeviceLabel &&
            configuration.microphoneDeviceId === candidate.microphoneDeviceId &&
            configuration.microphoneDeviceLabel === candidate.microphoneDeviceLabel &&
            configuration.displaySurface === candidate.displaySurface &&
            configuration.displaySourceLabel === candidate.displaySourceLabel &&
            configuration.isCaptureEnabled === candidate.isCaptureEnabled &&
            configuration.isAudioEnabled === candidate.isAudioEnabled;
    });
}
