import { clipRecordingSessionRange, getRecordingAvailableRanges } from './recordingStudioSessionTime';
import type {
    RecordingDerivedTrack,
    RecordingTrack,
    RecordingTrim,
    RecordingWorkshopCommitAnchor,
    RecordingWorkshopMetadata,
} from './recordingStudioTypes';
import {
    STUDIO_MAXIMUM_ACTIVE_TRACKS,
    type StudioAsset,
    type StudioPartGroup,
    type StudioPlacedClip,
    type StudioProject,
    type StudioScene,
} from './studioProjectTypes';

const TIMELINE_EPSILON_SECONDS = 0.000001;
const SCENE_BOUNDARY_SEPARATION_SECONDS = 0.001;

export function getStudioProjectDuration(project: StudioProject): number {
    return project.groups.reduce((end, group) => {
        const groupEnd = group.projectStartSeconds + group.sourceOutSeconds - group.sourceInSeconds;
        return Number.isFinite(groupEnd) ? Math.max(end, groupEnd) : end;
    }, 0);
}

/** All raw, composite, metadata, export and upload views use this rate-one mapping. */
export function placeStudioClips(project: StudioProject): readonly StudioPlacedClip[] {
    return project.clips.flatMap((clip) => {
        const group = project.groups.find((candidate) => candidate.id === clip.groupId);
        if (!group) return [];
        const start = Math.max(group.sourceInSeconds, clip.groupOffsetSeconds);
        const end = Math.min(
            group.sourceOutSeconds,
            clip.groupOffsetSeconds + clip.sourceOutSeconds - clip.sourceInSeconds,
        );
        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            !Number.isFinite(group.projectStartSeconds) ||
            end <= start
        )
            return [];
        return [
            {
                ...clip,
                projectStartSeconds: group.projectStartSeconds + start - group.sourceInSeconds,
                projectEndSeconds: group.projectStartSeconds + end - group.sourceInSeconds,
                sourceStartSeconds: clip.sourceInSeconds + start - clip.groupOffsetSeconds,
            },
        ];
    });
}

export function getStudioClipAt(project: StudioProject, trackId: string, seconds: number): StudioPlacedClip | null {
    const matches = placeStudioClips(project).filter(
        (clip) => clip.trackId === trackId && seconds >= clip.projectStartSeconds && seconds < clip.projectEndSeconds,
    );
    // Invalid overlapping drafts remain editable, but no source wins their preview by array order.
    return matches.length === 1 ? matches[0] : null;
}

export function getStudioSceneAt(project: StudioProject, seconds: number): StudioScene | null {
    const groups = project.groups.filter(
        (candidate) =>
            seconds >= candidate.projectStartSeconds &&
            seconds < candidate.projectStartSeconds + candidate.sourceOutSeconds - candidate.sourceInSeconds,
    );
    if (groups.length !== 1) return null;
    const group = groups[0];
    const originalSeconds = seconds - group.projectStartSeconds + group.sourceInSeconds;
    return (
        project.scenes
            .filter((scene) => scene.groupId === group.id && scene.offsetSeconds <= originalSeconds)
            .sort((first, second) => second.offsetSeconds - first.offsetSeconds)[0] ?? null
    );
}

export function placeStudioScenes(project: StudioProject) {
    return project.groups.flatMap((group) => {
        const scenes = project.scenes
            .filter((scene) => scene.groupId === group.id)
            .sort((first, second) => first.offsetSeconds - second.offsetSeconds);
        return scenes.flatMap((scene, index) => {
            const start = Math.max(scene.offsetSeconds, group.sourceInSeconds);
            const end = Math.min(scenes[index + 1]?.offsetSeconds ?? group.durationSeconds, group.sourceOutSeconds);
            return end > start
                ? [
                      {
                          ...scene,
                          startSeconds: group.projectStartSeconds + start - group.sourceInSeconds,
                          endSeconds: group.projectStartSeconds + end - group.sourceInSeconds,
                      },
                  ]
                : [];
        });
    });
}

