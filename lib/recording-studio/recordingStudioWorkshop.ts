import { GITHUB_COMMIT_SHA_PATTERN } from '@/lib/github/githubCommitSha';
import { getRecordingMediaRevision, mapRecordingPartMediaInterval } from './recordingStudioDerived';
import { clipRecordingSessionRange, createRecordingEditRecipe, getRecordingAvailableRanges, getRecordingSelection,
    getRecordingSessionDuration } from './recordingStudioSessionTime';
import type { RecordingDerivedTrack, RecordingTrim, RecordingWorkshopActivityInterval, RecordingWorkshopCommit, RecordingWorkshopMetadata,
    RecordingWorkshopScene, StudioRecording } from './recordingStudioTypes';

const TIME_TOLERANCE_SECONDS = 0.000001;
const WORKSHOP_METADATA_SCHEMA_VERSION = 1;
const MAXIMUM_WORKSHOP_ITEMS = 5_000;

export function createRecordingWorkshopMetadata(recording: StudioRecording, sourceRevision: string): RecordingWorkshopMetadata {
    const durationSeconds = getRecordingSessionDuration(recording);
    const firstVideoSource = recording.tracks.find((track) => track.kind !== 'microphone');
    return {
        schemaVersion: WORKSHOP_METADATA_SCHEMA_VERSION, sourceRevision,
        activityIntervals: durationSeconds > 0 ? [{ id: crypto.randomUUID(), startSeconds: 0, endSeconds: durationSeconds,
            classification: 'unclassified', origin: 'initial', isReviewed: false }] : [],
        events: [], autoView: { defaultScene: 'editor', isDefaultReviewed: false,
            editorSourceId: firstVideoSource?.id ?? null, applicationSourceId: null, transitions: [] },
        repository: null, startingCommit: null, commitAnchors: [], calibration: null,
    };
}

/** Appended takes extend the existing annotation without rewriting reviewed ranges. */
export function extendRecordingWorkshopActivity(metadata: RecordingWorkshopMetadata, durationSeconds: number): RecordingWorkshopMetadata {
    const last = metadata.activityIntervals.at(-1);
    if (!last || last.endSeconds >= durationSeconds - TIME_TOLERANCE_SECONDS) return metadata;
    return { ...metadata, activityIntervals: [...metadata.activityIntervals, { id: crypto.randomUUID(),
        startSeconds: last.endSeconds, endSeconds: durationSeconds, classification: 'unclassified', origin: 'initial', isReviewed: false }] };
}

export function splitRecordingWorkshopActivity(metadata: RecordingWorkshopMetadata, seconds: number): RecordingWorkshopMetadata {
    const index = metadata.activityIntervals.findIndex((interval) => seconds > interval.startSeconds + TIME_TOLERANCE_SECONDS &&
        seconds < interval.endSeconds - TIME_TOLERANCE_SECONDS);
    if (index < 0) return metadata;
    const interval = metadata.activityIntervals[index]!;
    return { ...metadata, activityIntervals: [
        ...metadata.activityIntervals.slice(0, index), { ...interval, endSeconds: seconds },
        { ...interval, id: crypto.randomUUID(), startSeconds: seconds }, ...metadata.activityIntervals.slice(index + 1),
    ] };
}

export function mergeRecordingWorkshopActivity(metadata: RecordingWorkshopMetadata, index: number): RecordingWorkshopMetadata {
    const first = metadata.activityIntervals[index];
    const second = metadata.activityIntervals[index + 1];
    if (!first || !second || Math.abs(first.endSeconds - second.startSeconds) > TIME_TOLERANCE_SECONDS) return metadata;
    return { ...metadata, activityIntervals: [...metadata.activityIntervals.slice(0, index),
        { ...first, endSeconds: second.endSeconds, classification: first.classification === second.classification ? first.classification : 'unclassified',
            origin: 'manual', isReviewed: false },
        ...metadata.activityIntervals.slice(index + 2)] };
}

export function moveRecordingWorkshopActivityBoundary(metadata: RecordingWorkshopMetadata, index: number, seconds: number): RecordingWorkshopMetadata {
    const first = metadata.activityIntervals[index];
    const second = metadata.activityIntervals[index + 1];
    if (!first || !second || !Number.isFinite(seconds) || seconds <= first.startSeconds || seconds >= second.endSeconds) return metadata;
    return { ...metadata, activityIntervals: metadata.activityIntervals.map((interval, currentIndex) =>
        currentIndex === index ? { ...interval, endSeconds: seconds, origin: 'manual',
            isReviewed: interval.classification === 'automatic-coding' ? false : interval.isReviewed } :
            currentIndex === index + 1 ? { ...interval, startSeconds: seconds, origin: 'manual',
                isReviewed: interval.classification === 'automatic-coding' ? false : interval.isReviewed } : interval) };
}

