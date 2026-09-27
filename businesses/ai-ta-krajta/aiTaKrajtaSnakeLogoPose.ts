import {
    AI_TA_KRAJTA_MARK_BODY,
    placeAiTaKrajtaMarkPointInFrame,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import {
    SEGMENT_DISTANCE_IN_PIXELS,
    type SnakeInitialPose,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';

/** Seeds the motion skeleton without resampling away its bends or rounding away the end of its tail. */
export function createAiTaKrajtaSnakeLogoPose(frame: AiTaKrajtaMarkFrame): SnakeInitialPose {
    const trail = AI_TA_KRAJTA_MARK_BODY.map((point) => placeAiTaKrajtaMarkPointInFrame(point, frame));
    const headPosition = trail[0];
    const pointBehindHead = trail[1];
    const bodyLength = trail.slice(1).reduce((length, point, index) => {
        const previousPoint = trail[index];
        return length + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    }, 0);

    return {
        headPosition,
        headAngleInRadians: Math.atan2(headPosition.y - pointBehindHead.y, headPosition.x - pointBehindHead.x),
        trail,
        // The simulation stores length in segment units; a fractional last segment preserves the whole drawing.
        segmentCount: 1 + bodyLength / SEGMENT_DISTANCE_IN_PIXELS,
    };
}
