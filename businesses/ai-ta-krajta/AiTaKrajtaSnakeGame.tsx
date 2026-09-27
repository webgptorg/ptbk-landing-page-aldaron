'use client';

import {
    advanceSnakeState,
    createSnakeState,
    resizeSnakeState,
    type SnakeBounds,
    type SnakePoint,
    type SnakeState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import {
    AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME,
    getAiTaKrajtaMarkFrameScale,
    getAiTaKrajtaMarkPointFromFrame,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeArtworkRenderer } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';

/**
 * Where an eye sits on the head and how big it is, in units of the view box of the mark
 */
const EYE_FORWARD_OFFSET = 3;
const EYE_SIDEWAYS_OFFSET = 3.4;
const EYE_HALF_WIDTH = 2.1;
const PUPIL_FORWARD_OFFSET = 0.74;
const PUPIL_HALF_WIDTH = 1;

/**
 * Radius of one token and of the glow around it, in pixels
 */
const FOOD_RADIUS_IN_PIXELS = 6;
const FOOD_GLOW_RADIUS_IN_PIXELS = 14;

/**
 * Speed, eyes and food ease in; the artwork itself has no timed transition.
 */
const LOGO_RELEASE_DURATION_IN_MILLISECONDS = 700;

/**
 * Restricts an animation progress to its meaningful range
 */
function clampProgress(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * How far the game has accelerated, independently of the artwork's geometry
 */
function getLogoReleaseProgress(elapsedInMilliseconds: number): number {
    return clampProgress(
        elapsedInMilliseconds / LOGO_RELEASE_DURATION_IN_MILLISECONDS,
    );
}

/**
 * Draws the tokens lying on the field
 */
function drawFood(context: CanvasRenderingContext2D, state: SnakeState, opacity: number): void {
    if (opacity <= 0) {
        return;
    }

    context.save();

    for (const food of state.food) {
        const color = food.isWarm ? AI_TA_KRAJTA_COLORS.CORAL : AI_TA_KRAJTA_COLORS.INDIGO;

        context.globalAlpha = opacity * 0.22;
        context.fillStyle = color;
        context.beginPath();
        context.arc(food.position.x, food.position.y, FOOD_GLOW_RADIUS_IN_PIXELS, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(food.position.x, food.position.y, FOOD_RADIUS_IN_PIXELS, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();
}

/** Eyes share the moving SVG so food can stay behind the body without an extra full-size canvas. */
function createEyesRenderer(mark: SVGSVGElement) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('opacity', '0');
    for (const side of [-1, 1]) {
        for (const isPupil of [false, true]) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(EYE_FORWARD_OFFSET + (isPupil ? PUPIL_FORWARD_OFFSET : 0)));
            circle.setAttribute('cy', String(EYE_SIDEWAYS_OFFSET * side));
            circle.setAttribute('r', String(isPupil ? PUPIL_HALF_WIDTH : EYE_HALF_WIDTH));
            circle.setAttribute('fill', isPupil ? AI_TA_KRAJTA_COLORS.MOSS_DEEP : '#ffffff');
            group.appendChild(circle);
        }
    }
    mark.appendChild(group);
    return {
        draw(state: SnakeState, frame: AiTaKrajtaMarkFrame, opacity: number, artworkScale: number) {
            const headPosition = getAiTaKrajtaMarkPointFromFrame(state.headPosition, frame);
            group.setAttribute('opacity', String(opacity));
            group.setAttribute('transform',
                `translate(${headPosition.x} ${headPosition.y}) rotate(${state.headAngleInRadians * 180 / Math.PI}) scale(${artworkScale})`,
            );
        },
        remove() { group.remove(); },
    };
}
/** Measures both elements in the same CSS coordinate system, inside the terrarium's border. */
function readMarkFrame(canvas: HTMLCanvasElement, mark: SVGSVGElement): AiTaKrajtaMarkFrame {
    const canvasBounds = canvas.getBoundingClientRect();
    const markBounds = mark.getBoundingClientRect();
    return {
        left: markBounds.left - canvasBounds.left,
        top: markBounds.top - canvasBounds.top,
        width: markBounds.width,
        height: markBounds.height,
    };
}

/** Converts the travelled path back to the unchanged SVG view box, including SVG's centered aspect-ratio fit. */
function getArtworkTrail(state: SnakeState, frame: AiTaKrajtaMarkFrame): readonly SnakePoint[] {
    return state.trail.map((point) => getAiTaKrajtaMarkPointFromFrame(point, frame));
}

/**
 * The logo's existing SVG is the snake renderer for the entire game. Canvas owns only food and pointer input.
 * Keeping the original SVG node, view box, gradients and CSS shadow also keeps subpixel placement and native device
 * resolution identical on activation. The blank food canvas is initialized while idle, too: mounting a filtered
 * canvas only on activation can change Chromium's compositing and shift the SVG raster at fractional pixel ratios.
 * No animation frame is scheduled until activation, and there is no second animal waiting to replace the artwork.
 */
export function AiTaKrajtaSnakeGame({ markRef, isActive }: {
    readonly markRef: RefObject<SVGSVGElement | null>;
    readonly isActive: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetPositionRef = useRef<SnakePoint | null>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const mark = markRef.current;
        const context = canvas?.getContext('2d') ?? null;
        if (canvas === null || mark === null || context === null) return;

        const artworkRenderer = createAiTaKrajtaSnakeArtworkRenderer(mark);
        const eyesRenderer = createEyesRenderer(mark);
        let bounds: SnakeBounds = { width: 0, height: 0 };
        let markFrame = readMarkFrame(canvas, mark);
        let state: SnakeState;
        let isSnakeStateInitialized = false;
        let isSnakeMoving = false;
        let lastFrameTimestamp: number | null = null;
        let elapsedInMilliseconds = 0;
        let releaseProgress = 0;
        let artworkScale = 1;
        let animationFrameId = 0;
        let pixelRatio = 0;

        const drawFrame = () => {
            context.clearRect(0, 0, bounds.width, bounds.height);
            drawFood(context, state, releaseProgress);
            if (isSnakeMoving) artworkRenderer.draw(getArtworkTrail(state, markFrame), artworkScale);
            eyesRenderer.draw(state, markFrame, releaseProgress, artworkScale);
        };

        const resizeCanvas = () => {
            const canvasBounds = canvas.getBoundingClientRect();
            const nextBounds = { width: canvasBounds.width, height: canvasBounds.height };
            const nextPixelRatio = window.devicePixelRatio || 1;
            const nextMarkFrame = readMarkFrame(canvas, mark);
            if (nextBounds.width <= 0 || nextBounds.height <= 0 || getAiTaKrajtaMarkFrameScale(nextMarkFrame) <= 0) return;
            const isSizeChanged = bounds.width !== nextBounds.width || bounds.height !== nextBounds.height;
            const isMarkFrameChanged = markFrame.left !== nextMarkFrame.left || markFrame.top !== nextMarkFrame.top ||
                markFrame.width !== nextMarkFrame.width || markFrame.height !== nextMarkFrame.height;

            if (isSnakeStateInitialized && (isSizeChanged || isMarkFrameChanged)) {
                const resizedState = resizeSnakeState(state, bounds, nextBounds);
                if (isSnakeMoving) {
                    const bodyLengthScale = state.segmentCount > 1
                        ? (resizedState.segmentCount - 1) / (state.segmentCount - 1)
                        : 1;
                    artworkScale *= bodyLengthScale * getAiTaKrajtaMarkFrameScale(markFrame) /
                        getAiTaKrajtaMarkFrameScale(nextMarkFrame);
                    state = resizedState;
                } else {
                    state = { ...resizedState, ...createAiTaKrajtaSnakeLogoPose(nextMarkFrame) };
                }
                if (targetPositionRef.current !== null) {
                    targetPositionRef.current = {
                        x: targetPositionRef.current.x * nextBounds.width / bounds.width,
                        y: targetPositionRef.current.y * nextBounds.height / bounds.height,
                    };
                }
            }

            markFrame = nextMarkFrame;
            bounds = nextBounds;
            // Setting width/height clears a canvas, so do it only when needed and repaint in this same callback.
            if (isSizeChanged || pixelRatio !== nextPixelRatio) {
                pixelRatio = nextPixelRatio;
                canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
                canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
                context.setTransform(canvas.width / bounds.width, 0, 0, canvas.height / bounds.height, 0, 0);
            }
            if (isSnakeStateInitialized) drawFrame();
        };

        resizeCanvas();
        state = createSnakeState(bounds, Math.random, createAiTaKrajtaSnakeLogoPose(markFrame));
        isSnakeStateInitialized = true;
        drawFrame();

        const renderFrame = (frameTimestamp: number) => {
            // Use the same bounded time for release and simulation after a hidden tab resumes.
            const stepInSeconds = lastFrameTimestamp === null ? 0 : Math.min(1 / 20, (frameTimestamp - lastFrameTimestamp) / 1000);
            lastFrameTimestamp = frameTimestamp;
            elapsedInMilliseconds += stepInSeconds * 1000;
            releaseProgress = getLogoReleaseProgress(elapsedInMilliseconds);
            if (pixelRatio !== (window.devicePixelRatio || 1)) resizeCanvas();

            if (stepInSeconds > 0) {
                const previousScore = state.score;
                state = advanceSnakeState(state, {
                    bounds,
                    targetPosition: targetPositionRef.current,
                    stepInSeconds: stepInSeconds * releaseProgress,
                    createRandomNumber: Math.random,
                });
                isSnakeMoving = true;
                if (state.score !== previousScore) setScore(state.score);
            }

            drawFrame();
            animationFrameId = window.requestAnimationFrame(renderFrame);
        };
        if (isActive) animationFrameId = window.requestAnimationFrame(renderFrame);

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);
        resizeObserver.observe(mark);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            artworkRenderer.reset();
            eyesRenderer.remove();
        };
    }, [isActive, markRef]);

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        const canvasBounds = event.currentTarget.getBoundingClientRect();
        targetPositionRef.current = {
            x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top,
        };
    };
    const handlePointerLeave = () => { targetPositionRef.current = null; };

    return (
        <div className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerLeave}
                className={`h-full w-full ${isActive ? 'cursor-crosshair touch-none' : 'pointer-events-none'} ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`}
                aria-label="Krajta, veďte ji myší nebo prstem"
                aria-hidden={!isActive}
                role="img"
            />
            <output
                aria-live="polite"
                hidden={!isActive}
                className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-[#101916]/80 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm"
            >
                Skóre: {score}
            </output>
        </div>
    );
}
