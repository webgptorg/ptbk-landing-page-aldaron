'use client';

import { useEffect, useState } from 'react';
import { readRecordingMediaArtwork, type RecordingMediaArtwork } from '@/lib/recording-studio/recordingStudioMedia';
import { createStudioRangeInput, readStudioLocalRangeSource } from '@/lib/recording-studio/studioMediaSource';
import { placeStudioClips } from '@/lib/recording-studio/studioProjectTimeline';
import type { StudioAsset, StudioProject } from '@/lib/recording-studio/studioProjectTypes';

/** Bounded sparse artwork keeps the familiar source timeline without collecting original videos in memory. */
export function useStudioProjectArtwork(project: StudioProject, assets: readonly StudioAsset[]) {
    const [artwork, setArtwork] = useState<Record<string, RecordingMediaArtwork>>({});
    const clips = placeStudioClips(project);
    const key = JSON.stringify(clips.map(({ id, assetId, trackId, projectStartSeconds, projectEndSeconds, sourceStartSeconds }) => ({ id, assetId, trackId, projectStartSeconds, projectEndSeconds, sourceStartSeconds })));
    useEffect(() => {
        const controller = new AbortController();
        const result: Record<string, RecordingMediaArtwork> = {};
        setArtwork({});
        void (async () => {
            const cache = new Map<string, RecordingMediaArtwork>();
            for (const clip of clips) {
                if (controller.signal.aborted) return;
                const asset = assets.find((item) => item.id === clip.assetId);
                if (!asset || asset.original.kind === 'https') continue;
                try {
                    let source = cache.get(asset.id);
                    if (!source) {
                        const input = createStudioRangeInput(await readStudioLocalRangeSource(asset), controller.signal);
                        try { source = await readRecordingMediaArtwork(input, asset.bounds, controller.signal); cache.set(asset.id, source); }
                        finally { input.dispose(); }
                    }
                    const current = result[clip.trackId] ?? { thumbnails: [], peaks: [] };
                    const map = <Value extends { seconds: number },>(items: readonly Value[]) => items.flatMap((item) => {
                        const seconds = item.seconds - clip.sourceStartSeconds + clip.projectStartSeconds;
                        return seconds >= clip.projectStartSeconds && seconds < clip.projectEndSeconds ? [{ ...item, seconds }] : [];
                    });
                    result[clip.trackId] = { thumbnails: [...current.thumbnails, ...map(source.thumbnails)], peaks: [...current.peaks, ...map(source.peaks)] };
                    if (!controller.signal.aborted) setArtwork({ ...result });
                } catch { /* Artwork is optional; the transport reports actual source errors separately. */ }
            }
        })();
        return () => controller.abort();
        // Geometry, titles and transient playback do not restart source decoding.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, assets]);
    return artwork;
}
