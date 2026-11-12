/** Bounded, pressure-shaped handwriting, shared by the homepage and its study. */
type Point = { x: number; y: number };
type Curve = [Point, Point, Point, Point];
export type InkStroke = {
    outline: string;
    spine: string;
    maskWidth: number;
    texture: string[];
    duration: number;
    delay: number;
    opacity: number;
};
export type InkDrawing = { seed: number; strokes: InkStroke[] };

/** Call after hydration, once per drawing, never during render or on a timer tick. */
export function freshInkSeed(previous?: number): number {
    const seed = typeof crypto !== 'undefined' && crypto.getRandomValues
        ? crypto.getRandomValues(new Uint32Array(1))[0]
        : Math.floor(Math.random() * 0x100000000);
    return seed === previous ? (seed + 1) >>> 0 : seed;
}

function randomFor(seed: number) {
    let state = seed >>> 0;
    return (min: number, max: number) => {
        state += 0x6D2B79F5;
        let value = Math.imul(state ^ state >>> 15, 1 | state);
        value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
        return min + (((value ^ value >>> 14) >>> 0) / 0x100000000) * (max - min);
    };
}
const number = (value: number) => Number(value.toFixed(2));
const xy = (point: Point) => `${number(point.x)} ${number(point.y)}`;

function at([a, b, c, d]: Curve, t: number): Point {
    const s = 1 - t;
    return {
        x: s ** 3 * a.x + 3 * s * s * t * b.x + 3 * s * t * t * c.x + t ** 3 * d.x,
        y: s ** 3 * a.y + 3 * s * s * t * b.y + 3 * s * t * t * c.y + t ** 3 * d.y,
    };
}
function normal([a, b, c, d]: Curve, t: number): Point {
    const s = 1 - t;
    const x = 3 * s * s * (b.x - a.x) + 6 * s * t * (c.x - b.x) + 3 * t * t * (d.x - c.x);
    const y = 3 * s * s * (b.y - a.y) + 6 * s * t * (c.y - b.y) + 3 * t * t * (d.y - c.y);
    const length = Math.hypot(x, y);
    return { x: -y / length, y: x / length };
}
function offset(point: Point, direction: Point, distance: number): Point {
    return { x: point.x + direction.x * distance, y: point.y + direction.y * distance };
}
function spline(points: Point[], closed = false): string {
    const point = (i: number) => closed ? points[(i + points.length) % points.length] : points[Math.max(0, Math.min(points.length - 1, i))];
    let path = `M${xy(points[0])}`;
    for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
        const [a, b, c, d] = [point(i - 1), point(i), point(i + 1), point(i + 2)];
        path += `C${xy({ x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 })} ${xy({ x: c.x - (d.x - b.x) / 6, y: c.y - (d.y - b.y) / 6 })} ${xy(c)}`;
    }
    return path + (closed ? 'Z' : '');
}
function stroke(curve: Curve, peak: number, roughness: number, random: ReturnType<typeof randomFor>, texture = false): Pick<InkStroke, 'outline' | 'spine' | 'maskWidth' | 'texture'> {
    const left: Point[] = [], right: Point[] = [];
    const phase = random(-.5, .5);
    for (let i = 0; i <= 24; i++) {
        const t = i / 24, p = at(curve, t), n = normal(curve, t);
        const pressure = .45 + Math.sin(Math.PI * t) ** .65 * peak * (1 + .12 * Math.sin(t * 7 + phase));
        left.push(offset(p, n, pressure / 2 + random(-roughness, roughness)));
        right.push(offset(p, n, -pressure / 2 + random(-roughness, roughness)));
    }
    const grain: string[] = [];
    if (texture) {
        for (let i = 0; i < 2; i++) {
            const start = random(.22, .64), end = Math.min(.86, start + random(.12, .24)), shift = random(-.8, .8);
            grain.push(spline(Array.from({ length: 7 }, (_, j) => {
                const t = start + (end - start) * j / 6;
                return offset(at(curve, t), normal(curve, t), shift);
            })));
        }
    }
    return {
        outline: spline([...left, ...right.reverse()], true),
        spine: `M${xy(curve[0])}C${xy(curve[1])} ${xy(curve[2])} ${xy(curve[3])}`,
        maskWidth: peak * 1.3 + 4,
        texture: grain,
    };
}

/** One cohesive family: a softly textured full stroke, then a lighter return. */
export function createInkDrawing(seed: number): InkDrawing {
    const random = randomFor(seed);
    const curve: Curve = [
        { x: random(4, 7), y: random(14, 17) },
        { x: random(39, 54), y: random(19, 24) },
        { x: random(103, 118), y: random(13, 19) },
        { x: random(151, 156), y: random(9, 13) },
    ];
    const returnCurve: Curve = [
        { x: random(142, 153), y: random(18, 21) },
        { x: random(112, 128), y: random(23, 27) },
        { x: random(61, 79), y: random(26, 30) },
        { x: random(24, 40), y: random(28, 32) },
    ];
    const duration = Math.round(random(570, 720));
    return {
        seed: seed >>> 0,
        strokes: [
            { ...stroke(curve, random(5.2, 7.6), .3, random, true), duration, delay: 0, opacity: 1 },
            { ...stroke(returnCurve, random(1.3, 2.5), .1, random), duration: Math.round(random(310, 430)), delay: duration + Math.round(random(65, 115)), opacity: random(.8, .95) },
        ],
    };
}
