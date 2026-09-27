import { AI_TA_KRAJTA_MARK_BODY } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeBodySlices } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import {
    advanceSnakeState,
    createSnakeState,
    FIELD_MARGIN_IN_PIXELS,
    getSnakeSegments,
    SEGMENT_DISTANCE_IN_PIXELS,
    TRAIL_POINT_DISTANCE_IN_PIXELS,
    type SnakePoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

/**
 * A body of the same shape as the drawn one, so that a slice can be looked up by where it sits along the animal
 */
const CENTER_LINE = AI_TA_KRAJTA_MARK_BODY.map((point) => ({ x: point.x, y: point.y }));

/**
 * The slices of a whole body, ordered from the nose towards the tip of the tail
 */
function createSlicesFromNose(releaseProgress: number, markScale = 1) {
    return [...createAiTaKrajtaSnakeBodySlices(CENTER_LINE, markScale, releaseProgress)].reverse();
}

/**
 * How far two `#rrggbb` colours are from each other, over all three channels
 *
 * Note: A slice is as thick and as coloured as the body a step behind its leading end, which is what lets each one
 *       cover the one drawn before it. The nose is therefore a step short of the very first measurement rather than
 *       exactly on it.
 */
function getColorDistance(firstColor: string, secondColor: string): number {
    const readChannels = (color: string) => [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
    const firstChannels = readChannels(firstColor);
    const secondChannels = readChannels(secondColor);

    return Math.max(...firstChannels.map((channel, index) => Math.abs(channel - (secondChannels[index] ?? 0))));
}

describe('AI ta Krajta snake body', () => {
    it('is laid down from the tip of the tail forwards, so that it overlaps itself the way the drawing does', () => {
        const slices = createAiTaKrajtaSnakeBodySlices(CENTER_LINE, 1, 0);
        const firstSlice = slices[0];
        const lastSlice = slices[slices.length - 1];
        const tailPoint = AI_TA_KRAJTA_MARK_BODY[AI_TA_KRAJTA_MARK_BODY.length - 1];
        const nosePoint = AI_TA_KRAJTA_MARK_BODY[0];

        expect(slices).toHaveLength(AI_TA_KRAJTA_MARK_BODY.length - 1);
        expect(firstSlice?.from).toEqual({ x: tailPoint?.x, y: tailPoint?.y });
        expect(lastSlice?.to).toEqual({ x: nosePoint?.x, y: nosePoint?.y });
    });

    it('stands in the thickness and the colours of the logo before it is let go', () => {
        const slices = createSlicesFromNose(0);
        const noseSlice = slices[0];
        const tailSlice = slices[slices.length - 1];
        const nosePoint = AI_TA_KRAJTA_MARK_BODY[0];
        const tailPoint = AI_TA_KRAJTA_MARK_BODY[AI_TA_KRAJTA_MARK_BODY.length - 1];

        expect(noseSlice?.strokeWidth).toBeCloseTo((nosePoint?.halfWidth ?? 0) * 2, 0);
        expect(getColorDistance(noseSlice?.color ?? '', nosePoint?.color ?? '')).toBeLessThan(4);
        expect(tailSlice?.strokeWidth).toBeCloseTo((tailPoint?.halfWidth ?? 0) * 2, 5);
        expect(tailSlice?.color).toBe(tailPoint?.color);
    });

    it('thickens where the drawn coil is thickest, which an even taper never would', () => {
        const slices = createSlicesFromNose(0);
        const widestSliceIndex = slices.reduce(
            (widestIndex, slice, index) =>
                slice.strokeWidth > (slices[widestIndex]?.strokeWidth ?? 0) ? index : widestIndex,
            0,
        );

        expect(widestSliceIndex).toBeGreaterThan(slices.length / 5);
        expect(widestSliceIndex).toBeLessThan(slices.length / 2);
    });

    it('has become an evenly tapered game snake in the colours of the show once it is loose', () => {
        const slices = createSlicesFromNose(1);
        const strokeWidths = slices.map((slice) => slice.strokeWidth);

        expect(getColorDistance(slices[0]?.color ?? '', AI_TA_KRAJTA_COLORS.CORAL)).toBeLessThan(4);
        expect(slices[slices.length - 1]?.color).toBe(AI_TA_KRAJTA_COLORS.INDIGO);
        expect(strokeWidths.every((width, index) => index === 0 || width <= (strokeWidths[index - 1] ?? 0))).toBe(true);
    });

    it('grows with the frame it is drawn into, so that it is the size of the logo on any screen', () => {
        const [smallSlice] = createSlicesFromNose(0, 1);
        const [largeSlice] = createSlicesFromNose(0, 3);

        expect(largeSlice?.strokeWidth).toBeCloseTo((smallSlice?.strokeWidth ?? 0) * 3, 5);
    });

    it('keeps every painted body slice joined through a corner rebound', () => {
        const bounds = { width: 900, height: 700 };
        const wallPoint = {
            x: bounds.width - FIELD_MARGIN_IN_PIXELS,
            y: FIELD_MARGIN_IN_PIXELS,
        };
        const headPosition = { x: wallPoint.x - 1, y: wallPoint.y + 1 };
        const headAngleInRadians = -Math.PI / 4;
        const initialState = createSnakeState(bounds, () => 0.5);
        const trail = Array.from({ length: 32 }, (_, pointIndex) => {
            const distanceBehindHead = pointIndex * (SEGMENT_DISTANCE_IN_PIXELS / 2);

            return {
                x: headPosition.x - Math.cos(headAngleInRadians) * distanceBehindHead,
                y: headPosition.y - Math.sin(headAngleInRadians) * distanceBehindHead,
            };
        });
        const stateAtCorner = { ...initialState, headPosition, headAngleInRadians, trail };
        const stateAfterBounce = advanceSnakeState(stateAtCorner, {
            bounds,
            targetPosition: { x: bounds.width + 40, y: -40 },
            stepInSeconds: 1 / 20,
            createRandomNumber: () => 0.5,
        });
        const centerLine: SnakePoint[] = [stateAfterBounce.headPosition, ...getSnakeSegments(stateAfterBounce, bounds)];
        const slices = createAiTaKrajtaSnakeBodySlices(centerLine, 1, 1);

        expect(stateAfterBounce.trail[1]).toEqual(wallPoint);
        expect(slices.length).toBeGreaterThan(0);

        for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
            const slice = slices[sliceIndex];
            const nextSlice = slices[sliceIndex + 1];

            expect(slice).toBeDefined();
            expect(Number.isFinite(slice?.strokeWidth)).toBe(true);
            expect(slice?.strokeWidth).toBeGreaterThan(0);
            expect(Number.isFinite(slice?.from.x)).toBe(true);
            expect(Number.isFinite(slice?.from.y)).toBe(true);
            expect(Number.isFinite(slice?.to.x)).toBe(true);
            expect(Number.isFinite(slice?.to.y)).toBe(true);

            if (slice !== undefined && nextSlice !== undefined) {
                expect(slice.to).toEqual(nextSlice.from);
                expect(Math.hypot(slice.to.x - slice.from.x, slice.to.y - slice.from.y)).toBeLessThanOrEqual(
                    TRAIL_POINT_DISTANCE_IN_PIXELS + 1e-6,
                );
                expect(Math.abs(slice.strokeWidth - nextSlice.strokeWidth)).toBeLessThanOrEqual(1);
                expect(getColorDistance(slice.color, nextSlice.color)).toBeLessThanOrEqual(12);
            }
        }
    });
});
