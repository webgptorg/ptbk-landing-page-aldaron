import 'server-only';

import { probeHostedRecordingMedia, readHostedRecordingSmallObject, type HostedRecordingMediaProbe } from './hostedRecordingStorage';
import { HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES } from './hostedRecordingConstants';

export const HOSTED_RECORDING_VIDEO_ROLES = ['editor', 'application', 'camera'] as const;
export const HOSTED_RECORDING_ASSET_ROLES = [
    ...HOSTED_RECORDING_VIDEO_ROLES, 'manifest', 'workshop',
    'subtitle-editor', 'subtitle-application', 'subtitle-camera', 'activity', 'events', 'commits',
] as const;
export type HostedRecordingAssetRole = (typeof HOSTED_RECORDING_ASSET_ROLES)[number];
export type HostedRecordingVideoRole = (typeof HOSTED_RECORDING_VIDEO_ROLES)[number];

export type HostedRecordingAssetRow = {
    readonly id: string;
    readonly revision_id: string;
    readonly role: HostedRecordingAssetRole;
    readonly source_id: string | null;
    readonly filename: string;
    readonly content_type: string;
    readonly byte_length: number;
    readonly object_key: string;
    readonly upload_id: string;
    readonly status: 'uploading' | 'completing' | 'complete';
    readonly completion_started_at?: string | null;
    readonly measured_duration_seconds: number | null;
};

export type HostedRecordingPlayerMetadata = {
    readonly schemaVersion: 1;
    readonly durationSeconds: number;
    readonly liveStartAt: string;
    readonly liveSegments: readonly { readonly startSeconds: number; readonly endSeconds: number;
        readonly startsAt: string }[];
    readonly tracks: readonly {
        readonly role: HostedRecordingVideoRole;
        readonly contentType: string;
        readonly hasAudio: boolean;
    }[];
    readonly activityIntervals: readonly unknown[];
    readonly events: readonly unknown[];
    readonly autoView: unknown | null;
    readonly repository: unknown | null;
    readonly startingCommit: unknown | null;
    readonly commitAtSelectionStart?: { readonly state: 'known' | 'unavailable' | 'unknown'; readonly sha: string | null };
    readonly commitAnchors: readonly unknown[];
};

export type HostedRecordingValidationReport = {
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly durationSeconds: number | null;
    readonly tracks: readonly { readonly role: HostedRecordingVideoRole; readonly durationSeconds: number;
        readonly mimeType: string; readonly videoCodec: string; readonly audioCodec: string | null }[];
};

function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getObject(value: unknown, label: string): Record<string, unknown> {
    if (!isObject(value)) throw new Error(`${label} must be an object.`);
    return value;
}

