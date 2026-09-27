import {
    AI_TA_KRAJTA_MARK_BODY,
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_TAIL_JOINT,
    type AiTaKrajtaMarkPoint,
    type AiTaKrajtaMarkShape,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import {
    createAiTaKrajtaSnakeArtworkMesh,
    drawAiTaKrajtaSnakeArtworkMesh,
    type AiTaKrajtaArtworkCommand,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeArtworkMesh';

type MeasuredPath = {
    readonly points: readonly AiTaKrajtaMarkPoint[];
    readonly distances: readonly number[];
    readonly length: number;
};

type BodyAttachment = {
    readonly weight: number;
    readonly boneIndex: number;
    readonly real: number;
    readonly imaginary: number;
};

type BoundPoint = {
    readonly position: AiTaKrajtaMarkPoint;
    readonly attachments: readonly BodyAttachment[];
};

type BoundCommand = AiTaKrajtaArtworkCommand<BoundPoint>;

/** Short exact Bezier subdivisions let a curve follow a newly travelled bend, including a wall contact. */
const MAXIMUM_CURVE_SPAN = 3;
const BINDING_RADIUS = 5;
const MINIMUM_LENGTH = 1e-8;
const MAXIMUM_CLIP_SUBDIVISION_DEPTH = 32;
const MINIMUM_ATTACHMENT_WEIGHT = 1e-12;

function measurePath(points: readonly AiTaKrajtaMarkPoint[]): MeasuredPath {
    const distances = [0];
    for (let index = 1; index < points.length; index++) {
        const before = points[index - 1];
        const point = points[index];
        distances.push(distances[index - 1] + Math.hypot(point.x - before.x, point.y - before.y));
    }
    return { points, distances, length: distances[distances.length - 1] ?? 0 };
}

const REST_PATH = measurePath(AI_TA_KRAJTA_MARK_BODY);

/** Arc-length lookup uses the actual trail, including its exact wall/corner vertices. */
function samplePath(path: MeasuredPath, distance: number): AiTaKrajtaMarkPoint {
    let lower = 0;
    let upper = path.points.length - 1;
    const clampedDistance = Math.max(0, Math.min(path.length, distance));
    while (upper - lower > 1) {
        const middle = Math.floor((lower + upper) / 2);
        if (path.distances[middle] < clampedDistance) lower = middle;
        else upper = middle;
    }
    const before = path.points[lower];
    const after = path.points[upper];
    const span = path.distances[upper] - path.distances[lower];
    const ratio = span > MINIMUM_LENGTH ? (clampedDistance - path.distances[lower]) / span : 0;
    return { x: before.x + (after.x - before.x) * ratio, y: before.y + (after.y - before.y) * ratio };
}

/**
 * Moving least squares fits continuous local transformations to overlapping sections of the measured body.
 * A wall reflection never normalizes a zero tangent into an instantaneous outline flip. At rest every fitted
 * transformation is identity, including points off the centre line such as the asymmetric head and tapered tail.
 */
function bindPoint(point: AiTaKrajtaMarkPoint, range: readonly [number, number]): BoundPoint {
    const squaredDistances = REST_PATH.points.map((center, index) => index >= range[0] && index <= range[1]
        ? (point.x - center.x) ** 2 + (point.y - center.y) ** 2 : Infinity);
    const nearestDistance = Math.min(...squaredDistances);
    const weights = squaredDistances.map((distance) => Math.exp(-(distance - nearestDistance) / (2 * BINDING_RADIUS ** 2)));
    const totalWeight = weights.reduce((total, weight) => total + weight, 0);
    const normalizedWeights = weights.map((weight) => weight / totalWeight);
    const center = REST_PATH.points.reduce((result, point, index) => ({
        x: result.x + point.x * normalizedWeights[index],
        y: result.y + point.y * normalizedWeights[index],
    }), { x: 0, y: 0 });
    const variance = REST_PATH.points.reduce((total, point, index) =>
        total + normalizedWeights[index] * ((point.x - center.x) ** 2 + (point.y - center.y) ** 2), 0);
    const attachments = REST_PATH.points.map((bone, boneIndex) => {
        const weight = normalizedWeights[boneIndex];
        return {
            boneIndex,
            weight,
            real: weight * ((point.x - center.x) * (bone.x - center.x) + (point.y - center.y) * (bone.y - center.y)) / variance,
            imaginary: weight * ((point.y - center.y) * (bone.x - center.x) - (point.x - center.x) * (bone.y - center.y)) / variance,
        };
    }).filter((attachment) => attachment.weight > MINIMUM_ATTACHMENT_WEIGHT);
    return { position: point, attachments };
}

function midpoint(first: AiTaKrajtaMarkPoint, second: AiTaKrajtaMarkPoint): AiTaKrajtaMarkPoint {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

/** De Casteljau subdivision preserves the source curve exactly; no outline is traced or fitted here. */
function splitCurve(points: readonly AiTaKrajtaMarkPoint[]): readonly (readonly AiTaKrajtaMarkPoint[])[] {
    const [start, firstControl, secondControl, end] = points;
    const first = midpoint(start, firstControl);
    const middle = midpoint(firstControl, secondControl);
    const last = midpoint(secondControl, end);
    const left = midpoint(first, middle);
    const right = midpoint(middle, last);
    const center = midpoint(left, right);
    return [[start, first, left, center], [center, right, last, end]];
}

function subdivideCurve(points: readonly AiTaKrajtaMarkPoint[]): readonly (readonly AiTaKrajtaMarkPoint[])[] {
    const span = points.slice(1).reduce((length, point, index) =>
        length + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
    return span <= MAXIMUM_CURVE_SPAN ? [points] : splitCurve(points).flatMap(subdivideCurve);
}

/** Clips by subdivision of the actual cubics, without fitting or tracing a replacement outline. */
function clipTailCurves(
    curves: readonly (readonly AiTaKrajtaMarkPoint[])[],
    isRightSide: boolean,
): readonly (readonly AiTaKrajtaMarkPoint[])[] {
    const boundary = AI_TA_KRAJTA_MARK_BODY[AI_TA_KRAJTA_MARK_TAIL_JOINT.undersideEndPointIndex].x;
    const clipped: (readonly AiTaKrajtaMarkPoint[])[] = [];
    const visit = (curve: readonly AiTaKrajtaMarkPoint[], depth: number) => {
        const isInside = (point: AiTaKrajtaMarkPoint) => isRightSide ? point.x >= boundary : point.x <= boundary;
        if (curve.every(isInside)) { clipped.push(curve); return; }
        if (curve.every((point) => !isInside(point))) return;
        if (depth >= MAXIMUM_CLIP_SUBDIVISION_DEPTH) { if (isInside(curve[0])) clipped.push(curve); return; }
        splitCurve(curve).forEach((part) => visit(part, depth + 1));
    };
    curves.forEach((curve) => visit(curve, 0));
    return clipped;
}

function bindCurves(curves: readonly (readonly AiTaKrajtaMarkPoint[])[], range: readonly [number, number]): BoundCommand[] {
    if (curves.length === 0) return [];
    const commands: BoundCommand[] = [{ command: 'M', points: [bindPoint(curves[0][0], range)] }];
    let position = curves[0][0];
    for (const curve of curves) {
        if (Math.hypot(position.x - curve[0].x, position.y - curve[0].y) > MINIMUM_LENGTH) {
            commands.push({ command: 'L', points: [bindPoint(curve[0], range)] });
        }
        commands.push({ command: 'C', points: curve.slice(1).map((point) => bindPoint(point, range)) });
        position = curve[3];
    }
    commands.push({ command: 'Z', points: [] });
    return commands;
}

/** The canonical artwork uses absolute move/cubic/close commands. Fail explicitly if new artwork needs a new command. */
function readShapeCurves(pathData: string): readonly (readonly AiTaKrajtaMarkPoint[])[] {
    const tokens = pathData.match(/[a-zA-Z]|-?(?:\d*\.)?\d+(?:e[-+]?\d+)?/g) ?? [];
    const curves: (readonly AiTaKrajtaMarkPoint[])[] = [];
    let position = { x: 0, y: 0 };
    let start = position;
    let tokenIndex = 0;
    while (tokenIndex < tokens.length) {
        const command = tokens[tokenIndex++];
        const pointCount = command === 'M' ? 1 : command === 'C' ? 3 : command === 'Z' ? 0 : -1;
        if (pointCount < 0) throw new Error(`Unsupported mark command: ${command}`);
        const points = Array.from({ length: pointCount }, () => ({
            x: Number(tokens[tokenIndex++]), y: Number(tokens[tokenIndex++]),
        }));
        if (command === 'C') {
            curves.push(...subdivideCurve([position, ...points]));
        } else if (command === 'M') {
            start = points[0];
        } else if (command === 'Z') {
            curves.push([position, position, start, start]);
        }
        position = points[points.length - 1] ?? position;
    }
    return curves;
}

/** The joint is wholly inside the resting artwork; it is exposed only by the coil's actual movement. */
function bindHiddenTailJoint(range: readonly [number, number]): BoundCommand[] {
    const { firstPointIndex, lastPointIndex, maximumHalfWidth } = AI_TA_KRAJTA_MARK_TAIL_JOINT;
    const joint = AI_TA_KRAJTA_MARK_BODY.slice(firstPointIndex, lastPointIndex + 1);
    const sides = [-1, 1].map((side) => joint.map((point, index) => {
        const before = joint[Math.max(0, index - 1)];
        const after = joint[Math.min(joint.length - 1, index + 1)];
        const length = Math.hypot(after.x - before.x, after.y - before.y);
        const radius = Math.min(maximumHalfWidth, point.halfWidth / 2);
        return {
            x: point.x - (after.y - before.y) / length * radius * side,
            y: point.y + (after.x - before.x) / length * radius * side,
        };
    }));
    return [
        ...[...sides[0], ...sides[1].reverse()].map((point, index) => ({
            command: index === 0 ? 'M' : 'L', points: [bindPoint(point, range)],
        })),
        { command: 'Z', points: [] },
    ];
}

function bindShape(shape: AiTaKrajtaMarkShape) {
    const curves = readShapeCurves(shape.pathData);
    // The tail drawing includes the thin red underside of the foreground coil. It must stay with that coil when
    // the tail uncoils, instead of pulling the formerly hidden, wide underpainting out as a fin.
    const commands = shape.id === 'tail'
        ? [
            ...bindCurves(clipTailCurves(curves, false), AI_TA_KRAJTA_MARK_SHAPES[2].bodyPointRange),
            ...bindCurves(clipTailCurves(curves, true), shape.bodyPointRange),
            ...bindHiddenTailJoint(shape.bodyPointRange),
        ]
        : bindCurves(curves, shape.bodyPointRange);
    return {
        shape,
        mesh: createAiTaKrajtaSnakeArtworkMesh(commands, (point) => point.position),
        gradientAnchor: bindPoint(REST_PATH.points[shape.bodyPointRange[0]], shape.bodyPointRange),
    };
}

const BOUND_SHAPES = AI_TA_KRAJTA_MARK_SHAPES.map(bindShape);

export type AiTaKrajtaSnakeArtwork = {
    readonly pathData: string;
    readonly gradientStart: AiTaKrajtaMarkPoint;
    readonly gradientEnd: AiTaKrajtaMarkPoint;
};

/**
 * Moves the existing filled Bezier outlines, with their existing gradients, by the skeleton's actual displacement.
 * An unchanged skeleton is the identity transformation at any time: there is no release/morph parameter and no
 * later renderer switch. The same calculation also lets the artwork grow with the travelled body.
 */
export function createAiTaKrajtaSnakeArtwork(
    centerLine: readonly AiTaKrajtaMarkPoint[],
    artworkScale = 1,
): readonly AiTaKrajtaSnakeArtwork[] {
    if (centerLine.length < 2) return [];
    const path = measurePath(centerLine);
    const lengthRatio = path.length / REST_PATH.length;
    const bones = REST_PATH.distances.map((distance) => samplePath(path, distance * lengthRatio));
    // Growth stretches the length without inflating the head. A responsive resize, however, scales the entire
    // animal. Keeping that scale separate prevents the first redraw after a resize from narrowing its outline.
    const widthScale = lengthRatio > MINIMUM_LENGTH ? artworkScale / lengthRatio : 1;
    const movedPoints = new Map<BoundPoint, AiTaKrajtaMarkPoint>();
    const movePoint = (point: BoundPoint): AiTaKrajtaMarkPoint => {
        const cachedPoint = movedPoints.get(point);
        if (cachedPoint !== undefined) return cachedPoint;
        const movedPoint = point.attachments.reduce((result, attachment) => {
            const bone = bones[attachment.boneIndex];
            const real = attachment.weight + attachment.real * widthScale;
            const imaginary = attachment.imaginary * widthScale;
            return {
                x: result.x + real * bone.x - imaginary * bone.y,
                y: result.y + real * bone.y + imaginary * bone.x,
            };
        }, { x: 0, y: 0 });
        movedPoints.set(point, movedPoint);
        return movedPoint;
    };
    return BOUND_SHAPES.map(({ shape, mesh, gradientAnchor }) => {
        const [startIndex, endIndex] = shape.bodyPointRange;
        const restAnchor = REST_PATH.points[startIndex];
        const currentAnchor = movePoint(gradientAnchor);
        let real = 0;
        let imaginary = 0;
        let variance = 0;
        for (let index = startIndex + 1; index <= endIndex; index++) {
            const restOffsetX = REST_PATH.points[index].x - restAnchor.x;
            const restOffsetY = REST_PATH.points[index].y - restAnchor.y;
            const currentOffsetX = bones[index].x - bones[startIndex].x;
            const currentOffsetY = bones[index].y - bones[startIndex].y;
            real += restOffsetX * currentOffsetX + restOffsetY * currentOffsetY;
            imaginary += restOffsetX * currentOffsetY - restOffsetY * currentOffsetX;
            variance += restOffsetX ** 2 + restOffsetY ** 2;
        }
        real /= variance;
        imaginary /= variance;
        const moveGradientPoint = (point: AiTaKrajtaMarkPoint): AiTaKrajtaMarkPoint => ({
            x: currentAnchor.x + real * (point.x - restAnchor.x) - imaginary * (point.y - restAnchor.y),
            y: currentAnchor.y + real * (point.y - restAnchor.y) + imaginary * (point.x - restAnchor.x),
        });
        return {
            pathData: drawAiTaKrajtaSnakeArtworkMesh(mesh, movePoint),
            gradientStart: moveGradientPoint({ x: shape.gradient.x1, y: shape.gradient.y1 }),
            gradientEnd: moveGradientPoint({ x: shape.gradient.x2, y: shape.gradient.y2 }),
        };
    });
}

/** Owns only animation attributes; React and the original SVG keep owning the element and brand definition. */
export function createAiTaKrajtaSnakeArtworkRenderer(mark: SVGSVGElement) {
    const paths = Array.from(mark.querySelectorAll('path'));
    const gradients = Array.from(mark.querySelectorAll('linearGradient'));
    return {
        draw(centerLine: readonly AiTaKrajtaMarkPoint[], artworkScale = 1) {
            const artwork = createAiTaKrajtaSnakeArtwork(centerLine, artworkScale);
            artwork.forEach((shape, index) => {
                paths[index].setAttribute('d', shape.pathData);
                const gradient = gradients[index];
                gradient.setAttribute('x1', String(shape.gradientStart.x));
                gradient.setAttribute('y1', String(shape.gradientStart.y));
                gradient.setAttribute('x2', String(shape.gradientEnd.x));
                gradient.setAttribute('y2', String(shape.gradientEnd.y));
            });
        },
        reset() {
            AI_TA_KRAJTA_MARK_SHAPES.forEach((shape, index) => {
                paths[index].setAttribute('d', shape.pathData);
                const gradient = gradients[index];
                gradient.setAttribute('x1', String(shape.gradient.x1));
                gradient.setAttribute('y1', String(shape.gradient.y1));
                gradient.setAttribute('x2', String(shape.gradient.x2));
                gradient.setAttribute('y2', String(shape.gradient.y2));
            });
        },
    };
}
