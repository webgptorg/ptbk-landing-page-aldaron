import { describe, expect, it } from 'vitest';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import { createRecordingEditRecipe, formatRecordingTimecode, getRecordingPreparationRange, getRecordingSessionDuration, getRecordingTrackSegments, getRecordingUnavailableRanges, sessionToRecordingMediaTime } from './recordingStudioSessionTime';

describe('source preparation time model', () => {
    const recording = createTestStudioRecording();
    const track = { ...recording.tracks[0], byteLength: 10, startOffsetSeconds: 0.27, durationSeconds: 36_000 };
    it('adapts older IDs and trims without rewriting media or inventing a second clock', () => {
        const legacy = { ...recording, tracks: [track], trim: { startSeconds: 300, endSeconds: 35_000 } };
        const recipe = createRecordingEditRecipe(legacy);
        expect(recipe.preparedTimeZeroSessionSeconds).toBe(300);
        expect(recipe.sources[0]).toEqual({ sourceId: track.id, segments: [{ sourceStartSeconds: 0, sessionStartSeconds: 0.27, durationSeconds: 36_000 }] });
        expect(legacy).not.toHaveProperty('editRecipe');
        expect(formatRecordingTimecode(36_000.123)).toBe('10:00:00.123');
        expect(sessionToRecordingMediaTime(track, 35_555.55, 0.08)).toBeCloseTo(35_555.36, 6);
    });
    it('retains startup, internal and short encoder gaps without sliding later material left', () => {
        const segmented = { ...track, segments: [
            { sourceStartSeconds: 0, sessionStartSeconds: 1, durationSeconds: 3 },
            { sourceStartSeconds: 3, sessionStartSeconds: 8, durationSeconds: 5 },
        ] };
        expect(sessionToRecordingMediaTime(segmented, 0.9)).toBeNull();
        expect(sessionToRecordingMediaTime(segmented, 5)).toBeNull();
        expect(sessionToRecordingMediaTime(segmented, 9)).toBe(4);
        expect(sessionToRecordingMediaTime(segmented, 12, 0, 6)).toBeNull();
        expect(getRecordingUnavailableRanges(segmented, 15, 0, 6)).toEqual([
            { startSeconds: 0, endSeconds: 1 }, { startSeconds: 4, endSeconds: 8 }, { startSeconds: 11, endSeconds: 15 },
        ]);
        expect(() => getRecordingPreparationRange(segmented, { startSeconds: 3, endSeconds: 9 }, 0, 8)).toThrow('chybějící');
        expect(getRecordingPreparationRange(segmented, { startSeconds: 8.5, endSeconds: 10 }, 0.1, 8.1)).toEqual({ start: 3.5999999999999996, end: 5.1 });
    });
    it('exposes longer committed tails and never advertises an empty source as playable', () => {
        expect(getRecordingSessionDuration({ ...recording, tracks: [track], captureEndSeconds: 36_001 })).toBe(36_001);
        expect(getRecordingTrackSegments({ ...track, byteLength: 0 })).toEqual([]);
        expect(() => getRecordingPreparationRange(track, { startSeconds: 1, endSeconds: 10 }, 0, 5)).toThrow('končí');
    });
});
