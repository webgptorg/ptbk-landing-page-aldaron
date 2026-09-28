import { RECORDING_STUDIO_PATH, type RecordingEditRecipe, type RecordingTimeSegment, type RecordingTrack, type RecordingTrim, type StudioRecording } from './recordingStudioTypes';

export const RECORDING_SYNC_TOLERANCE_SECONDS = 0.1;
export const RECORDING_SEEK_TOLERANCE_SECONDS = 0.025;

export function getRecordingClockSeconds(startMilliseconds: number, currentMilliseconds: number): number {
    return Math.max(0, (currentMilliseconds - startMilliseconds) / 1000);
}

export function getRecordingWorkspacePath(recordingId: string): string {
    return `${RECORDING_STUDIO_PATH}/${encodeURIComponent(recordingId)}`;
}

/** Legacy records keep their IDs/bytes; only the missing mapping is derived. */
export function getRecordingTrackSegments(track: RecordingTrack): readonly RecordingTimeSegment[] {
    if (track.byteLength === 0) return [];
    return track.segments ?? [{ sourceStartSeconds: 0, sessionStartSeconds: track.startOffsetSeconds, durationSeconds: track.durationSeconds }];
}

export function getRecordingTrackEndSeconds(track: RecordingTrack): number {
    return getRecordingTrackSegments(track).reduce((end, segment) => Math.max(end, segment.sessionStartSeconds + segment.durationSeconds), 0);
}

/** Reject ambiguous imported maps; an interruption cannot overlap or run backwards in either clock. */
export function isRecordingSegmentMapValid(segments: readonly RecordingTimeSegment[]): boolean {
    let sourceEnd = 0;
    let sessionEnd = 0;
    return segments.every((segment) => {
        const isValid = [segment.sourceStartSeconds, segment.sessionStartSeconds, segment.durationSeconds].every((value) => Number.isFinite(value) && value >= 0) &&
            segment.durationSeconds > 0 && segment.sourceStartSeconds >= sourceEnd && segment.sessionStartSeconds >= sessionEnd;
        sourceEnd = segment.sourceStartSeconds + segment.durationSeconds;
        sessionEnd = segment.sessionStartSeconds + segment.durationSeconds;
        return isValid;
    });
}

export function getRecordingSessionDuration(recording: StudioRecording): number {
    return Math.max(recording.durationSeconds, recording.captureEndSeconds ?? 0,
        ...recording.tracks.map(getRecordingTrackEndSeconds));
}

export function getRecordingSelection(recording: StudioRecording): RecordingTrim {
    return recording.editRecipe?.selection ?? recording.trim ?? { startSeconds: 0, endSeconds: getRecordingSessionDuration(recording) };
}

export function createRecordingEditRecipe(recording: StudioRecording, selection = getRecordingSelection(recording)): RecordingEditRecipe {
    return {
        schemaVersion: 1, timeUnit: 'seconds', selection, preparedTimeZeroSessionSeconds: selection.startSeconds,
        sources: recording.tracks.map((track) => ({ sourceId: track.id, segments: getRecordingTrackSegments(track) })),
    };
}

/** Media timestamps are never stretched to fit the recorder's wall-clock duration. */
export function sessionToRecordingMediaTime(track: RecordingTrack, sessionSeconds: number, firstTimestampSeconds = 0, mediaEndSeconds = Infinity, availableStartTimestampSeconds = firstTimestampSeconds): number | null {
    const segment = getRecordingTrackSegments(track).find((candidate) => sessionSeconds >= candidate.sessionStartSeconds &&
        sessionSeconds < candidate.sessionStartSeconds + candidate.durationSeconds);
    if (!segment) return null;
    const mediaSeconds = firstTimestampSeconds + segment.sourceStartSeconds + sessionSeconds - segment.sessionStartSeconds;
    return mediaSeconds >= availableStartTimestampSeconds && mediaSeconds < mediaEndSeconds ? mediaSeconds : null;
}

export function getRecordingAvailableRanges(track: RecordingTrack, firstTimestampSeconds = 0, mediaEndSeconds = Infinity, availableStartTimestampSeconds = firstTimestampSeconds): readonly RecordingTrim[] {
    return getRecordingTrackSegments(track).map((segment) => ({
        startSeconds: segment.sessionStartSeconds + Math.max(0, availableStartTimestampSeconds - firstTimestampSeconds - segment.sourceStartSeconds),
        endSeconds: segment.sessionStartSeconds + Math.max(0, Math.min(segment.durationSeconds, mediaEndSeconds - firstTimestampSeconds - segment.sourceStartSeconds)),
    })).filter((range) => range.endSeconds > range.startSeconds);
}

export function getRecordingUnavailableRanges(track: RecordingTrack, durationSeconds: number, firstTimestampSeconds = 0, mediaEndSeconds = Infinity, availableStartTimestampSeconds = firstTimestampSeconds): RecordingTrim[] {
    const gaps: RecordingTrim[] = [];
    let endSeconds = 0;
    for (const range of getRecordingAvailableRanges(track, firstTimestampSeconds, mediaEndSeconds, availableStartTimestampSeconds)) {
        if (range.startSeconds > endSeconds) gaps.push({ startSeconds: endSeconds, endSeconds: Math.min(durationSeconds, range.startSeconds) });
        endSeconds = Math.max(endSeconds, range.endSeconds);
    }
    if (endSeconds < durationSeconds) gaps.push({ startSeconds: endSeconds, endSeconds: durationSeconds });
    return gaps.filter((range) => range.endSeconds > range.startSeconds);
}

/** Exact contiguous processing is supported; holes require originals + a recipe, never a ripple edit. */
export function getRecordingPreparationRange(track: RecordingTrack, selection: RecordingTrim, firstTimestampSeconds: number, mediaEndSeconds: number, availableStartTimestampSeconds = firstTimestampSeconds) {
    const segment = getRecordingTrackSegments(track).find((candidate) => selection.startSeconds >= candidate.sessionStartSeconds &&
        selection.endSeconds <= candidate.sessionStartSeconds + candidate.durationSeconds + 0.000001);
    if (!segment) throw new Error('Vybraný interval obsahuje chybějící rozsah. Použijte originál a časový předpis; mezery se neposouvají.');
    const start = firstTimestampSeconds + segment.sourceStartSeconds + selection.startSeconds - segment.sessionStartSeconds;
    const end = start + selection.endSeconds - selection.startSeconds;
    if (start < availableStartTimestampSeconds - 0.001) throw new Error('Obraz nebo zvuk začíná až po začátku výběru. Originál a předpis zachovávají chybějící začátek.');
    if (end > mediaEndSeconds + 0.001) throw new Error('Médium končí před vybraným intervalem. Originál a předpis zachovávají chybějící konec.');
    return { start, end };
}

export function formatRecordingTimecode(seconds: number): string {
    const milliseconds = Math.max(0, Math.round((Number.isFinite(seconds) ? seconds : 0) * 1000));
    return `${String(Math.floor(milliseconds / 3_600_000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 60_000) % 60).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}
