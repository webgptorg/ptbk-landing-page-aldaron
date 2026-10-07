import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { claimTestRecordingStudioAuthority, createTestStudioRecording } from './recordingStudioTestUtilities';
import {
    addStudioRecording,
    createStudioProject,
    deleteStudioProject,
    listStudioAssets,
    openStudioRecordingProject,
    saveStudioProject,
} from './studioProjectStorage';
import {
    appendRecordingChunk,
    deleteStudioRecording,
    listStudioRecordings,
    saveStudioRecording,
} from './recordingStudioStorage';
import {
    CHUNK_STORE,
    openRecordingDatabase,
    readRequest,
    STUDIO_PROJECT_STORE,
    STUDIO_ASSET_STORE,
} from './recordingStudioDatabase';
import {
    assembleStudioGroups,
    createStudioPlaybackTrack,
    createStudioTimelineTracks,
    getStudioClipAt,
    getStudioProjectDuration,
    getStudioSceneAt,
    getStudioSceneBoundaryRange,
    mapStudioProjectMetadata,
    moveStudioSceneBoundary,
    placeStudioClips,
    splitStudioGroup,
    validateStudioProject,
} from './studioProjectTimeline';
import { getRecordingMediaRevision } from './recordingStudioDerived';
import { createStudioProjectRecipe } from './studioProjectRecipe';
import { sessionToRecordingMediaTime } from './recordingStudioSessionTime';
import { readStudioRecordingRange } from '@/public/studio-range-reader.mjs';
import type { StudioAsset, StudioProject } from './studioProjectTypes';

beforeEach(async () => {
    await claimTestRecordingStudioAuthority();
    const database = await openRecordingDatabase();
    await new Promise<void>((resolve) => {
        const transaction = database.transaction([STUDIO_PROJECT_STORE, STUDIO_ASSET_STORE], 'readwrite');
        transaction.objectStore(STUDIO_PROJECT_STORE).clear();
        transaction.objectStore(STUDIO_ASSET_STORE).clear();
        transaction.oncomplete = () => resolve();
    });
    for (const recording of await listStudioRecordings()) await deleteStudioRecording(recording.id);
});

function createLongRecording(id: string, durationSeconds = 6_001) {
    const base = createTestStudioRecording();
    return {
        ...base,
        id,
        title: `Part ${id}`,
        durationSeconds,
        tracks: ['screen', 'screen', 'camera', 'microphone'].map((kind, index) => ({
            ...base.tracks[0],
            id: `${id}-source-${index}`,
            kind: kind as 'screen' | 'camera' | 'microphone',
            label: `${kind} ${index}`,
            byteLength: 3,
            chunkCount: 1,
            startOffsetSeconds: index * 0.1,
            durationSeconds: durationSeconds - index * 0.1,
            isAudioIncluded: index >= 2,
            parts: [
                {
                    id: `${id}-part-${index}`,
                    takeId: id,
                    sessionStartSeconds: index * 0.1,
                    byteLength: 3,
                    chunkCount: 1,
                    durationSeconds: durationSeconds - index * 0.1,
                    mimeType: kind === 'microphone' ? 'audio/webm' : 'video/webm',
                    mediaBounds: {
                        firstTimestampSeconds: 0,
                        availableStartTimestampSeconds: 0,
                        endTimestampSeconds: durationSeconds - index * 0.1,
                        components: [
                            {
                                kind: kind === 'microphone' ? ('audio' as const) : ('video' as const),
                                firstTimestampSeconds: 0,
                                endTimestampSeconds: durationSeconds - index * 0.1,
                            },
                        ],
                    },
                },
            ],
        })),
    };
}

