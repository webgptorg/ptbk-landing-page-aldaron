import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';

/**
 * A point of the playing field, in pixels of the canvas
 */
export type SnakePoint = {
    readonly x: number;
    readonly y: number;
};

/**
 * Size of the playing field, in pixels of the canvas
 */
export type SnakeBounds = {
    readonly width: number;
    readonly height: number;
};

/**
 * One token lying on the field, waiting to be eaten
 */
export type SnakeFood = {
    readonly id: number;
    readonly position: SnakePoint;

    /**
     * Which of the two colors of the show this token is drawn in
     */
    readonly isWarm: boolean;
};

export type SnakeState = {
    readonly headPosition: SnakePoint;

    /**
     * Direction the head is moving in, in radians, zero pointing right
     */
    readonly headAngleInRadians: number;

    /**
     * The path the head has travelled, newest first. Wall contacts stay in the path so the body follows the rebound.
     */
    readonly trail: readonly SnakePoint[];

    /**
     * How many segments the body is drawn with, which is how the snake shows that it grew
     */
    readonly segmentCount: number;

    readonly food: readonly SnakeFood[];

    /**
     * How many tokens have been eaten
     */
    readonly score: number;

    /**
     * Identifier the next token will be given, so that React can tell two tokens apart
     */
    readonly nextFoodId: number;
};

/**
 * The part of a game state which decides how the snake first appears
 */
export type SnakeInitialPose = Pick<SnakeState, 'headPosition' | 'headAngleInRadians' | 'trail' | 'segmentCount'>;

/**
 * How fast the snake glides, in pixels per second
 */
const SPEED_IN_PIXELS_PER_SECOND = 175;

/**
 * How sharply the snake can turn, in radians per second
 */
const MAXIMUM_TURN_IN_RADIANS_PER_SECOND = 4.2;

/**
 * How fast the snake turns while nobody is pointing at it, in radians per second
 */
const IDLE_TURN_IN_RADIANS_PER_SECOND = 0.9;

/**
 * Distance between two remembered points of the trail, in pixels
 */
export const TRAIL_POINT_DISTANCE_IN_PIXELS = 4;

/**
 * Distance between two drawn segments of the body, in pixels
 */
export const SEGMENT_DISTANCE_IN_PIXELS = 8;

/**
 * How long the body is before the snake eats anything
 */
const INITIAL_SEGMENT_COUNT = 14;

/**
 * Direction of the snake while it first appears in the middle of the field
 */
const INITIAL_HEAD_ANGLE_IN_RADIANS = -Math.PI / 2;

/**
 * How much longer the body gets with every eaten token
 */
const SEGMENT_COUNT_PER_FOOD = 3;

/**
 * Where the body stops growing, so that it never fills the whole field
 */
const MAXIMUM_SEGMENT_COUNT = 70;

/**
 * How many tokens lie on the field at once
 */
const FOOD_COUNT = 5;

/**
 * How close the head has to come to a token to eat it, in pixels
 */
const EATING_DISTANCE_IN_PIXELS = 18;

/**
 * How far from the walls a token is placed and how close the head may come to a wall, in pixels
 */
export const FIELD_MARGIN_IN_PIXELS = 26;

/**
 * How far from the head a new token appears, so that it is never eaten the moment it is placed
 */
const MINIMUM_FOOD_DISTANCE_IN_PIXELS = 90;

/**
 * How long one step of the simulation may be, in seconds
 *
 * Note: A browser tab which was in the background hands over one enormous step. Cutting it keeps the snake from
 *       teleporting across the field when the visitor comes back.
 */
const MAXIMUM_STEP_IN_SECONDS = 1 / 20;

/**
 * Keep a small canvas usable without letting an almost zero-width field cause dozens of bounces in one frame
 */
const MINIMUM_PLAYABLE_SPAN_IN_PIXELS = 8;

/**
 * The distance tolerance used to treat two axis contacts as the same corner hit
 */
const WALL_CONTACT_DISTANCE_TOLERANCE = 1e-8;

type PlayableFieldBounds = {
    readonly minimumX: number;
    readonly maximumX: number;
    readonly minimumY: number;
    readonly maximumY: number;
};

type ReflectedMovement = {
    readonly headPosition: SnakePoint;
    readonly headAngleInRadians: number;
    readonly path: readonly SnakePoint[];
};

