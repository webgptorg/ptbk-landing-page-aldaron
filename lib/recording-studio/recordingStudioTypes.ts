export const RECORDING_STUDIO_PATH = '/admin/recording-studio';
export const RECORDING_CHUNK_MILLISECONDS = 1_000;
export const RECORDING_VIDEO_BITS_PER_SECOND = 8_000_000;
export const RECORDING_AUDIO_BITS_PER_SECOND = 192_000;
export const RECORDING_STORAGE_RESERVE_BYTES = 64 * 1024 * 1024;
export const RECORDING_MAX_PENDING_BYTES = 64 * 1024 * 1024;
export const RECORDING_DIRECTORY_CHUNK_MILLISECONDS = 5_000;
export const RECORDING_STUDIO_LOCK = 'promptbook-recording-studio';

export type RecordingSourceKind = 'camera' | 'screen' | 'microphone';
export type RecordingDisplaySurface = 'browser' | 'window' | 'monitor';
export type RecordingSourceReadiness = 'ready' | 'needs-permission' | 'disconnected' | 'temporarily-unavailable' | 'unavailable';

/** Browser-local, serializable source intent. It never contains permission or live media state. */
export type RecordingSourceConfiguration = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly cameraDeviceId: string;
    readonly cameraDeviceLabel: string | null;
    readonly microphoneDeviceId: string;
    readonly microphoneDeviceLabel: string | null;
    readonly displaySurface: RecordingDisplaySurface | null;
    readonly displaySourceLabel: string | null;
    readonly isCaptureEnabled: boolean;
    readonly isAudioEnabled: boolean;
};

export type RecordingSource = RecordingSourceConfiguration & {
    readonly stream: MediaStream;
    readonly microphoneLabel: string | null;
};

export type RecordingTrim = {
    readonly startSeconds: number;
    readonly endSeconds: number;
};

export type RecordingTrack = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly mimeType: string;
    readonly byteLength: number;
    readonly chunkCount: number;
    readonly startOffsetSeconds: number;
    readonly durationSeconds: number;
    readonly width: number | null;
    readonly height: number | null;
    readonly frameRate: number | null;
    readonly isAudioIncluded: boolean;
    /** Missing on older takes. On camera files, the microphone which supplied embedded audio. */
    readonly audioSourceLabel?: string | null;
};

export type StudioRecording = {
    readonly id: string;
    readonly title: string;
    readonly createdAt: string;
    readonly status: 'recording' | 'complete' | 'interrupted';
    readonly durationSeconds: number;
    readonly tracks: readonly RecordingTrack[];
    readonly trim: RecordingTrim | null;
    readonly errorMessage: string | null;
    /** Immutable source preferences for this take; absent on older recordings. */
    readonly sourceConfiguration?: readonly RecordingSourceConfiguration[];
    /** Absent on older takes: IndexedDB. Directory media never passes through origin storage. */
    readonly storageDestination?: { readonly kind: 'directory'; readonly name: string };
    /** End requested on the same capture clock; null means a crash left the tail unknown. */
    readonly captureEndSeconds?: number | null;
};

export type RecordingArchiveTrack = RecordingTrack & {
    readonly originalFile: string | null;
    readonly trimmedFile: string | null;
};

export type RecordingArchiveManifest = Pick<StudioRecording, 'id' | 'title' | 'createdAt' | 'status' | 'errorMessage' | 'durationSeconds' | 'trim' | 'captureEndSeconds' | 'sourceConfiguration'> & {
    readonly schemaVersion: 2;
    readonly isTrimIncluded: boolean;
    readonly tracks: readonly RecordingArchiveTrack[];
    readonly timing: string;
    readonly missingRanges: readonly { readonly trackId: string; readonly startSeconds: number; readonly endSeconds: number | null }[];
};

export type RecordingStorageEstimate = {
    readonly headroomBytes: number | null;
    readonly quotaBytes: number | null;
    readonly usageBytes: number | null;
    readonly measuredAt: number | null;
    readonly status: 'available' | 'unsupported' | 'failed';
};

export type RecordingPersistence = 'granted' | 'not-granted' | 'denied' | 'unsupported' | 'failed';
