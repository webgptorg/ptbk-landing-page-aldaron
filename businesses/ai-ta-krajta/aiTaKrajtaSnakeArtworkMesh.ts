import type { AiTaKrajtaMarkPoint } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';

export type AiTaKrajtaArtworkCommand<Point> = {
    readonly command: string;
    readonly points: readonly Point[];
};

type Edge<Point> = {
    readonly start: Point;
    readonly controls: readonly Point[];
    readonly end: Point;
};

type ReadPoint<Point> = (point: Point) => AiTaKrajtaMarkPoint;
type ArtworkMesh<Point> = readonly (readonly Edge<Point>[])[];

const GEOMETRY_TOLERANCE = 1e-8;

function signedArea(first: AiTaKrajtaMarkPoint, second: AiTaKrajtaMarkPoint, third: AiTaKrajtaMarkPoint): number {
    return (second.x - first.x) * (third.y - first.y) - (second.y - first.y) * (third.x - first.x);
}

/** Keep the original cubic edges, including straight closures introduced by clipping an underpainted layer. */
function readContours<Point>(commands: readonly AiTaKrajtaArtworkCommand<Point>[]): Edge<Point>[][] {
    const contours: Edge<Point>[][] = [];
    let edges: Edge<Point>[] = [];
    let position: Point;
    let start: Point;
    for (const { command, points } of commands) {
        if (command === 'M') {
            edges = [];
            contours.push(edges);
            position = start = points[0];
        } else if (command === 'Z') {
            edges.push({ start: position!, controls: [], end: start! });
        } else {
            const end = points[points.length - 1];
            edges.push({ start: position!, controls: points.slice(0, -1), end });
            position = end;
        }
    }
    return contours;
}

/** Ear clipping adds only interior diagonals. Boundary edges retain their exact Bezier controls. */
function triangulate<Point>(edges: readonly Edge<Point>[], readPoint: ReadPoint<Point>): number[][] {
    const points = edges.map((edge) => readPoint(edge.start));
    const pending = points.map((_, index) => index);
    const triangles: number[][] = [];
    const orientation = Math.sign(points.reduce((area, point, index) => {
        const next = points[(index + 1) % points.length];
        return area + point.x * next.y - next.x * point.y;
    }, 0));

    while (pending.length > 3) {
        let selectedIndex = -1;
        for (let index = 0; index < pending.length; index++) {
            const indices = [pending[(index + pending.length - 1) % pending.length], pending[index], pending[(index + 1) % pending.length]];
            const [first, second, third] = indices.map((index) => points[index]);
            const area = signedArea(first, second, third) * orientation;
            if (area < -GEOMETRY_TOLERANCE) continue;
            const isOccupied = area > GEOMETRY_TOLERANCE && pending.some((candidate) => !indices.includes(candidate) &&
                signedArea(first, second, points[candidate]) * orientation >= -GEOMETRY_TOLERANCE &&
                signedArea(second, third, points[candidate]) * orientation >= -GEOMETRY_TOLERANCE &&
                signedArea(third, first, points[candidate]) * orientation >= -GEOMETRY_TOLERANCE,
            );
            if (isOccupied) continue;
            selectedIndex = index;
            triangles.push(indices);
            break;
        }
        if (selectedIndex < 0) throw new Error('The snake artwork needs a simple closed contour.');
        pending.splice(selectedIndex, 1);
    }
    if (pending.length === 3) triangles.push(pending);
    return triangles;
}

function getTriangleEdge<Point>(edges: readonly Edge<Point>[], startIndex: number, endIndex: number): Edge<Point> {
    const start = edges[startIndex].start;
    const end = edges[endIndex].start;
    if (endIndex === (startIndex + 1) % edges.length) return { ...edges[startIndex], end };
    if (startIndex === (endIndex + 1) % edges.length) {
        return { start, controls: [...edges[endIndex].controls].reverse(), end };
    }
    return { start, controls: [], end };
}

/**
 * Partition the canonical fills once, without flattening or tracing their curves. A folded painted strip can
 * otherwise subtract from itself under SVG's winding rule, tearing holes in an animal whose skeleton is joined.
 */
export function createAiTaKrajtaSnakeArtworkMesh<Point>(
    commands: readonly AiTaKrajtaArtworkCommand<Point>[],
    readPoint: ReadPoint<Point>,
): ArtworkMesh<Point> {
    return readContours(commands).flatMap((contour) => {
        const edges = contour.filter((edge) => {
            const start = readPoint(edge.start);
            const end = readPoint(edge.end);
            return Math.hypot(end.x - start.x, end.y - start.y) > GEOMETRY_TOLERANCE;
        });
        return triangulate(edges, readPoint).map((indices) => indices.map((index, edgeIndex) =>
            getTriangleEdge(edges, index, indices[(edgeIndex + 1) % indices.length]),
        ));
    });
}

/** Positive winding makes folded patches overlap instead of canceling; reversing a patch changes no geometry. */
export function drawAiTaKrajtaSnakeArtworkMesh<Point>(mesh: ArtworkMesh<Point>, readPoint: ReadPoint<Point>): string {
    const writePoint = (point: Point) => {
        const position = readPoint(point);
        return `${position.x.toFixed(5)} ${position.y.toFixed(5)}`;
    };
    return mesh.map((triangle) => {
        const isReversed = signedArea(readPoint(triangle[0].start), readPoint(triangle[1].start), readPoint(triangle[2].start)) < 0;
        const edges = isReversed ? [...triangle].reverse() : triangle;
        const start = isReversed ? edges[0].end : edges[0].start;
        return `M${writePoint(start)}` + edges.map((edge) => {
            const controls = isReversed ? [...edge.controls].reverse() : edge.controls;
            const end = isReversed ? edge.start : edge.end;
            return (controls.length === 0 ? 'L' : `C${controls.map(writePoint).join(' ')} `) + writePoint(end);
        }).join('') + 'Z';
    }).join('');
}
