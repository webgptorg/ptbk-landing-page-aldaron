import { RECORDING_STUDIO_AUTHORITY } from './recordingStudioAuthority';
import {
    openRecordingDatabase,
    readRequest,
    STUDIO_ASSET_STORE,
    STUDIO_PROJECT_STORE,
    STUDIO_UPLOAD_STORE,
} from './recordingStudioDatabase';
import { getRecordingMediaParts, getRecordingSessionDuration } from './recordingStudioSessionTime';
import { getRecordingMediaRevision } from './recordingStudioDerived';
import { assembleStudioGroups, getStudioProjectDuration, validateStudioProject } from './studioProjectTimeline';
import {
    STUDIO_MAXIMUM_ACTIVE_TRACKS,
    type StudioAsset,
    type StudioClip,
    type StudioLogicalTrack,
    type StudioPartGroup,
    type StudioProject,
    type StudioScene,
} from './studioProjectTypes';
import type { StudioRecording } from './recordingStudioTypes';
import { ALL_FORMATS, CustomSource, Input } from 'mediabunny';
import { readStudioRecordingRange } from '@/public/studio-range-reader.mjs';
import { inspectRecordingMedia } from './recordingStudioMedia';

const MAXIMUM_LEGACY_PROBE_BYTES = 64 * 1024 * 1024;

export async function listStudioProjects(): Promise<StudioProject[]> {
    const database = await openRecordingDatabase();
    const projects = await readRequest<StudioProject[]>(
        database.transaction(STUDIO_PROJECT_STORE).objectStore(STUDIO_PROJECT_STORE).getAll(),
    );
    return projects.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}
export async function readStudioProject(id: string): Promise<StudioProject | undefined> {
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(STUDIO_PROJECT_STORE).objectStore(STUDIO_PROJECT_STORE).get(id));
}
export async function listStudioAssets(): Promise<StudioAsset[]> {
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(STUDIO_ASSET_STORE).objectStore(STUDIO_ASSET_STORE).getAll());
}
export async function saveStudioAsset(asset: StudioAsset): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.runTransaction([STUDIO_ASSET_STORE], (transaction) =>
        transaction.objectStore(STUDIO_ASSET_STORE).put(asset),
    );
}
export async function saveStudioProject(
    project: StudioProject,
    assets: readonly StudioAsset[] = [],
): Promise<StudioProject> {
    validateStudioProject(project);
    const updated = { ...project, updatedAt: new Date().toISOString() };
    await RECORDING_STUDIO_AUTHORITY.runTransaction([STUDIO_PROJECT_STORE, STUDIO_ASSET_STORE], (transaction) => {
        transaction.objectStore(STUDIO_PROJECT_STORE).put(updated);
        assets.forEach((asset) => transaction.objectStore(STUDIO_ASSET_STORE).put(asset));
    });
    return updated;
}
export async function deleteStudioProject(id: string): Promise<void> {
    // Only the small recipe is deleted. Source assets, raw bytes and verified remote objects stay intact.
    await RECORDING_STUDIO_AUTHORITY.runTransaction([STUDIO_PROJECT_STORE], (transaction) =>
        transaction.objectStore(STUDIO_PROJECT_STORE).delete(id),
    );
}
export function createStudioProject(title = 'Nový workshop'): StudioProject {
    const createdAt = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        schemaVersion: 1,
        title,
        createdAt,
        updatedAt: createdAt,
        originRecordingId: null,
        tracks: [],
        groups: [],
        clips: [],
        scenes: [],
        selection: { startSeconds: 0, endSeconds: 0 },
        recordingSnapshots: [],
    };
}

async function createStableStudioId(value: string): Promise<string> {
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
    const bytes = digest.slice(0, 16);
    bytes[6] = (bytes[6] & 15) | 80;
    bytes[8] = (bytes[8] & 63) | 128;
    const hexadecimal = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
}

export function createStudioScene(
    groupId: string,
    tracks: readonly StudioLogicalTrack[],
    offsetSeconds = 0,
): StudioScene {
    return {
        id: crypto.randomUUID(),
        groupId,
        offsetSeconds,
        backgroundTrackId:
            (tracks.find((track) => track.role === 'editor') ?? tracks.find((track) => track.role !== 'audio'))?.id ??
            null,
        overlayTrackId: tracks.find((track) => track.role === 'webcam')?.id ?? null,
        audioTrackId: tracks.find((track) => track.role === 'audio')?.id ?? null,
        mask: 'rectangle',
        fit: 'contain',
        overlayFit: 'cover',
        rectangle: { x: 0.74, y: 0.72, width: 0.24, height: 0.24 },
    };
}

