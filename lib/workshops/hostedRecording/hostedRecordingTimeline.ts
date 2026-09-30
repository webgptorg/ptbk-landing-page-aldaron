export type HostedRecordingRole = 'editor' | 'application' | 'camera';
export type HostedRecordingView = HostedRecordingRole | 'auto';
export type HostedRecordingSpeed = 'auto' | 0.5 | 1 | 1.5 | 2 | 4;

export type HostedRecordingCommit = {
    readonly sha: string;
    readonly availability: 'verified' | 'unavailable' | 'unverified';
};
export type HostedRecordingMetadata = {
    readonly schemaVersion: 1;
    readonly durationSeconds: number;
    readonly liveStartAt: string;
    readonly liveSegments?: readonly { readonly startSeconds: number; readonly endSeconds: number;
        readonly startsAt: string }[];
    readonly tracks: readonly { readonly role: HostedRecordingRole; readonly contentType: string;
        readonly hasAudio: boolean }[];
    readonly activityIntervals?: readonly { readonly startSeconds: number; readonly endSeconds: number;
        readonly classification: 'active' | 'automatic-coding' | 'unclassified' }[];
    readonly events?: readonly { readonly id?: string; readonly seconds: number; readonly title: string;
        readonly detail?: string; readonly type?: string }[];
    readonly autoView?: { readonly defaultScene: 'editor' | 'application'; readonly transitions?: readonly {
        readonly seconds: number; readonly scene: 'editor' | 'application' }[] } | null;
    readonly repository?: { readonly owner: string; readonly name: string } | null;
    readonly startingCommit?: HostedRecordingCommit | null;
    readonly commitAtSelectionStart?: { readonly state: 'known' | 'unavailable' | 'unknown';
        readonly sha: string | null } | null;
    readonly commitAnchors?: readonly { readonly seconds: number; readonly commit: HostedRecordingCommit }[];
    /** Added per authorized manifest response; never persisted in the published revision. */
    readonly delivery?: { readonly mode: 'full' | 'live-window'; readonly segmentSeconds: number;
        readonly serverTime: string };
};

export const HOSTED_RECORDING_LIVE_SEGMENT_SECONDS = 2;
type HostedRecordingLiveClock = Pick<HostedRecordingMetadata, 'durationSeconds' | 'liveStartAt' | 'liveSegments'>;
export type HostedRecordingLiveWindow = { readonly startSeconds: number; readonly endSeconds: number };

function getHostedRecordingLiveTakes(metadata: HostedRecordingLiveClock) {
    return metadata.liveSegments ?? [{ startSeconds: 0, endSeconds: metadata.durationSeconds,
        startsAt: metadata.liveStartAt }];
}

/** Segment IDs run across takes, but a window never spans a studio pause. */
export function getHostedRecordingLiveWindow(metadata: HostedRecordingLiveClock,
    requestedIndex: number): HostedRecordingLiveWindow | null {
    if (!Number.isSafeInteger(requestedIndex) || requestedIndex < 0) return null;
    let remainingIndex = requestedIndex;
    for (const take of getHostedRecordingLiveTakes(metadata)) {
        const windowCount = Math.ceil((take.endSeconds - take.startSeconds) /
            HOSTED_RECORDING_LIVE_SEGMENT_SECONDS);
        if (remainingIndex < windowCount) {
            const startSeconds = take.startSeconds + remainingIndex * HOSTED_RECORDING_LIVE_SEGMENT_SECONDS;
            return { startSeconds, endSeconds: Math.min(take.endSeconds,
                startSeconds + HOSTED_RECORDING_LIVE_SEGMENT_SECONDS) };
        }
        remainingIndex -= windowCount;
    }
    return null;
}

export type HostedRecordingCommitSelection = { readonly state: 'known'; readonly sha: string;
    readonly repository: { readonly owner: string; readonly name: string } } |
    { readonly state: 'unavailable' | 'unknown' | 'absent' | 'different-repository'; readonly sha: null };

/** The same wall-to-recorded-content map used when the hosted revision was validated. */
export function getHostedRecordingLiveSeconds(metadata: HostedRecordingLiveClock, wallClockMilliseconds: number): number {
    const segments = getHostedRecordingLiveTakes(metadata);
    let previousEndSeconds = 0;
    for (const segment of segments) {
        const startMilliseconds = Date.parse(segment.startsAt);
        if (wallClockMilliseconds < startMilliseconds) return previousEndSeconds;
        const endMilliseconds = startMilliseconds + (segment.endSeconds - segment.startSeconds) * 1000;
        if (wallClockMilliseconds < endMilliseconds) {
            return segment.startSeconds + (wallClockMilliseconds - startMilliseconds) / 1000;
        }
        previousEndSeconds = segment.endSeconds;
    }
    return previousEndSeconds;
}

