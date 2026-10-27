'use client';

import type { StudioProject } from '@/lib/recording-studio/studioProjectTypes';
import { getStudioClipAt, getStudioSceneAt } from '@/lib/recording-studio/studioProjectTimeline';
import type { RecordingTransportSnapshot } from '@/lib/recording-studio/RecordingStudioTransport';
import { useEffect, useRef } from 'react';

import { drawStudioComposition, type StudioCompositionFrame } from '@/lib/recording-studio/studioComposition';

const PREVIEW_WIDTH = 960;
const PREVIEW_HEIGHT = 540;

/** Draws the very same raw decoders. Composition never starts a second player or duplicates audio. */
export function StudioCompositePreview({
    project,
    snapshot,
    media,
}: {
    readonly project: StudioProject;
    readonly snapshot: RecordingTransportSnapshot;
    readonly media: Map<string, HTMLMediaElement>;
}) {
    const canvasReference = useRef<HTMLCanvasElement>(null);
    const current = useRef({ project, snapshot });
    current.current = { project, snapshot };
    useEffect(() => {
        let frame = 0;
        let isDisposed = false;
        const draw = () => {
            if (isDisposed) return;
            const canvas = canvasReference.current;
            const context = canvas?.getContext('2d');
            if (context) {
                context.fillStyle = '#020617';
                context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
                const { project: currentProject, snapshot: currentSnapshot } = current.current;
                const frames = new Map<string, StudioCompositionFrame>();
                for (const [trackId, source] of Array.from(media)) {
                    const clip = getStudioClipAt(currentProject, trackId, currentSnapshot.seconds);
                    if (clip && source instanceof HTMLVideoElement && source.dataset.clipId === clip.id && currentSnapshot.sources[trackId] === 'ready' && !source.seeking && source.readyState >= 2)
                        frames.set(trackId, { image: source, width: source.videoWidth, height: source.videoHeight });
                }
                drawStudioComposition(context, PREVIEW_WIDTH, PREVIEW_HEIGHT, currentProject, currentSnapshot.seconds, frames);
            }
            frame = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            isDisposed = true;
            cancelAnimationFrame(frame);
        };
    }, [media]);
    return (
        <section className="mx-auto w-full max-w-4xl" aria-label="Kompozitní náhled">
            <canvas
                ref={canvasReference}
                width={PREVIEW_WIDTH}
                height={PREVIEW_HEIGHT}
                className="aspect-video w-full rounded-xl bg-slate-950"
                aria-label="Náhled uložené kompozice"
                data-scene-id={getStudioSceneAt(project, snapshot.seconds)?.id ?? ''}
            />

        </section>
    );
}