function getDistance(firstPoint: SnakePoint, secondPoint: SnakePoint): number {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

/**
 * Writes an angle as the shortest turn, between minus half a turn and half a turn
 */
function normalizeAngle(angleInRadians: number): number {
    return Math.atan2(Math.sin(angleInRadians), Math.cos(angleInRadians));
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

/**
 * The part of the canvas where the head and tokens can safely move
 */
function getPlayableFieldBounds(bounds: SnakeBounds): PlayableFieldBounds {
    const getAxisBounds = (length: number) => {
        const safeLength = Number.isFinite(length) ? Math.max(0, length) : 0;

        if (safeLength < MINIMUM_PLAYABLE_SPAN_IN_PIXELS) {
            return { minimum: safeLength / 2, maximum: safeLength / 2 };
        }

        const margin = Math.min(FIELD_MARGIN_IN_PIXELS, (safeLength - MINIMUM_PLAYABLE_SPAN_IN_PIXELS) / 2);

        return { minimum: margin, maximum: safeLength - margin };
    };

    const horizontalBounds = getAxisBounds(bounds.width);
    const verticalBounds = getAxisBounds(bounds.height);

    return {
        minimumX: horizontalBounds.minimum,
        maximumX: horizontalBounds.maximum,
        minimumY: verticalBounds.minimum,
        maximumY: verticalBounds.maximum,
    };
}

/**
 * Distance along one direction vector until the next wall, or infinity when this axis cannot hit a wall
 */
function getDistanceToWall(
    coordinate: number,
    direction: number,
    minimumCoordinate: number,
    maximumCoordinate: number,
): number {
    if (maximumCoordinate <= minimumCoordinate || direction === 0) {
        return Number.POSITIVE_INFINITY;
    }

    if (direction > 0) {
        return Math.max(0, (maximumCoordinate - coordinate) / direction);
    }

    return Math.max(0, (minimumCoordinate - coordinate) / direction);
}

/**
 * Adds a point only when it contributes real length to the path
 */
function appendDistinctPathPoint(path: SnakePoint[], point: SnakePoint): void {
    const previousPoint = path[path.length - 1];

    if (previousPoint === undefined || getDistance(previousPoint, point) > WALL_CONTACT_DISTANCE_TOLERANCE) {
        path.push(point);
    }
}

/**
 * Follows the head's actual piecewise-linear route, including each wall or corner contact
 */
function traceReflectedMovement(
    previousHeadPosition: SnakePoint,
    headAngleInRadians: number,
    distance: number,
    bounds: SnakeBounds,
): ReflectedMovement {
    const { minimumX, maximumX, minimumY, maximumY } = getPlayableFieldBounds(bounds);
    const horizontalSpan = maximumX - minimumX;
    const verticalSpan = maximumY - minimumY;
    const path: SnakePoint[] = [];
    let currentPosition = {
        x: clamp(previousHeadPosition.x, minimumX, maximumX),
        y: clamp(previousHeadPosition.y, minimumY, maximumY),
    };
    let directionX = Math.cos(headAngleInRadians);
    let directionY = Math.sin(headAngleInRadians);
    let remainingDistance = distance;

    appendDistinctPathPoint(path, currentPosition);

    while (remainingDistance > WALL_CONTACT_DISTANCE_TOLERANCE) {
        const horizontalDistance = getDistanceToWall(currentPosition.x, directionX, minimumX, maximumX);
        const verticalDistance = getDistanceToWall(currentPosition.y, directionY, minimumY, maximumY);
        const distanceToWall = Math.min(horizontalDistance, verticalDistance);

        if (!Number.isFinite(distanceToWall) || distanceToWall > remainingDistance) {
            currentPosition = {
                x: horizontalSpan === 0 ? minimumX : clamp(currentPosition.x + directionX * remainingDistance, minimumX, maximumX),
                y: verticalSpan === 0 ? minimumY : clamp(currentPosition.y + directionY * remainingDistance, minimumY, maximumY),
            };
            appendDistinctPathPoint(path, currentPosition);
            remainingDistance = 0;
            break;
        }

        const isHorizontalContact = horizontalDistance <= distanceToWall + WALL_CONTACT_DISTANCE_TOLERANCE;
        const isVerticalContact = verticalDistance <= distanceToWall + WALL_CONTACT_DISTANCE_TOLERANCE;
        const travelDistance = Math.min(remainingDistance, distanceToWall);

        currentPosition = {
            x: horizontalSpan === 0 ? minimumX : clamp(currentPosition.x + directionX * travelDistance, minimumX, maximumX),
            y: verticalSpan === 0 ? minimumY : clamp(currentPosition.y + directionY * travelDistance, minimumY, maximumY),
        };

        if (isHorizontalContact) {
            currentPosition = { ...currentPosition, x: directionX > 0 ? maximumX : minimumX };
        }

        if (isVerticalContact) {
            currentPosition = { ...currentPosition, y: directionY > 0 ? maximumY : minimumY };
        }

        appendDistinctPathPoint(path, currentPosition);
        remainingDistance = Math.max(0, remainingDistance - travelDistance);

        if (isHorizontalContact && horizontalSpan > 0) {
            directionX *= -1;
        }

        if (isVerticalContact && verticalSpan > 0) {
            directionY *= -1;
        }
    }

    return {
        headPosition: currentPosition,
        headAngleInRadians: Math.atan2(directionY, directionX),
        path,
    };
}

/**
 * How many remembered trail points make up a body of the requested length
 */
function getNeededTrailLength(segmentCount: number): number {
    const trailPointsPerSegment = SEGMENT_DISTANCE_IN_PIXELS / TRAIL_POINT_DISTANCE_IN_PIXELS;

    return Math.ceil(segmentCount * trailPointsPerSegment) + 2;
}

/**
 * Fills the body behind the head before the first animation frame, so the snake never starts as overlapping dots
 */
function createInitialTrail(headPosition: SnakePoint): SnakePoint[] {
    return Array.from({ length: getNeededTrailLength(INITIAL_SEGMENT_COUNT) }, (_, trailPointIndex) => {
        const distanceFromHead = trailPointIndex * TRAIL_POINT_DISTANCE_IN_PIXELS;

        return {
            x: headPosition.x - Math.cos(INITIAL_HEAD_ANGLE_IN_RADIANS) * distanceFromHead,
            y: headPosition.y - Math.sin(INITIAL_HEAD_ANGLE_IN_RADIANS) * distanceFromHead,
        };
    });
}

/**
 * The ordinary centred pose used by simulations which do not begin from the logo
 */
function createDefaultSnakeInitialPose(bounds: SnakeBounds): SnakeInitialPose {
    const headPosition = { x: bounds.width / 2, y: bounds.height / 2 };

    return {
        headPosition,
        headAngleInRadians: INITIAL_HEAD_ANGLE_IN_RADIANS,
        trail: createInitialTrail(headPosition),
        segmentCount: INITIAL_SEGMENT_COUNT,
    };
}

/**
 * Places one token somewhere on the field, out of reach of the head
 */
function createFood(
    id: number,
    bounds: SnakeBounds,
    headPosition: SnakePoint,
    createRandomNumber: CreateRandomNumber,
): SnakeFood {
    const { minimumX, maximumX, minimumY, maximumY } = getPlayableFieldBounds(bounds);
    const usableWidth = maximumX - minimumX;
    const usableHeight = maximumY - minimumY;

    // Note: A field can be smaller than the distance asked for, so the search gives up after a few tries instead of
    //       spinning forever.
    for (let attempt = 0; attempt < 12; attempt++) {
        const position = {
            x: minimumX + createRandomNumber() * usableWidth,
            y: minimumY + createRandomNumber() * usableHeight,
        };

        if (getDistance(position, headPosition) >= MINIMUM_FOOD_DISTANCE_IN_PIXELS || attempt === 11) {
            return { id, position, isWarm: createRandomNumber() < 0.5 };
        }
    }

    throw new Error('Unreachable, the loop above always returns');
}

/**
 * Sets the field up with a supplied starting pose and the first tokens around it
 */
export function createSnakeState(
    bounds: SnakeBounds,
    createRandomNumber: CreateRandomNumber,
    initialPose: SnakeInitialPose = createDefaultSnakeInitialPose(bounds),
): SnakeState {
    const food: SnakeFood[] = [];

    for (let foodIndex = 0; foodIndex < FOOD_COUNT; foodIndex++) {
        food.push(createFood(foodIndex, bounds, initialPose.headPosition, createRandomNumber));
    }

    return {
        ...initialPose,
        food,
        score: 0,
        nextFoodId: FOOD_COUNT,
    };
}

/**
 * Which way the head wants to go, which is towards the pointer or, when there is none, around in a slow circle
 */
function getDesiredAngleInRadians(
    state: SnakeState,
    targetPosition: SnakePoint | null,
    stepInSeconds: number,
): number {
    if (targetPosition === null) {
        return state.headAngleInRadians + IDLE_TURN_IN_RADIANS_PER_SECOND * stepInSeconds;
    }

    return Math.atan2(targetPosition.y - state.headPosition.y, targetPosition.x - state.headPosition.x);
}

/**
 * Keeps only the part of the remembered path that can still be drawn by the tail
 */
function trimTrailToBodyLength(trail: readonly SnakePoint[], segmentCount: number): SnakePoint[] {
    const neededDistance = Math.max(0, segmentCount - 1) * SEGMENT_DISTANCE_IN_PIXELS;
    const newestPoint = trail[0];

    if (newestPoint === undefined) {
        return [];
    }

    const trimmedTrail = [newestPoint];
    let rememberedDistance = 0;

    for (let pointIndex = 1; pointIndex < trail.length; pointIndex++) {
        const previousPoint = trail[pointIndex - 1];
        const point = trail[pointIndex];

        if (previousPoint === undefined || point === undefined) {
            continue;
        }

        const segmentDistance = getDistance(previousPoint, point);
        const remainingDistance = neededDistance - rememberedDistance;

        if (segmentDistance <= remainingDistance) {
            trimmedTrail.push(point);
            rememberedDistance += segmentDistance;
            continue;
        }

        if (segmentDistance > 0 && remainingDistance > 0) {
            const ratio = remainingDistance / segmentDistance;

            trimmedTrail.push({
                x: previousPoint.x + (point.x - previousPoint.x) * ratio,
                y: previousPoint.y + (point.y - previousPoint.y) * ratio,
            });
        }

        break;
    }

    return trimmedTrail;
}

/**
 * Adds the just-travelled path in reverse order so the newest head position stays at trail index zero
 */
function extendTrail(
    trail: readonly SnakePoint[],
    pathFromOldestToNewest: readonly SnakePoint[],
    segmentCount: number,
): SnakePoint[] {
    const newestToOldestMovement = [...pathFromOldestToNewest].reverse();

    return trimTrailToBodyLength([...newestToOldestMovement, ...trail.slice(1)], segmentCount);
}

/**
 * Rescales a running snake and its food when its CSS-sized field changes dimensions
 */
export function resizeSnakeState(
    state: SnakeState,
    previousBounds: SnakeBounds,
    nextBounds: SnakeBounds,
): SnakeState {
    const previousField = getPlayableFieldBounds(previousBounds);
    const nextField = getPlayableFieldBounds(nextBounds);
    const previousHorizontalSpan = previousField.maximumX - previousField.minimumX;
    const nextHorizontalSpan = nextField.maximumX - nextField.minimumX;
    const previousVerticalSpan = previousField.maximumY - previousField.minimumY;
    const nextVerticalSpan = nextField.maximumY - nextField.minimumY;
    const horizontalScale = previousHorizontalSpan === 0 ? 1 : nextHorizontalSpan / previousHorizontalSpan;
    const verticalScale = previousVerticalSpan === 0 ? 1 : nextVerticalSpan / previousVerticalSpan;
    const resizeCoordinate = (
        coordinate: number,
        previousMinimum: number,
        previousSpan: number,
        nextMinimum: number,
        nextSpan: number,
        scale: number,
    ) => (previousSpan === 0 ? nextMinimum + nextSpan / 2 : nextMinimum + (coordinate - previousMinimum) * scale);
    const resizePoint = (point: SnakePoint): SnakePoint => ({
        x: resizeCoordinate(
            point.x,
            previousField.minimumX,
            previousHorizontalSpan,
            nextField.minimumX,
            nextHorizontalSpan,
            horizontalScale,
        ),
        y: resizeCoordinate(
            point.y,
            previousField.minimumY,
            previousVerticalSpan,
            nextField.minimumY,
            nextVerticalSpan,
            verticalScale,
        ),
    });
    const headAngleInRadians =
        nextHorizontalSpan === 0 && nextVerticalSpan === 0
            ? state.headAngleInRadians
            : Math.atan2(
                  Math.sin(state.headAngleInRadians) * verticalScale,
                  Math.cos(state.headAngleInRadians) * horizontalScale,
              );

    return {
        ...state,
        headPosition: resizePoint(state.headPosition),
        headAngleInRadians,
        trail: state.trail.map(resizePoint),
        food: state.food.map((food) => ({ ...food, position: resizePoint(food.position) })),
    };
}

export type AdvanceSnakeStateOptions = {
    readonly bounds: SnakeBounds;

    /**
     * Where the pointer is, `null` when it left the field and the snake glides on its own
     */
    readonly targetPosition: SnakePoint | null;

    readonly stepInSeconds: number;
    readonly createRandomNumber: CreateRandomNumber;
};

/**
 * Moves the game on by one step
 *
 * Note: The whole game is this one pure function, so the component around it only has to draw what it returns and a
 *       test can play the game without a canvas.
 */
export function advanceSnakeState(state: SnakeState, options: AdvanceSnakeStateOptions): SnakeState {
    const stepInSeconds = Math.min(MAXIMUM_STEP_IN_SECONDS, Math.max(0, options.stepInSeconds));
    const desiredAngle = getDesiredAngleInRadians(state, options.targetPosition, stepInSeconds);
    const maximumTurn = MAXIMUM_TURN_IN_RADIANS_PER_SECOND * stepInSeconds;
    const turn = clamp(normalizeAngle(desiredAngle - state.headAngleInRadians), -maximumTurn, maximumTurn);
    const angleAfterTurn = normalizeAngle(state.headAngleInRadians + turn);
    const distance = SPEED_IN_PIXELS_PER_SECOND * stepInSeconds;
    const movement = traceReflectedMovement(state.headPosition, angleAfterTurn, distance, options.bounds);
    const { headPosition, headAngleInRadians } = movement;

    const eatenFood = state.food.filter(
        (food) => getDistance(food.position, headPosition) <= EATING_DISTANCE_IN_PIXELS,
    );
    const segmentCount = Math.min(
        MAXIMUM_SEGMENT_COUNT,
        state.segmentCount + eatenFood.length * SEGMENT_COUNT_PER_FOOD,
    );

    const food = state.food.map((existingFood, foodIndex) =>
        eatenFood.includes(existingFood)
            ? createFood(state.nextFoodId + foodIndex, options.bounds, headPosition, options.createRandomNumber)
            : existingFood,
    );

    return {
        headPosition,
        headAngleInRadians,
        trail: extendTrail(state.trail, movement.path, segmentCount),
        segmentCount,
        food,
        score: state.score + eatenFood.length,
        nextFoodId: state.nextFoodId + (eatenFood.length === 0 ? 0 : state.food.length),
    };
}

/**
 * The centre-line samples behind the nose, retaining every exact wall contact between regular spacing points
 */
export function getSnakeSegments(state: SnakeState, bounds: SnakeBounds): readonly SnakePoint[] {
    const trail = trimTrailToBodyLength(state.trail, state.segmentCount);
    const { minimumX, maximumX, minimumY, maximumY } = getPlayableFieldBounds(bounds);
    const bodyLength = Math.max(0, state.segmentCount - 1) * SEGMENT_DISTANCE_IN_PIXELS;
    const segments: SnakePoint[] = [];
    let distanceAlongPath = 0;
    let nextRegularSampleDistance = TRAIL_POINT_DISTANCE_IN_PIXELS;

    for (let pointIndex = 1; pointIndex < trail.length; pointIndex++) {
        const previousPoint = trail[pointIndex - 1];
        const point = trail[pointIndex];

        if (previousPoint === undefined || point === undefined) {
            continue;
        }

        const pathSegmentDistance = getDistance(previousPoint, point);
        const distanceAtSegmentEnd = distanceAlongPath + pathSegmentDistance;

        while (
            pathSegmentDistance > 0 &&
            nextRegularSampleDistance <= distanceAtSegmentEnd + WALL_CONTACT_DISTANCE_TOLERANCE &&
            nextRegularSampleDistance <= bodyLength
        ) {
            const ratio = clamp((nextRegularSampleDistance - distanceAlongPath) / pathSegmentDistance, 0, 1);

            appendDistinctPathPoint(segments, {
                x: previousPoint.x + (point.x - previousPoint.x) * ratio,
                y: previousPoint.y + (point.y - previousPoint.y) * ratio,
            });
            nextRegularSampleDistance += TRAIL_POINT_DISTANCE_IN_PIXELS;
        }

        const isWallContactPoint =
            Math.abs(point.x - minimumX) <= WALL_CONTACT_DISTANCE_TOLERANCE ||
            Math.abs(point.x - maximumX) <= WALL_CONTACT_DISTANCE_TOLERANCE ||
            Math.abs(point.y - minimumY) <= WALL_CONTACT_DISTANCE_TOLERANCE ||
            Math.abs(point.y - maximumY) <= WALL_CONTACT_DISTANCE_TOLERANCE;

        if (isWallContactPoint && distanceAtSegmentEnd <= bodyLength + WALL_CONTACT_DISTANCE_TOLERANCE) {
            appendDistinctPathPoint(segments, point);
        }

        distanceAlongPath = distanceAtSegmentEnd;

        if (distanceAlongPath >= bodyLength) {
            break;
        }
    }

    return segments;
}
