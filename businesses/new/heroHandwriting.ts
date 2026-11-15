import words from './heroCalligrapher.json';

export type HandwrittenWord = {
    width: number;
    strokes: { outline: string; spine: string; maskWidth: number; edgeWidth: number; start: number; duration: number }[];
};

/** Reviewed, whole-word Calligrapher style-9 exports. Never synthesize letters. */
export function handwritingFor(word: string): HandwrittenWord {
    const drawing = (words as Record<string, HandwrittenWord>)[word];
    if (!drawing) throw new Error(`Missing Calligrapher drawing: ${word}`);
    return drawing;
}
