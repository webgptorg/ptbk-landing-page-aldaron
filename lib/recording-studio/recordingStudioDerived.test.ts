import { describe, expect, it } from 'vitest';
import { applyRecordingSpeechCorrection, clipRecordingDerivedTrack, createRecordingSpeechIntervals, getRecordingMediaRevision,
    getRecordingAudioAvailability, getRecordingPartAudioRanges, reconcileRecordingSubtitleCues, serializeRecordingActivity,
    serializeRecordingSubtitles } from './recordingStudioDerived';
import { getRecordingDerivedFiles } from './recordingStudioDerivedExport';
import { getRecordingAudioChunkWindows, getRecordingUncertainAudioRanges } from './recordingStudioDerivedGeneration';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import type { RecordingDerivedTrack, RecordingMediaPart, StudioRecording } from './recordingStudioTypes';

const PROVENANCE = { sourceId: 'camera-audio', sourceLabel: 'Camera with microphone', mediaRevision: 'a'.repeat(64),
    createdAt: '2026-09-29T08:00:00.000Z', language: 'cs' as const, processor: 'openai-whisper-1', settings: { chunkSeconds: 70 } };

const SUBTITLES: Extract<RecordingDerivedTrack, { kind: 'subtitles' }> = { id: 'subtitle-revision', kind: 'subtitles', provenance: PROVENANCE,
    cues: [
        { id: 'first', startSeconds: 2, endSeconds: 3, text: 'Dobrý den', isEnabled: true, origin: 'manual' },
        { id: 'second', startSeconds: 6.2, endSeconds: 7, text: 'Česky', isEnabled: true, origin: 'generated' },
        { id: 'disabled', startSeconds: 4, endSeconds: 5, text: 'Vypnuto', isEnabled: false, origin: 'manual' },
    ] };

const ACTIVITY: Extract<RecordingDerivedTrack, { kind: 'speech-activity' }> = { id: 'activity-revision', kind: 'speech-activity',
    provenance: { ...PROVENANCE, language: null, processor: 'silero-vad-legacy', settings: { positiveSpeechThreshold: 0.5 } },
    intervals: [
        { id: 'silence', type: 'silence', startSeconds: 0, endSeconds: 2, origin: 'generated' },
        { id: 'speech', type: 'speech', startSeconds: 2, endSeconds: 3, origin: 'generated' },
        { id: 'unknown', type: 'unknown', startSeconds: 3, endSeconds: 4, origin: 'generated' },
        { id: 'later', type: 'speech', startSeconds: 6, endSeconds: 7, origin: 'manual' },
    ] };