/** Adds immutable ID/timing references. It does not read a media payload, request capture or create a cloud object. */
export async function addStudioRecording(
    project: StudioProject,
    recording: StudioRecording,
): Promise<{ project: StudioProject; assets: readonly StudioAsset[] }> {
    if (recording.status === 'recording') throw new Error('Nejdříve dokončete nahrávání.');
    const revision = await getRecordingMediaRevision(recording);
    if (
        project.recordingSnapshots.some(
            (snapshot) => snapshot.recording.id === recording.id && snapshot.revision === revision,
        )
    ) {
        throw new Error(
            'Tento záznam už je v projektu. Nové donahrané části přidejte výslovnou akcí pro novou revizi.',
        );
    }
    const knownAssets = await listStudioAssets();
    const assets: StudioAsset[] = [];
    const tracks = [...project.tracks];
    const sourceTrackIds = new Map<string, string>();
    for (const sourceTrack of recording.tracks) {
        const role =
            sourceTrack.kind === 'camera'
                ? 'webcam'
                : sourceTrack.kind === 'microphone'
                  ? 'audio'
                  : recording.tracks
                          .filter((track) => track.kind === 'screen')
                          .findIndex((track) => track.id === sourceTrack.id) === 0
                    ? 'editor'
                    : 'application';
        const roleIndex = recording.tracks
            .filter((track) => track.kind === sourceTrack.kind)
            .findIndex((track) => track.id === sourceTrack.id);
        const isAdditional =
            (sourceTrack.kind === 'screen' && roleIndex > 1) || (sourceTrack.kind !== 'screen' && roleIndex > 0);
        let logical = tracks.find((track) => !isAdditional && track.role === role);
        if (!logical) {
            logical = { id: crypto.randomUUID(), role: isAdditional ? 'additional' : role, label: sourceTrack.label };
            tracks.push(logical);
        }
        sourceTrackIds.set(sourceTrack.id, logical.id);
    }
    if (tracks.length > STUDIO_MAXIMUM_ACTIVE_TRACKS)
        throw new Error(
            'Projekt podporuje nejvýše osm souběžných logických stop. Použijte samostatný projekt nebo zúžený záznam.',
        );
    const takes = recording.takes?.length
        ? recording.takes
        : [{ id: recording.id, sessionStartSeconds: 0, durationSeconds: getRecordingSessionDuration(recording) }];
    const groups: StudioPartGroup[] = takes
        .filter((take) => take.durationSeconds > 0)
        .map((take, index) => ({
            id: crypto.randomUUID(),
            label: `${recording.title}${takes.length > 1 ? ` · část ${index + 1}` : ''}`,
            projectStartSeconds: 0,
            durationSeconds: take.durationSeconds,
            sourceInSeconds: 0,
            sourceOutSeconds: take.durationSeconds,
            recordingId: recording.id,
            recordingRevision: revision,
            recordingSessionStartSeconds: take.sessionStartSeconds,
            isInterrupted: recording.status === 'interrupted',
        }));
    const clips: StudioClip[] = [];
    for (const sourceTrack of recording.tracks) {
        for (const part of getRecordingMediaParts(sourceTrack).filter(
            (part) => part.byteLength > 0 && part.durationSeconds > 0,
        )) {
            const original = {
                kind: 'recording' as const,
                recordingId: recording.id,
                trackId: sourceTrack.id,
                part: { ...part },
                revision,
            };
            const existing = knownAssets.find(
                (asset) =>
                    asset.original.kind === 'recording' &&
                    asset.original.recordingId === recording.id &&
                    asset.original.part.id === part.id &&
                    asset.original.part.byteLength === part.byteLength &&
                    asset.original.part.durationSeconds === part.durationSeconds,
            );
            let bounds = part.mediaBounds;
            if (!bounds) {
                const database = await openRecordingDatabase();
                let bytesRead = 0;
                const signal = new AbortController().signal;
                const input = new Input({
                    formats: ALL_FORMATS,
                    source: new CustomSource({
                        getSize: () => part.byteLength,
                        maxCacheSize: 8 * 1024 * 1024,
                        read: async (start, end) => {
                            bytesRead += end - start;
                            if (bytesRead > MAXIMUM_LEGACY_PROBE_BYTES)
                                throw new Error(
                                    'Časování staršího záznamu nelze ověřit omezeným čtením. Originál zůstává v Nahrávání.',
                                );
                            return (await readStudioRecordingRange(database, original, start, end, signal)).stream();
                        },
                    }),
                });
                try {
                    bounds = await inspectRecordingMedia(input, sourceTrack);
                } finally {
                    input.dispose();
                }
            }
            const asset: StudioAsset = existing ?? {
                id: await createStableStudioId(JSON.stringify({ recordingId: recording.id, part })),
                label: sourceTrack.label,
                kind: sourceTrack.kind === 'microphone' ? 'audio' : 'video',
                mimeType: part.mimeType,
                byteLength: part.byteLength,
                bounds,
                width: part.width ?? sourceTrack.width,
                height: part.height ?? sourceTrack.height,
                frameRate: part.frameRate ?? sourceTrack.frameRate,
                isAudioIncluded: part.isAudioIncluded ?? sourceTrack.isAudioIncluded,
                original,
                location: original,
            };
            assets.push(asset);
            for (const segment of part.segments ?? [
                {
                    sourceStartSeconds: 0,
                    sessionStartSeconds: part.sessionStartSeconds,
                    durationSeconds: part.durationSeconds,
                },
            ]) {
                for (const group of groups) {
                    const start = Math.max(segment.sessionStartSeconds, group.recordingSessionStartSeconds);
                    const end = Math.min(
                        segment.sessionStartSeconds + segment.durationSeconds,
                        group.recordingSessionStartSeconds + group.durationSeconds,
                        segment.sessionStartSeconds +
                            bounds.endTimestampSeconds -
                            bounds.firstTimestampSeconds -
                            segment.sourceStartSeconds,
                    );
                    if (end <= start) continue;
                    clips.push({
                        id: crypto.randomUUID(),
                        groupId: group.id,
                        assetId: asset.id,
                        trackId: sourceTrackIds.get(sourceTrack.id)!,
                        originSourceId: sourceTrack.id,
                        groupOffsetSeconds: start - group.recordingSessionStartSeconds,
                        originGroupOffsetSeconds: start - group.recordingSessionStartSeconds,
                        sourceInSeconds: segment.sourceStartSeconds + start - segment.sessionStartSeconds,
                        sourceOutSeconds: segment.sourceStartSeconds + end - segment.sessionStartSeconds,
                    });
                }
            }
        }
    }
    const scenes = groups.map((group) => {
        const scene = createStudioScene(group.id, tracks);
        const audibleTrack =
            recording.tracks.find((track) => track.kind === 'microphone' && track.byteLength > 0) ??
            recording.tracks.find((track) => track.isAudioIncluded && track.byteLength > 0);
        return { ...scene, audioTrackId: audibleTrack ? sourceTrackIds.get(audibleTrack.id)! : null };
    });
    const nextProject = assembleStudioGroups(
        {
            ...project,
            tracks,
            clips: [...project.clips, ...clips],
            scenes: [...project.scenes, ...scenes],
            recordingSnapshots: [...project.recordingSnapshots, { revision, recording: structuredClone(recording) }],
        },
        [...project.groups, ...groups],
    );
    // assemble uses the previous duration to preserve a full-session selection when adding another part.
    if (project.selection.startSeconds === 0 && project.selection.endSeconds === getStudioProjectDuration(project)) {
        return {
            project: {
                ...nextProject,
                selection: { startSeconds: 0, endSeconds: getStudioProjectDuration(nextProject) },
            },
            assets,
        };
    }
    return { project: nextProject, assets };
}

