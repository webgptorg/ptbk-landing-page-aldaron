import { serializeSubtitleFile } from '@/lib/workshops/subtitles/workshopSubtitleFormat';
import { getRecordingMediaParts, getRecordingSessionDuration } from './recordingStudioSessionTime';
import type { RecordingDerivedTrack, RecordingMediaBounds, RecordingMediaPart, RecordingSpeechInterval, RecordingSubtitleCue, RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';

export const RECORDING_SUBTITLE_CHUNK_SECONDS = 70;
export const RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS = 1.5;
export const RECORDING_AUDIO_SAMPLE_RATE = 16_000;
const SUBTITLE_PUNCTUATION_PATTERN = new RegExp('[\\p{P}\\p{S}]', 'gu');
export const RECORDING_VAD_SETTINGS = {
    positiveSpeechThreshold: 0.5,
    negativeSpeechThreshold: 0.35,
    minSpeechMs: 250,
    redemptionMs: 500,
    preSpeechPadMs: 200,
    uncertainEnergyRmsThreshold: 0.0025,
} as const;

/** Revision covers all committed media and timing, including new takes, but not editorial changes. */
export async function getRecordingMediaRevision(recording: StudioRecording): Promise<string> {
    const content = JSON.stringify({ status: recording.status, durationSeconds: recording.durationSeconds,
        captureEndSeconds: recording.captureEndSeconds, takes: recording.takes,
        tracks: recording.tracks.map(({ id, kind, isAudioIncluded, byteLength, chunkCount, startOffsetSeconds, durationSeconds, segments, parts }) =>
            ({ id, kind, isAudioIncluded, byteLength, chunkCount, startOffsetSeconds, durationSeconds, segments, parts })) });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
    return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

/** Older parts need a local decoder check before the editor can claim audio is available. */
export function getRecordingAudioAvailability(track: RecordingTrack): 'available' | 'unavailable' | 'unchecked' {
    const parts = getRecordingMediaParts(track).filter((part) => part.byteLength > 0);
    if (parts.some((part) => part.mediaBounds?.components.some((component) => component.kind === 'audio'))) return 'available';
    if (parts.some((part) => !part.mediaBounds)) return 'unchecked';
    return 'unavailable';
}

export function isRecordingPartAudioAvailable(part: RecordingMediaPart, track: RecordingTrack): boolean {
    return part.byteLength > 0 && (part.mediaBounds ? part.mediaBounds.components.some((component) => component.kind === 'audio') :
        (part.isAudioIncluded ?? track.isAudioIncluded));
}

/** A decoded file's timestamp zero can differ from its audio start and from session zero. */
export function mapRecordingPartMediaInterval(part: RecordingMediaPart, bounds: RecordingMediaBounds, startSeconds: number, endSeconds: number): RecordingTrim[] {
    const segments = part.segments ?? [{ sourceStartSeconds: 0, sessionStartSeconds: part.sessionStartSeconds, durationSeconds: part.durationSeconds }];
    return segments.flatMap((segment) => {
        const segmentMediaStart = bounds.firstTimestampSeconds + segment.sourceStartSeconds;
        const overlapStart = Math.max(startSeconds, segmentMediaStart);
        const overlapEnd = Math.min(endSeconds, segmentMediaStart + segment.durationSeconds);
        return overlapEnd > overlapStart ? [{ startSeconds: segment.sessionStartSeconds + overlapStart - segmentMediaStart,
            endSeconds: segment.sessionStartSeconds + overlapEnd - segmentMediaStart }] : [];
    });
}

export function getRecordingPartAudioRanges(part: RecordingMediaPart, bounds: RecordingMediaBounds): RecordingTrim[] {
    const audio = bounds.components.find((component) => component.kind === 'audio');
    return audio ? mapRecordingPartMediaInterval(part, bounds, audio.firstTimestampSeconds, audio.endTimestampSeconds) : [];
}

export function mergeRecordingIntervals(intervals: readonly RecordingTrim[], toleranceSeconds = 0.05): RecordingTrim[] {
    const merged: RecordingTrim[] = [];
    for (const interval of [...intervals].filter((value) => value.endSeconds > value.startSeconds).sort((first, second) => first.startSeconds - second.startSeconds)) {
        const previous = merged[merged.length - 1];
        if (previous && interval.startSeconds <= previous.endSeconds + toleranceSeconds) {
            merged[merged.length - 1] = { startSeconds: previous.startSeconds, endSeconds: Math.max(previous.endSeconds, interval.endSeconds) };
        } else merged.push(interval);
    }
    return merged;
}

/** Missing source coverage becomes unknown. Captured nonspeech becomes silence or uncertain. */
export function createRecordingSpeechIntervals(durationSeconds: number, availableRanges: readonly RecordingTrim[], speechRanges: readonly RecordingTrim[], uncertainRanges: readonly RecordingTrim[] = []): RecordingSpeechInterval[] {
    const available = mergeRecordingIntervals(availableRanges, 0);
    const speech = mergeRecordingIntervals(speechRanges);
    const uncertain = mergeRecordingIntervals(uncertainRanges);
    const boundaries = new Set([0, durationSeconds, ...available.flatMap((range) => [range.startSeconds, range.endSeconds]),
        ...speech.flatMap((range) => [range.startSeconds, range.endSeconds]), ...uncertain.flatMap((range) => [range.startSeconds, range.endSeconds])]);
    const ordered = Array.from(boundaries).filter((value) => value >= 0 && value <= durationSeconds).sort((first, second) => first - second);
    const result: RecordingSpeechInterval[] = [];
    let availableIndex = 0;
    let speechIndex = 0;
    let uncertainIndex = 0;
    for (let index = 0; index + 1 < ordered.length; index += 1) {
        const startSeconds = ordered[index]!;
        const endSeconds = ordered[index + 1]!;
        if (endSeconds - startSeconds < 0.001) continue;
        while (available[availableIndex]?.endSeconds <= startSeconds) availableIndex += 1;
        while (speech[speechIndex]?.endSeconds <= startSeconds) speechIndex += 1;
        while (uncertain[uncertainIndex]?.endSeconds <= startSeconds) uncertainIndex += 1;
        const isAvailable = available[availableIndex]?.startSeconds <= startSeconds;
        const isSpeech = speech[speechIndex]?.startSeconds <= startSeconds;
        const isUncertain = uncertain[uncertainIndex]?.startSeconds <= startSeconds;
        const type = !isAvailable ? 'unknown' : isSpeech ? 'speech' : isUncertain ? 'uncertain' : 'silence';
        const previous = result[result.length - 1];
        if (previous?.type === type && Math.abs(previous.endSeconds - startSeconds) < 0.001) {
            result[result.length - 1] = { ...previous, endSeconds };
        } else result.push({ id: crypto.randomUUID(), type, startSeconds, endSeconds, origin: 'generated' });
    }
    return result;
}

/** A correction owns its interval; neighboring generated ranges are clipped rather than contradicted. */
export function applyRecordingSpeechCorrection(intervals: readonly RecordingSpeechInterval[], corrected: RecordingSpeechInterval): RecordingSpeechInterval[] {
    const previous = intervals.find((interval) => interval.id === corrected.id);
    const uncovered: RecordingSpeechInterval[] = previous ? [
        ...(previous.startSeconds < corrected.startSeconds ? [{ id: crypto.randomUUID(), type: 'unknown' as const,
            startSeconds: previous.startSeconds, endSeconds: Math.min(previous.endSeconds, corrected.startSeconds), origin: 'manual' as const }] : []),
        ...(previous.endSeconds > corrected.endSeconds ? [{ id: crypto.randomUUID(), type: 'unknown' as const,
            startSeconds: Math.max(previous.startSeconds, corrected.endSeconds), endSeconds: previous.endSeconds, origin: 'manual' as const }] : []),
    ] : [];
    const others = intervals.filter((interval) => interval.id !== corrected.id).flatMap((interval) => {
        if (interval.endSeconds <= corrected.startSeconds || interval.startSeconds >= corrected.endSeconds) return [interval];
        const pieces: RecordingSpeechInterval[] = [];
        if (interval.startSeconds < corrected.startSeconds) pieces.push({ ...interval, endSeconds: corrected.startSeconds });
        if (interval.endSeconds > corrected.endSeconds) pieces.push({ ...interval, id: crypto.randomUUID(), startSeconds: corrected.endSeconds });
        return pieces;
    });
    return [...others, ...uncovered.filter((interval) => interval.endSeconds > interval.startSeconds), corrected].sort((first, second) => first.startSeconds - second.startSeconds);
}

export function clipRecordingDerivedTrack(track: RecordingDerivedTrack, selection: RecordingTrim): RecordingDerivedTrack {
    const clip = (value: { readonly startSeconds: number; readonly endSeconds: number }) => ({
        startSeconds: Math.max(value.startSeconds, selection.startSeconds) - selection.startSeconds,
        endSeconds: Math.min(value.endSeconds, selection.endSeconds) - selection.startSeconds,
    });
    if (track.kind === 'subtitles') return { ...track, cues: track.cues.filter((cue) => cue.endSeconds > selection.startSeconds && cue.startSeconds < selection.endSeconds)
        .map((cue) => ({ ...cue, ...clip(cue) })).filter((cue) => cue.endSeconds > cue.startSeconds)
        .sort((first, second) => first.startSeconds - second.startSeconds) };
    return { ...track, intervals: track.intervals.filter((interval) => interval.endSeconds > selection.startSeconds && interval.startSeconds < selection.endSeconds)
        .map((interval) => ({ ...interval, ...clip(interval) })).filter((interval) => interval.endSeconds > interval.startSeconds) };
}

export function getRecordingSpeechEvents(intervals: readonly RecordingSpeechInterval[]) {
    const speech = intervals.filter((interval) => interval.type === 'speech').sort((first, second) => first.startSeconds - second.startSeconds);
    const merged: { readonly id: string; readonly startSeconds: number; readonly endSeconds: number }[] = [];
    for (const interval of speech) {
        const previous = merged[merged.length - 1];
        if (previous && interval.startSeconds <= previous.endSeconds) {
            merged[merged.length - 1] = { ...previous, endSeconds: Math.max(previous.endSeconds, interval.endSeconds) };
        } else merged.push(interval);
    }
    return merged.flatMap((interval) => [
        { type: 'speech-start' as const, seconds: interval.startSeconds, startSeconds: interval.startSeconds,
            endSeconds: interval.startSeconds, intervalId: interval.id },
        { type: 'speech-end' as const, seconds: interval.endSeconds, startSeconds: interval.endSeconds,
            endSeconds: interval.endSeconds, intervalId: interval.id },
    ]);
}

export function serializeRecordingActivity(track: Extract<RecordingDerivedTrack, { kind: 'speech-activity' }>, coordinate: 'original-session' | 'prepared-export', format: 'json' | 'csv'): string {
    const events = getRecordingSpeechEvents(track.intervals);
    if (format === 'json') return JSON.stringify({ schemaVersion: 1, sourceId: track.provenance.sourceId, timeUnit: 'seconds', coordinate, provenance: track.provenance,
        intervals: track.intervals, events }, null, 2);
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
        ...track.intervals.map((interval) => ({ type: interval.type, start: interval.startSeconds, end: interval.endSeconds,
            confidence: interval.confidence, origin: interval.origin })),
        ...events.map((event) => ({ type: event.type, start: event.seconds, end: event.seconds, confidence: undefined, origin: 'derived' })),
    ].sort((first, second) => first.start - second.start);
    return ['source_id,type,start_seconds,end_seconds,time_unit,confidence,origin,coordinate,processor,media_revision,settings_json',
        ...rows.map((row) => [track.provenance.sourceId, row.type, row.start, row.end, 'seconds', row.confidence ?? '', row.origin,
            coordinate, track.provenance.processor, track.provenance.mediaRevision, JSON.stringify(track.provenance.settings)].map(escape).join(','))].join('\r\n') + '\r\n';
}

export function serializeRecordingSubtitles(track: Extract<RecordingDerivedTrack, { kind: 'subtitles' }>, format: 'srt' | 'vtt'): string {
    const cues = track.cues.filter((cue) => cue.isEnabled && cue.text.trim() && cue.endSeconds > cue.startSeconds)
        .sort((first, second) => first.startSeconds - second.startSeconds)
        .map(({ startSeconds, endSeconds, text }) => {
            // Both subtitle formats have millisecond precision. A positive submillisecond
            // overlap at an IN/OUT edge must still serialize to a valid nonzero cue.
            const startMilliseconds = Math.round(startSeconds * 1000);
            const endMilliseconds = Math.max(startMilliseconds + 1, Math.round(endSeconds * 1000));
            return { startSeconds: startMilliseconds / 1000, endSeconds: endMilliseconds / 1000, text };
        });
    return serializeSubtitleFile(cues, format);
}

export function serializeRecordingSubtitleMetadata(track: Extract<RecordingDerivedTrack, { kind: 'subtitles' }>, coordinate: 'original-session' | 'prepared-export'): string {
    return JSON.stringify({ schemaVersion: 1, timeUnit: 'seconds', coordinate, provenance: track.provenance, cues: track.cues }, null, 2);
}

export function getRecordingDerivedSource(recording: StudioRecording, sourceId: string): RecordingTrack {
    const track = recording.tracks.find((candidate) => candidate.id === sourceId);
    if (!track || getRecordingAudioAvailability(track) === 'unavailable') throw new Error('Vybraný zdroj nemá dostupnou zvukovou stopu. Vyberte mikrofon nebo kameru/obrazovku se zvukem.');
    if (recording.status !== 'complete' || getRecordingSessionDuration(recording) <= 0) throw new Error('Nejprve bezpečně dokončete nahrávání. Pozastavená relace není neměnný zdroj.');
    return track;
}

export function reconcileRecordingSubtitleCues(cues: readonly RecordingSubtitleCue[]): RecordingSubtitleCue[] {
    const ordered = [...cues].sort((first, second) => first.startSeconds - second.startSeconds);
    const reconciled: RecordingSubtitleCue[] = [];
    const normalizeText = (cue: RecordingSubtitleCue) => cue.text.normalize('NFKC').toLocaleLowerCase()
        .replace(SUBTITLE_PUNCTUATION_PATTERN, '').replace(/\s+/g, ' ').trim();
    for (const cue of ordered) {
        const text = normalizeText(cue);
        let previousIndex = -1;
        for (let index = reconciled.length - 1; index >= 0; index -= 1) {
            const previous = reconciled[index]!;
            if (cue.startSeconds - previous.startSeconds > RECORDING_SUBTITLE_CHUNK_SECONDS + 2 * RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS) break;
            const previousText = normalizeText(previous);
            const isSameSpeech = text !== '' && previousText !== '' && (text === previousText ||
                ` ${text} `.includes(` ${previousText} `) || ` ${previousText} `.includes(` ${text} `));
            const overlap = Math.min(previous.endSeconds, cue.endSeconds) - Math.max(previous.startSeconds, cue.startSeconds);
            if (isSameSpeech && overlap > Math.min(previous.endSeconds - previous.startSeconds, cue.endSeconds - cue.startSeconds) * 0.5) {
                previousIndex = index;
                break;
            }
        }
        if (previousIndex >= 0) {
            const previous = reconciled[previousIndex]!;
            const previousText = normalizeText(previous);
            if (text.length > previousText.length || (text.length === previousText.length &&
                cue.endSeconds - cue.startSeconds >= previous.endSeconds - previous.startSeconds)) {
                reconciled.splice(previousIndex, 1);
                reconciled.push(cue);
            }
            continue;
        }
        reconciled.push(cue);
    }
    return reconciled.sort((first, second) => first.startSeconds - second.startSeconds);
}
