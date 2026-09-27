import {
    AI_TA_KRAJTA_MARK_BODY,
    AI_TA_KRAJTA_MARK_SHAPES,
    type AiTaKrajtaMarkPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeArtwork } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { advanceSnakeState, createSnakeState, resizeSnakeState, SEGMENT_DISTANCE_IN_PIXELS } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const MARK_FRAME = { left: 0, top: 0, width: 128, height: 128 };
const BOUNDS = { width: 400, height: 400 };

/** Compare to the actual canonical fills and gradients, not a second stroke approximation or the cover JPEG. */
async function renderArtwork(isCanonical: boolean, trail: readonly AiTaKrajtaMarkPoint[] = AI_TA_KRAJTA_MARK_BODY) {
    const moved = createAiTaKrajtaSnakeArtwork(trail);
    const markup = AI_TA_KRAJTA_MARK_SHAPES.map((shape, index) => {
        const gradient = shape.gradient;
        const start = isCanonical ? { x: gradient.x1, y: gradient.y1 } : moved[index].gradientStart;
        const end = isCanonical ? { x: gradient.x2, y: gradient.y2 } : moved[index].gradientEnd;
        return `<defs><linearGradient id="${shape.id}" gradientUnits="userSpaceOnUse" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}">${gradient.stops.map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"/>`).join('')}</linearGradient></defs><path d="${isCanonical ? shape.pathData : moved[index].pathData}" fill="url(#${shape.id})"/>`;
    }).join('');
    return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="768" height="768"><rect width="128" height="128" fill="#232a25"/>${markup}</svg>`)).ensureAlpha().raw().toBuffer();
}

function getCoordinates(path: string): number[] {
    return (path.match(/-?(?:\d*\.)?\d+/g) ?? []).map(Number);
}

/** Count substantial disconnected pieces in the actual rasterized fills, excluding isolated antialias pixels. */
async function countVisiblePieces(trail: readonly AiTaKrajtaMarkPoint[]): Promise<number> {
    const paths = createAiTaKrajtaSnakeArtwork(trail).map((shape) => `<path d="${shape.pathData}" fill="white"/>`).join('');
    const { data, info } = await sharp(Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 256 256">${paths}</svg>`,
    )).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const visited = new Uint8Array(info.width * info.height);
    let pieceCount = 0;
    for (let index = 0; index < visited.length; index++) {
        if (visited[index] || data[index * 4 + 3] < 128) continue;
        const pending = [index];
        visited[index] = 1;
        let pixelCount = 0;
        while (pending.length > 0) {
            const point = pending.pop()!;
            pixelCount++;
            const column = point % info.width;
            for (const neighbor of [point - info.width, point + info.width, column > 0 ? point - 1 : -1, column + 1 < info.width ? point + 1 : -1]) {
                if (neighbor < 0 || neighbor >= visited.length || visited[neighbor] || data[neighbor * 4 + 3] < 128) continue;
                visited[neighbor] = 1;
                pending.push(neighbor);
            }
        }
        if (pixelCount > 4) pieceCount++;
    }
    return pieceCount;
}

