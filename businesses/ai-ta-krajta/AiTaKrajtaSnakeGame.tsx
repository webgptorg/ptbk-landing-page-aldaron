'use client';

import {
    advanceSnakeState,
    createSnakeState,
    getSnakeSegments,
    resizeSnakeState,
    type SnakeBounds,
    type SnakePoint,
    type SnakeState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { drawAiTaKrajtaMarkOnCanvas } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkCanvas';
import {
    AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME,
    getAiTaKrajtaMarkFrameScale,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeBodySlices } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

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
 * How long the exact logo stays intact before its living version starts to emerge
 */
const LOGO_HOLD_DURATION_IN_MILLISECONDS = 220;

/**
 * How long the snake takes to leave the drawing behind: to lose the proportions and colours of the logo, to open its
 * eyes and to come up to speed
 */
const LOGO_RELEASE_DURATION_IN_MILLISECONDS = 700;

/**
 * Restricts an animation progress to its meaningful range
 */
function clampProgress(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * How far the game has released the logo into its playable body
 */
function getLogoReleaseProgress(elapsedInMilliseconds: number): number {
    return clampProgress(
        (elapsedInMilliseconds - LOGO_HOLD_DURATION_IN_MILLISECONDS) / LOGO_RELEASE_DURATION_IN_MILLISECONDS,
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

/**
 * Draws the eyes, which is what turns a drawn snake into an animal looking where it goes
 *
 * Note: The logo has none, so they open while the snake wakes up rather than the moment the game begins.
 */
function drawEyes(context: CanvasRenderingContext2D, state: SnakeState, markScale: number, opacity: number): void {
    if (opacity <= 0) {
        return;
    }

    const sidewaysAngle = state.headAngleInRadians + Math.PI / 2;

    context.save();
    context.globalAlpha = opacity;

    for (const side of [-1, 1]) {
        const eyePosition: SnakePoint = {
            x:
                state.headPosition.x +
                (Math.cos(state.headAngleInRadians) * EYE_FORWARD_OFFSET +
                    Math.cos(sidewaysAngle) * EYE_SIDEWAYS_OFFSET * side) *
                    markScale,
            y:
                state.headPosition.y +
                (Math.sin(state.headAngleInRadians) * EYE_FORWARD_OFFSET +
                    Math.sin(sidewaysAngle) * EYE_SIDEWAYS_OFFSET * side) *
                    markScale,
        };

        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(eyePosition.x, eyePosition.y, EYE_HALF_WIDTH * markScale, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = AI_TA_KRAJTA_COLORS.MOSS_DEEP;
        context.beginPath();
        context.arc(
            eyePosition.x + Math.cos(state.headAngleInRadians) * PUPIL_FORWARD_OFFSET * markScale,
            eyePosition.y + Math.sin(state.headAngleInRadians) * PUPIL_FORWARD_OFFSET * markScale,
            PUPIL_HALF_WIDTH * markScale,
            0,
            Math.PI * 2,
        );
        context.fill();
    }

    context.restore();
}

/**
 * Draws the animal along the line its head has travelled
 *
 * @param markScale how many pixels one unit of the artwork is worth here
 * @param releaseProgress how far the logo has been let go, zero while it is still the logo and one once it is loose
 */
function drawSnake(
    context: CanvasRenderingContext2D,
    state: SnakeState,
    bounds: SnakeBounds,
    markScale: number,
    releaseProgress: number,
): void {
    const centerLine = [state.headPosition, ...getSnakeSegments(state, bounds)];

    context.save();
    context.lineCap = 'round';

    for (const slice of createAiTaKrajtaSnakeBodySlices(centerLine, markScale, releaseProgress)) {
        context.strokeStyle = slice.color;
        context.lineWidth = slice.strokeWidth;
        context.beginPath();
        context.moveTo(slice.from.x, slice.from.y);
        context.lineTo(slice.to.x, slice.to.y);
        context.stroke();
    }

    context.restore();
    drawEyes(context, state, markScale, releaseProgress);
}

/**
 * The snake of the logo, let loose
 *
 * Note: It moves freely rather than jumping from square to square, so it steers the way a snake in a browser game
 *       does. The whole game is `aiTaKrajtaSnakeSimulation`, this only draws what it returns and feeds the pointer
 *       into it.
 *
 */
export function AiTaKrajtaSnakeGame({
    initialMarkFrame,
    onInitialMarkFrameDrawn,
}: {
    readonly initialMarkFrame: AiTaKrajtaMarkFrame;
    readonly onInitialMarkFrameDrawn: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetPositionRef = useRef<SnakePoint | null>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d') ?? null;

        if (canvas === null || context === null) {
            return;
        }

        let bounds: SnakeBounds = { width: canvas.clientWidth, height: canvas.clientHeight };
        let state: SnakeState;
        let isSnakeStateInitialized = false;
        let lastFrameTimestamp: number | null = null;
        let gameStartTimestamp: number | null = null;
        let animationFrameId = 0;
        let isInitialMarkFrameDrawn = false;

        const resizeCanvas = () => {
            const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
            const nextBounds: SnakeBounds = { width: canvas.clientWidth, height: canvas.clientHeight };

            if (
                isSnakeStateInitialized &&
                (bounds.width !== nextBounds.width || bounds.height !== nextBounds.height)
            ) {
                state = resizeSnakeState(state, bounds, nextBounds);

                if (targetPositionRef.current !== null) {
                    targetPositionRef.current = {
                        x:
                            bounds.width > 0
                                ? (targetPositionRef.current.x / bounds.width) * nextBounds.width
                                : nextBounds.width / 2,
                        y:
                            bounds.height > 0
                                ? (targetPositionRef.current.y / bounds.height) * nextBounds.height
                                : nextBounds.height / 2,
                    };
                }
            }

            bounds = nextBounds;
            canvas.width = Math.max(1, Math.round(bounds.width * devicePixelRatio));
            canvas.height = Math.max(1, Math.round(bounds.height * devicePixelRatio));
            context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        };

        resizeCanvas();
        const markScale = getAiTaKrajtaMarkFrameScale(initialMarkFrame);
        state = createSnakeState(bounds, Math.random, createAiTaKrajtaSnakeLogoPose(initialMarkFrame));
        isSnakeStateInitialized = true;

        const renderFrame = (frameTimestamp: number) => {
            const stepInSeconds = lastFrameTimestamp === null ? 0 : (frameTimestamp - lastFrameTimestamp) / 1000;
            lastFrameTimestamp = frameTimestamp;
            gameStartTimestamp ??= frameTimestamp;
            const logoReleaseProgress = getLogoReleaseProgress(frameTimestamp - gameStartTimestamp);

            const previousScore = state.score;
            state = advanceSnakeState(state, {
                bounds,
                targetPosition: targetPositionRef.current,
                // Note: The animal stands as still as the logo until it is let go, and then comes up to speed
                stepInSeconds: stepInSeconds * logoReleaseProgress,
                createRandomNumber: Math.random,
            });

            if (state.score !== previousScore) {
                setScore(state.score);
            }

            context.clearRect(0, 0, bounds.width, bounds.height);
            drawFood(context, state, logoReleaseProgress);
            drawSnake(context, state, bounds, markScale, logoReleaseProgress);
            drawAiTaKrajtaMarkOnCanvas(context, initialMarkFrame, 1 - logoReleaseProgress);

            if (!isInitialMarkFrameDrawn) {
                isInitialMarkFrameDrawn = true;
                onInitialMarkFrameDrawn();
            }

            animationFrameId = window.requestAnimationFrame(renderFrame);
        };

        animationFrameId = window.requestAnimationFrame(renderFrame);

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [initialMarkFrame, onInitialMarkFrameDrawn]);

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        const canvasBounds = event.currentTarget.getBoundingClientRect();

        targetPositionRef.current = {
            x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top,
        };
    };

    const handlePointerLeave = () => {
        targetPositionRef.current = null;
    };

    return (
        <div className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerLeave}
                className={`h-full w-full cursor-crosshair touch-none ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`}
                aria-label="Krajta, veďte ji myší nebo prstem"
                role="img"
            />
            <output
                aria-live="polite"
                className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/20 bg-[#101916]/80 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm"
            >
                Skóre: {score}
            </output>
        </div>
    );
}