/** Speech supplies review boundaries only. Silence and uncertain audio never infer unattended coding. */
export function suggestRecordingWorkshopSpeechBoundaries(metadata: RecordingWorkshopMetadata,
    speechTrack: Extract<RecordingDerivedTrack, { kind: 'speech-activity' }>): RecordingWorkshopMetadata {
    let suggested = metadata;
    const suggestedFrom = { speechTrackId: speechTrack.id, audioSourceId: speechTrack.provenance.sourceId,
        mediaRevision: speechTrack.provenance.mediaRevision };
    for (const interval of speechTrack.intervals.filter((candidate) => candidate.type === 'speech')) {
        for (const seconds of [interval.startSeconds, interval.endSeconds]) {
            const containing = suggested.activityIntervals.find((candidate) => candidate.classification === 'unclassified' &&
                seconds > candidate.startSeconds + TIME_TOLERANCE_SECONDS && seconds < candidate.endSeconds - TIME_TOLERANCE_SECONDS);
            if (containing) {
                const previousIds = new Set(suggested.activityIntervals.map((candidate) => candidate.id));
                const split = splitRecordingWorkshopActivity(suggested, seconds);
                suggested = { ...split, activityIntervals: split.activityIntervals.map((candidate) =>
                    candidate.id === containing.id || !previousIds.has(candidate.id)
                        ? { ...candidate, origin: 'speech-suggestion' as const, suggestedFrom }
                        : candidate) };
            }
        }
    }
    return suggested;
}

export function getRecordingWorkshopCommitAt(metadata: RecordingWorkshopMetadata, seconds: number):
    { readonly state: 'known'; readonly sha: string } | { readonly state: 'unavailable' | 'unknown'; readonly sha: null } {
    const anchor = [...metadata.commitAnchors].filter((candidate) => candidate.isReviewed && candidate.seconds <= seconds)
        .sort((first, second) => second.seconds - first.seconds)[0];
    const commit = anchor?.commit ?? metadata.startingCommit;
    if (!commit) return { state: 'unknown', sha: null };
    if (commit.availability === 'verified') return { state: 'known', sha: commit.sha };
    return { state: commit.availability === 'unavailable' ? 'unavailable' : 'unknown', sha: null };
}

export function getRecordingWorkshopSceneAt(metadata: RecordingWorkshopMetadata, seconds: number): RecordingWorkshopScene {
    return [...metadata.autoView.transitions].filter((transition) => transition.seconds <= seconds)
        .sort((first, second) => second.seconds - first.seconds)[0]?.scene ?? metadata.autoView.defaultScene;
}

function validatePoint(seconds: number, durationSeconds: number, label: string, isEndAllowed = false): void {
    if (!Number.isFinite(seconds) || seconds < 0 || (isEndAllowed ? seconds > durationSeconds : seconds >= durationSeconds)) {
        throw new Error(`${label}: čas je mimo délku záznamu.`);
    }
}

function validateOrderedPoints(points: readonly { readonly seconds: number }[], durationSeconds: number, label: string, isDuplicateAllowed = false): void {
    if (points.length > MAXIMUM_WORKSHOP_ITEMS) throw new Error(`${label}: příliš mnoho položek.`);
    let previousSeconds = -1;
    for (const point of [...points].sort((first, second) => first.seconds - second.seconds)) {
        validatePoint(point.seconds, durationSeconds, label);
        if (!isDuplicateAllowed && point.seconds <= previousSeconds) throw new Error(`${label}: dvě položky mají stejný čas.`);
        previousSeconds = point.seconds;
    }
}

function validateCommit(commit: RecordingWorkshopCommit, label: string): void {
    if (!GITHUB_COMMIT_SHA_PATTERN.test(commit.sha) || commit.sha.length !== 40 ||
        !['verified', 'unavailable', 'unverified'].includes(commit.availability) || !Number.isFinite(Date.parse(commit.checkedAt))) {
        throw new Error(`${label}: chybí ověřené úplné SHA nebo stav dostupnosti.`);
    }
}

