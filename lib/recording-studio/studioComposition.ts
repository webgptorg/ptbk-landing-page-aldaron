import type { StudioProject, StudioScene } from './studioProjectTypes';
import { getStudioSceneAt, placeStudioScenes } from './studioProjectTimeline';

export const DEFAULT_STUDIO_TRANSITION = { type: 'smooth', durationSeconds: 0.7 } as const;
export const STUDIO_CAMERA_RECTANGLE = { x: 0.78, y: 0.60, width: 0.20, height: 0.3555555556 };
const FULL_FRAME = { x: 0, y: 0, width: 1, height: 1 };
export type StudioCompositionLayer = {
    readonly trackId: string;
    readonly rectangle: StudioScene['rectangle'];
    readonly fit: StudioScene['fit'];
    readonly roundness: number;
    readonly opacity: number;
    readonly blendGroup?: 'previous' | 'next';
};
export type StudioCompositionFrame = { readonly image: CanvasImageSource; readonly width: number; readonly height: number };

function sceneLayers(scene: StudioScene | null): StudioCompositionLayer[] {
    if (!scene) return [];
    const layers: StudioCompositionLayer[] = [];
    if (scene.backgroundTrackId) layers.push({ trackId: scene.backgroundTrackId, rectangle: FULL_FRAME, fit: scene.fit, roundness: 0, opacity: 1 });
    if (scene.overlayTrackId && scene.overlayTrackId !== scene.backgroundTrackId) {
        let rectangle = scene.rectangle;
        if (scene.mask === 'circle' && Math.abs(rectangle.width * 16 / 9 - rectangle.height) > 0.000000001) {
            const height = Math.min(rectangle.width * 16 / 9, rectangle.height), width = height * 9 / 16;
            rectangle = { x: rectangle.x + (rectangle.width - width) / 2, y: rectangle.y + (rectangle.height - height) / 2, width, height };
        }
        layers.push({ trackId: scene.overlayTrackId, rectangle, fit: scene.overlayFit, roundness: scene.mask === 'circle' ? 1 : 0, opacity: 1 });
    }
    return layers;
}

/** Frame geometry is shared by the live preview and deterministic, locally encoded output. */
export function getStudioCompositionLayers(project: StudioProject, seconds: number): StudioCompositionLayer[] {
    const scene = getStudioSceneAt(project, seconds);
    const next = sceneLayers(scene);
    const transition = project.transition ?? DEFAULT_STUDIO_TRANSITION;
    const placed = scene ? placeStudioScenes(project).find((item) => item.id === scene.id && seconds >= item.startSeconds && seconds < item.endSeconds) : null;
    if (!placed || transition.type === 'cut' || transition.durationSeconds <= 0) return next;
    // A source trim does not replay a transition which already happened in the removed material.
    const group = project.groups.find((item) => item.id === placed.groupId)!;
    const boundary = group.projectStartSeconds + scene!.offsetSeconds - group.sourceInSeconds;
    const duration = Math.min(Number.isFinite(transition.durationSeconds) ? Math.max(0.1, transition.durationSeconds) : DEFAULT_STUDIO_TRANSITION.durationSeconds, placed.endSeconds - boundary);
    if (boundary < placed.startSeconds || seconds >= boundary + duration || boundary <= 0) return next;
    const previous = sceneLayers(getStudioSceneAt(project, boundary - 0.000001));
    if (!previous.length) return next;
    const progress = Math.max(0, Math.min(1, (seconds - boundary) / duration));
    const eased = progress * progress * (3 - 2 * progress);
    if (transition.type === 'fade') return [...previous.map((layer) => ({ ...layer, opacity: 1 - eased, blendGroup: 'previous' as const })), ...next.map((layer) => ({ ...layer, opacity: eased, blendGroup: 'next' as const }))];
    const order = Array.from(new Set([...next.map((layer) => layer.trackId), ...previous.map((layer) => layer.trackId)]));
    const overlays = new Set([...previous.slice(1), ...next.slice(1)].map((layer) => layer.trackId));
    order.sort((a, b) => Number(overlays.has(a)) - Number(overlays.has(b)));
    const isMorphing = previous.some((from) => next.some((to) => from.trackId === to.trackId && JSON.stringify(from.rectangle) !== JSON.stringify(to.rectangle)));
    const interpolate = (a: number, b: number) => a + (b - a) * eased;
    return order.map((trackId) => {
        const from = previous.find((layer) => layer.trackId === trackId);
        const to = next.find((layer) => layer.trackId === trackId);
        if (!from || !to) {
            const layer = (to ?? from)!;
            // A shrinking camera reveals an already opaque screen; the reverse keeps that screen behind it.
            return { ...layer, opacity: isMorphing && !overlays.has(trackId) ? 1 : to ? eased : 1 - eased };
        }
        return { ...to, fit: from.fit === 'cover' || to.fit === 'cover' ? 'cover' : 'contain', roundness: interpolate(from.roundness, to.roundness),
            rectangle: { x: interpolate(from.rectangle.x, to.rectangle.x), y: interpolate(from.rectangle.y, to.rectangle.y), width: interpolate(from.rectangle.width, to.rectangle.width), height: interpolate(from.rectangle.height, to.rectangle.height) } };
    });
}

type DrawingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
const FADE_SURFACES = new WeakMap<DrawingContext, readonly [OffscreenCanvas, OffscreenCanvas]>();

function drawLayers(context: DrawingContext, width: number, height: number, layers: readonly StudioCompositionLayer[], frames: ReadonlyMap<string, StudioCompositionFrame>): void {
    context.fillStyle = '#020617';
    context.fillRect(0, 0, width, height);
    for (const layer of layers) {
        const frame = frames.get(layer.trackId);
        if (!frame || !frame.width || !frame.height || layer.opacity <= 0) continue;
        const x = layer.rectangle.x * width, y = layer.rectangle.y * height;
        const w = layer.rectangle.width * width, h = layer.rectangle.height * height;
        if (![x, y, w, h, layer.opacity, layer.roundness].every(Number.isFinite) || w <= 0 || h <= 0) continue;
        context.save();
        context.globalAlpha = layer.opacity;
        context.beginPath();
        context.roundRect(x, y, w, h, layer.roundness * Math.min(w, h) / 2);
        context.clip();
        const scale = layer.fit === 'cover' ? Math.max(w / frame.width, h / frame.height) : Math.min(w / frame.width, h / frame.height);
        context.drawImage(frame.image, x + (w - frame.width * scale) / 2, y + (h - frame.height * scale) / 2, frame.width * scale, frame.height * scale);
        context.restore();
    }
}

export function drawStudioComposition(context: DrawingContext, width: number, height: number,
    project: StudioProject, seconds: number, frames: ReadonlyMap<string, StudioCompositionFrame>): void {
    const layers = getStudioCompositionLayers(project, seconds);
    if (!layers.some((layer) => layer.blendGroup)) { drawLayers(context, width, height, layers, frames); return; }
    let surfaces = FADE_SURFACES.get(context);
    if (!surfaces || surfaces[0].width !== width || surfaces[0].height !== height) {
        surfaces = [new OffscreenCanvas(width, height), new OffscreenCanvas(width, height)]; FADE_SURFACES.set(context, surfaces);
    }
    // Composite each complete scene first. Per-layer fades would darken the picture and double-blend overlays.
    for (const [index, group] of Array.from((['previous', 'next'] as const).entries()))
        drawLayers(surfaces[index].getContext('2d')!, width, height, layers.filter((layer) => layer.blendGroup === group).map((layer) => ({ ...layer, opacity: 1 })), frames);
    context.drawImage(surfaces[0], 0, 0);
    context.save(); context.globalAlpha = layers.find((layer) => layer.blendGroup === 'next')?.opacity ?? 0;
    context.drawImage(surfaces[1], 0, 0); context.restore();
}
