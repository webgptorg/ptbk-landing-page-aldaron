import {
    advanceSnakeState,
    createSnakeState,
    FIELD_MARGIN_IN_PIXELS,
    getSnakeSegments,
    resizeSnakeState,
    SEGMENT_DISTANCE_IN_PIXELS,
    TRAIL_POINT_DISTANCE_IN_PIXELS,
    type SnakeBounds,
    type SnakePoint,
    type SnakeState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

const BOUNDS: SnakeBounds = { width: 640, height: 360 };
const BOUNDARY_BOUNDS: SnakeBounds = { width: 900, height: 700 };

/**
 * A source of random numbers which always answers the same, so that a test plays the same game twice
 */
function createPredictableRandomNumber(): () => number {
    let callCount = 0;

    return () => {
        callCount += 1;

        return (callCount % 7) / 7;
    };
}

/**
 * Plays the game for a while with the pointer standing still
 */
function playTowards(
    state: SnakeState,
    targetPosition: { readonly x: number; readonly y: number } | null,
    stepCount: number,
): SnakeState {
    const createRandomNumber = createPredictableRandomNumber();
    let currentState = state;

    for (let step = 0; step < stepCount; step++) {
        currentState = advanceSnakeState(currentState, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 60,
            createRandomNumber,
        });
    }

    return currentState;
}

/**
 * Starts a test snake with an evenly spaced, in-bounds body behind its nose
 */
function createSnakeAtBoundary(
    headPosition: { readonly x: number; readonly y: number },
    headAngleInRadians: number,
    segmentCount: number,
): SnakeState {
    const createRandomNumber = createPredictableRandomNumber();
    const initialState = createSnakeState(BOUNDARY_BOUNDS, createRandomNumber);
    const trail = Array.from({ length: segmentCount * 2 + 2 }, (_, pointIndex) => {
        const distanceBehindHead = pointIndex * TRAIL_POINT_DISTANCE_IN_PIXELS;

        return {
            x: headPosition.x - Math.cos(headAngleInRadians) * distanceBehindHead,
            y: headPosition.y - Math.sin(headAngleInRadians) * distanceBehindHead,
        };
    });

    return { ...initialState, headPosition, headAngleInRadians, trail, segmentCount };
}

/**
 * The path stored newest-first, measured in pixels along its bends
 */
function getRememberedTrailDistance(state: SnakeState): number {
    return state.trail.slice(1).reduce((distance, point, pointIndex) => {
        const previousPoint = state.trail[pointIndex];

        return previousPoint === undefined ? distance : distance + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    }, 0);
}

/**
 * Ensures sampled segments stay evenly spaced along the reflected path
 */
function expectContinuousBody(state: SnakeState, bounds: SnakeBounds = BOUNDARY_BOUNDS): void {
    const centerLine = [state.headPosition, ...getSnakeSegments(state, bounds)];

    expect(centerLine.length).toBeGreaterThan(1);
    expect(centerLine[0]).toEqual(state.headPosition);

    for (let pointIndex = 1; pointIndex < centerLine.length; pointIndex++) {
        const previousPoint = centerLine[pointIndex - 1];
        const point = centerLine[pointIndex];

        expect(previousPoint).toBeDefined();
        expect(point).toBeDefined();
        expect(Math.hypot((point?.x ?? 0) - (previousPoint?.x ?? 0), (point?.y ?? 0) - (previousPoint?.y ?? 0))).toBeLessThanOrEqual(
            175 / 20 + 1e-6,
        );
    }
}

/**
 * Ensures the remembered path stays inside the field the head is allowed to use
 */
function expectTrailWithinBounds(state: SnakeState, bounds: SnakeBounds = BOUNDARY_BOUNDS): void {
    const isTrailWithinBounds = state.trail.every(
        (point) =>
            point.x >= FIELD_MARGIN_IN_PIXELS &&
            point.x <= bounds.width - FIELD_MARGIN_IN_PIXELS &&
            point.y >= FIELD_MARGIN_IN_PIXELS &&
            point.y <= bounds.height - FIELD_MARGIN_IN_PIXELS,
    );

    expect(isTrailWithinBounds).toBe(true);
}

