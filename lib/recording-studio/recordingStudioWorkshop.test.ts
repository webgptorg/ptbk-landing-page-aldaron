import { describe, expect, it } from 'vitest';
import { getRecordingMediaRevision } from './recordingStudioDerived';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import { createRecordingWorkshopMetadata, createRecordingWorkshopSidecar, extendRecordingWorkshopActivity,
    getRecordingWorkshopCommitAt, mergeRecordingWorkshopActivity, moveRecordingWorkshopActivityBoundary,
    splitRecordingWorkshopActivity, suggestRecordingWorkshopSpeechBoundaries, validateRecordingWorkshopMetadata } from './recordingStudioWorkshop';
import type { RecordingWorkshopCommit, StudioRecording } from './recordingStudioTypes';

const START_SHA = 'a'.repeat(40);
const NEXT_SHA = 'b'.repeat(40);
const UNAVAILABLE_SHA = 'c'.repeat(40);

function createCommit(sha: string, availability: RecordingWorkshopCommit['availability'] = 'verified'): RecordingWorkshopCommit {
    return { sha, availability, checkedAt: '2026-09-29T10:00:00.000Z', committedAt: '2026-09-29T09:00:00.000Z', message: 'Actual commit' };
}

function createPausedRecording(): StudioRecording {
    const base = createTestStudioRecording();
    return { ...base, trim: { startSeconds: 4, endSeconds: 8 }, takes: [
        { id: 'take-one', startedAt: '2026-09-29T08:00:00.000Z', sessionStartSeconds: 0, durationSeconds: 5,
            sourceIds: base.tracks.map((track) => track.id) },
        { id: 'take-two', startedAt: '2026-09-29T08:10:00.000Z', sessionStartSeconds: 5, durationSeconds: 5,
            sourceIds: base.tracks.map((track) => track.id) },
    ], tracks: base.tracks.map((track) => ({ ...track, startOffsetSeconds: 0, durationSeconds: 10, byteLength: 20, chunkCount: 2,
        parts: [0, 5].map((startSeconds, index) => ({ id: `${track.id}-part-${index}`, takeId: index === 0 ? 'take-one' : 'take-two',
            sessionStartSeconds: startSeconds, durationSeconds: 5, byteLength: 10, chunkCount: 1, mimeType: 'video/webm',
            isAudioIncluded: track.isAudioIncluded })) })) };
}