describe('recording derived tracks', () => {
    it('selects only sources with recorded audio and maps media timestamps through pause and appended parts', () => {
        const part: RecordingMediaPart = { id: 'part', takeId: 'take-2', sessionStartSeconds: 5, durationSeconds: 3,
            byteLength: 100, chunkCount: 1, mimeType: 'video/webm', isAudioIncluded: true };
        const base = createTestStudioRecording();
        const camera = { ...base.tracks[0], id: 'camera-audio', isAudioIncluded: true, byteLength: 100, parts: [part] };
        expect(getRecordingAudioAvailability(camera)).toBe('unchecked');
        expect(getRecordingAudioAvailability({ ...camera, isAudioIncluded: false, parts: [{ ...part, isAudioIncluded: false }] })).toBe('unchecked');
        expect(getRecordingAudioAvailability({ ...camera, parts: [{ ...part, mediaBounds: { firstTimestampSeconds: 0,
            availableStartTimestampSeconds: 0, endTimestampSeconds: 3,
            components: [{ kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds: 3 }] } }] })).toBe('unavailable');
        expect(getRecordingAudioAvailability({ ...camera, isAudioIncluded: false, parts: [{ ...part, isAudioIncluded: false,
            mediaBounds: { firstTimestampSeconds: 0, availableStartTimestampSeconds: 0, endTimestampSeconds: 3,
                components: [{ kind: 'audio', firstTimestampSeconds: 0, endTimestampSeconds: 3 }] } }] })).toBe('available');
        const audioRanges = getRecordingPartAudioRanges(part, { firstTimestampSeconds: 0.1, availableStartTimestampSeconds: 0.45, endTimestampSeconds: 3.1,
            components: [{ kind: 'video', firstTimestampSeconds: 0.1, endTimestampSeconds: 3.1 }, { kind: 'audio', firstTimestampSeconds: 0.45, endTimestampSeconds: 3.1 }] });
        expect(audioRanges).toHaveLength(1);
        expect(audioRanges[0].startSeconds).toBeCloseTo(5.35, 6);
        expect(audioRanges[0].endSeconds).toBeCloseTo(8, 6);
    });

    it('marks unavailable source ranges unknown and loud ambiguous audio uncertain without fabricated confidence', () => {
        const intervals = createRecordingSpeechIntervals(8, [{ startSeconds: 0.5, endSeconds: 3 }, { startSeconds: 5, endSeconds: 8 }],
            [{ startSeconds: 1, endSeconds: 2 }, { startSeconds: 6, endSeconds: 7 }], [{ startSeconds: 2.4, endSeconds: 2.8 }]);
        expect(intervals.map(({ type, startSeconds, endSeconds }) => [type, startSeconds, endSeconds])).toEqual([
            ['unknown', 0, 0.5], ['silence', 0.5, 1], ['speech', 1, 2], ['silence', 2, 2.4],
            ['uncertain', 2.4, 2.8], ['silence', 2.8, 3], ['unknown', 3, 5], ['silence', 5, 6],
            ['speech', 6, 7], ['silence', 7, 8],
        ]);
        expect(intervals.every((interval) => interval.confidence === undefined)).toBe(true);
        expect(createRecordingSpeechIntervals(8, [], [])).toEqual([expect.objectContaining({
            type: 'unknown', startSeconds: 0, endSeconds: 8,
        })]);
        const corrected = applyRecordingSpeechCorrection(intervals, { ...intervals[2], startSeconds: 1.2, type: 'speech', origin: 'manual' });
        expect(corrected.some((interval) => interval.type === 'unknown' && interval.startSeconds === 1 && interval.endSeconds === 1.2)).toBe(true);
        expect(corrected.every((interval, index) => index === 0 || interval.startSeconds >= corrected[index - 1].endSeconds)).toBe(true);
    });

    it('clips Czech cues and speech events to the exact prepared zero while retaining originals', () => {
        const trim = { startSeconds: 2.5, endSeconds: 6.5 };
        const clippedSubtitles = clipRecordingDerivedTrack(SUBTITLES, trim);
        const clippedActivity = clipRecordingDerivedTrack(ACTIVITY, trim);
        expect(clippedSubtitles.kind === 'subtitles' && clippedSubtitles.cues.map(({ startSeconds, endSeconds }) => [startSeconds, endSeconds]))
            .toEqual([[0, 0.5], [1.5, 2.5], [3.7, 4]]);
        expect(serializeRecordingSubtitles(clippedSubtitles as typeof SUBTITLES, 'srt')).toContain('00:00:00,000 --> 00:00:00,500\nDobrý den');
        expect(serializeRecordingSubtitles(clippedSubtitles as typeof SUBTITLES, 'vtt')).toContain('00:00:03.700 --> 00:00:04.000\nČesky');
        expect(serializeRecordingSubtitles(clippedSubtitles as typeof SUBTITLES, 'srt')).not.toContain('Vypnuto');
        const activityJson = JSON.parse(serializeRecordingActivity(clippedActivity as typeof ACTIVITY, 'prepared-export', 'json')) as {
            intervals: { type: string; startSeconds: number; endSeconds: number }[];
            events: { type: string; seconds: number }[];
        };
        expect(activityJson.intervals).toContainEqual(expect.objectContaining({ type: 'speech', startSeconds: 0, endSeconds: 0.5 }));
        expect(activityJson.events).toContainEqual(expect.objectContaining({ type: 'speech-end', seconds: 0.5,
            startSeconds: 0.5, endSeconds: 0.5 }));
        expect(serializeRecordingActivity(clippedActivity as typeof ACTIVITY, 'prepared-export', 'csv')).toContain('speech-start');
        expect(SUBTITLES.cues[0].startSeconds).toBe(2);
    });

    it('keeps independent original and prepared sidecars for the selected camera source', () => {
        const base = createTestStudioRecording();
        const recording: StudioRecording = { ...base, trim: { startSeconds: 2.5, endSeconds: 6.5 },
            tracks: [{ ...base.tracks[0], id: 'camera-audio', isAudioIncluded: true }, ...base.tracks.slice(1)],
            derivedTracks: [SUBTITLES, ACTIVITY] };
        const originals = getRecordingDerivedFiles(recording, 'project-123', false);
        const prepared = getRecordingDerivedFiles(recording, 'project-123', true);
        expect(originals.map((file) => file.filename.split('.').pop())).toEqual(['srt', 'vtt', 'json', 'json', 'csv']);
        expect(prepared.every((file) => file.coordinate === 'prepared-export' && file.filename.includes('camera-audio'))).toBe(true);
        expect(prepared.find((file) => file.filename.endsWith('.srt'))?.content).toContain('00:00:00,000 --> 00:00:00,500');
        expect(originals.find((file) => file.filename.endsWith('.srt'))?.content).toContain('00:00:02,000 --> 00:00:03,000');
    });

    it('changes media revision for appended takes but not editorial trim or title', async () => {
        const base = createTestStudioRecording();
        const revision = await getRecordingMediaRevision(base);
        expect(await getRecordingMediaRevision({ ...base, title: 'Changed', trim: { startSeconds: 1, endSeconds: 2 } })).toBe(revision);
        expect(await getRecordingMediaRevision({ ...base, takes: [{ id: 'new-take', startedAt: '2026-09-29T09:00:00.000Z',
            sessionStartSeconds: 10, durationSeconds: 2, sourceIds: ['track-0'] }] })).not.toBe(revision);
    });

    it('reconciles overlapping chunk suggestions without deleting different words', () => {
        const cues = reconcileRecordingSubtitleCues([
            { id: 'one', startSeconds: 69.5, endSeconds: 70.4, text: 'Ahoj', isEnabled: true, origin: 'generated' },
            { id: 'copy', startSeconds: 69.6, endSeconds: 70.5, text: 'Ahoj!', isEnabled: true, origin: 'generated' },
            { id: 'next', startSeconds: 70.4, endSeconds: 71, text: 'světe', isEnabled: true, origin: 'generated' },
            { id: 'partial', startSeconds: 71.1, endSeconds: 71.6, text: 'Dobrý', isEnabled: true, origin: 'generated' },
            { id: 'complete', startSeconds: 71, endSeconds: 71.8, text: 'Dobrý den', isEnabled: true, origin: 'generated' },
            { id: 'neighbor-only', startSeconds: 71.9, endSeconds: 72.4, text: 'pokračuje', isEnabled: true, origin: 'generated' },
        ]);
        expect(cues.map((cue) => cue.text)).toEqual(['Ahoj!', 'světe', 'Dobrý den', 'pokračuje']);
    });

    it('serializes tiny clipped cues with valid millisecond times', () => {
        const tiny = { ...SUBTITLES, cues: [{ ...SUBTITLES.cues[0], startSeconds: 0.0001, endSeconds: 0.0004 }] };
        expect(serializeRecordingSubtitles(tiny, 'srt')).toContain('00:00:00,000 --> 00:00:00,001');
        expect(serializeRecordingSubtitles(tiny, 'vtt')).toContain('00:00:00.000 --> 00:00:00.001');
    });

    it('treats non-silent detector misses as uncertain without inventing speech confidence', () => {
        const samples = new Float32Array(16_000);
        let randomState = 123456;
        let smoothedNoise = 0;
        for (let index = 0; index < samples.length; index += 1) {
            randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
            const noise = randomState / 4294967296 * 2 - 1;
            smoothedNoise = smoothedNoise * 0.85 + noise * 0.15;
            // Music, background noise and breath-like noise stay uncertain, never speech by energy alone.
            samples[index] = index < 4_000 ? 0 : index < 8_000 ? 0.03 * Math.sin(index / 8) :
                index < 12_000 ? noise * 0.02 : smoothedNoise * 0.025;
        }
        const uncertain = getRecordingUncertainAudioRanges(samples, 10);
        expect(uncertain[0].startSeconds).toBeCloseTo(10.2, 1);
        expect(uncertain.some((range) => range.endSeconds > 10.9)).toBe(true);
        const intervals = createRecordingSpeechIntervals(11, [{ startSeconds: 10, endSeconds: 11 }], [], uncertain);
        expect(intervals.some((interval) => interval.type === 'speech')).toBe(false);
        expect(intervals.some((interval) => interval.type === 'uncertain')).toBe(true);
        expect(intervals.some((interval) => interval.type === 'silence')).toBe(true);
        expect(intervals.every((interval) => interval.confidence === undefined)).toBe(true);
    });

    it('keeps long audio windows bounded with gapless core coverage and overlapping decoder context', () => {
        const windows = getRecordingAudioChunkWindows(0.37, 36_000);
        expect(windows.length).toBeGreaterThan(500);
        expect(windows[0].coreStart).toBe(0.37);
        expect(windows[windows.length - 1].coreEnd).toBe(36_000);
        for (let index = 0; index < windows.length; index += 1) {
            const window = windows[index];
            expect(window.decodeEnd - window.decodeStart).toBeLessThanOrEqual(73);
            if (index > 0) {
                expect(window.coreStart).toBeCloseTo(windows[index - 1].coreEnd, 6);
                expect(window.decodeStart).toBeLessThan(window.coreStart);
            }
        }
    });
});
