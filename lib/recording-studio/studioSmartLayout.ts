import { VideoSampleSink } from 'mediabunny';
import { createStudioRangeInput, readStudioLocalRangeSource } from './studioMediaSource';
import { STUDIO_CAMERA_RECTANGLE } from './studioComposition';
import { getStudioClipAt, placeStudioClips } from './studioProjectTimeline';
import type { StudioAsset, StudioProject, StudioScene } from './studioProjectTypes';

/** Regenerates only scene metadata. Clips, original media and linked edits never change. */
export function createStudioSmartLayout(project: StudioProject, screenStarts: ReadonlyMap<string, number> = new Map()): StudioProject {
    const camera = project.tracks.find((track) => track.role === 'webcam');
    const screens = project.tracks.filter((track) => ['editor', 'application'].includes(track.role));
    const clips = placeStudioClips(project);
    const scenes: StudioScene[] = [];
    for (const group of project.groups) {
        const end = group.projectStartSeconds + group.sourceOutSeconds - group.sourceInSeconds;
        const groupClips = clips.filter((clip) => clip.groupId === group.id);
        const boundaries = new Set([group.projectStartSeconds, ...groupClips.filter((clip) => screens.some((track) => track.id === clip.trackId)).flatMap((clip) => [clip.projectStartSeconds, clip.projectEndSeconds])]);
        const suggested = screenStarts.get(group.id);
        if (suggested !== undefined) boundaries.add(suggested);
        let previous: string | null = null;
        for (const seconds of Array.from(boundaries).sort((a, b) => a - b)) {
            if (seconds >= end || seconds < group.projectStartSeconds) continue;
            const screen = suggested !== undefined && seconds < suggested ? undefined : screens.find((track) => groupClips.some((clip) => clip.trackId === track.id && seconds >= clip.projectStartSeconds && seconds < clip.projectEndSeconds));
            const cameraId = camera?.id ?? project.tracks.find((track) => track.role !== 'audio')?.id ?? null;
            const backgroundTrackId = screen?.id ?? cameraId;
            const overlayTrackId = screen && camera ? camera.id : null;
            const key = `${backgroundTrackId}:${overlayTrackId}`;
            if (key === previous) continue;
            previous = key;
            const audioTrackId = project.scenes.find((scene) => scene.groupId === group.id)?.audioTrackId ?? project.tracks.find((track) => track.role === 'audio')?.id ?? cameraId;
            scenes.push({ id: crypto.randomUUID(), groupId: group.id, offsetSeconds: seconds - group.projectStartSeconds + group.sourceInSeconds,
                backgroundTrackId, overlayTrackId, audioTrackId, mask: 'circle', fit: screen ? 'contain' : 'cover', overlayFit: 'cover', rectangle: STUDIO_CAMERA_RECTANGLE });
        }
    }
    return { ...project, scenes };
}

/** A bounded local visual heuristic: sustained departure from the first screen frame suggests showing begins. */
export async function suggestStudioScreenStarts(project: StudioProject, assets: readonly StudioAsset[], signal: AbortSignal): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    const screen = project.tracks.find((track) => track.role === 'editor' || track.role === 'application');
    if (!screen || !project.tracks.some((track) => track.role === 'webcam')) return result;
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    for (const group of project.groups) {
        const clip = placeStudioClips(project).find((item) => item.groupId === group.id && item.trackId === screen.id);
        if (!clip) continue;
        const asset = assets.find((item) => item.id === clip.assetId);
        if (!asset || asset.original.kind === 'https') continue;
        const input = createStudioRangeInput(await readStudioLocalRangeSource(asset), signal);
        try {
            const video = await input.getPrimaryVideoTrack();
            if (!video || !await video.canDecode()) continue;
            const sink = new VideoSampleSink(video);
            let baseline: Uint8ClampedArray | null = null, candidate: number | null = null;
            // At most 120 small frames per group. No microphone or network transcription is involved.
            const end = Math.min(clip.projectEndSeconds, clip.projectStartSeconds + 120);
            for (let seconds = clip.projectStartSeconds; seconds < end; seconds += 1) {
                signal.throwIfAborted();
                if (getStudioClipAt(project, screen.id, seconds)?.id !== clip.id) break;
                const sample = await sink.getSample(asset.bounds.firstTimestampSeconds + clip.sourceStartSeconds + seconds - clip.projectStartSeconds);
                if (!sample) continue;
                try { context.drawImage(sample.toCanvasImageSource(), 0, 0, 64, 36); }
                finally { sample.close(); }
                const pixels = context.getImageData(0, 0, 64, 36).data;
                if (!baseline) { baseline = pixels; continue; }
                let difference = 0;
                for (let index = 0; index < pixels.length; index += 4) difference += Math.abs(pixels[index] - baseline[index]) + Math.abs(pixels[index + 1] - baseline[index + 1]) + Math.abs(pixels[index + 2] - baseline[index + 2]);
                if (difference / (64 * 36 * 3 * 255) > 0.06) {
                    if (candidate !== null) { result.set(group.id, candidate); break; }
                    candidate = seconds;
                } else candidate = null;
            }
            // When activity cannot be inferred, keep camera until the user places the transition explicitly.
            if (!result.has(group.id)) result.set(group.id, clip.projectStartSeconds > group.projectStartSeconds ? clip.projectStartSeconds : clip.projectEndSeconds);
        } finally { input.dispose(); }
    }
    return result;
}