export async function openStudioRecordingProject(recording: StudioRecording): Promise<StudioProject> {
    const previous = (await listStudioProjects()).find((project) => project.originRecordingId === recording.id);
    if (previous) return previous;
    const result = await addStudioRecording(
        {
            ...createStudioProject(recording.title),
            id: await createStableStudioId(`recording-project:${recording.id}`),
            originRecordingId: recording.id,
        },
        recording,
    );
    return saveStudioProject(result.project, result.assets);
}

/** Explicitly adds only newly appended take groups. Earlier snapshots/cuts remain pinned to their original revision. */
export async function addStudioRecordingRevision(project: StudioProject, recording: StudioRecording) {
    const previous = project.recordingSnapshots.filter((snapshot) => snapshot.recording.id === recording.id);
    if (!previous.length) return addStudioRecording(project, recording);
    const revision = await getRecordingMediaRevision(recording);
    if (previous.some((snapshot) => snapshot.revision === revision)) throw new Error('Projekt už používá tuto revizi.');
    const previousTakeIds = new Set(
        previous.flatMap((snapshot) => snapshot.recording.takes?.map((take) => take.id) ?? [recording.id]),
    );
    const newTakes = recording.takes?.filter((take) => !previousTakeIds.has(take.id)) ?? [];
    if (!newTakes.length)
        throw new Error(
            'Změna neobsahuje nové samostatné části. Původní časování zůstává připnuté; změněný záznam přidejte do nového projektu.',
        );
    const result = await addStudioRecording(
        { ...createStudioProject(project.title), tracks: project.tracks },
        recording,
    );
    const addedGroups = result.project.groups.filter((group) =>
        newTakes.some((take) => take.sessionStartSeconds === group.recordingSessionStartSeconds),
    );
    const groupIds = new Set(addedGroups.map((group) => group.id));
    const next = {
        ...project,
        tracks: result.project.tracks,
        clips: [...project.clips, ...result.project.clips.filter((clip) => groupIds.has(clip.groupId))],
        scenes: [...project.scenes, ...result.project.scenes.filter((scene) => groupIds.has(scene.groupId))],
        recordingSnapshots: [...project.recordingSnapshots, { revision, recording: structuredClone(recording) }],
    };
    return { project: assembleStudioGroups(next, [...project.groups, ...addedGroups]), assets: result.assets };
}

export async function readStudioAssetUpload<Result>(id: string): Promise<Result | undefined> {
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(STUDIO_UPLOAD_STORE).objectStore(STUDIO_UPLOAD_STORE).get(id));
}
export async function saveStudioAssetUpload<Value extends { readonly id: string }>(
    value: Value | null,
    id: string,
): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.runTransaction([STUDIO_UPLOAD_STORE], (transaction) => {
        if (value) transaction.objectStore(STUDIO_UPLOAD_STORE).put(value);
        else transaction.objectStore(STUDIO_UPLOAD_STORE).delete(id);
    });
}