function getFiniteNumber(value: unknown, label: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} must be a finite number.`);
    return value;
}

function getTimestamp(value: unknown, label: string): string {
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:/.test(value) ||
        !/(Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) {
        throw new Error(`${label} needs an ISO timestamp with a timezone.`);
    }
    return value;
}

/** A pause consumes wall time but no recorded-content time. The administrator aligns export zero once. */
function createLiveSegments(takes: unknown, selectionStartSeconds: number, selectionEndSeconds: number,
    sessionDurationSeconds: number,
    liveStartAt: string): HostedRecordingPlayerMetadata['liveSegments'] {
    const durationSeconds = selectionEndSeconds - selectionStartSeconds;
    if (takes === undefined) return [{ startSeconds: 0, endSeconds: durationSeconds, startsAt: liveStartAt }];
    if (!Array.isArray(takes) || takes.length === 0 || takes.length > 1000) {
        throw new Error('Manifest takes need a bounded, nonempty list.');
    }
    const clipped: { startSeconds: number; endSeconds: number; wallStartMilliseconds: number }[] = [];
    let coveredUntil = selectionStartSeconds;
    let previousSessionEnd = 0;
    let previousWallEnd = -Infinity;
    for (const take of takes) {
        const entry = getObject(take, 'Take');
        const startedAt = getTimestamp(entry.startedAt, 'Take start');
        const takeStart = getFiniteNumber(entry.sessionStartSeconds, 'Take session start');
        const takeDuration = getFiniteNumber(entry.durationSeconds, 'Take duration');
        const wallStartMilliseconds = Date.parse(startedAt);
        if (takeStart < previousSessionEnd - 0.001 || takeDuration <= 0 ||
            takeStart + takeDuration > sessionDurationSeconds + 0.1 ||
            wallStartMilliseconds < previousWallEnd - 100) {
            throw new Error('Manifest takes do not have an ordered session and wall clock.');
        }
        previousSessionEnd = takeStart + takeDuration;
        previousWallEnd = wallStartMilliseconds + takeDuration * 1000;
        const clippedStart = Math.max(takeStart, selectionStartSeconds);
        const clippedEnd = Math.min(previousSessionEnd, selectionEndSeconds);
        if (clippedEnd <= clippedStart) continue;
        if (clippedStart > coveredUntil + 0.1) {
            throw new Error('Prepared selection has an uncovered session-clock gap.');
        }
        clipped.push({ startSeconds: clippedStart - selectionStartSeconds,
            endSeconds: clippedEnd - selectionStartSeconds,
            wallStartMilliseconds: wallStartMilliseconds + (clippedStart - takeStart) * 1000 });
        coveredUntil = clippedEnd;
    }
    if (!clipped.length || coveredUntil < selectionEndSeconds - 0.1) {
        throw new Error('Prepared selection is not covered by its recorded takes.');
    }
    const wallClockShiftMilliseconds = Date.parse(liveStartAt) - clipped[0]!.wallStartMilliseconds;
    return clipped.map((segment) => ({ startSeconds: segment.startSeconds, endSeconds: segment.endSeconds,
        startsAt: new Date(segment.wallStartMilliseconds + wallClockShiftMilliseconds).toISOString() }));
}

function getJson(bytes: Uint8Array, label: string): Record<string, unknown> {
    try { return getObject(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)), label); }
    catch (error) { throw new Error(`${label}: ${error instanceof Error ? error.message : 'invalid JSON'}`); }
}

function checkKnownCoordinates(value: unknown, label: string): void {
    if (Array.isArray(value)) { value.forEach((item) => checkKnownCoordinates(item, label)); return; }
    if (!isObject(value)) return;
    for (const [key, child] of Object.entries(value)) {
        if (key === 'coordinate' && child !== 'prepared-export' && child !== 'original-session') {
            throw new Error(`${label} contains an unknown timing coordinate.`);
        }
        checkKnownCoordinates(child, label);
    }
}

function checkPoint(seconds: unknown, durationSeconds: number, label: string, isEnd = false): number {
    const value = getFiniteNumber(seconds, label);
    if (value < 0 || value > durationSeconds + (isEnd ? 0.001 : -0.001)) throw new Error(`${label} is outside the export.`);
    return value;
}

function checkPointList(value: unknown, durationSeconds: number, label: string): readonly unknown[] {
    if (!Array.isArray(value) || value.length > 5000) throw new Error(`${label} must be a bounded list.`);
    for (const entry of value) checkPoint(getObject(entry, label).seconds, durationSeconds, label);
    return value;
}

function checkRangeList(value: unknown, durationSeconds: number, label: string): readonly unknown[] {
    if (!Array.isArray(value) || value.length > 5000) throw new Error(`${label} must be a bounded list.`);
    for (const entry of value) {
        const interval = getObject(entry, label);
        const startSeconds = checkPoint(interval.startSeconds, durationSeconds, `${label} start`);
        const endSeconds = checkPoint(interval.endSeconds, durationSeconds, `${label} end`, true);
        if (endSeconds <= startSeconds) throw new Error(`${label} has an empty or reversed interval.`);
    }
    return value;
}

function checkCommit(value: unknown, label: string): void {
    const commit = getObject(value, label);
    if (typeof commit.sha !== 'string' || !/^[0-9a-f]{40}$/i.test(commit.sha) ||
        !['verified', 'unavailable', 'unverified'].includes(String(commit.availability))) {
        throw new Error(`${label} needs a complete SHA and availability status.`);
    }
    getTimestamp(commit.checkedAt, `${label} checkedAt`);
}

function checkIntervalList(value: unknown, durationSeconds: number): readonly unknown[] {
    if (!Array.isArray(value) || value.length > 5000) throw new Error('Activity must be a bounded list.');
    let coveredUntil = 0;
    for (const entry of value) {
        const interval = getObject(entry, 'Activity interval');
        const startSeconds = checkPoint(interval.startSeconds, durationSeconds, 'Activity start');
        const endSeconds = checkPoint(interval.endSeconds, durationSeconds, 'Activity end', true);
        if (Math.abs(startSeconds - coveredUntil) > 0.001 || endSeconds <= startSeconds ||
            !['active', 'automatic-coding', 'unclassified'].includes(String(interval.classification)) ||
            (interval.classification === 'automatic-coding' && interval.isReviewed !== true)) {
            throw new Error('Activity intervals must cover the export without gaps or overlap; automatic coding needs review.');
        }
        coveredUntil = endSeconds;
    }
    if (Math.abs(coveredUntil - durationSeconds) > 0.1) throw new Error('Activity intervals do not cover the exported duration.');
    return value;
}

function checkEvents(value: unknown, durationSeconds: number): readonly unknown[] {
    const events = checkPointList(value, durationSeconds, 'Event');
    for (const event of events) {
        const entry = getObject(event, 'Event');
        if (typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 120 ||
            entry.detail !== undefined && (typeof entry.detail !== 'string' || entry.detail.length > 2000)) {
            throw new Error('Event needs a bounded title and detail.');
        }
    }
    return events;
}

function checkWorkshopSidecar(value: Record<string, unknown>, durationSeconds: number,
    sourceIdByRole: ReadonlyMap<HostedRecordingVideoRole, string>): Pick<HostedRecordingPlayerMetadata,
        'activityIntervals' | 'events' | 'autoView' | 'repository' | 'startingCommit' | 'commitAtSelectionStart' | 'commitAnchors'> {
    if (value.schemaVersion !== 1 || value.timeUnit !== 'seconds' || value.coordinate !== 'prepared-export' ||
        value.isSourceRevisionStale === true || typeof value.sourceRevision !== 'string' ||
        !value.sourceRevision || value.sourceRevision !== value.currentRevision) {
        throw new Error('Workshop sidecar must use current prepared-export seconds, schema 1.');
    }
    const selection = getObject(value.selection, 'Workshop selection');
    const startSeconds = getFiniteNumber(selection.startSeconds, 'Workshop selection start');
    const endSeconds = getFiniteNumber(selection.endSeconds, 'Workshop selection end');
    if (Math.abs(endSeconds - startSeconds - durationSeconds) > 0.1 ||
        Math.abs(getFiniteNumber(value.preparedTimeZeroSessionSeconds, 'Workshop time zero') - startSeconds) > 0.001) {
        throw new Error('Workshop sidecar selection does not match prepared media.');
    }
    const activityIntervals = checkIntervalList(value.activityIntervals, durationSeconds);
    const events = checkEvents(value.events, durationSeconds);
    const commitAnchors = checkPointList(value.commitAnchors, durationSeconds, 'Commit anchor');
    const autoView = getObject(value.autoView, 'Auto-view');
    const editorSourceId = sourceIdByRole.get('editor');
    const applicationSourceId = sourceIdByRole.get('application');
    if ((editorSourceId !== undefined && autoView.editorSourceId !== editorSourceId) ||
        (applicationSourceId !== undefined && autoView.applicationSourceId !== applicationSourceId)) {
        throw new Error('Auto-view source IDs do not match the uploaded editor/application tracks.');
    }
    if (autoView.isDefaultReviewed !== true ||
        !['editor', 'application'].includes(String(autoView.defaultScene))) {
        throw new Error('Auto-view default scene must be reviewed and valid.');
    }
    const transitions = checkPointList(autoView.transitions, durationSeconds, 'Auto-view transition');
    let previousTransitionSeconds = -1;
    for (const transition of transitions) {
        const entry = getObject(transition, 'Auto-view transition');
        const scene = entry.scene;
        const seconds = getFiniteNumber(entry.seconds, 'Auto-view transition');
        if (entry.isReviewed !== true || seconds <= previousTransitionSeconds ||
            !['editor', 'application'].includes(String(scene))) {
            throw new Error('Auto-view transitions must be reviewed, ordered and valid.');
        }
        previousTransitionSeconds = seconds;
        if (scene === 'editor' && !editorSourceId || scene === 'application' && !applicationSourceId) {
            throw new Error('Auto-view selects a missing screen track.');
        }
    }
    if (autoView.defaultScene === 'editor' && !editorSourceId ||
        autoView.defaultScene === 'application' && !applicationSourceId) {
        throw new Error('Auto-view default selects a missing screen track.');
    }
    const repository = value.repository;
    if (repository !== null && repository !== undefined) {
        const repositoryObject = getObject(repository, 'Repository');
        if (typeof repositoryObject.owner !== 'string' || !repositoryObject.owner ||
            typeof repositoryObject.name !== 'string' || !repositoryObject.name ||
            !value.startingCommit) throw new Error('Repository needs its identity and starting commit.');
    } else if (value.startingCommit || commitAnchors.length > 0) {
        throw new Error('Commit metadata needs a repository.');
    }
    if (value.startingCommit) checkCommit(value.startingCommit, 'Starting commit');
    const commitAtSelectionStart = value.commitAtSelectionStart === undefined ? undefined :
        getObject(value.commitAtSelectionStart, 'Commit at selection start');
    if (commitAtSelectionStart && (!['known', 'unavailable', 'unknown'].includes(String(commitAtSelectionStart.state)) ||
        (commitAtSelectionStart.state === 'known' &&
            (typeof commitAtSelectionStart.sha !== 'string' || !/^[0-9a-f]{40}$/i.test(commitAtSelectionStart.sha))) ||
        (commitAtSelectionStart.state !== 'known' && commitAtSelectionStart.sha !== null))) {
        throw new Error('Commit at selection start is invalid.');
    }
    let previousCommitSeconds = -1;
    for (const anchor of commitAnchors) {
        const entry = getObject(anchor, 'Commit anchor');
        const seconds = getFiniteNumber(entry.seconds, 'Commit anchor');
        if (entry.isReviewed !== true || seconds <= previousCommitSeconds) {
            throw new Error('Commit anchors must be reviewed and ordered.');
        }
        previousCommitSeconds = seconds;
        checkCommit(entry.commit, 'Commit anchor');
    }
    return { activityIntervals, events, autoView, repository: value.repository ?? null,
        startingCommit: value.startingCommit ?? null,
        commitAtSelectionStart: commitAtSelectionStart as HostedRecordingPlayerMetadata['commitAtSelectionStart'],
        commitAnchors };
}

function checkSubtitle(bytes: Uint8Array, durationSeconds: number): void {
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (!content.trim()) throw new Error('Subtitle sidecar is empty.');
    if (content.trimStart().startsWith('{')) {
        const subtitle = getJson(bytes, 'Subtitle sidecar');
        if (subtitle.schemaVersion !== 1 || subtitle.coordinate !== 'prepared-export' ||
            subtitle.timeUnit !== 'seconds') {
            throw new Error('Subtitle JSON must use prepared-export seconds.');
        }
        checkKnownCoordinates(subtitle, 'Subtitle sidecar');
        for (const cue of checkRangeList(subtitle.cues, durationSeconds, 'Subtitle cue')) {
            if (typeof getObject(cue, 'Subtitle cue').text !== 'string') {
                throw new Error('Subtitle cue text is invalid.');
            }
        }
        return;
    }
    if (!content.startsWith('WEBVTT') && !/\d\d:\d\d:\d\d[,.]\d{3}\s+-->/.test(content)) {
        throw new Error('Subtitle sidecar must be WebVTT, SRT, or prepared JSON.');
    }
    const cuePattern = /(\d\d):(\d\d):(\d\d)[,.](\d{3})\s+-->\s+(\d\d):(\d\d):(\d\d)[,.](\d{3})/g;
    const cues = Array.from(content.matchAll(cuePattern));
    if (cues.length === 0 || (content.match(/-->/g)?.length ?? 0) !== cues.length) {
        throw new Error('Subtitle cues are malformed.');
    }
    for (const cue of cues) {
        const startSeconds = Number(cue[1]) * 3600 + Number(cue[2]) * 60 + Number(cue[3]) + Number(cue[4]) / 1000;
        const endSeconds = Number(cue[5]) * 3600 + Number(cue[6]) * 60 + Number(cue[7]) + Number(cue[8]) / 1000;
        if (endSeconds <= startSeconds || endSeconds > durationSeconds + 0.1 ||
            Number(cue[2]) >= 60 || Number(cue[3]) >= 60 || Number(cue[6]) >= 60 || Number(cue[7]) >= 60) {
            throw new Error('Subtitle cue lies outside the export or has invalid timing.');
        }
    }
}

function checkStandaloneSidecar(value: Record<string, unknown>, role: 'activity' | 'events' | 'commits',
    durationSeconds: number): Partial<Pick<HostedRecordingPlayerMetadata,
        'activityIntervals' | 'events' | 'repository' | 'startingCommit' | 'commitAtSelectionStart' | 'commitAnchors'>> {
    if (value.schemaVersion !== 1 || value.coordinate !== 'prepared-export' ||
        value.timeUnit !== 'seconds') {
        throw new Error(`${role}: sidecar needs schema 1 and prepared-export seconds.`);
    }
    checkKnownCoordinates(value, role);
    if (role === 'activity') {
        return { activityIntervals: checkIntervalList(value.intervals ?? value.activityIntervals, durationSeconds) };
    } else if (role === 'events') {
        return { events: checkEvents(value.events, durationSeconds) };
    } else {
        if (value.repository !== null && value.repository !== undefined) {
            const repository = getObject(value.repository, 'Repository');
            if (typeof repository.owner !== 'string' || !repository.owner ||
                typeof repository.name !== 'string' || !repository.name || !value.startingCommit) {
                throw new Error('Repository needs its identity and starting commit.');
            }
        } else if (value.startingCommit ||
            Array.isArray(value.commitAnchors) && value.commitAnchors.length > 0) {
            throw new Error('Commit metadata needs a repository.');
        }
        if (value.startingCommit) checkCommit(value.startingCommit, 'Starting commit');
        const commitAnchors = checkPointList(value.commitAnchors, durationSeconds, 'Commit anchor');
        let previousSeconds = -1;
        for (const anchor of commitAnchors) {
            const entry = getObject(anchor, 'Commit anchor');
            const seconds = getFiniteNumber(entry.seconds, 'Commit anchor');
            if (entry.isReviewed !== true || seconds <= previousSeconds) {
                throw new Error('Commit anchors must be reviewed and ordered.');
            }
            previousSeconds = seconds;
            checkCommit(entry.commit, 'Commit anchor');
        }
        const selectionStart = value.commitAtSelectionStart;
        if (selectionStart !== undefined && (getObject(selectionStart, 'Commit at selection start').state === 'known'
            ? typeof getObject(selectionStart, 'Commit at selection start').sha !== 'string' ||
                !/^[0-9a-f]{40}$/i.test(String(getObject(selectionStart, 'Commit at selection start').sha))
            : !['unknown', 'unavailable'].includes(String(getObject(selectionStart, 'Commit at selection start').state)) ||
                getObject(selectionStart, 'Commit at selection start').sha !== null)) {
            throw new Error('Commit at selection start is invalid.');
        }
        return { repository: value.repository ?? null, startingCommit: value.startingCommit ?? null,
            commitAtSelectionStart: selectionStart as HostedRecordingPlayerMetadata['commitAtSelectionStart'], commitAnchors };
    }
}

/** The report is stored before the separate atomic publication action. It never includes object keys. */
export async function validateHostedRecordingAssets(assets: readonly HostedRecordingAssetRow[], liveStartAt: string):
    Promise<{ readonly report: HostedRecordingValidationReport; readonly playerMetadata: HostedRecordingPlayerMetadata | null }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const trackReports: HostedRecordingValidationReport['tracks'][number][] = [];
    let playerMetadata: HostedRecordingPlayerMetadata | null = null;
    let durationSeconds: number | null = null;
    try {
        getTimestamp(liveStartAt, 'Live session start');
        if (assets.some((asset) => asset.status !== 'complete')) throw new Error('All files must finish uploading first.');
        const manifestAsset = assets.find((asset) => asset.role === 'manifest');
        if (!manifestAsset) throw new Error('A versioned studio manifest is required for the shared session clock.');
        const manifest = getJson(await readHostedRecordingSmallObject(manifestAsset.object_key,
            HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES), 'Manifest');
        checkKnownCoordinates(manifest, 'Manifest');
        if (manifest.schemaVersion !== 5 || manifest.timeUnit !== 'seconds') throw new Error('Expected studio manifest schema 5 in seconds.');
        getTimestamp(manifest.createdAt, 'Recording createdAt');
        const recipe = getObject(manifest.editRecipe, 'Edit recipe');
        const selection = getObject(recipe.selection, 'Edit selection');
        const startSeconds = getFiniteNumber(selection.startSeconds, 'Export start');
        const endSeconds = getFiniteNumber(selection.endSeconds, 'Export end');
        const preparedZero = getFiniteNumber(recipe.preparedTimeZeroSessionSeconds, 'Prepared zero');
        const sessionDurationSeconds = getFiniteNumber(manifest.durationSeconds, 'Session duration');
        if (recipe.schemaVersion !== 1 || recipe.timeUnit !== 'seconds' || startSeconds < 0 ||
            endSeconds <= startSeconds || endSeconds > 43200 || endSeconds > sessionDurationSeconds + 0.1 ||
            Math.abs(preparedZero - startSeconds) > 0.001) {
            throw new Error('Manifest has an invalid prepared session selection or time zero.');
        }
        durationSeconds = endSeconds - startSeconds;
        if (!Array.isArray(manifest.tracks) || manifest.tracks.length === 0 || manifest.tracks.length > 100) {
            throw new Error('Manifest needs a bounded list of source tracks.');
        }
        const liveSegments = createLiveSegments(manifest.takes, startSeconds, endSeconds,
            sessionDurationSeconds, liveStartAt);
        if (manifest.takes === undefined) warnings.push('Take timestamps are absent; live timing uses the manually supplied start continuously.');
        const sourceIdByRole = new Map<HostedRecordingVideoRole, string>();
        for (const role of HOSTED_RECORDING_VIDEO_ROLES) {
            const asset = assets.find((candidate) => candidate.role === role);
            if (!asset) { warnings.push(`${role} track is absent; its player tab is disabled.`); continue; }
            const matchingTracks = manifest.tracks.filter((candidate) => {
                if (!isObject(candidate)) return false;
                return candidate.id === asset.source_id ||
                    (typeof candidate.trimmedFile === 'string' &&
                        candidate.trimmedFile.split('/').at(-1) === asset.filename);
            });
            if (matchingTracks.length !== 1) throw new Error(`${role}: choose the matching studio source ID or prepared filename.`);
            const track = matchingTracks[0] as Record<string, unknown>;
            if (typeof track.id !== 'string' || !track.id ||
                (role === 'camera' ? track.kind !== 'camera' : track.kind !== 'screen')) {
                throw new Error(`${role}: track role does not match its manifest source kind.`);
            }
            const preparation = getObject(track.preparation, `${role} preparation`);
            if (preparation.status !== 'prepared' ||
                Math.abs(getFiniteNumber(preparation.preparedTimeZeroSessionSeconds, `${role} zero`) - preparedZero) > 0.001) {
                throw new Error(`${role}: original media or a different export zero cannot be published.`);
            }
            if (!Array.isArray(preparation.components) || preparation.components.length === 0 ||
                preparation.components.some((component) => {
                    const bounds = getObject(component, `${role} component`);
                    return !['video', 'audio'].includes(String(bounds.kind)) ||
                        Math.abs(getFiniteNumber(bounds.firstTimestampSeconds, `${role} component start`)) > 0.05 ||
                        Math.abs(getFiniteNumber(bounds.endTimestampSeconds, `${role} component end`) -
                            durationSeconds!) > 0.1;
                })) {
                throw new Error(`${role}: every prepared media component must span the shared duration.`);
            }
            const probe: HostedRecordingMediaProbe = await probeHostedRecordingMedia(asset.object_key, asset.byte_length);
            if (!probe.mimeType.startsWith(asset.content_type)) {
                throw new Error(`${role}: declared content type differs from the media container.`);
            }
            if (Math.abs(probe.durationSeconds - durationSeconds) > 0.1 ||
                Math.abs(getFiniteNumber(preparation.firstTimestampSeconds, `${role} first`)) > 0.05 ||
                Math.abs(getFiniteNumber(preparation.endTimestampSeconds, `${role} end`) - probe.durationSeconds) > 0.1) {
                throw new Error(`${role}: media duration differs materially from the common export.`);
            }
            if (Array.from(sourceIdByRole.values()).includes(track.id)) {
                throw new Error(`${role}: one source cannot fill two track roles.`);
            }
            sourceIdByRole.set(role, track.id);
            trackReports.push({ role, durationSeconds: probe.durationSeconds, mimeType: probe.mimeType,
                videoCodec: probe.videoCodec, audioCodec: probe.audioCodec });
        }
        if (trackReports.length === 0) throw new Error('At least one playable video track is required.');
        const workshopAsset = assets.find((asset) => asset.role === 'workshop');
        const workshopSidecar = workshopAsset ? getJson(await readHostedRecordingSmallObject(workshopAsset.object_key,
            HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES), 'Workshop sidecar') : null;
        let workshopData = workshopSidecar ? checkWorkshopSidecar(workshopSidecar, durationSeconds, sourceIdByRole) :
            { activityIntervals: [], events: [], autoView: null, repository: null, startingCommit: null, commitAnchors: [] };
        if (manifest.workshopMetadata) {
            if (!workshopAsset || !workshopSidecar) throw new Error('Manifest declares workshop metadata but its prepared sidecar is missing.');
            const declared = getObject(manifest.workshopMetadata, 'Manifest workshop metadata');
            if (typeof declared.preparedFile !== 'string' ||
                declared.preparedFile.split('/').at(-1) !== workshopAsset.filename ||
                declared.isSourceRevisionStale === true || declared.sourceRevision !== declared.currentRevision ||
                declared.sourceRevision !== workshopSidecar.sourceRevision ||
                manifest.id !== workshopSidecar.sourceRecordingId) {
                throw new Error('Manifest workshop metadata does not match the prepared sidecar.');
            }
        } else if (workshopAsset) {
            throw new Error('Prepared workshop sidecar is not declared by the manifest.');
        }
        for (const asset of assets) {
            if (asset.role.startsWith('subtitle-')) {
                const videoRole = asset.role.slice('subtitle-'.length);
                if (!sourceIdByRole.has(videoRole as HostedRecordingVideoRole)) {
                    throw new Error(`${asset.role}: subtitle has no matching video track.`);
                }
                await checkSubtitle(await readHostedRecordingSmallObject(asset.object_key,
                    HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES), durationSeconds);
            } else if (['activity', 'events', 'commits'].includes(asset.role)) {
                const sidecar = getJson(await readHostedRecordingSmallObject(asset.object_key,
                    HOSTED_RECORDING_MAXIMUM_SIDECAR_BYTES), asset.role);
                const sidecarData = checkStandaloneSidecar(sidecar,
                    asset.role as 'activity' | 'events' | 'commits', durationSeconds);
                if (!workshopSidecar) workshopData = { ...workshopData, ...sidecarData };
                else warnings.push(`${asset.role} sidecar is archived; the prepared workshop sidecar governs playback.`);
            }
        }
        playerMetadata = { schemaVersion: 1, durationSeconds, liveStartAt, liveSegments,
            tracks: trackReports.map((track) => ({ role: track.role, contentType: track.mimeType, hasAudio: track.audioCodec !== null })),
            ...workshopData };
    } catch (error) { errors.push(error instanceof Error ? error.message : 'Recording validation failed.'); }
    return { report: { isValid: errors.length === 0, errors, warnings, durationSeconds, tracks: trackReports }, playerMetadata };
}
