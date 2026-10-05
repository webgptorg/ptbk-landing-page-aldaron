import { createStudioScene } from './studioProjectStorage';
import { getStudioProjectDuration } from './studioProjectTimeline';
import {
    STUDIO_MAXIMUM_ACTIVE_TRACKS,
    type StudioAsset,
    type StudioLogicalTrack,
    type StudioProject,
} from './studioProjectTypes';

/** Files never imply synchronization. A source is either a new part or explicitly aligned inside a chosen part. */
export function addStudioExternalAsset(
    project: StudioProject,
    asset: StudioAsset,
    groupId: string | null,
    logicalTrackId: string | null,
    offsetSeconds: number,
): StudioProject {
    const duration = asset.bounds.endTimestampSeconds - asset.bounds.firstTimestampSeconds;
    let track = project.tracks.find((candidate) => candidate.id === logicalTrackId);
    if (!track)
        track = { id: crypto.randomUUID(), label: asset.label, role: asset.kind === 'audio' ? 'audio' : 'additional' };
    const tracks: readonly StudioLogicalTrack[] = project.tracks.some((candidate) => candidate.id === track!.id)
        ? project.tracks
        : [...project.tracks, track];
    if (tracks.length > STUDIO_MAXIMUM_ACTIVE_TRACKS)
        throw new Error('Projekt podporuje nejvýše osm souběžných stop. Vyberte existující logickou stopu.');
    if (!Number.isFinite(offsetSeconds)) throw new Error('Vyplňte platný ruční posun zdroje v sekundách.');
    let group = project.groups.find((candidate) => candidate.id === groupId);
    const isNewGroup = !group;
    if (!group)
        group = {
            id: crypto.randomUUID(),
            label: asset.label,
            projectStartSeconds: getStudioProjectDuration(project),
            durationSeconds: duration,
            sourceInSeconds: 0,
            sourceOutSeconds: duration,
            recordingId: null,
            recordingRevision: null,
            recordingSessionStartSeconds: 0,
            isInterrupted: false,
        };
    const clip = {
        id: crypto.randomUUID(),
        groupId: group.id,
        assetId: asset.id,
        trackId: track.id,
        originSourceId: null,
        groupOffsetSeconds: offsetSeconds,
        sourceInSeconds: 0,
        sourceOutSeconds: duration,
    };
    const scene = createStudioScene(group.id, tracks);
    const scenes = isNewGroup
        ? [
              ...project.scenes,
              {
                  ...scene,
                  backgroundTrackId: asset.kind === 'video' ? track.id : null,
                  overlayTrackId: null,
                  audioTrackId: asset.isAudioIncluded ? track.id : null,
              },
          ]
        : project.scenes;
    const result = {
        ...project,
        tracks,
        groups: isNewGroup ? [...project.groups, group] : project.groups,
        clips: [...project.clips, clip],
        scenes,
    };
    return project.selection.startSeconds === 0 && project.selection.endSeconds === getStudioProjectDuration(project)
        ? { ...result, selection: { startSeconds: 0, endSeconds: getStudioProjectDuration(result) } }
        : result;
}