function validateSceneSource(recording: StudioRecording, sourceId: string | null, range: RecordingTrim, label: string): void {
    const source = recording.tracks.find((track) => track.id === sourceId && track.kind !== 'microphone');
    if (!source) throw new Error(`${label}: vyberte existující zdroj obrazu.`);
    const ranges = [...(source.parts ? source.parts.flatMap((part) => {
        if (part.byteLength === 0) return [];
        if (!part.mediaBounds) return getRecordingAvailableRanges({ ...source, parts: [part] });
        const video = part.mediaBounds.components.find((component) => component.kind === 'video');
        return video ? mapRecordingPartMediaInterval(part, part.mediaBounds,
            Math.max(video.firstTimestampSeconds, part.mediaBounds.availableStartTimestampSeconds), video.endTimestampSeconds) : [];
    }) : getRecordingAvailableRanges(source))].sort((first, second) => first.startSeconds - second.startSeconds);
    let coveredUntil = range.startSeconds;
    for (const available of ranges) {
        if (available.endSeconds <= coveredUntil) continue;
        if (available.startSeconds > coveredUntil + TIME_TOLERANCE_SECONDS) break;
        coveredUntil = Math.max(coveredUntil, available.endSeconds);
        if (coveredUntil >= range.endSeconds - TIME_TOLERANCE_SECONDS) return;
    }
    throw new Error(`${label}: zdroj nemá obraz po celý vybraný interval ${range.startSeconds}–${range.endSeconds} s.`);
}

/** Validate the selected player interval before any ZIP or individual prepared export writes files. */
export function validateRecordingWorkshopMetadata(recording: StudioRecording, selection = getRecordingSelection(recording)): void {
    const metadata = recording.workshopMetadata;
    if (!metadata) return;
    const durationSeconds = getRecordingSessionDuration(recording);
    if (metadata.schemaVersion !== WORKSHOP_METADATA_SCHEMA_VERSION || !metadata.sourceRevision) throw new Error('Neplatná verze metadat workshopu.');
    if (!Number.isFinite(selection.startSeconds) || !Number.isFinite(selection.endSeconds) || selection.startSeconds < 0 ||
        selection.endSeconds > durationSeconds || selection.startSeconds >= selection.endSeconds) throw new Error('Neplatný výběr workshopu.');
    if (metadata.activityIntervals.length > MAXIMUM_WORKSHOP_ITEMS) throw new Error('Příliš mnoho intervalů aktivity.');
    let coveredUntil = selection.startSeconds;
    let previousEnd = 0;
    for (const interval of [...metadata.activityIntervals].sort((first, second) => first.startSeconds - second.startSeconds)) {
        validatePoint(interval.startSeconds, durationSeconds, 'Aktivita');
        validatePoint(interval.endSeconds, durationSeconds, 'Aktivita', true);
        if (interval.endSeconds <= interval.startSeconds || interval.startSeconds < previousEnd - TIME_TOLERANCE_SECONDS ||
            !['active', 'automatic-coding', 'unclassified'].includes(interval.classification)) throw new Error('Intervaly aktivity se překrývají nebo mají neplatný rozsah.');
        if (interval.classification === 'automatic-coding' && !interval.isReviewed) throw new Error('Automatické kódování musí být ručně potvrzené.');
        if (interval.endSeconds > selection.startSeconds && interval.startSeconds < selection.endSeconds) {
            if (interval.startSeconds > coveredUntil + TIME_TOLERANCE_SECONDS) throw new Error('Ve vybraném intervalu aktivity je mezera.');
            coveredUntil = Math.max(coveredUntil, interval.endSeconds);
        }
        previousEnd = interval.endSeconds;
    }
    if (coveredUntil < selection.endSeconds - TIME_TOLERANCE_SECONDS) throw new Error('Aktivita nepokrývá celý vybraný interval.');
    validateOrderedPoints(metadata.events, durationSeconds, 'Události', true);
    for (const event of metadata.events) if (!event.title.trim() || event.title.length > 120 || event.detail.length > 2_000 || event.type.length > 80) {
        throw new Error('Událost potřebuje krátký název; detail nebo typ je příliš dlouhý.');
    }
    const view = metadata.autoView;
    if (!view.isDefaultReviewed || view.transitions.some((transition) => !transition.isReviewed)) throw new Error('Před exportem potvrďte volby Auto-view.');
    validateOrderedPoints(view.transitions, durationSeconds, 'Auto-view');
    const transitions = [...view.transitions].sort((first, second) => first.seconds - second.seconds);
    const scenePoints = [selection.startSeconds, ...transitions.filter((transition) => transition.seconds > selection.startSeconds &&
        transition.seconds < selection.endSeconds).map((transition) => transition.seconds), selection.endSeconds];
    for (let index = 0; index < scenePoints.length - 1; index += 1) {
        const scene = getRecordingWorkshopSceneAt(metadata, scenePoints[index]!);
        validateSceneSource(recording, scene === 'editor' ? view.editorSourceId : view.applicationSourceId,
            { startSeconds: scenePoints[index]!, endSeconds: scenePoints[index + 1]! }, `Auto-view ${scene}`);
    }
    if (metadata.repository === null && (metadata.startingCommit || metadata.commitAnchors.length)) throw new Error('Commity potřebují přiřazený repozitář.');
    if (metadata.repository !== null && !metadata.startingCommit) throw new Error('Doplňte počáteční commit workshopu.');
    if (metadata.startingCommit) validateCommit(metadata.startingCommit, 'Počáteční commit');
    validateOrderedPoints(metadata.commitAnchors, durationSeconds, 'Commity');
    for (const anchor of metadata.commitAnchors) {
        validateCommit(anchor.commit, 'Kotva commitu');
        if (!anchor.isReviewed) throw new Error('Před exportem zkontrolujte všechny navržené kotvy commitů.');
    }
    if (metadata.calibration) {
        validatePoint(metadata.calibration.sessionSeconds, durationSeconds, 'Kalibrace');
        if (!Number.isFinite(Date.parse(metadata.calibration.wallClockAtSessionSeconds))) throw new Error('Kalibrace vyžaduje platný čas s časovým pásmem.');
    }
}