export function getStudioSceneBoundaryRange(project: StudioProject, sceneId: string): RecordingTrim | null {
    const scene = project.scenes.find((candidate) => candidate.id === sceneId);
    const group = project.groups.find((candidate) => candidate.id === scene?.groupId);
    if (!scene || !group) return null;
    const ordered = project.scenes
        .filter((candidate) => candidate.groupId === group.id)
        .sort((first, second) => first.offsetSeconds - second.offsetSeconds);
    const index = ordered.findIndex((candidate) => candidate.id === sceneId);
    const firstOffset = Math.max(
        group.sourceInSeconds,
        index > 0 ? ordered[index - 1].offsetSeconds + SCENE_BOUNDARY_SEPARATION_SECONDS : 0,
    );
    const lastOffset =
        Math.min(group.sourceOutSeconds, ordered[index + 1]?.offsetSeconds ?? group.sourceOutSeconds) -
        SCENE_BOUNDARY_SEPARATION_SECONDS;
    return lastOffset >= firstOffset
        ? {
              startSeconds: group.projectStartSeconds + firstOffset - group.sourceInSeconds,
              endSeconds: group.projectStartSeconds + lastOffset - group.sourceInSeconds,
          }
        : null;
}

/** Direct timeline edits retain source/scene identities and cannot cross a neighboring cut or linked part. */
export function moveStudioSceneBoundary(project: StudioProject, sceneId: string, seconds: number): StudioProject {
    const range = getStudioSceneBoundaryRange(project, sceneId);
    const scene = project.scenes.find((candidate) => candidate.id === sceneId);
    const group = project.groups.find((candidate) => candidate.id === scene?.groupId);
    if (!range || !scene || !group || !Number.isFinite(seconds)) return project;
    const offsetSeconds =
        Math.max(range.startSeconds, Math.min(range.endSeconds, seconds)) -
        group.projectStartSeconds +
        group.sourceInSeconds;
    return {
        ...project,
        scenes: project.scenes.map((candidate) =>
            candidate.id === sceneId ? { ...candidate, offsetSeconds } : candidate,
        ),
    };
}

export function getStudioAvailableRanges(project: StudioProject, assets: readonly StudioAsset[]) {
    const tracks = createStudioTimelineTracks(project, assets);
    const clips = placeStudioClips(project);
    return Object.fromEntries(
        project.tracks.map((track) => [
            track.id,
            clips
                .filter((clip) => clip.trackId === track.id)
                .flatMap((clip) => {
                    const asset = assets.find((candidate) => candidate.id === clip.assetId);
                    if (!asset) return [];
                    const playback = createStudioPlaybackTrack(
                        tracks.find((candidate) => candidate.id === track.id)!,
                        clip,
                        asset,
                    );
                    return getRecordingAvailableRanges(
                        playback,
                        asset.bounds.firstTimestampSeconds,
                        asset.bounds.endTimestampSeconds,
                        asset.bounds.availableStartTimestampSeconds,
                    );
                }),
        ]),
    );
}

export function createStudioTimelineTracks(
    project: StudioProject,
    assets: readonly StudioAsset[],
): readonly RecordingTrack[] {
    const placedClips = placeStudioClips(project);
    return project.tracks.map((track) => {
        const clips = placedClips.filter((clip) => clip.trackId === track.id);
        const asset = assets.find((candidate) => candidate.id === clips[0]?.assetId);
        return {
            id: track.id,
            label: track.label,
            kind: track.role === 'audio' ? 'microphone' : track.role === 'webcam' ? 'camera' : 'screen',
            mimeType: asset?.mimeType ?? '',
            byteLength: clips.reduce(
                (total, clip) => total + (assets.find((candidate) => candidate.id === clip.assetId)?.byteLength ?? 0),
                0,
            ),
            chunkCount: 0,
            startOffsetSeconds: 0,
            durationSeconds: getStudioProjectDuration(project),
            width: asset?.width ?? null,
            height: asset?.height ?? null,
            frameRate: asset?.frameRate ?? null,
            isAudioIncluded: clips.some(
                (clip) => assets.find((candidate) => candidate.id === clip.assetId)?.isAudioIncluded,
            ),
            segments: clips.map((clip) => ({
                sourceStartSeconds: clip.sourceStartSeconds,
                sessionStartSeconds: clip.projectStartSeconds,
                durationSeconds: clip.projectEndSeconds - clip.projectStartSeconds,
            })),
        };
    });
}

/** One file registered against a logical track in the existing shared transport. */
export function createStudioPlaybackTrack(
    track: RecordingTrack,
    clip: StudioPlacedClip,
    asset: StudioAsset,
): RecordingTrack {
    return {
        ...track,
        byteLength: asset.byteLength,
        kind: asset.kind === 'audio' ? 'microphone' : track.kind,
        isAudioIncluded: asset.isAudioIncluded,
        parts: undefined,
        segments: [
            {
                sourceStartSeconds: clip.sourceStartSeconds,
                sessionStartSeconds: clip.projectStartSeconds,
                durationSeconds: clip.projectEndSeconds - clip.projectStartSeconds,
            },
        ],
    };
}

