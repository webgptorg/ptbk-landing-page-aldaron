import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_STORAGE_RESERVE_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingSource, type RecordingTrack, type RecordingTrim, type StudioRecording,
} from './recordingStudioTypes';

const RECORDING_SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

export function getRecordingByteLength(recording: StudioRecording): number {
    return recording.tracks.reduce((total, track) => total + track.byteLength, 0);
}

/** The last point for which every source has persisted data, including after recovery. */
export function getCommonRecordingDuration(tracks: readonly RecordingTrack[]): number {
    if (tracks.length === 0 || tracks.some((track) => track.byteLength === 0)) return 0;
    return Math.max(0, Math.min(...tracks.map((track) => track.startOffsetSeconds + track.durationSeconds)));
}

export function getRecordingBytesPerSecond(sources: readonly RecordingSource[], recording: StudioRecording | null): number {
    if (recording && recording.durationSeconds >= 3 && getRecordingByteLength(recording) > 0) {
        return getRecordingByteLength(recording) / recording.durationSeconds;
    }
    return sources.reduce((total, source) => total +
        (source.stream.getVideoTracks().length > 0 ? RECORDING_VIDEO_BITS_PER_SECOND : 0) +
        (source.stream.getAudioTracks().length > 0 ? RECORDING_AUDIO_BITS_PER_SECOND : 0), 0) / 8;
}

export function estimateRecordingSeconds(availableBytes: number | null, bytesPerSecond: number): number | null {
    if (availableBytes === null || !Number.isFinite(availableBytes) || !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return null;
    return Math.floor(Math.max(0, availableBytes - RECORDING_STORAGE_RESERVE_BYTES) / bytesPerSecond);
}

export function validateRecordingTrim(trim: RecordingTrim, durationSeconds: number): void {
    if (!Number.isFinite(trim.startSeconds) || !Number.isFinite(trim.endSeconds) || trim.startSeconds < 0 ||
        trim.endSeconds > durationSeconds || trim.endSeconds <= trim.startSeconds) {
        throw new Error('Začátek musí být před koncem a oba časy uvnitř záznamu.');
    }
}

/** All edits use the session clock; offsets retain the small difference between browser start calls. */
export function getTrackTrim(trim: RecordingTrim, track: RecordingTrack, firstTimestamp = 0) {
    return {
        start: firstTimestamp + trim.startSeconds - track.startOffsetSeconds,
        end: firstTimestamp + trim.endSeconds - track.startOffsetSeconds,
    };
}

export function formatRecordingDuration(seconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    return [Math.floor(totalSeconds / 3600), Math.floor(totalSeconds / 60) % 60, totalSeconds % 60]
        .map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatRecordingBytes(bytes: number): string {
    const exponent = Math.min(RECORDING_SIZE_UNITS.length - 1, Math.max(0, Math.floor(Math.log2(Math.max(1, bytes)) / 10)));
    return `${(bytes / 1024 ** exponent).toLocaleString('cs-CZ', { maximumFractionDigits: exponent > 0 ? 1 : 0 })} ${RECORDING_SIZE_UNITS[exponent]}`;
}
