'use client';

import type { StudioProject, StudioScene } from '@/lib/recording-studio/studioProjectTypes';
import { getStudioClipAt, getStudioSceneAt } from '@/lib/recording-studio/studioProjectTimeline';
import type { RecordingTransportSnapshot } from '@/lib/recording-studio/RecordingStudioTransport';
import { useEffect, useRef } from 'react';

const PREVIEW_WIDTH = 960;
const PREVIEW_HEIGHT = 540;

function drawStudioFrame(
    context: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    rectangle: { x: number; y: number; width: number; height: number },
    fit: StudioScene['fit'],
    isCircular: boolean,
) {
    if (!video.videoWidth || !video.videoHeight) return;
    const x = rectangle.x * PREVIEW_WIDTH;
    const y = rectangle.y * PREVIEW_HEIGHT;
    const width = rectangle.width * PREVIEW_WIDTH;
    const height = rectangle.height * PREVIEW_HEIGHT;
    context.save();
    context.beginPath();
    if (isCircular) context.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    else context.rect(x, y, width, height);
    context.clip();
    const scale =
        fit === 'cover'
            ? Math.max(width / video.videoWidth, height / video.videoHeight)
            : Math.min(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    context.drawImage(video, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
    context.restore();
}

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
                const scene = getStudioSceneAt(currentProject, currentSnapshot.seconds);
                const drawTrack = (
                    trackId: string | null,
                    rectangle: StudioScene['rectangle'],
                    fit: StudioScene['fit'],
                    isCircular: boolean,
                ) => {
                    const source = trackId ? media.get(trackId) : undefined;
                    const clip = trackId ? getStudioClipAt(currentProject, trackId, currentSnapshot.seconds) : null;
                    if (
                        clip &&
                        source instanceof HTMLVideoElement &&
                        source.dataset.clipId === clip.id &&
                        currentSnapshot.sources[trackId!] === 'ready' &&
                        !source.seeking &&
                        source.readyState >= 2
                    ) {
                        try {
                            drawStudioFrame(context, source, rectangle, fit, isCircular);
                        } catch {
                            /* A lost decoder leaves a black gap, never its old frame. */
                        }
                    }
                };
                if (scene) {
                    drawTrack(scene.backgroundTrackId, { x: 0, y: 0, width: 1, height: 1 }, scene.fit, false);
                    if (scene.overlayTrackId !== scene.backgroundTrackId)
                        drawTrack(scene.overlayTrackId, scene.rectangle, scene.overlayFit, scene.mask === 'circle');
                }
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
        <section className="space-y-2" aria-label="Kompozitní náhled">
            <h3 className="font-semibold">Výsledný workshop</h3>
            <canvas
                ref={canvasReference}
                width={PREVIEW_WIDTH}
                height={PREVIEW_HEIGHT}
                className="aspect-video w-full rounded-xl bg-slate-950"
                aria-label="Náhled uložené kompozice"
                data-scene-id={getStudioSceneAt(project, snapshot.seconds)?.id ?? ''}
            />
            <p className="text-xs text-slate-600">
                Náhled čte uloženou kompozici a stejné dekodéry jako surové stopy. Chybějící nebo čekající obraz zůstává
                prázdný.
            </p>
        </section>
    );
}
