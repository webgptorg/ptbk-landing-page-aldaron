/** Original monoline pen paths, drawn for the homepage (no font or remote service).
 * Coordinates share a baseline at 80; dots and accents are written after the word.
 * A stroke's weight controls time, rather than assigning equal time to each letter.
 */
type PenStroke = { d: string; weight: number };
type Letter = { advance: number; strokes: PenStroke[]; markX?: number };
const stroke = (d: string, weight = 1): PenStroke => ({ d, weight });
const LETTERS: Record<string, Letter> = {
    a: { advance: 51, strokes: [stroke('M43 35 C32 24 9 35 7 59 C5 79 24 87 38 70 C45 60 45 43 43 35 C40 53 38 73 48 80', 1.7)] },
    c: { advance: 46, strokes: [stroke('M42 37 C29 24 9 38 6 58 C2 81 27 88 44 73', 1.1)] },
    d: { advance: 54, strokes: [stroke('M43 36 C29 25 8 38 7 59 C5 80 24 86 39 67 C49 50 54 12 51 6 C47 1 42 18 42 47 C40 68 42 79 51 80', 2)] },
    e: { advance: 46, strokes: [stroke('M8 59 C25 59 43 45 37 35 C29 23 7 39 6 59 C4 82 28 87 46 72', 1.3)] },
    f: { advance: 34, strokes: [stroke('M8 111 C16 89 13 27 24 11 C30 2 40 9 35 21 C32 29 27 32 22 34', 1.2), stroke('M3 48 C15 46 28 45 36 44', .3)] },
    i: { advance: 23, markX: 14, strokes: [stroke('M14 36 C11 51 7 76 20 79', .65)] },
    j: { advance: 29, markX: 21, strokes: [stroke('M21 36 C21 57 27 98 13 109 C6 114 -3 108 -6 102', 1)] },
    k: { advance: 49, strokes: [stroke('M12 81 C13 56 19 22 18 8', .8), stroke('M46 35 C36 42 24 54 15 60 C25 57 32 77 47 79', .95)] },
    l: { advance: 26, strokes: [stroke('M9 58 C21 40 27 10 21 7 C9 2 7 49 10 68 C11 78 17 83 25 77', 1.15)] },
    n: { advance: 52, strokes: [stroke('M9 36 C10 48 7 68 7 80 C13 61 28 29 39 36 C49 42 38 72 50 79', 1.35)] },
    o: { advance: 51, strokes: [stroke('M37 34 C23 26 8 39 6 59 C4 80 21 88 36 75 C51 63 50 39 37 34 C30 32 29 39 35 42', 1.6)] },
    p: { advance: 51, strokes: [stroke('M12 36 C13 59 9 89 11 110', .9), stroke('M13 48 C23 31 43 28 47 46 C53 69 30 86 14 74', 1.25)] },
    r: { advance: 38, strokes: [stroke('M9 37 C11 49 8 70 8 80 C11 59 20 32 30 34 C35 35 34 42 31 45', 1)] },
    s: { advance: 43, strokes: [stroke('M39 37 C24 26 9 34 11 44 C13 53 35 53 36 64 C38 82 15 88 4 75', 1.25)] },
    t: { advance: 35, strokes: [stroke('M22 18 C18 34 10 66 15 76 C18 84 28 79 33 75', .9), stroke('M3 43 C15 42 27 40 37 41', .35)] },
    u: { advance: 54, strokes: [stroke('M10 36 C6 51 4 73 16 79 C30 85 42 57 45 36 C41 55 40 78 52 79', 1.45)] },
    v: { advance: 49, strokes: [stroke('M7 36 C8 52 11 69 21 80 C34 67 43 48 45 34', 1)] },
    w: { advance: 69, strokes: [stroke('M7 36 C8 55 8 71 19 79 C28 69 32 50 35 40 C35 55 36 73 46 79 C58 64 64 47 65 35', 1.6)] },
    y: { advance: 53, strokes: [stroke('M8 36 C4 56 5 77 19 78 C33 78 42 53 44 35 C43 60 49 97 32 108 C24 114 11 111 5 103', 1.8)] },
    z: { advance: 49, strokes: [stroke('M7 39 C20 33 32 33 44 36 C33 50 18 65 6 78 C20 75 35 76 46 80', 1.15)] },
};

export type HandwrittenWord = { width: number; strokes: (PenStroke & { x: number; start: number; duration: number })[] };

export function handwritingFor(word: string): HandwrittenWord {
    let x = 10;
    const body: (PenStroke & { x: number })[] = [];
    const marks: (PenStroke & { x: number })[] = [];
    for (const character of word) {
        const [base, ...accents] = Array.from(character.normalize('NFD'));
        const letter = LETTERS[base];
        if (!letter) throw new Error(`Missing homepage handwriting: ${character}`);
        body.push(...letter.strokes.map(path => ({ ...path, x })));
        const markX = letter.markX ?? letter.advance / 2;
        if (accents.includes('\u0301')) {
            marks.push({ ...stroke(`M${markX - 3} 19 Q${markX + 3} 12 ${markX + 9} 6`, .22), x });
        } else if (letter.markX !== undefined) {
            marks.push({ ...stroke(`M${markX} 18 l.7 -1.7`, .1), x });
        }
        if (accents.includes('\u030c')) {
            marks.push({ ...stroke(`M${markX - 9} 9 L${markX - 1} 20 L${markX + 12} 7`, .28), x });
        }
        x += letter.advance;
    }
    const paths = [...body, ...marks];
    const total = paths.reduce((sum, path) => sum + path.weight, 0);
    let cursor = 0;
    return {
        width: x + 6,
        strokes: paths.map(path => {
            const start = cursor / total;
            cursor += path.weight;
            return { ...path, start, duration: path.weight / total };
        }),
    };
}