/** A free viewer receives only the segment covering the delayed, server-authorized playhead.
 * -1 means that the next segment has not completed; -2 means that the last segment has played. */
export function getHostedRecordingLiveSegmentIndex(metadata: HostedRecordingLiveClock,
    wallClockMilliseconds: number): number {
    const playbackSeconds = getHostedRecordingLivePlaybackSeconds(metadata, wallClockMilliseconds);
    if (playbackSeconds >= metadata.durationSeconds) return -2;
    const availableSeconds = getHostedRecordingLiveSeconds(metadata, wallClockMilliseconds);
    let firstWindowIndex = 0;
    for (const take of getHostedRecordingLiveTakes(metadata)) {
        if (playbackSeconds >= take.startSeconds && playbackSeconds < take.endSeconds) {
            const localIndex = Math.floor((playbackSeconds - take.startSeconds) /
                HOSTED_RECORDING_LIVE_SEGMENT_SECONDS);
            const windowEndSeconds = Math.min(take.endSeconds,
                take.startSeconds + (localIndex + 1) * HOSTED_RECORDING_LIVE_SEGMENT_SECONDS);
            return availableSeconds >= windowEndSeconds - 0.000001 ? firstWindowIndex + localIndex : -1;
        }
        firstWindowIndex += Math.ceil((take.endSeconds - take.startSeconds) /
            HOSTED_RECORDING_LIVE_SEGMENT_SECONDS);
    }
    return -1;
}

/** Delaying wall time, rather than subtracting recorded seconds, preserves studio pause gaps. */
export function getHostedRecordingLivePlaybackSeconds(metadata: HostedRecordingLiveClock,
    wallClockMilliseconds: number): number {
    return getHostedRecordingLiveSeconds(metadata,
        wallClockMilliseconds - HOSTED_RECORDING_LIVE_SEGMENT_SECONDS * 1000);
}

export function getHostedRecordingSpeedAt(metadata: HostedRecordingMetadata, seconds: number,
    speed: HostedRecordingSpeed): number {
    if (speed !== 'auto') return speed;
    const interval = metadata.activityIntervals?.find((candidate) =>
        seconds >= candidate.startSeconds && seconds < candidate.endSeconds);
    return interval?.classification === 'automatic-coding' ? 10 : 1;
}

/** Stop precisely at an annotation boundary before changing the common clock rate. */
export function getHostedRecordingNextSpeedBoundary(metadata: HostedRecordingMetadata, seconds: number): number {
    const nextBoundary = metadata.activityIntervals?.flatMap((interval) =>
        [interval.startSeconds, interval.endSeconds]).find((candidate) => candidate > seconds + 0.000001);
    return nextBoundary ?? metadata.durationSeconds;
}

export function getHostedRecordingScene(metadata: HostedRecordingMetadata, seconds: number,
    availableRoles: readonly HostedRecordingRole[]): HostedRecordingRole | null {
    const transitions = metadata.autoView?.transitions ?? [];
    const chosen = [...transitions].reverse().find((transition) => transition.seconds <= seconds)?.scene ??
        metadata.autoView?.defaultScene;
    if (chosen && availableRoles.includes(chosen)) return chosen;
    // A missing screen is never a reason to leave a stale frame on the canvas.
    return (['editor', 'application', 'camera'] as const).find((role) => availableRoles.includes(role)) ?? null;
}

export function getHostedRecordingCommitAt(metadata: HostedRecordingMetadata, seconds: number,
    connectedRepository: { readonly owner: string; readonly name: string } | null): HostedRecordingCommitSelection {
    if (!metadata.repository || !connectedRepository) return { state: 'absent', sha: null };
    if (metadata.repository.owner.toLowerCase() !== connectedRepository.owner.toLowerCase() ||
        metadata.repository.name.toLowerCase() !== connectedRepository.name.toLowerCase()) {
        return { state: 'different-repository', sha: null };
    }
    const anchor = [...(metadata.commitAnchors ?? [])].reverse().find((candidate) => candidate.seconds <= seconds);
    if (anchor) {
        if (anchor.commit.availability === 'verified') return { state: 'known', sha: anchor.commit.sha,
            repository: metadata.repository };
        return { state: anchor.commit.availability === 'unavailable' ? 'unavailable' : 'unknown', sha: null };
    }
    if (metadata.commitAtSelectionStart) {
        const selection = metadata.commitAtSelectionStart;
        return selection.state === 'known' && selection.sha ? { state: 'known', sha: selection.sha,
            repository: metadata.repository } : { state: selection.state === 'unavailable' ? 'unavailable' : 'unknown', sha: null };
    }
    const start = metadata.startingCommit;
    if (!start) return { state: 'unknown', sha: null };
    return start.availability === 'verified' ? { state: 'known', sha: start.sha,
        repository: metadata.repository } : { state: start.availability === 'unavailable' ? 'unavailable' : 'unknown', sha: null };
}
