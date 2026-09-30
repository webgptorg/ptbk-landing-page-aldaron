import { describe, expect, it } from 'vitest';
import { getHostedRecordingCommitAt, getHostedRecordingLivePlaybackSeconds, getHostedRecordingLiveSeconds,
    getHostedRecordingLiveSegmentIndex, getHostedRecordingLiveWindow,
    getHostedRecordingNextSpeedBoundary, getHostedRecordingScene, getHostedRecordingSpeedAt,
    type HostedRecordingMetadata } from './hostedRecordingTimeline';

const SHA_ONE = '1'.repeat(40);
const SHA_TWO = '2'.repeat(40);
const METADATA: HostedRecordingMetadata = {
    schemaVersion: 1, durationSeconds: 30, liveStartAt: '2026-09-30T10:00:00.000Z',
    liveSegments: [
        { startSeconds: 0, endSeconds: 10, startsAt: '2026-09-30T10:00:00.000Z' },
        { startSeconds: 10, endSeconds: 30, startsAt: '2026-09-30T10:00:20.000Z' },
    ],
    tracks: [{ role: 'editor', contentType: 'video/webm', hasAudio: true },
        { role: 'application', contentType: 'video/webm', hasAudio: false },
        { role: 'camera', contentType: 'video/webm', hasAudio: true }],
    activityIntervals: [
        { startSeconds: 0, endSeconds: 5, classification: 'active' },
        { startSeconds: 5, endSeconds: 10, classification: 'automatic-coding' },
        { startSeconds: 10, endSeconds: 20, classification: 'unclassified' },
        { startSeconds: 20, endSeconds: 25, classification: 'automatic-coding' },
        { startSeconds: 25, endSeconds: 30, classification: 'active' },
    ],
    autoView: { defaultScene: 'editor', transitions: [{ seconds: 10, scene: 'application' }] },
    repository: { owner: 'owner', name: 'project' },
    startingCommit: { sha: SHA_ONE, availability: 'verified' },
    commitAnchors: [{ seconds: 12, commit: { sha: SHA_TWO, availability: 'verified' } }],
};

describe('hosted recording timeline', () => {
    it('changes Auto speed at each half-open interval boundary, including appended-take boundaries', () => {
        expect([0, 4.999, 5, 9.999, 10, 19.999, 20, 25].map((seconds) =>
            getHostedRecordingSpeedAt(METADATA, seconds, 'auto'))).toEqual([1, 1, 10, 10, 1, 1, 10, 1]);
        expect([0, 5, 10, 20, 25].map((seconds) =>
            getHostedRecordingNextSpeedBoundary(METADATA, seconds))).toEqual([5, 10, 20, 25, 30]);
        expect(getHostedRecordingSpeedAt(METADATA, 7, 1.5)).toBe(1.5);
    });

    it('uses the pause-aware wall clock and only the most recently completed live segment', () => {
        expect(getHostedRecordingLiveSeconds(METADATA, Date.parse('2026-09-30T10:00:15.000Z'))).toBe(10);
        expect(getHostedRecordingLivePlaybackSeconds(METADATA, Date.parse('2026-09-30T10:00:11.000Z'))).toBe(9);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:11.000Z'))).toBe(4);
        expect(getHostedRecordingLivePlaybackSeconds(METADATA, Date.parse('2026-09-30T10:00:15.000Z'))).toBe(10);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:15.000Z'))).toBe(-1);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:21.000Z'))).toBe(-1);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:22.000Z'))).toBe(5);
        expect(getHostedRecordingLiveSeconds(METADATA, Date.parse('2026-09-30T10:00:24.000Z'))).toBe(14);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:24.000Z'))).toBe(6);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:40.000Z'))).toBe(14);
        expect(getHostedRecordingLivePlaybackSeconds(METADATA, Date.parse('2026-09-30T10:00:40.000Z'))).toBe(28);
        expect(getHostedRecordingLivePlaybackSeconds(METADATA, Date.parse('2026-09-30T10:00:42.000Z'))).toBe(30);
        expect(getHostedRecordingLiveSegmentIndex(METADATA, Date.parse('2026-09-30T10:00:42.000Z'))).toBe(-2);
        const partial = { durationSeconds: 7.638, liveStartAt: METADATA.liveStartAt };
        expect(getHostedRecordingLiveSegmentIndex(partial, Date.parse('2026-09-30T10:00:07.638Z'))).toBe(2);
        expect(getHostedRecordingLiveSegmentIndex(partial, Date.parse('2026-09-30T10:00:08.000Z'))).toBe(3);
        expect(getHostedRecordingLiveSegmentIndex(partial, Date.parse('2026-09-30T10:00:09.638Z'))).toBe(-2);
    });

    it('keeps a partial take window separate from media recorded after an unaligned pause', () => {
        const paused = { durationSeconds: 20, liveStartAt: METADATA.liveStartAt, liveSegments: [
            { startSeconds: 0, endSeconds: 9.5, startsAt: '2026-09-30T10:00:00.000Z' },
            { startSeconds: 9.5, endSeconds: 20, startsAt: '2026-09-30T10:00:20.000Z' },
        ] };
        expect(getHostedRecordingLiveWindow(paused, 4)).toEqual({ startSeconds: 8, endSeconds: 9.5 });
        expect(getHostedRecordingLiveWindow(paused, 5)).toEqual({ startSeconds: 9.5, endSeconds: 11.5 });
        expect(getHostedRecordingLiveSegmentIndex(paused, Date.parse('2026-09-30T10:00:10.000Z'))).toBe(4);
        expect(getHostedRecordingLiveSegmentIndex(paused, Date.parse('2026-09-30T10:00:12.000Z'))).toBe(-1);
        expect(getHostedRecordingLiveSegmentIndex(paused, Date.parse('2026-09-30T10:00:22.000Z'))).toBe(5);
    });

    it('falls back to an available frame and follows only anchored, verified commits', () => {
        expect(getHostedRecordingScene(METADATA, 15, ['editor', 'camera'])).toBe('editor');
        expect(getHostedRecordingScene(METADATA, 15, ['camera'])).toBe('camera');
        expect(getHostedRecordingCommitAt(METADATA, 11, { owner: 'owner', name: 'project' }))
            .toMatchObject({ state: 'known', sha: SHA_ONE });
        expect(getHostedRecordingCommitAt(METADATA, 12, { owner: 'owner', name: 'project' }))
            .toMatchObject({ state: 'known', sha: SHA_TWO });
        expect(getHostedRecordingCommitAt(METADATA, 12, { owner: 'other', name: 'project' }).state)
            .toBe('different-repository');
        expect(getHostedRecordingCommitAt({ ...METADATA, commitAnchors: [{ seconds: 12,
            commit: { sha: SHA_TWO, availability: 'unavailable' } }] }, 12,
        { owner: 'owner', name: 'project' }).state).toBe('unavailable');
    });
});