describe('AI ta Krajta moving artwork', () => {
    it('preserves the actual silhouette and colors through the first deforming draw, at six pixels per artwork unit', async () => {
        const canonical = await renderArtwork(true);
        const moving = await renderArtwork(false);
        let changedChannelCount = 0;
        let differenceSum = 0;
        let maximumDifference = 0;
        for (let index = 0; index < canonical.length; index++) {
            const difference = Math.abs(canonical[index] - moving[index]);
            if (difference > 2) changedChannelCount++;
            differenceSum += difference;
            maximumDifference = Math.max(maximumDifference, difference);
        }
        // Exact cubic subdivision can change librsvg's edge coverage. This allows fewer than 200 edge pixels at
        // 768 × 768, with at most 20/255 coverage difference; the mean also excludes any solid-area/color change.
        expect(changedChannelCount).toBeLessThan(600);
        expect(maximumDifference).toBeLessThan(20);
        expect(differenceSum / canonical.length).toBeLessThan(0.005);
    });

    it('translates the whole artwork including its gradients without changing its pose', () => {
        const original = createAiTaKrajtaSnakeArtwork(AI_TA_KRAJTA_MARK_BODY);
        const translated = createAiTaKrajtaSnakeArtwork(AI_TA_KRAJTA_MARK_BODY.map((point) => ({ x: point.x + 11, y: point.y - 7 })));
        original.forEach((shape, index) => {
            const coordinates = getCoordinates(shape.pathData);
            const moved = getCoordinates(translated[index].pathData);
            coordinates.forEach((coordinate, coordinateIndex) => {
                expect(moved[coordinateIndex] - coordinate).toBeCloseTo(coordinateIndex % 2 === 0 ? 11 : -7, 4);
            });
            expect(translated[index].gradientStart.x - shape.gradientStart.x).toBeCloseTo(11, 8);
            expect(translated[index].gradientStart.y - shape.gradientStart.y).toBeCloseTo(-7, 8);
        });
    });

    it.each([0.6, 1.8])('preserves the silhouette, head and taper through a %s responsive scale and rotation', (scale) => {
        const angle = 0.37;
        const transformPoint = (point: AiTaKrajtaMarkPoint) => ({
            x: 11 + scale * (point.x * Math.cos(angle) - point.y * Math.sin(angle)),
            y: -7 + scale * (point.x * Math.sin(angle) + point.y * Math.cos(angle)),
        });
        const original = createAiTaKrajtaSnakeArtwork(AI_TA_KRAJTA_MARK_BODY);
        const transformed = createAiTaKrajtaSnakeArtwork(AI_TA_KRAJTA_MARK_BODY.map(transformPoint), scale);
        original.forEach((shape, index) => {
            const coordinates = getCoordinates(shape.pathData);
            const moved = getCoordinates(transformed[index].pathData);
            for (let coordinateIndex = 0; coordinateIndex < coordinates.length; coordinateIndex += 2) {
                const expected = transformPoint({ x: coordinates[coordinateIndex], y: coordinates[coordinateIndex + 1] });
                expect(moved[coordinateIndex]).toBeCloseTo(expected.x, 4);
                expect(moved[coordinateIndex + 1]).toBeCloseTo(expected.y, 4);
            }
            for (const gradientPoint of ['gradientStart', 'gradientEnd'] as const) {
                const expected = transformPoint(shape[gradientPoint]);
                expect(transformed[index][gradientPoint].x).toBeCloseTo(expected.x, 8);
                expect(transformed[index][gradientPoint].y).toBeCloseTo(expected.y, 8);
            }
        });
    });

    it('converges to the static artwork, not a replacement pose, as the first movement approaches zero', async () => {
        const state = createSnakeState(BOUNDS, () => 0.9, createAiTaKrajtaSnakeLogoPose(MARK_FRAME));
        const next = advanceSnakeState(state, { bounds: BOUNDS, stepInSeconds: 1e-9, targetPosition: null, createRandomNumber: () => 0.9 });
        const canonical = await renderArtwork(true);
        const firstMovement = await renderArtwork(false, next.trail);
        let differenceSum = 0;
        let maximumDifference = 0;
        for (let index = 0; index < canonical.length; index++) {
            const difference = Math.abs(canonical[index] - firstMovement[index]);
            differenceSum += difference;
            maximumDifference = Math.max(maximumDifference, difference);
        }
        // Use the same edge-rasterization allowance as the identity draw, against the unmodified static paths.
        expect(maximumDifference).toBeLessThan(20);
        expect(differenceSum / canonical.length).toBeLessThan(0.005);
    });

    it('has no timed morph: a stopped simulation renders the same artwork after any number of redraws', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        let state = createSnakeState(BOUNDS, () => 0.9, pose);
        const first = createAiTaKrajtaSnakeArtwork(state.trail);
        for (let frame = 0; frame < 80; frame++) {
            state = advanceSnakeState(state, { bounds: BOUNDS, stepInSeconds: 0, targetPosition: null, createRandomNumber: () => 0.9 });
        }
        expect(createAiTaKrajtaSnakeArtwork(state.trail)).toEqual(first);
    });

    it('keeps the painted animal connected as the original coil unfolds throughout and after release', async () => {
        const bounds = { width: 256, height: 256 };
        let state = createSnakeState(bounds, () => 0.9, createAiTaKrajtaSnakeLogoPose(MARK_FRAME));
        const captureTimes = new Set([0, 16, 128, 256, 512, 704, 896, 1504]);
        for (let elapsed = 0; elapsed <= 1504; elapsed += 16) {
            if (elapsed > 0) state = advanceSnakeState(state, {
                bounds, stepInSeconds: 0.016 * Math.min(1, elapsed / 700),
                targetPosition: null, createRandomNumber: () => 0.9,
            });
            if (captureTimes.has(elapsed)) expect(await countVisiblePieces(state.trail), `release at ${elapsed} ms`).toBe(1);
        }
    });

    it('responds continuously to arbitrarily small real movement', () => {
        const state = createSnakeState(BOUNDS, () => 0.9, createAiTaKrajtaSnakeLogoPose(MARK_FRAME));
        const initial = createAiTaKrajtaSnakeArtwork(state.trail);
        const next = advanceSnakeState(state, { bounds: BOUNDS, stepInSeconds: 0.000001, targetPosition: null, createRandomNumber: () => 0.9 });
        const moving = createAiTaKrajtaSnakeArtwork(next.trail);
        initial.forEach((shape, index) => {
            const coordinates = getCoordinates(shape.pathData);
            const moved = getCoordinates(moving[index].pathData);
            coordinates.forEach((coordinate, coordinateIndex) => expect(Math.abs(moved[coordinateIndex] - coordinate)).toBeLessThan(0.002));
        });
        expect(next.headPosition).not.toEqual(state.headPosition);
    });

    it('preserves the entire resized tail through the next advancing frame', () => {
        const state = createSnakeState(BOUNDS, () => 0.9, createAiTaKrajtaSnakeLogoPose({ left: 90, top: 90, width: 200, height: 200 }));
        const bounds = { width: 900, height: 900 };
        const resized = resizeSnakeState(state, BOUNDS, bounds);
        const next = advanceSnakeState(resized, { bounds, stepInSeconds: 0, targetPosition: null, createRandomNumber: () => 0.9 });
        expect(next.trail.at(-1)?.x).toBeCloseTo(resized.trail.at(-1)!.x, 8);
        expect(next.trail.at(-1)?.y).toBeCloseTo(resized.trail.at(-1)!.y, 8);
        expect(next.segmentCount * SEGMENT_DISTANCE_IN_PIXELS).toBeGreaterThan(state.segmentCount * SEGMENT_DISTANCE_IN_PIXELS);
    });

    it.each([14, 48])('keeps the %i-segment artwork continuous through infinitesimal wall and corner rebounds', (segmentCount) => {
        const margin = 26;
        const distanceToWall = 0.00005;
        for (const direction of [0, 1, 2, 3, 4, 5, 6, 7]) {
            const angle = direction * Math.PI / 4;
            const headPosition = {
                x: Math.abs(Math.cos(angle)) < 0.001 ? 200 : Math.cos(angle) > 0 ? 400 - margin - distanceToWall : margin + distanceToWall,
                y: Math.abs(Math.sin(angle)) < 0.001 ? 200 : Math.sin(angle) > 0 ? 400 - margin - distanceToWall : margin + distanceToWall,
            };
            const length = (segmentCount - 1) * SEGMENT_DISTANCE_IN_PIXELS;
            const trail = Array.from({ length: segmentCount * 2 + 1 }, (_, index) => ({
                x: headPosition.x - Math.cos(angle) * length * index / (segmentCount * 2),
                y: headPosition.y - Math.sin(angle) * length * index / (segmentCount * 2),
            }));
            const state = { ...createSnakeState(BOUNDS, () => 0.9), headPosition, headAngleInRadians: angle, trail, segmentCount, food: [] };
            const before = createAiTaKrajtaSnakeArtwork(state.trail);
            const next = advanceSnakeState(state, {
                bounds: BOUNDS, stepInSeconds: 0.000001,
                targetPosition: { x: headPosition.x + Math.cos(angle) * 100, y: headPosition.y + Math.sin(angle) * 100 },
                createRandomNumber: () => 0.9,
            });
            createAiTaKrajtaSnakeArtwork(next.trail).forEach((shape, index) => {
                const previous = getCoordinates(before[index].pathData);
                getCoordinates(shape.pathData).forEach((coordinate, coordinateIndex) => {
                    expect(Number.isFinite(coordinate)).toBe(true);
                    expect(Math.abs(coordinate - previous[coordinateIndex])).toBeLessThan(0.005);
                });
            });
        }
    });
});