/** Both sidecars use the saved edit recipe; prepared positions subtract exactly its common zero. */
export async function createRecordingWorkshopSidecar(recording: StudioRecording, isPrepared: boolean) {
    validateRecordingWorkshopMetadata(recording);
    const metadata = recording.workshopMetadata;
    if (!metadata) return null;
    const recipe = createRecordingEditRecipe(recording);
    const selection = isPrepared ? recipe.selection : { startSeconds: 0, endSeconds: getRecordingSessionDuration(recording) };
    const zero = isPrepared ? recipe.preparedTimeZeroSessionSeconds : 0;
    const clip = (interval: RecordingWorkshopActivityInterval) => {
        const clipped = clipRecordingSessionRange(interval, selection);
        return clipped ? [{ ...interval, originalStartSeconds: interval.startSeconds,
            originalEndSeconds: interval.endSeconds, ...clipped }] : [];
    };
    const commitAtZero = getRecordingWorkshopCommitAt(metadata, selection.startSeconds);
    const transitionScene = getRecordingWorkshopSceneAt(metadata, selection.startSeconds);
    const currentRevision = await getRecordingMediaRevision(recording);
    return {
        schemaVersion: WORKSHOP_METADATA_SCHEMA_VERSION, timeUnit: 'seconds', coordinate: isPrepared ? 'prepared-export' : 'original-session',
        sourceRecordingId: recording.id, sourceRevision: metadata.sourceRevision, currentRevision,
        isSourceRevisionStale: metadata.sourceRevision !== currentRevision, editRecipe: recipe,
        selection, preparedTimeZeroSessionSeconds: recipe.preparedTimeZeroSessionSeconds,
        repository: metadata.repository, startingCommit: metadata.startingCommit,
        commitAtSelectionStart: commitAtZero,
        activityIntervals: metadata.activityIntervals.flatMap(clip),
        events: metadata.events.filter((event) => event.seconds >= selection.startSeconds && event.seconds < selection.endSeconds)
            .sort((first, second) => first.seconds - second.seconds).map((event) => ({ ...event,
                originalSeconds: event.seconds, seconds: event.seconds - zero })),
        autoView: { ...metadata.autoView, defaultScene: transitionScene,
            transitions: metadata.autoView.transitions.filter((transition) => transition.seconds >= selection.startSeconds &&
                transition.seconds < selection.endSeconds).sort((first, second) => first.seconds - second.seconds)
                .map((transition) => ({ ...transition, originalSeconds: transition.seconds, seconds: transition.seconds - zero })) },
        commitAnchors: metadata.commitAnchors.filter((anchor) => anchor.seconds >= selection.startSeconds && anchor.seconds < selection.endSeconds)
            .sort((first, second) => first.seconds - second.seconds).map((anchor) => ({ ...anchor,
                originalSeconds: anchor.seconds, seconds: anchor.seconds - zero })),
        calibration: metadata.calibration,
        playback: { unclassifiedRate: 1, automaticCodingRequiresReview: true,
            transcriptIsVisiblePlayerSubtitles: false },
    };
}