export function assembleStudioGroups(project: StudioProject, groups: readonly StudioPartGroup[]): StudioProject {
    let projectStartSeconds = 0;
    const assembledGroups = groups.map((group) => {
        const assembled = { ...group, projectStartSeconds };
        projectStartSeconds += group.sourceOutSeconds - group.sourceInSeconds;
        return assembled;
    });
    const previousDuration = getStudioProjectDuration(project);
    const isFullSelection = project.selection.startSeconds === 0 && project.selection.endSeconds === previousDuration;
    return {
        ...project,
        groups: assembledGroups,
        selection: isFullSelection
            ? { startSeconds: 0, endSeconds: projectStartSeconds }
            : {
                  startSeconds: Math.min(project.selection.startSeconds, Math.max(0, projectStartSeconds - 0.001)),
                  endSeconds: Math.min(project.selection.endSeconds, projectStartSeconds),
              },
    };
}

export function splitStudioGroup(project: StudioProject, groupId: string, projectSeconds: number): StudioProject {
    const group = project.groups.find((candidate) => candidate.id === groupId);
    if (!group) throw new Error('Část není dostupná.');
    const splitSeconds = projectSeconds - group.projectStartSeconds + group.sourceInSeconds;
    if (splitSeconds <= group.sourceInSeconds || splitSeconds >= group.sourceOutSeconds)
        throw new Error('Řez musí být uvnitř části.');
    const nextGroupId = crypto.randomUUID();
    const newGroup = { ...group, id: nextGroupId, sourceInSeconds: splitSeconds, projectStartSeconds: projectSeconds };
    const groups = project.groups.flatMap((candidate) =>
        candidate.id === group.id ? [{ ...group, sourceOutSeconds: splitSeconds }, newGroup] : [candidate],
    );
    const clips = [
        ...project.clips,
        ...project.clips
            .filter((clip) => clip.groupId === group.id)
            .map((clip) => ({ ...clip, id: crypto.randomUUID(), groupId: nextGroupId })),
    ];
    const scenes = [
        ...project.scenes,
        ...project.scenes
            .filter((scene) => scene.groupId === group.id)
            .map((scene) => ({ ...scene, id: crypto.randomUUID(), groupId: nextGroupId })),
    ];
    return { ...project, groups, clips, scenes };
}

export function validateStudioProject(project: StudioProject): void {
    if (project.schemaVersion !== 1 || !project.id || !project.title.trim())
        throw new Error('Projekt potřebuje podporovanou verzi a název.');
    const duration = getStudioProjectDuration(project);
    const ids = [...project.tracks, ...project.groups, ...project.clips, ...project.scenes].map((value) => value.id);
    if (new Set(ids).size !== ids.length) throw new Error('Identifikátory projektu musí být jedinečné.');
    if (project.tracks.length > STUDIO_MAXIMUM_ACTIVE_TRACKS)
        throw new Error('Studio podporuje nejvýše osm souběžných stop.');
    for (const group of project.groups) {
        if (
            ![group.projectStartSeconds, group.durationSeconds, group.sourceInSeconds, group.sourceOutSeconds].every(
                Number.isFinite,
            ) ||
            group.projectStartSeconds < 0 ||
            group.sourceInSeconds < 0 ||
            group.sourceOutSeconds > group.durationSeconds ||
            group.sourceOutSeconds <= group.sourceInSeconds
        )
            throw new Error('Vyplňte platný společný IN/OUT části.');
    }
    for (const clip of project.clips) {
        if (
            !project.groups.some((group) => group.id === clip.groupId) ||
            !project.tracks.some((track) => track.id === clip.trackId) ||
            ![clip.groupOffsetSeconds, clip.sourceInSeconds, clip.sourceOutSeconds].every(Number.isFinite) ||
            clip.sourceInSeconds < 0 ||
            clip.sourceOutSeconds <= clip.sourceInSeconds
        )
            throw new Error('Klip potřebuje platný zdroj, stopu a časování.');
    }
    const sortedGroups = [...project.groups].sort(
        (first, second) => first.projectStartSeconds - second.projectStartSeconds,
    );
    for (let index = 1; index < sortedGroups.length; index += 1) {
        const previous = sortedGroups[index - 1];
        if (
            sortedGroups[index].projectStartSeconds <
            previous.projectStartSeconds +
                previous.sourceOutSeconds -
                previous.sourceInSeconds -
                TIMELINE_EPSILON_SECONDS
        )
            throw new Error('Propojené části se nesmí překrývat. Posuňte je nebo spojte zdroje v jedné části.');
    }
    for (const track of project.tracks) {
        if (!track.label.trim()) throw new Error('Každá logická stopa potřebuje název.');
        const clips = placeStudioClips(project)
            .filter((clip) => clip.trackId === track.id)
            .sort((first, second) => first.projectStartSeconds - second.projectStartSeconds);
        if (
            clips.some(
                (clip, index) =>
                    index > 0 &&
                    clip.projectStartSeconds < clips[index - 1].projectEndSeconds - TIMELINE_EPSILON_SECONDS,
            )
        )
            throw new Error(`Stopa „${track.label}“ má překryv. Studio vyžaduje jednoznačný zdroj v každém čase.`);
    }
    if (
        ![project.selection.startSeconds, project.selection.endSeconds].every(Number.isFinite) ||
        project.selection.startSeconds < 0 ||
        project.selection.endSeconds > duration ||
        (duration > 0 && project.selection.endSeconds <= project.selection.startSeconds)
    )
        throw new Error('Opravte společný výběr projektu.');
    for (const scene of project.scenes) {
        const group = project.groups.find((candidate) => candidate.id === scene.groupId);
        const { x, y, width, height } = scene.rectangle;
        if (
            !group ||
            !Number.isFinite(scene.offsetSeconds) ||
            scene.offsetSeconds < 0 ||
            scene.offsetSeconds >= group.durationSeconds ||
            ![x, y, width, height].every(Number.isFinite) ||
            x < 0 ||
            y < 0 ||
            width <= 0 ||
            height <= 0 ||
            x + width > 1.000001 ||
            y + height > 1.000001 ||
            [scene.backgroundTrackId, scene.overlayTrackId, scene.audioTrackId].some(
                (id) => id !== null && !project.tracks.some((track) => track.id === id),
            )
        )
            throw new Error('Opravte čas a normalizované rozložení scény.');
        if (
            project.scenes.some(
                (other) =>
                    other.id !== scene.id &&
                    other.groupId === scene.groupId &&
                    other.offsetSeconds === scene.offsetSeconds,
            )
        )
            throw new Error('Dvě scény nemohou začínat ve stejném čase části.');
    }
}

