/** Explicit, reviewed mapping from narration tokens to stable words in the rendered article. */
export interface ArticleTimedWord {
    readonly start: number;
    readonly end: number;
    /** Exact written word from the renderer; the spoken transcript is mapped editorially, not compared at runtime. */
    readonly text: string;
    readonly wordId: string;
    readonly sentenceId: string;
}

export interface ArticleWordTimings {
    readonly version: 1;
    readonly words: readonly ArticleTimedWord[];
}

/** Invalid or absent alignment disables tracking rather than inventing timestamps. */
export function parseArticleWordTimings(value: unknown): ArticleWordTimings | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Partial<ArticleWordTimings>;
    if (candidate.version !== 1 || !Array.isArray(candidate.words) || !candidate.words.length) return null;
    let previousStart = -1;
    const words: ArticleTimedWord[] = [];
    for (const word of candidate.words) {
        if (
            !word || typeof word !== 'object' ||
            typeof word.start !== 'number' || !Number.isFinite(word.start) || word.start < 0 ||
            typeof word.end !== 'number' || !Number.isFinite(word.end) || word.end <= word.start ||
            word.start < previousStart || typeof word.text !== 'string' || !word.text.trim() ||
            typeof word.wordId !== 'string' || !/^[wtp]\d+$/.test(word.wordId) ||
            typeof word.sentenceId !== 'string' || !word.sentenceId.trim()
        ) return null;
        previousStart = word.start;
        words.push({ start: word.start, end: word.end, text: word.text, wordId: word.wordId, sentenceId: word.sentenceId });
    }
    return { version: 1, words };
}

/** A silent gap is not a word; end times are exclusive. */
export function findArticleWordAtTime(words: readonly ArticleTimedWord[], time: number): ArticleTimedWord | undefined {
    if (!Number.isFinite(time) || time < 0) return undefined;
    let low = 0;
    let high = words.length - 1;
    let candidate = -1;
    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (words[middle].start <= time) { candidate = middle; low = middle + 1; }
        else high = middle - 1;
    }
    if (candidate < 0) return undefined;
    return time < words[candidate].end ? words[candidate] : undefined;
}

/** Several spoken tokens may intentionally point to the same original visual word. */
export function getArticleWordStartTimes(words: readonly ArticleTimedWord[]): ReadonlyMap<string, number> {
    const starts = new Map<string, number>();
    for (const word of words) if (!starts.has(word.wordId)) starts.set(word.wordId, word.start);
    return starts;
}

/** Media clocks can round a seek a microsecond below its target; land just inside the actual word interval. */
export function getArticleWordSeekTimes(words: readonly ArticleTimedWord[]): ReadonlyMap<string, number> {
    const times = new Map<string, number>();
    for (const word of words) if (!times.has(word.wordId)) {
        times.set(word.wordId, word.start + Math.min(0.001, (word.end - word.start) / 2));
    }
    return times;
}

export interface ArticleTimedSentence {
    readonly id: string;
    readonly start: number;
    readonly end: number;
    readonly wordIds: readonly string[];
}

export function getArticleTimedSentences(words: readonly ArticleTimedWord[]): readonly ArticleTimedSentence[] {
    const sentences = new Map<string, { id: string; start: number; end: number; wordIds: Set<string> }>();
    for (const word of words) {
        const sentence = sentences.get(word.sentenceId);
        if (sentence) {
            sentence.end = Math.max(sentence.end, word.end);
            sentence.wordIds.add(word.wordId);
        } else sentences.set(word.sentenceId, { id: word.sentenceId, start: word.start, end: word.end, wordIds: new Set([word.wordId]) });
    }
    return Array.from(sentences.values(), (sentence) => ({ ...sentence, wordIds: Array.from(sentence.wordIds) }));
}
