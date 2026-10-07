import type { StudioAsset, StudioProject } from './studioProjectTypes';
import {
    mapStudioProjectMetadata,
    placeStudioClips,
    placeStudioScenes,
    validateStudioProject,
} from './studioProjectTimeline';
import { clipRecordingSessionRange } from './recordingStudioSessionTime';
import { clipRecordingDerivedTrack } from './recordingStudioDerived';

function stripStudioAddressSecrets(url: string) {
    const address = new URL(url);
    const isRelinkRequired = Boolean(address.search || address.hash);
    address.search = '';
    address.hash = '';
    address.username = '';
    address.password = '';
    return { url: address.href, isRelinkRequired };
}
function portableStudioLocation(location: StudioAsset['location']) {
    if (location.kind === 'file') return { kind: 'file', identity: location.identity, isRelinkRequired: true };
    if (location.kind === 'https') return { kind: 'https', ...stripStudioAddressSecrets(location.url) };
    return location;
}
/** Credentials, object URLs and filesystem permission claims never enter a portable recipe. */
export function createStudioProjectRecipe(project: StudioProject, assets: readonly StudioAsset[]) {
    validateStudioProject(project);
    const metadata = mapStudioProjectMetadata(project);
    const assetIds = new Set(project.clips.map((clip) => clip.assetId));
    const preparedClips = placeStudioClips(project).flatMap((clip) => {
        const clipped = clipRecordingSessionRange(
            { startSeconds: clip.projectStartSeconds, endSeconds: clip.projectEndSeconds },
            project.selection,
        );
        if (!clipped) return [];
        return [
            {
                ...clip,
                sourceStartSeconds:
                    clip.sourceStartSeconds + Math.max(0, project.selection.startSeconds - clip.projectStartSeconds),
                preparedStartSeconds: clipped.startSeconds,
                preparedEndSeconds: clipped.endSeconds,
            },
        ];
    });
    const clipScenes = placeStudioScenes(project).flatMap((scene) => {
        const clipped = clipRecordingSessionRange(scene, project.selection);
        return clipped
            ? [{ ...scene, projectStartSeconds: scene.startSeconds, projectEndSeconds: scene.endSeconds, ...clipped }]
            : [];
    });
    return {
        schemaVersion: 1,
        type: 'promptbook-studio-project',
        timeUnit: 'seconds',
        project,
        sources: assets
            .filter((asset) => assetIds.has(asset.id))
            .map((asset) => ({
                ...asset,
                original: portableStudioLocation(asset.original),
                location: portableStudioLocation(asset.location),
            })),
        projectMetadata: metadata,
        prepared: {
            timeZeroProjectSeconds: project.selection.startSeconds,
            clips: preparedClips,
            scenes: clipScenes,
            derivedTracks: metadata.derivedTracks.map((track) => clipRecordingDerivedTrack(track, project.selection)),
            events: metadata.events
                .filter(
                    (event) =>
                        event.seconds >= project.selection.startSeconds && event.seconds < project.selection.endSeconds,
                )
                .map((event) => ({ ...event, seconds: event.seconds - project.selection.startSeconds })),
            activityIntervals: metadata.activityIntervals.flatMap((interval) => {
                const clipped = clipRecordingSessionRange(interval, project.selection);
                return clipped ? [{ ...interval, ...clipped }] : [];
            }),
            commitAnchors: metadata.commitAnchors
                .filter(
                    (anchor) =>
                        anchor.seconds >= project.selection.startSeconds &&
                        anchor.seconds < project.selection.endSeconds,
                )
                .map((anchor) => ({ ...anchor, seconds: anchor.seconds - project.selection.startSeconds })),
            autoView: metadata.autoView.flatMap((view) => {
                const clipped = clipRecordingSessionRange(
                    { startSeconds: view.projectStartSeconds, endSeconds: view.projectEndSeconds },
                    project.selection,
                );
                if (!clipped) return [];
                const startSeconds = Math.max(view.projectStartSeconds, project.selection.startSeconds);
                const prior = [...view.transitions]
                    .filter((transition) => transition.seconds <= startSeconds)
                    .sort((first, second) => second.seconds - first.seconds)[0];
                return [
                    {
                        ...view,
                        preparedStartSeconds: clipped.startSeconds,
                        preparedEndSeconds: clipped.endSeconds,
                        defaultScene: prior?.scene ?? view.defaultScene,
                        transitions: view.transitions
                            .filter(
                                (transition) =>
                                    transition.seconds >= startSeconds &&
                                    transition.seconds < Math.min(view.projectEndSeconds, project.selection.endSeconds),
                            )
                            .map((transition) => ({
                                ...transition,
                                seconds: transition.seconds - project.selection.startSeconds,
                            })),
                    },
                ];
            }),
        },
        privacy:
            'Private derived subtitles remain administrative metadata. Uploading media does not publish a workshop.',
    };
}

export function downloadStudioProjectRecipe(project: StudioProject, assets: readonly StudioAsset[]) {
    const blob = new Blob([JSON.stringify(createStudioProjectRecipe(project, assets), null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `studio-${project.id}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
