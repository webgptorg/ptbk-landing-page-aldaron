export const RECORDING_STUDIO_PATH = '/admin/recording-studio';
export const RECORDING_CHUNK_MILLISECONDS = 1_000;
export const RECORDING_VIDEO_BITS_PER_SECOND = 8_000_000;
export const RECORDING_AUDIO_BITS_PER_SECOND = 192_000;
export const RECORDING_STORAGE_RESERVE_BYTES = 64 * 1024 * 1024;
export const RECORDING_MAX_PENDING_BYTES = 64 * 1024 * 1024;
export const RECORDING_STUDIO_LOCK = 'promptbook-recording-studio';

export type RecordingSourceKind = 'camera' | 'screen' | 'microphone';

export type RecordingSource = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly stream: MediaStream;
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
};

export type RecordingArchiveTrack = RecordingTrack & {
    readonly originalFile: string | null;
    readonly trimmedFile: string | null;
};

export type RecordingArchiveManifest = Pick<StudioRecording, 'id' | 'title' | 'createdAt' | 'status' | 'errorMessage' | 'durationSeconds' | 'trim'> & {
    readonly schemaVersion: 1;
    readonly isTrimIncluded: boolean;
    readonly tracks: readonly RecordingArchiveTrack[];
    readonly timing: string;
};

export type RecordingStorageEstimate = {
    readonly availableBytes: number | null;
    readonly quotaBytes: number | null;
    readonly isPersistent: boolean;
};
