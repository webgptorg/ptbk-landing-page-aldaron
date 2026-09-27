import {
    AI_TA_KRAJTA_MARK_BODY,
    placeAiTaKrajtaMarkPointInFrame,
    type AiTaKrajtaMarkFrame,
    type AiTaKrajtaMarkPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import {
    SEGMENT_DISTANCE_IN_PIXELS,
    TRAIL_POINT_DISTANCE_IN_PIXELS,
    type SnakeInitialPose,
    type SnakePoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';

/**
 * Distance between two points of the logo's centre line
 */
function getDistance(firstPoint: AiTaKrajtaMarkPoint, secondPoint: AiTaKrajtaMarkPoint): number {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

/**
 * Adds points at the same spacing the game remembers its trail with
 */
function createEvenlySpacedTrail(points: readonly AiTaKrajtaMarkPoint[]): SnakePoint[] {
    const firstPoint = points[0];

    if (firstPoint === undefined) {
        return [];
    }

    const trail: SnakePoint[] = [{ x: firstPoint.x, y: firstPoint.y }];
    let distanceUntilNextPoint = TRAIL_POINT_DISTANCE_IN_PIXELS;

    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
        const previousPoint = points[pointIndex - 1];
        const nextPoint = points[pointIndex];

        if (previousPoint === undefined || nextPoint === undefined) {
            continue;
        }

        const segmentDistance = getDistance(previousPoint, nextPoint);

        if (segmentDistance === 0) {
            continue;
        }

        let distanceFromPreviousPoint = distanceUntilNextPoint;

        while (distanceFromPreviousPoint <= segmentDistance) {
            const ratio = distanceFromPreviousPoint / segmentDistance;

            trail.push({
                x: previousPoint.x + (nextPoint.x - previousPoint.x) * ratio,
                y: previousPoint.y + (nextPoint.y - previousPoint.y) * ratio,
            });
            distanceFromPreviousPoint += TRAIL_POINT_DISTANCE_IN_PIXELS;
        }

        distanceUntilNextPoint = distanceFromPreviousPoint - segmentDistance;
    }

    const lastPoint = points[points.length - 1];

    if (lastPoint !== undefined) {
        trail.push({ x: lastPoint.x, y: lastPoint.y });
    }

    return trail;
}

/**
 * Creates the initial simulation pose from the exact frame occupied by the static logo
 */
export function createAiTaKrajtaSnakeLogoPose(frame: AiTaKrajtaMarkFrame): SnakeInitialPose {
    const points = AI_TA_KRAJTA_MARK_BODY.map((point) => placeAiTaKrajtaMarkPointInFrame(point, frame));
    const trail = createEvenlySpacedTrail(points);
    const headPosition = trail[0];
    const pointBehindHead = trail[1];

    if (headPosition === undefined || pointBehindHead === undefined) {
        throw new Error('The AI ta Krajta mark needs at least two body points.');
    }

    return {
        headPosition,
        headAngleInRadians: Math.atan2(headPosition.y - pointBehindHead.y, headPosition.x - pointBehindHead.x),
        trail,
        segmentCount: Math.max(
            2,
            Math.ceil(((trail.length - 1) * TRAIL_POINT_DISTANCE_IN_PIXELS) / SEGMENT_DISTANCE_IN_PIXELS),
        ),
    };
}