const CORNERS = [
    { name: 'top-left', horizontalDirection: -1, verticalDirection: -1 },
    { name: 'top-right', horizontalDirection: 1, verticalDirection: -1 },
    { name: 'bottom-left', horizontalDirection: -1, verticalDirection: 1 },
    { name: 'bottom-right', horizontalDirection: 1, verticalDirection: 1 },
] as const;

describe('aiTaKrajtaSnakeSimulation', () => {
    it('starts in the middle of the field with tokens to eat', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());

        expect(state.headPosition).toEqual({ x: 320, y: 180 });
        expect(state.score).toBe(0);
        expect(state.food.length).toBeGreaterThan(0);
    });

    it('starts with a full body behind its head', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const bodyPositions = getSnakeSegments(state, BOUNDS).map((segment) => `${segment.x},${segment.y}`);

        expect(new Set(bodyPositions).size).toBeGreaterThan(1);
    });

    it('turns towards the pointer instead of jumping to it', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const afterOneStep = advanceSnakeState(state, {
            bounds: BOUNDS,
            targetPosition: { x: 620, y: 180 },
            stepInSeconds: 1 / 60,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(afterOneStep.headPosition.x).toBeLessThan(330);
        expect(afterOneStep.headAngleInRadians).toBeGreaterThan(state.headAngleInRadians);
    });

    it('chases the pointer down and then circles it, the way a snake in a browser game does', () => {
        const targetPosition = { x: 500, y: 300 };
        const createRandomNumber = createPredictableRandomNumber();
        let state = createSnakeState(BOUNDS, createRandomNumber);
        let closestDistance = Number.POSITIVE_INFINITY;

        for (let step = 0; step < 240; step++) {
            state = advanceSnakeState(state, {
                bounds: BOUNDS,
                targetPosition,
                stepInSeconds: 1 / 60,
                createRandomNumber,
            });
            closestDistance = Math.min(
                closestDistance,
                Math.hypot(state.headPosition.x - targetPosition.x, state.headPosition.y - targetPosition.y),
            );
        }

        expect(closestDistance).toBeLessThan(30);
    });

    it('stays on the field however long it glides on its own', () => {
        const state = playTowards(createSnakeState(BOUNDS, createPredictableRandomNumber()), null, 3000);

        expect(state.headPosition.x).toBeGreaterThanOrEqual(0);
        expect(state.headPosition.x).toBeLessThanOrEqual(BOUNDS.width);
        expect(state.headPosition.y).toBeGreaterThanOrEqual(0);
        expect(state.headPosition.y).toBeLessThanOrEqual(BOUNDS.height);
    });

    it('returns inward from both walls after a diagonal corner bounce', () => {
        const stateAtCorner = createSnakeAtBoundary(
            {
                x: BOUNDS.width - FIELD_MARGIN_IN_PIXELS - 1,
                y: FIELD_MARGIN_IN_PIXELS + 1,
            },
            -Math.PI / 4,
            14,
        );
        const targetPosition = { x: BOUNDS.width, y: 0 };
        const stateAfterCornerBounce = advanceSnakeState(stateAtCorner, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 20,
            createRandomNumber: createPredictableRandomNumber(),
        });
        const stateAfterFollowingFrame = advanceSnakeState(stateAfterCornerBounce, {
            bounds: BOUNDS,
            targetPosition,
            stepInSeconds: 1 / 20,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(Math.cos(stateAfterCornerBounce.headAngleInRadians)).toBeLessThan(0);
        expect(Math.sin(stateAfterCornerBounce.headAngleInRadians)).toBeGreaterThan(0);
        expect(stateAfterCornerBounce.headPosition.x).toBeLessThan(stateAtCorner.headPosition.x);
        expect(stateAfterCornerBounce.headPosition.y).toBeGreaterThan(stateAtCorner.headPosition.y);
        expect(stateAfterFollowingFrame.headPosition.x).toBeLessThan(stateAfterCornerBounce.headPosition.x);
        expect(stateAfterFollowingFrame.headPosition.y).toBeGreaterThan(stateAfterCornerBounce.headPosition.y);
    });

    it.each([14, 48])('keeps the %i-segment body continuous after rebounds at every wall', (segmentCount) => {
        const walls = [
            {
                name: 'right',
                headPosition: { x: BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS - 1, y: BOUNDARY_BOUNDS.height / 2 },
                angle: 0,
                targetPosition: { x: BOUNDARY_BOUNDS.width + 60, y: BOUNDARY_BOUNDS.height / 2 },
                isReflectedInward: (state: SnakeState) => Math.cos(state.headAngleInRadians) < 0,
                isContact: (point: { readonly x: number; readonly y: number }) =>
                    Math.abs(point.x - (BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS)) < 1e-6,
            },
            {
                name: 'left',
                headPosition: { x: FIELD_MARGIN_IN_PIXELS + 1, y: BOUNDARY_BOUNDS.height / 2 },
                angle: Math.PI,
                targetPosition: { x: -60, y: BOUNDARY_BOUNDS.height / 2 },
                isReflectedInward: (state: SnakeState) => Math.cos(state.headAngleInRadians) > 0,
                isContact: (point: { readonly x: number; readonly y: number }) => Math.abs(point.x - FIELD_MARGIN_IN_PIXELS) < 1e-6,
            },
            {
                name: 'bottom',
                headPosition: { x: BOUNDARY_BOUNDS.width / 2, y: BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS - 1 },
                angle: Math.PI / 2,
                targetPosition: { x: BOUNDARY_BOUNDS.width / 2, y: BOUNDARY_BOUNDS.height + 60 },
                isReflectedInward: (state: SnakeState) => Math.sin(state.headAngleInRadians) < 0,
                isContact: (point: { readonly x: number; readonly y: number }) =>
                    Math.abs(point.y - (BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS)) < 1e-6,
            },
            {
                name: 'top',
                headPosition: { x: BOUNDARY_BOUNDS.width / 2, y: FIELD_MARGIN_IN_PIXELS + 1 },
                angle: -Math.PI / 2,
                targetPosition: { x: BOUNDARY_BOUNDS.width / 2, y: -60 },
                isReflectedInward: (state: SnakeState) => Math.sin(state.headAngleInRadians) > 0,
                isContact: (point: { readonly x: number; readonly y: number }) => Math.abs(point.y - FIELD_MARGIN_IN_PIXELS) < 1e-6,
            },
        ];

        for (const wall of walls) {
            const stateAtWall = createSnakeAtBoundary(wall.headPosition, wall.angle, segmentCount);
            const stateAfterBounce = advanceSnakeState(stateAtWall, {
                bounds: BOUNDARY_BOUNDS,
                targetPosition: wall.targetPosition,
                stepInSeconds: 1 / 20,
                createRandomNumber: createPredictableRandomNumber(),
            });

            expect(wall.isReflectedInward(stateAfterBounce), wall.name).toBe(true);
            expect(wall.isContact(stateAfterBounce.trail[1] ?? { x: Number.NaN, y: Number.NaN }), wall.name).toBe(true);
            expectContinuousBody(stateAfterBounce);
        }
    });

    it.each(CORNERS)('records the full corner path at $name for short and grown snakes', (corner) => {
        const horizontalWall = corner.horizontalDirection < 0
            ? FIELD_MARGIN_IN_PIXELS
            : BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS;
        const verticalWall = corner.verticalDirection < 0
            ? FIELD_MARGIN_IN_PIXELS
            : BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS;
        const angle = Math.atan2(corner.verticalDirection, corner.horizontalDirection);
        const headPosition = {
            x: horizontalWall - corner.horizontalDirection,
            y: verticalWall - corner.verticalDirection,
        };

        for (const segmentCount of [14, 48]) {
            let state = createSnakeAtBoundary(headPosition, angle, segmentCount);
            const outsideCornerTarget = {
                x: horizontalWall + corner.horizontalDirection * 80,
                y: verticalWall + corner.verticalDirection * 80,
            };
            const stateAfterCornerBounce = advanceSnakeState(state, {
                bounds: BOUNDARY_BOUNDS,
                targetPosition: outsideCornerTarget,
                stepInSeconds: 1 / 20,
                createRandomNumber: createPredictableRandomNumber(),
            });

            expect(stateAfterCornerBounce.trail[1]).toEqual({ x: horizontalWall, y: verticalWall });
            expect(Math.sign(Math.cos(stateAfterCornerBounce.headAngleInRadians))).toBe(-corner.horizontalDirection);
            expect(Math.sign(Math.sin(stateAfterCornerBounce.headAngleInRadians))).toBe(-corner.verticalDirection);
            expectContinuousBody(stateAfterCornerBounce);

            state = stateAfterCornerBounce;

            for (let stepIndex = 0; stepIndex < 600; stepIndex++) {
                const previousHeadPosition = state.headPosition;
                const nextState = advanceSnakeState(state, {
                    bounds: BOUNDARY_BOUNDS,
                    targetPosition: outsideCornerTarget,
                    stepInSeconds: 1 / 60,
                    createRandomNumber: createPredictableRandomNumber(),
                });

                expect(Number.isFinite(nextState.headPosition.x)).toBe(true);
                expect(Number.isFinite(nextState.headPosition.y)).toBe(true);
                expect(nextState.headPosition.x).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.x).toBeLessThanOrEqual(BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.y).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.y).toBeLessThanOrEqual(BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS);
                expect(Math.hypot(
                    nextState.headPosition.x - previousHeadPosition.x,
                    nextState.headPosition.y - previousHeadPosition.y,
                )).toBeLessThanOrEqual(175 / 60 + 1e-6);
                expect(nextState.trail.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
                expect(getRememberedTrailDistance(nextState)).toBeLessThanOrEqual(
                    nextState.segmentCount * SEGMENT_DISTANCE_IN_PIXELS + 1e-6,
                );
                expect(nextState.trail.length).toBeLessThan(nextState.segmentCount * 3 + 32);

                if (stepIndex % 60 === 0) {
                    expectContinuousBody(nextState);
                    expectTrailWithinBounds(nextState);
                }

                state = nextState;
            }
        }
    });

    it.each([14, 48])('keeps repeated steering at each wall stable for a %i-segment snake', (segmentCount) => {
        const walls = [
            {
                name: 'right',
                headPosition: { x: BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS - 1, y: BOUNDARY_BOUNDS.height / 2 },
                angle: 0,
                targetPosition: { x: BOUNDARY_BOUNDS.width + 80, y: BOUNDARY_BOUNDS.height / 2 },
                isContact: (point: SnakePoint) => Math.abs(point.x - (BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS)) < 1e-6,
            },
            {
                name: 'left',
                headPosition: { x: FIELD_MARGIN_IN_PIXELS + 1, y: BOUNDARY_BOUNDS.height / 2 },
                angle: Math.PI,
                targetPosition: { x: -80, y: BOUNDARY_BOUNDS.height / 2 },
                isContact: (point: SnakePoint) => Math.abs(point.x - FIELD_MARGIN_IN_PIXELS) < 1e-6,
            },
            {
                name: 'bottom',
                headPosition: { x: BOUNDARY_BOUNDS.width / 2, y: BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS - 1 },
                angle: Math.PI / 2,
                targetPosition: { x: BOUNDARY_BOUNDS.width / 2, y: BOUNDARY_BOUNDS.height + 80 },
                isContact: (point: SnakePoint) => Math.abs(point.y - (BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS)) < 1e-6,
            },
            {
                name: 'top',
                headPosition: { x: BOUNDARY_BOUNDS.width / 2, y: FIELD_MARGIN_IN_PIXELS + 1 },
                angle: -Math.PI / 2,
                targetPosition: { x: BOUNDARY_BOUNDS.width / 2, y: -80 },
                isContact: (point: SnakePoint) => Math.abs(point.y - FIELD_MARGIN_IN_PIXELS) < 1e-6,
            },
        ];

        for (const wall of walls) {
            let state = createSnakeAtBoundary(wall.headPosition, wall.angle, segmentCount);
            let reboundCount = 0;

            for (let stepIndex = 0; stepIndex < 720; stepIndex++) {
                const previousHeadPosition = state.headPosition;
                const nextState = advanceSnakeState(state, {
                    bounds: BOUNDARY_BOUNDS,
                    targetPosition: wall.targetPosition,
                    stepInSeconds: 1 / 60,
                    createRandomNumber: createPredictableRandomNumber(),
                });
                const contactPoint = nextState.trail[1];

                if (
                    contactPoint !== undefined &&
                    wall.isContact(contactPoint) &&
                    Math.hypot(contactPoint.x - previousHeadPosition.x, contactPoint.y - previousHeadPosition.y) > 1e-6
                ) {
                    reboundCount++;
                }

                expect(Number.isFinite(nextState.headAngleInRadians)).toBe(true);
                expect(Number.isFinite(nextState.headPosition.x)).toBe(true);
                expect(Number.isFinite(nextState.headPosition.y)).toBe(true);
                expect(nextState.headPosition.x).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.x).toBeLessThanOrEqual(BOUNDARY_BOUNDS.width - FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.y).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
                expect(nextState.headPosition.y).toBeLessThanOrEqual(BOUNDARY_BOUNDS.height - FIELD_MARGIN_IN_PIXELS);

                if (stepIndex % 120 === 0) {
                    expectContinuousBody(nextState);
                    expectTrailWithinBounds(nextState);
                }

                state = nextState;
            }

            expect(reboundCount, wall.name).toBeGreaterThan(1);
        }
    });

    it('keeps its body and steering scale stable when a responsive canvas changes size', () => {
        const initialState = createSnakeAtBoundary(
            { x: BOUNDARY_BOUNDS.width / 2, y: BOUNDARY_BOUNDS.height / 2 },
            -Math.PI / 4,
            48,
        );
        const resizedBounds = { width: 480, height: 360 };
        const resizedState = resizeSnakeState(initialState, BOUNDARY_BOUNDS, resizedBounds);
        const stateAfterResize = advanceSnakeState(resizedState, {
            bounds: resizedBounds,
            targetPosition: { x: resizedBounds.width + 40, y: -30 },
            stepInSeconds: 1 / 30,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expectContinuousBody(resizedState, resizedBounds);
        expect(stateAfterResize.headPosition.x).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
        expect(stateAfterResize.headPosition.x).toBeLessThanOrEqual(resizedBounds.width - FIELD_MARGIN_IN_PIXELS);
        expect(stateAfterResize.headPosition.y).toBeGreaterThanOrEqual(FIELD_MARGIN_IN_PIXELS);
        expect(stateAfterResize.headPosition.y).toBeLessThanOrEqual(resizedBounds.height - FIELD_MARGIN_IN_PIXELS);
        expect(stateAfterResize.trail.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
    });

    it('grows and scores when the head reaches a token', () => {
        const initialState = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const firstFood = initialState.food[0];
        const afterEating = playTowards(initialState, firstFood.position, 600);

        expect(afterEating.score).toBeGreaterThan(0);
        expect(afterEating.segmentCount).toBeGreaterThan(initialState.segmentCount);
        expect(afterEating.food).toHaveLength(initialState.food.length);
        expect(getSnakeSegments(afterEating, BOUNDS).length).toBeGreaterThan(
            getSnakeSegments(initialState, BOUNDS).length,
        );
    });

    it('retains the travelled centre-line for smooth body drawing', () => {
        const state = playTowards(createSnakeState(BOUNDS, createPredictableRandomNumber()), { x: 100, y: 100 }, 120);
        const segments = getSnakeSegments(state, BOUNDS);

        expect(segments.length).toBeGreaterThan(state.segmentCount);
        expect(segments.every((segment) => Number.isFinite(segment.x) && Number.isFinite(segment.y))).toBe(true);
    });

    it('does not teleport when a background tab hands over one enormous step', () => {
        const state = createSnakeState(BOUNDS, createPredictableRandomNumber());
        const afterLongStep = advanceSnakeState(state, {
            bounds: BOUNDS,
            targetPosition: { x: 10, y: 10 },
            stepInSeconds: 45,
            createRandomNumber: createPredictableRandomNumber(),
        });

        expect(Math.hypot(afterLongStep.headPosition.x - state.headPosition.x, afterLongStep.headPosition.y - state.headPosition.y)).toBeLessThan(
            20,
        );
    });
});