describe('recording workshop metadata', () => {
    it('keeps speech as review boundaries, preserves manual classification and extends an appended take as unclassified', async () => {
        const recording = createPausedRecording();
        const revision = await getRecordingMediaRevision(recording);
        let metadata = createRecordingWorkshopMetadata(recording, revision);
        const speechTrack = { id: 'speech-one', kind: 'speech-activity' as const,
            provenance: { sourceId: recording.tracks[0]!.id, sourceLabel: recording.tracks[0]!.label,
                mediaRevision: revision, createdAt: '2026-09-29T08:00:00.000Z', language: null,
                processor: 'test', settings: {} },
            intervals: [{ id: 'speech-interval', type: 'speech' as const, startSeconds: 3, endSeconds: 4,
                origin: 'generated' as const }],
        };
        expect(suggestRecordingWorkshopSpeechBoundaries(metadata, { ...speechTrack,
            intervals: [{ ...speechTrack.intervals[0], type: 'silence' }] })).toEqual(metadata);
        metadata = suggestRecordingWorkshopSpeechBoundaries(metadata, speechTrack);
        expect(metadata.activityIntervals.map((interval) => interval.classification)).toEqual(['unclassified', 'unclassified', 'unclassified']);
        expect(metadata.activityIntervals[1]?.suggestedFrom).toEqual({ speechTrackId: 'speech-one',
            audioSourceId: recording.tracks[0]!.id, mediaRevision: revision });
        metadata = { ...metadata, activityIntervals: metadata.activityIntervals.map((interval) =>
            interval.startSeconds === 3 ? { ...interval, classification: 'active' as const, origin: 'manual' as const, isReviewed: true } : interval) };
        metadata = extendRecordingWorkshopActivity(metadata, 12);
        expect(metadata.activityIntervals.at(-1)).toMatchObject({ startSeconds: 10, endSeconds: 12, classification: 'unclassified' });
        expect(metadata.activityIntervals.find((interval) => interval.startSeconds === 3)).toMatchObject({ classification: 'active', isReviewed: true });
    });

    it('splits, moves and merges without leaving holes or overlapping intervals', async () => {
        const recording = createPausedRecording();
        let metadata = createRecordingWorkshopMetadata(recording, await getRecordingMediaRevision(recording));
        metadata = splitRecordingWorkshopActivity(metadata, 5);
        metadata = moveRecordingWorkshopActivityBoundary(metadata, 0, 4.5);
        expect(metadata.activityIntervals.map((interval) => [interval.startSeconds, interval.endSeconds])).toEqual([[0, 4.5], [4.5, 10]]);
        metadata = mergeRecordingWorkshopActivity(metadata, 0);
        expect(metadata.activityIntervals).toHaveLength(1);
        expect(metadata.activityIntervals[0]).toMatchObject({ startSeconds: 0, endSeconds: 10 });
    });

    it('clips and rebases activity, events, scenes and SHA anchors across paused and appended parts', async () => {
        const recording = createPausedRecording();
        const metadata = { ...createRecordingWorkshopMetadata(recording, await getRecordingMediaRevision(recording)),
            activityIntervals: [
                { id: 'activity-one', startSeconds: 0, endSeconds: 5, classification: 'active' as const, origin: 'manual' as const, isReviewed: true },
                { id: 'activity-two', startSeconds: 5, endSeconds: 10, classification: 'automatic-coding' as const, origin: 'manual' as const, isReviewed: true },
            ],
            events: [{ id: 'event-one', seconds: 4, title: 'Opened editor', detail: '', type: 'navigation' },
                { id: 'event-two', seconds: 9, title: 'Outside selection', detail: '', type: '' }],
            autoView: { defaultScene: 'editor' as const, isDefaultReviewed: true, editorSourceId: 'track-0', applicationSourceId: 'track-1',
                transitions: [{ id: 'scene-one', seconds: 5, scene: 'application' as const, isReviewed: true }] },
            repository: { owner: 'example', name: 'workshop', branch: 'main' }, startingCommit: createCommit(START_SHA),
            commitAnchors: [{ id: 'anchor-one', seconds: 5, commit: createCommit(NEXT_SHA), origin: 'manual' as const, isReviewed: true }],
            calibration: { sessionSeconds: 0, wallClockAtSessionSeconds: '2026-09-29T08:00:00.000Z' },
        };
        const stored = { ...recording, workshopMetadata: metadata };
        validateRecordingWorkshopMetadata(stored);
        const prepared = await createRecordingWorkshopSidecar(stored, true);
        expect(prepared).toMatchObject({ sourceRecordingId: recording.id, coordinate: 'prepared-export',
            preparedTimeZeroSessionSeconds: 4, commitAtSelectionStart: { state: 'known', sha: START_SHA },
            activityIntervals: [{ startSeconds: 0, endSeconds: 1, originalStartSeconds: 0, originalEndSeconds: 5 },
                { startSeconds: 1, endSeconds: 4, originalStartSeconds: 5, originalEndSeconds: 10 }],
            events: [{ seconds: 0, originalSeconds: 4 }],
            commitAnchors: [{ seconds: 1, originalSeconds: 5, commit: { sha: NEXT_SHA } }],
            autoView: { transitions: [{ seconds: 1, originalSeconds: 5, scene: 'application' }] } });
        expect(prepared?.editRecipe.sources).toHaveLength(2);
        expect(prepared?.editRecipe.sources[0].segments.map((segment) => segment.sessionStartSeconds)).toEqual([0, 5]);
        expect(getRecordingWorkshopCommitAt(metadata, 4.999)).toEqual({ state: 'known', sha: START_SHA });
        expect(getRecordingWorkshopCommitAt(metadata, 5)).toEqual({ state: 'known', sha: NEXT_SHA });
        expect(getRecordingWorkshopCommitAt(metadata, 8)).toEqual({ state: 'known', sha: NEXT_SHA });
        const missing = { ...metadata, commitAnchors: [...metadata.commitAnchors,
            { id: 'missing', seconds: 7, commit: createCommit(UNAVAILABLE_SHA, 'unavailable'), origin: 'manual' as const, isReviewed: true }] };
        expect(getRecordingWorkshopCommitAt(missing, 7)).toEqual({ state: 'unavailable', sha: null });
        const unverified = { ...missing, commitAnchors: [...missing.commitAnchors,
            { id: 'unverified', seconds: 8, commit: createCommit('d'.repeat(40), 'unverified'),
                origin: 'manual' as const, isReviewed: true }] };
        expect(getRecordingWorkshopCommitAt(unverified, 8)).toEqual({ state: 'unknown', sha: null });
    });

    it('rejects overlapping activity, unreviewed automatic coding and a scene source gap', async () => {
        const recording = createPausedRecording();
        const base = createRecordingWorkshopMetadata(recording, await getRecordingMediaRevision(recording));
        const view = { ...base.autoView, isDefaultReviewed: true };
        const valid = { ...recording, workshopMetadata: { ...base, autoView: view } };
        expect(() => validateRecordingWorkshopMetadata(valid)).not.toThrow();
        expect(() => validateRecordingWorkshopMetadata({ ...valid, workshopMetadata: { ...valid.workshopMetadata!, activityIntervals: [
            { id: 'one', startSeconds: 0, endSeconds: 6, classification: 'active', origin: 'manual', isReviewed: true },
            { id: 'two', startSeconds: 5, endSeconds: 10, classification: 'active', origin: 'manual', isReviewed: true },
        ] } })).toThrow(/překrývají/);
        expect(() => validateRecordingWorkshopMetadata({ ...valid, workshopMetadata: { ...valid.workshopMetadata!, activityIntervals: [
            { id: 'one', startSeconds: 0, endSeconds: 10, classification: 'automatic-coding', origin: 'manual', isReviewed: false },
        ] } })).toThrow(/ručně potvrzené/);
        const sourceWithGap = { ...recording.tracks[0], parts: recording.tracks[0].parts!.map((part, index) => index === 0 ? part : { ...part, sessionStartSeconds: 6 }) };
        expect(() => validateRecordingWorkshopMetadata({ ...valid, tracks: [sourceWithGap, recording.tracks[1]] })).toThrow(/nemá obraz/);
        const audioOnlyPart = { ...recording.tracks[0].parts![0]!, mediaBounds: {
            firstTimestampSeconds: 0, availableStartTimestampSeconds: 0, endTimestampSeconds: 5,
            components: [{ kind: 'audio' as const, firstTimestampSeconds: 0, endTimestampSeconds: 5 }],
        } };
        const sourceWithoutVideo = { ...recording.tracks[0], parts: [audioOnlyPart, recording.tracks[0].parts![1]!] };
        expect(() => validateRecordingWorkshopMetadata({ ...valid, tracks: [sourceWithoutVideo, recording.tracks[1]] })).toThrow(/nemá obraz/);
    });

    it('marks an edited recording revision stale without discarding its manual annotation', async () => {
        const recording = createPausedRecording();
        const metadata = { ...createRecordingWorkshopMetadata(recording, await getRecordingMediaRevision(recording)),
            autoView: { ...createRecordingWorkshopMetadata(recording, 'unused').autoView, isDefaultReviewed: true } };
        const changed = { ...recording, tracks: recording.tracks.map((track, index) => index === 0 ? { ...track, chunkCount: track.chunkCount + 1 } : track),
            workshopMetadata: metadata };
        const sidecar = await createRecordingWorkshopSidecar(changed, true);
        expect(sidecar?.isSourceRevisionStale).toBe(true);
        expect(sidecar?.activityIntervals).toHaveLength(1);
    });
});
