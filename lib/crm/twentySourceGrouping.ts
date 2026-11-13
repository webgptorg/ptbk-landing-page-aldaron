export type TwentySourceCategory = 'website' | 'workshop' | 'community' | 'license' | 'project';
export type TwentySourceGroups = Partial<Record<TwentySourceCategory, string>>;
const categories: readonly TwentySourceCategory[] = ['website', 'workshop', 'community', 'license', 'project'];

/** Invalid optional configuration must never stop the primary contact delivery. */
export function readTwentySourceGroups(raw?: string): TwentySourceGroups | undefined {
    if (!raw?.trim()) return undefined;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
        const result: TwentySourceGroups = {};
        for (const category of categories) {
            const id = (parsed as Record<string, unknown>)[category];
            if (id !== undefined && (typeof id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))) return undefined;
            if (typeof id === 'string') result[category] = id;
        }
        return Object.keys(result).length ? result : undefined;
    } catch { return undefined; }
}

export function getTwentySourceCategory(sourceType: string): TwentySourceCategory | undefined {
    if (sourceType === 'website') return 'website';
    if (['promptbook-subscription','promptbook-trial'].includes(sourceType)) return 'license';
    if (['workshop-registration', 'workshop-attendance', 'workshop-feedback'].includes(sourceType)) return 'workshop';
    if (['promptbook-article-proposal','community-registration', 'community-membership', 'community-attendance', 'community-feedback'].includes(sourceType)) return 'community';
    if (['project-attendance', 'project-feedback'].includes(sourceType)) return 'project';
    return undefined;
}
