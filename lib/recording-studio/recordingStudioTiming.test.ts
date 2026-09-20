import { describe, expect, it } from 'vitest';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import { estimateRecordingSeconds, getCommonRecordingDuration, getTrackTrim, validateRecordingTrim } from './recordingStudioTiming';
import { RECORDING_STORAGE_RESERVE_BYTES } from './recordingStudioTypes';

describe('shared recording timeline and quota estimates', () => {
    it('maps one session trim to source clocks without losing start offsets', () => {
        const recording = createTestStudioRecording();
        const trim = { startSeconds: 2, endSeconds: 7 };
        expect(getTrackTrim(trim, recording.tracks[0])).toEqual({ start: 2, end: 7 });
        expect(getTrackTrim(trim, recording.tracks[1], 0.5)).toEqual({ start: 2.498, end: 7.498 });
        expect(getTrackTrim({ startSeconds: 0, endSeconds: 5 }, recording.tracks[1]).start).toBe(-0.002);
    });
    it.each([
        [-1, 5], [3, 3], [4, 2], [0, 11], [NaN, 5], [0, Infinity],
    ])('refuses an invalid trim %s–%s', (startSeconds, endSeconds) => {
        expect(() => validateRecordingTrim({ startSeconds, endSeconds }, 10)).toThrow();
    });
    it('retains a disk reserve, counts all sources, and does not invent an unknown capacity', () => {
        expect(estimateRecordingSeconds(RECORDING_STORAGE_RESERVE_BYTES + 100_000_000, 2_000_000)).toBe(50);
        expect(estimateRecordingSeconds(10, 2_000_000)).toBe(0);
        expect(estimateRecordingSeconds(null, 2_000_000)).toBeNull();
        expect(estimateRecordingSeconds(100_000_000, 0)).toBeNull();
    });
    it('limits a recovered range to the last saved data present in every track', () => {
        const tracks = createTestStudioRecording().tracks.map((track) => ({ ...track, byteLength: 10 }));
        expect(getCommonRecordingDuration(tracks)).toBe(10);
        expect(getCommonRecordingDuration([tracks[0], { ...tracks[1], durationSeconds: 5 }])).toBe(5.002);
        expect(getCommonRecordingDuration([tracks[0], { ...tracks[1], byteLength: 0 }])).toBe(0);
    });
});
