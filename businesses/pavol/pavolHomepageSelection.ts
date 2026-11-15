import type { ArticleListing } from '@/lib/articles/types';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { PavolMediaAppearance } from './config-media';
import type { PavolPodcast } from './pavolPodcasts';

export type PavolHomepageSourceItem =
    | { readonly kind: 'article'; readonly item: ArticleListing }
    | { readonly kind: 'podcast'; readonly item: PavolPodcast }
    | { readonly kind: 'media'; readonly item: PavolMediaAppearance };

export type PavolHomepageItem = PavolHomepageSourceItem & {
    /** Stable key for a homepage-only editorial interest override. */
    readonly key: string;
    readonly interest: number;
};

/**
 * Homepage curation only: larger numbers appear first; zero hides an item from this selection.
 * Edit `items` with a returned selection key to promote or omit one exact article, episode or press link.
 * Show defaults let the latest credited Krajta episode refresh without adding a new editorial entry.
 * Archives, feeds, publication status and the original prominence values are never changed here.
 */
export const PAVOL_HOMEPAGE_INTEREST: {
    readonly defaults: { readonly article: number; readonly syndicatedArticle: number; readonly podcast: number; readonly media: number };
    readonly podcastShows: Readonly<Record<string, number>>;
    readonly items: Readonly<Record<string, number>>;
} = {
    defaults: { article: 40, syndicatedArticle: 0, podcast: 60, media: 20 },
    podcastShows: {
        'AI ta Krajta': 100,
        'Data Talk': 90,
    },
    items: {
        'article:spec-driven-anchoring-cs': 80,
        'article:spec-driven-anchoring-en': 80,
        'media:https://euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi': 70,
    },
};

/** www aliases, campaign tags and player state identify the same canonical publication. */
function canonicalUrl(value: string): string {
    try {
        const url = new URL(value);
        url.protocol = 'https:';
        url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
        url.hash = '';
        url.pathname = url.pathname.replace(/\/+$/, '') || '/';
        for (const key of Array.from(url.searchParams.keys())) {
            if (/^utm_/i.test(key) || ['fbclid', 'gclid', 'playing'].includes(key.toLowerCase())) url.searchParams.delete(key);
        }
        url.searchParams.sort();
        return url.pathname === '/' && !url.search ? url.origin : url.toString();
    } catch {
        return value.trim();
    }
}

export function getPavolHomepageInterestKey(candidate: PavolHomepageSourceItem): string {
    return candidate.kind === 'media'
        ? `media:${canonicalUrl(candidate.item.href)}`
        : `${candidate.kind}:${candidate.item.id}`;
}

function podcastShowKey(source: string): string {
    return source.trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
}

function itemUrl(candidate: PavolHomepageSourceItem): string {
    return canonicalUrl(candidate.kind === 'article' ? candidate.item.canonicalUrl : candidate.item.href);
}

function defaultInterest(candidate: PavolHomepageSourceItem): number {
    if (candidate.kind === 'podcast') {
        const show = podcastShowKey(candidate.item.source);
        const configured = Object.entries(PAVOL_HOMEPAGE_INTEREST.podcastShows)
            .find(([name]) => podcastShowKey(name) === show)?.[1];
        return configured ?? PAVOL_HOMEPAGE_INTEREST.defaults.podcast;
    }
    if (candidate.kind === 'article') {
        return candidate.item.syndicated
            ? PAVOL_HOMEPAGE_INTEREST.defaults.syndicatedArticle
            : PAVOL_HOMEPAGE_INTEREST.defaults.article;
    }
    return PAVOL_HOMEPAGE_INTEREST.defaults.media;
}

function publishedTime(candidate: PavolHomepageSourceItem): number {
    const time = Date.parse(candidate.item.publishedAt ?? '');
    return Number.isFinite(time) ? time : 0;
}

/**
 * Interest takes precedence; equal-interest items use newest publication first and then a stable key.
 * Only passed public sources can be selected. The existing podcast loader owns Pavol's credited participation.
 * Original Czech audio remains eligible on English pages, with its language retained for the caller's label.
 */
export function selectPavolHomepageItems({
    language,
    articles,
    podcasts,
    appearances,
    limit = 5,
    interestOverrides = {},
}: {
    readonly language: SupportedHomepageLanguage;
    readonly articles: readonly ArticleListing[];
    readonly podcasts: readonly PavolPodcast[];
    readonly appearances: readonly PavolMediaAppearance[];
    readonly limit?: number;
    readonly interestOverrides?: Readonly<Record<string, number>>;
}): PavolHomepageItem[] {
    const boundedLimit = Number.isFinite(limit) ? Math.max(0, Math.min(5, Math.floor(limit))) : 5;
    const candidates: PavolHomepageSourceItem[] = [
        ...articles.filter(article => article.language === language)
            .map(item => ({ kind: 'article' as const, item })),
        ...podcasts.map(item => ({ kind: 'podcast' as const, item })),
        ...appearances.filter(appearance => !['Přednáška', 'Talk'].includes(appearance.kind))
            .map(item => ({ kind: 'media' as const, item })),
    ];
    const ranked = candidates.flatMap(candidate => {
        // A homepage override never revives a source explicitly omitted by its original editor.
        if (candidate.item.prominence === 0) return [];
        const key = getPavolHomepageInterestKey(candidate);
        const configured = interestOverrides[key] ?? PAVOL_HOMEPAGE_INTEREST.items[key];
        const interest = Number.isFinite(configured) ? Math.max(0, configured!) : defaultInterest(candidate);
        return interest > 0 ? [{ ...candidate, key, interest }] : [];
    }).sort((a, b) => b.interest - a.interest || publishedTime(b) - publishedTime(a) || a.key.localeCompare(b.key, 'en'));

    const selected: PavolHomepageItem[] = [];
    const keys = new Set<string>();
    const urls = new Set<string>();
    const shows = new Set<string>();
    for (const candidate of ranked) {
        if (selected.length >= boundedLimit) break;
        const url = itemUrl(candidate);
        const show = candidate.kind === 'podcast' ? podcastShowKey(candidate.item.source) : null;
        if (keys.has(candidate.key) || (url && urls.has(url)) || (show !== null && shows.has(show))) continue;
        selected.push(candidate);
        keys.add(candidate.key);
        if (url) urls.add(url);
        if (show !== null) shows.add(show);
    }
    return selected;
}
