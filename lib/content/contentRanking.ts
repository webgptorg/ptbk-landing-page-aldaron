/** Editorial prominence: 1 is neutral, 0 removes an item from homepage selections only. */
export type RankedContent = { readonly publishedAt?: string; readonly prominence?: number };

/** Half the score after two years. The newest item's date anchors a deterministic selection. */
export function rankContent<T extends RankedContent>(items: readonly T[]): T[] {
    const dates = items.map(item => Date.parse(item.publishedAt ?? '')).filter(Number.isFinite);
    const newest = dates.length ? Math.max(...dates) : 0;
    const score = (item: T) => {
        const date = Date.parse(item.publishedAt ?? '');
        const ageYears = Number.isFinite(date) ? Math.max(0, newest - date) / (365.25 * 86400000) : 0;
        const prominence = Number.isFinite(item.prominence) ? Math.max(0, item.prominence!) : 1;
        return prominence / (1 + ageYears / 2);
    };
    return [...items].sort((a, b) => score(b) - score(a)
        || (Date.parse(b.publishedAt ?? '') || 0) - (Date.parse(a.publishedAt ?? '') || 0));
}