describe('independent Studio projects', () => {
    it('opens the same recording project without reading/copying chunks and blocks deleting referenced raw media', async () => {
        const recording = createLongRecording('recorded');
        await saveStudioRecording(recording);
        const first = await openStudioRecordingProject(recording);
        const second = await openStudioRecordingProject(recording);
        expect(second.id).toBe(first.id);
        expect(second.clips).toEqual(first.clips);
        const database = await openRecordingDatabase();
        expect(await readRequest(database.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).count())).toBe(0);
        await expect(deleteStudioRecording(recording.id)).rejects.toThrow(/projekt Střižny/);
        await deleteStudioProject(first.id);
        await deleteStudioRecording(recording.id);
        expect((await listStudioAssets()).length).toBe(4);
    });
    it('assembles three four-track parts over five hours, trims/reorders/splits linked parts and maps source clocks near joins/end', async () => {
        let project = createStudioProject();
        let assets: StudioAsset[] = [];
        for (const id of ['first', 'second', 'third']) {
            const result = await addStudioRecording(project, createLongRecording(id));
            project = result.project;
            assets = [...assets, ...result.assets];
            await saveStudioProject(project, result.assets);
        }
        expect(project.tracks).toHaveLength(4);
        expect(project.groups).toHaveLength(3);
        expect(project.clips).toHaveLength(12);
        expect(getStudioProjectDuration(project)).toBe(18_003);
        validateStudioProject(project);
        const camera = project.tracks.find((track) => track.role === 'webcam')!;
        const cameraTrack = createStudioTimelineTracks(project, assets).find((track) => track.id === camera.id)!;
        for (const seconds of [0.19, 0.21, 6000.99, 6001.01, 6001.21, 12002.21, 18002.9]) {
            const clip = getStudioClipAt(project, camera.id, seconds);
            if ([0.19, 6001.01].includes(seconds)) {
                expect(clip).toBeNull();
                continue;
            }
            expect(clip).not.toBeNull();
            const asset = assets.find((entry) => entry.id === clip!.assetId)!;
            const playbackTrack = createStudioPlaybackTrack(cameraTrack, clip!, asset);
            expect(
                sessionToRecordingMediaTime(playbackTrack, seconds, 0, asset.bounds.endTimestampSeconds),
            ).toBeCloseTo(seconds - clip!.projectStartSeconds + clip!.sourceStartSeconds, 8);
        }
        const ordered = assembleStudioGroups(project, [
            { ...project.groups[2], sourceInSeconds: 1, sourceOutSeconds: 6000 },
            project.groups[0],
            project.groups[1],
        ]);
        validateStudioProject(ordered);
        expect(getStudioClipAt(ordered, camera.id, 0)?.assetId).toBe(
            project.clips.find((clip) => clip.groupId === project.groups[2].id && clip.trackId === camera.id)!.assetId,
        );
        const split = splitStudioGroup(ordered, ordered.groups[0].id, 3000);
        validateStudioProject(split);
        expect(getStudioProjectDuration(split)).toBe(getStudioProjectDuration(ordered));
        expect(placeStudioClips(split).filter((clip) => clip.trackId === camera.id)).toHaveLength(4);
        expect(getStudioSceneAt(split, 3000)?.groupId).toBe(split.groups[1].id);
        expect(createStudioProjectRecipe(split, assets).prepared.timeZeroProjectSeconds).toBe(
            split.selection.startSeconds,
        );
    });
    it('pins metadata and maps events, derived cues and anchors through common trims/reorder without modifying recordings', async () => {
        const source = createLongRecording('metadata', 20);
        const revision = await getRecordingMediaRevision(source);
        const recording = {
            ...source,
            derivedTracks: [
                {
                    id: 'private-captions',
                    kind: 'subtitles' as const,
                    provenance: {
                        sourceId: source.tracks[2].id,
                        sourceLabel: 'camera',
                        mediaRevision: revision,
                        createdAt: source.createdAt,
                        language: 'cs' as const,
                        processor: 'manual',
                        settings: {},
                    },
                    cues: [
                        {
                            id: 'cue',
                            startSeconds: 2,
                            endSeconds: 10,
                            text: 'Private',
                            isEnabled: true,
                            origin: 'manual' as const,
                        },
                    ],
                },
            ],
            workshopMetadata: {
                schemaVersion: 1 as const,
                sourceRevision: revision,
                events: [{ id: 'event', seconds: 8, title: 'Join', detail: '', type: 'manual' }],
                activityIntervals: [
                    {
                        id: 'activity',
                        startSeconds: 1,
                        endSeconds: 12,
                        classification: 'active' as const,
                        origin: 'manual' as const,
                        isReviewed: true,
                    },
                ],
                autoView: {
                    defaultScene: 'editor' as const,
                    isDefaultReviewed: true,
                    editorSourceId: source.tracks[0].id,
                    applicationSourceId: source.tracks[1].id,
                    transitions: [],
                },
                repository: null,
                startingCommit: null,
                commitAnchors: [],
                calibration: null,
            },
        };
        const { project } = await addStudioRecording(createStudioProject(), recording);
        const edited = assembleStudioGroups(project, [
            { ...project.groups[0], sourceInSeconds: 5, sourceOutSeconds: 15 },
        ]);
        const mapped = mapStudioProjectMetadata(edited);
        expect(mapped.events[0].seconds).toBe(3);
        expect(mapped.derivedTracks[0].kind === 'subtitles' && mapped.derivedTracks[0].cues[0]).toMatchObject({
            startSeconds: 0,
            endSeconds: 5,
        });
        expect(mapped.activityIntervals[0]).toMatchObject({ startSeconds: 0, endSeconds: 7 });
        expect(recording.derivedTracks[0].cues[0].startSeconds).toBe(2);
        expect(project.recordingSnapshots[0].recording).not.toBe(recording);
        const aligned = {
            ...edited,
            clips: edited.clips.map((clip) =>
                clip.originSourceId === source.tracks[2].id
                    ? { ...clip, groupOffsetSeconds: clip.groupOffsetSeconds + 2 }
                    : clip,
            ),
        };
        const alignedMetadata = mapStudioProjectMetadata(aligned);
        expect(
            alignedMetadata.derivedTracks[0].kind === 'subtitles' && alignedMetadata.derivedTracks[0].cues[0],
        ).toMatchObject({ startSeconds: 0, endSeconds: 7 });
        const unknown = mapStudioProjectMetadata({
            ...aligned,
            clips: aligned.clips.map((clip) => ({ ...clip, originGroupOffsetSeconds: undefined })),
        });
        expect(unknown.derivedTracks).toHaveLength(0);
        expect(unknown.unavailable).toContainEqual(expect.stringMatching(/mapování zdroje/));
        const ambiguous = mapStudioProjectMetadata({
            ...edited,
            clips: edited.clips.map((clip) =>
                clip.originSourceId === source.tracks[1].id ? { ...clip, originSourceId: source.tracks[0].id } : clip,
            ),
        });
        expect(ambiguous.autoView[0].editorTrackId).toBeNull();
        expect(ambiguous.unavailable).toContainEqual(expect.stringMatching(/jednoznačnou logickou stopu/));
    });
    it('moves hard cuts in project seconds, clamps to neighboring scenes/trim and retains every source identity', async () => {
        const { project: original } = await addStudioRecording(
            createStudioProject(),
            createLongRecording('scenes', 20),
        );
        const project = assembleStudioGroups(original, [
            { ...original.groups[0], sourceInSeconds: 5, sourceOutSeconds: 15 },
        ]);
        const middle = { ...project.scenes[0], id: crypto.randomUUID(), offsetSeconds: 8 };
        const last = { ...project.scenes[0], id: crypto.randomUUID(), offsetSeconds: 12 };
        const withScenes = { ...project, scenes: [...project.scenes, middle, last] };
        expect(getStudioSceneBoundaryRange(withScenes, middle.id)?.startSeconds).toBe(0);
        expect(getStudioSceneBoundaryRange(withScenes, middle.id)?.endSeconds).toBeCloseTo(6.999, 8);
        const moved = moveStudioSceneBoundary(withScenes, middle.id, 4);
        expect(moved.scenes.find((scene) => scene.id === middle.id)?.offsetSeconds).toBe(9);
        expect(getStudioSceneAt(moved, 3.999)?.id).toBe(project.scenes[0].id);
        expect(getStudioSceneAt(moved, 4)?.id).toBe(middle.id);
        expect(
            moveStudioSceneBoundary(withScenes, middle.id, 100).scenes.find((scene) => scene.id === middle.id)
                ?.offsetSeconds,
        ).toBeCloseTo(11.999);
        expect(
            moveStudioSceneBoundary(withScenes, middle.id, -100).scenes.find((scene) => scene.id === middle.id)
                ?.offsetSeconds,
        ).toBe(5);
        expect(moved.clips).toBe(project.clips);
        expect(moved.recordingSnapshots).toBe(project.recordingSnapshots);
        expect(moved.scenes.find((scene) => scene.id === middle.id)?.audioTrackId).toBe(middle.audioTrackId);
        expect(moveStudioSceneBoundary(withScenes, middle.id, NaN)).toBe(withScenes);
        validateStudioProject(moved);
    });
    it('rejects overlaps, invalid numeric drafts and ambiguous scene boundaries', async () => {
        const { project } = await addStudioRecording(createStudioProject(), createLongRecording('valid', 10));
        const group = project.groups[0];
        const invalid = { ...project, groups: [{ ...group, sourceInSeconds: NaN }] };
        expect(() => validateStudioProject(invalid)).toThrow(/IN\/OUT/);
        const overlapping = { ...project, clips: [...project.clips, { ...project.clips[0], id: crypto.randomUUID() }] };
        expect(() => validateStudioProject(overlapping)).toThrow(/překryv/);
        expect(getStudioClipAt(overlapping, project.clips[0].trackId, 1)).toBeNull();
        expect(
            getStudioSceneAt({ ...project, groups: [...project.groups, { ...group, id: crypto.randomUUID() }] }, 1),
        ).toBeNull();
        expect(() =>
            validateStudioProject({
                ...project,
                scenes: [...project.scenes, { ...project.scenes[0], id: crypto.randomUUID() }],
            }),
        ).toThrow(/stejném čase/);
    });
    it('exports relink information without file handles, object URLs or authorization query strings', async () => {
        const asset: StudioAsset = {
            id: crypto.randomUUID(),
            label: 'Private source',
            kind: 'video',
            mimeType: 'video/mp4',
            byteLength: 42,
            width: 100,
            height: 100,
            frameRate: 25,
            isAudioIncluded: false,
            bounds: {
                firstTimestampSeconds: 0,
                availableStartTimestampSeconds: 0,
                endTimestampSeconds: 10,
                components: [],
            },
            original: { kind: 'https', url: 'https://cdn.test/private.mp4?token=secret#secret' },
            location: { kind: 's3', storageAssetId: crypto.randomUUID() },
        };
        const { project: base } = await addStudioRecording(createStudioProject(), createLongRecording('portable', 10));
        const project = { ...base, clips: base.clips.map((clip) => ({ ...clip, assetId: asset.id })) };
        const serialized = JSON.stringify(createStudioProjectRecipe(project, [asset]));
        expect(serialized).not.toContain('secret');
        expect(serialized).not.toContain('handle');
        expect(serialized).not.toContain('X-Amz');
        expect(serialized).toContain('isRelinkRequired');
    });
    it('reads only bounded IndexedDB ranges and keeps recorded media byte offsets indexed', async () => {
        const base = createTestStudioRecording();
        let recording = { ...base, tracks: [{ ...base.tracks[0], byteLength: 0, chunkCount: 0, durationSeconds: 9 }] };
        for (const sequence of [0, 1, 2]) {
            const value = ['abc', 'def', 'ghi'][sequence];
            recording = {
                ...recording,
                tracks: [{ ...recording.tracks[0], byteLength: (sequence + 1) * 3, chunkCount: sequence + 1 }],
            };
            await appendRecordingChunk(recording, recording.tracks[0].id, sequence, new Blob([value]));
        }
        const location = {
            kind: 'recording' as const,
            recordingId: recording.id,
            trackId: recording.tracks[0].id,
            revision: 'revision',
            part: {
                id: recording.tracks[0].id,
                takeId: recording.id,
                sessionStartSeconds: 0,
                durationSeconds: 9,
                byteLength: 9,
                chunkCount: 3,
                mimeType: 'video/webm',
            },
        };
        const database = await openRecordingDatabase();
        expect(await (await readStudioRecordingRange(database, location, 2, 7)).text()).toBe('cdefg');
        expect(await (await readStudioRecordingRange(database, location, 8, 9)).text()).toBe('i');
        await expect(readStudioRecordingRange(database, location, 0, 10)).rejects.toThrow(/range/);
    });
});
