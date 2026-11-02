/**
 * Writes text the way it is compared, so that `Koblížkem` and `koblizkem` are the same word
 */
export function normalizeSearchText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/**
 * Splits what a visitor typed into the words every result must contain
 */
export function createSearchWords(searchQuery: string): readonly string[] {
    return normalizeSearchText(searchQuery).split(/\s+/).filter(Boolean);
}

/**
 * Whether a piece of text contains every word the visitor is looking for
 */
export function isTextMatchingSearchWords(text: string, searchWords: readonly string[]): boolean {
    const normalizedText = normalizeSearchText(text);

    return searchWords.every((searchWord) => normalizedText.includes(searchWord));
}