/** Pinned recording metadata is clipped and mapped through exactly the same group trim as its media. */
export function mapStudioProjectMetadata(project: StudioProject) {
    const placedClips = placeStudioClips(project);
    const derivedTracks: RecordingDerivedTrack[] = [];
    const events: { id: string; seconds: number; title: string; detail: string; type: string }[] = [];
    const activityIntervals: (RecordingTrim & { id: string; classification: string; isReviewed: boolean })[] = [];
    const commitAnchors: (RecordingWorkshopCommitAnchor &
        Pick<RecordingWorkshopMetadata, 'repository' | 'startingCommit'>)[] = [];
    const autoView: {
        groupId: string;
        sourceSelection: RecordingTrim;
        projectStartSeconds: number;
        projectEndSeconds: number;
        defaultScene: RecordingWorkshopMetadata['autoView']['defaultScene'];
        transitions: RecordingWorkshopMetadata['autoView']['transitions'];
        editorTrackId: string | null;
        applicationTrackId: string | null;
    }[] = [];
    const unavailable: string[] = [];
    for (const group of project.groups) {
        const snapshot = project.recordingSnapshots.find(
            (entry) => entry.recording.id === group.recordingId && entry.revision === group.recordingRevision,
        );
        if (!snapshot) {
            if (group.recordingId) unavailable.push(`${group.label}: připnutá metadata záznamu chybí`);
            continue;
        }
        const recording = snapshot.recording;
        const sourceSelection = {
            startSeconds: group.recordingSessionStartSeconds + group.sourceInSeconds,
            endSeconds: group.recordingSessionStartSeconds + group.sourceOutSeconds,
        };
        const mapPoint = (seconds: number) =>
            seconds >= sourceSelection.startSeconds && seconds < sourceSelection.endSeconds
                ? seconds - sourceSelection.startSeconds + group.projectStartSeconds
                : null;
        const mapRange = (range: RecordingTrim) => {
            const clipped = clipRecordingSessionRange(range, sourceSelection);
            return clipped
                ? {
                      startSeconds: clipped.startSeconds + group.projectStartSeconds,
                      endSeconds: clipped.endSeconds + group.projectStartSeconds,
                  }
                : null;
        };
        for (const track of recording.derivedTracks ?? []) {
            if (track.provenance.mediaRevision !== snapshot.revision) {
                unavailable.push(`${group.label}: odvozená stopa ${track.id} má jinou revizi`);
                continue;
            }
            const sourceClips = placedClips.filter(
                (clip) => clip.groupId === group.id && clip.originSourceId === track.provenance.sourceId,
            );
            if (!sourceClips.length || sourceClips.some((clip) => !Number.isFinite(clip.originGroupOffsetSeconds))) {
                unavailable.push(`${group.label}: odvozená stopa ${track.id} nemá připnuté mapování zdroje`);
                continue;
            }
            const mapDerivedRange = (range: RecordingTrim) =>
                sourceClips.flatMap((clip) => {
                    const recordingStart =
                        group.recordingSessionStartSeconds +
                        clip.originGroupOffsetSeconds! +
                        clip.sourceStartSeconds -
                        clip.sourceInSeconds;
                    const recordingEnd = recordingStart + clip.projectEndSeconds - clip.projectStartSeconds;
                    const clipped = clipRecordingSessionRange(range, {
                        startSeconds: recordingStart,
                        endSeconds: recordingEnd,
                    });
                    return clipped
                        ? [
                              {
                                  startSeconds: clipped.startSeconds + clip.projectStartSeconds,
                                  endSeconds: clipped.endSeconds + clip.projectStartSeconds,
                                  clipId: clip.id,
                              },
                          ]
                        : [];
                });
            if (track.kind === 'subtitles')
                derivedTracks.push({
                    ...track,
                    id: `${group.id}:${track.id}`,
                    cues: track.cues.flatMap((cue) => {
                        return mapDerivedRange(cue).map(({ clipId, ...range }) => ({
                            ...cue,
                            ...range,
                            id: `${group.id}:${clipId}:${cue.id}`,
                        }));
                    }),
                });
            else
                derivedTracks.push({
                    ...track,
                    id: `${group.id}:${track.id}`,
                    intervals: track.intervals.flatMap((interval) => {
                        return mapDerivedRange(interval).map(({ clipId, ...range }) => ({
                            ...interval,
                            ...range,
                            id: `${group.id}:${clipId}:${interval.id}`,
                        }));
                    }),
                });
        }
        const metadata = recording.workshopMetadata;
        if (!metadata) continue;
        if (metadata.sourceRevision !== snapshot.revision) {
            unavailable.push(`${group.label}: workshopová metadata mají jinou revizi`);
            continue;
        }
        for (const event of metadata.events) {
            const seconds = mapPoint(event.seconds);
            if (seconds !== null) events.push({ ...event, id: `${group.id}:${event.id}`, seconds });
        }
        for (const interval of metadata.activityIntervals) {
            const range = mapRange(interval);
            if (range) activityIntervals.push({ ...interval, ...range, id: `${group.id}:${interval.id}` });
        }
        for (const anchor of metadata.commitAnchors) {
            const seconds = mapPoint(anchor.seconds);
            if (seconds !== null)
                commitAnchors.push({
                    ...anchor,
                    id: `${group.id}:${anchor.id}`,
                    seconds,
                    repository: metadata.repository,
                    startingCommit: metadata.startingCommit,
                });
        }
        const mapSource = (sourceId: string | null) => {
            if (!sourceId) return null;
            const trackIds = new Set(
                placedClips
                    .filter((clip) => clip.groupId === group.id && clip.originSourceId === sourceId)
                    .map((clip) => clip.trackId),
            );
            if (trackIds.size !== 1) {
                unavailable.push(`${group.label}: Auto-view zdroj ${sourceId} nemá jednoznačnou logickou stopu`);
                return null;
            }
            return Array.from(trackIds)[0];
        };
        // Preserve source references/provenance when logical roles cannot be established; never guess from names.
        const priorTransition = [...metadata.autoView.transitions]
            .filter((transition) => transition.seconds <= sourceSelection.startSeconds)
            .sort((first, second) => second.seconds - first.seconds)[0];
        autoView.push({
            groupId: group.id,
            sourceSelection,
            projectStartSeconds: group.projectStartSeconds,
            projectEndSeconds: group.projectStartSeconds + group.sourceOutSeconds - group.sourceInSeconds,
            defaultScene: priorTransition?.scene ?? metadata.autoView.defaultScene,
            transitions: metadata.autoView.transitions.flatMap((transition) => {
                const seconds = mapPoint(transition.seconds);
                return seconds === null ? [] : [{ ...transition, seconds }];
            }),
            editorTrackId: mapSource(metadata.autoView.editorSourceId),
            applicationTrackId: mapSource(metadata.autoView.applicationSourceId),
        });
    }
    return { derivedTracks, events, activityIntervals, commitAnchors, autoView, unavailable };
}
