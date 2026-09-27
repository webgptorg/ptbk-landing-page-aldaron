import {
    AI_TA_KRAJTA_MARK_BODY,
    placeAiTaKrajtaMarkPointInFrame,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { createSnakeState, type SnakeBounds } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { describe, expect, it } from 'vitest';

const MARK_FRAME: AiTaKrajtaMarkFrame = {
    left: 96,
    top: 96,
    width: 256,
    height: 256,
};

const BOUNDS: SnakeBounds = { width: 448, height: 448 };

describe('AI ta Krajta snake logo pose', () => {
    it('begins at the exact displayed nose of the mark and keeps its tail in the same frame', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        const nosePoint = AI_TA_KRAJTA_MARK_BODY[0];
        const tailPoint = AI_TA_KRAJTA_MARK_BODY[AI_TA_KRAJTA_MARK_BODY.length - 1];

        expect(nosePoint).toBeDefined();
        expect(tailPoint).toBeDefined();
        expect(pose.headPosition).toEqual(placeAiTaKrajtaMarkPointInFrame(nosePoint!, MARK_FRAME));
        expect(pose.trail.at(-1)).toEqual(placeAiTaKrajtaMarkPointInFrame(tailPoint!, MARK_FRAME));
        expect(pose.segmentCount).toBeGreaterThan(2);
    });

    it('looks the way the drawn snake looks, which is to the right and a little down', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);

        expect(Math.cos(pose.headAngleInRadians)).toBeGreaterThan(0.9);
        expect(Math.abs(pose.headAngleInRadians)).toBeLessThan(Math.PI / 4);
    });

    it('lets the ordinary simulation keep the logo-shaped pose instead of replacing it at startup', () => {
        const pose = createAiTaKrajtaSnakeLogoPose(MARK_FRAME);
        const state = createSnakeState(BOUNDS, () => 0.5, pose);

        expect(state.headPosition).toEqual(pose.headPosition);
        expect(state.trail).toEqual(pose.trail);
        expect(state.segmentCount).toBe(pose.segmentCount);
        expect(state.score).toBe(0);
    });
});
