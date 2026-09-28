import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_STORAGE_RESERVE_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingSource, type RecordingTrack, type RecordingTrim, type StudioRecording,
} from './recordingStudioTypes';
import { getRecordingTrackEndSeconds } from './recordingStudioSessionTime';

const RECORDING_SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

export function getRecordingByteLength(recording: StudioRecording): number {
    return recording.tracks.reduce((total, track) => addRecordingBytes(total, track.byteLength), 0);
}

/** Numbers retain exact byte counts past 4 GiB; reject unsafe arithmetic instead of wrapping. */
export function addRecordingBytes(current: number, added: number): number {
    const result = current + added;
    if (![current, added, result].every((value) => Number.isSafeInteger(value) && value >= 0)) {
        throw new Error('Čítač velikosti záznamu překročil přesný rozsah. Uložená data zůstávají zachována.');
    }
    return result;
}

/** The last point for which every source has persisted data, including after recovery. */
export function getCommonRecordingDuration(tracks: readonly RecordingTrack[]): number {
    if (tracks.length === 0 || tracks.some((track) => track.byteLength === 0)) return 0;
    return Math.max(0, Math.min(...tracks.map(getRecordingTrackEndSeconds)));
}

/** Missing tails are expressed on the existing session clock; a crashed page cannot supply an end time. */
export function getRecordingMissingRanges(recording: StudioRecording) {
    if (recording.status !== 'interrupted') return [];
    return recording.tracks.map((track) => ({
        trackId: track.id,
        startSeconds: getRecordingTrackEndSeconds(track),
        endSeconds: recording.captureEndSeconds ?? null,
    })).filter((range) => range.endSeconds === null || range.endSeconds > range.startSeconds);
}

export function getConfiguredRecordingBytesPerSecond(sources: readonly RecordingSource[]): number {
    return sources.reduce((total, source) => total +
        (source.stream.getVideoTracks().length > 0 ? RECORDING_VIDEO_BITS_PER_SECOND : 0) +
        (source.stream.getAudioTracks().length > 0 ? RECORDING_AUDIO_BITS_PER_SECOND : 0), 0) / 8;
}

/** Only for an independently defensible capacity; StorageManager quota/headroom is not such a capacity. */
export function estimateRecordingSeconds(availableBytes: number | null, bytesPerSecond: number): number | null {
    if (availableBytes === null || !Number.isSafeInteger(availableBytes) || availableBytes < 0 || !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return null;
    const seconds = Math.floor(Math.max(0, availableBytes - RECORDING_STORAGE_RESERVE_BYTES) / bytesPerSecond);
    return Number.isSafeInteger(seconds) ? seconds : null;
}

export function validateRecordingTrim(trim: RecordingTrim, durationSeconds: number): void {
    if (!Number.isFinite(trim.startSeconds) || !Number.isFinite(trim.endSeconds) || trim.startSeconds < 0 ||
        trim.endSeconds > durationSeconds || trim.endSeconds <= trim.startSeconds) {
        throw new Error('Začátek musí být před koncem a oba časy uvnitř záznamu.');
    }
}

export function formatRecordingDuration(seconds: number): string {
    const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return [Math.floor(totalSeconds / 3600), Math.floor(totalSeconds / 60) % 60, totalSeconds % 60]
        .map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatRecordingBytes(bytes: number): string {
    const exponent = Math.min(RECORDING_SIZE_UNITS.length - 1, Math.max(0, Math.floor(Math.log2(Math.max(1, bytes)) / 10)));
    return `${(bytes / 1024 ** exponent).toLocaleString('cs-CZ', { maximumFractionDigits: exponent > 0 ? 1 : 0 })} ${RECORDING_SIZE_UNITS[exponent]}`;
}

type RecordingRateSample = { readonly bytes: number; readonly seconds: number };
const RECORDING_RATE_WINDOW_SECONDS = 30;
const RECORDING_RATE_MINIMUM_SECONDS = 3;

/** Aggregate committed bytes on the capture clock, with a bounded VBR window, never an independent session clock. */
export class RecordingBitrateMeter {
    private samples: RecordingRateSample[] = [{ bytes: 0, seconds: 0 }];
    private lastChangedAt = 0;
    private bytesPerSecond: number | null = null;

    public update(recording: StudioRecording, now = performance.now()): number | null {
        const bytes = getRecordingByteLength(recording);
        const seconds = recording.durationSeconds;
        const previous = this.samples[this.samples.length - 1];
        if (bytes > previous.bytes && seconds > previous.seconds) {
            this.lastChangedAt = now;
            this.samples.push({ bytes, seconds });
            while (this.samples.length > 2 && this.samples[1].seconds <= seconds - RECORDING_RATE_WINDOW_SECONDS) this.samples.shift();
            const first = this.samples[0];
            const interval = seconds - first.seconds;
            this.bytesPerSecond = interval >= RECORDING_RATE_MINIMUM_SECONDS ? (bytes - first.bytes) / interval : null;
        }
        return this.read(now);
    }

    public read(now = performance.now()): number | null {
        // Pause, stalled writes and startup report no current measured rate.
        return now - this.lastChangedAt > 15_000 ? null : this.bytesPerSecond;
    }
}
