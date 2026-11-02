import { rankContent } from '@/lib/content/contentRanking';
import type { PavolPodcast } from './pavolPodcasts';

export type PavolPodcastOrder = 'smart' | 'newest' | 'oldest';

/** Keep recency within each show, promoting the newest alternative when a show would repeat. */
export function sortPavolPodcasts<T extends Pick<PavolPodcast, 'source' | 'publishedAt' | 'prominence'>>(
    podcasts: readonly T[],
    order: PavolPodcastOrder = 'smart',
): T[] {
    const direction = order === 'oldest' ? 1 : -1;
    const remaining = [...podcasts].sort((a, b) =>
        direction * (Date.parse(a.publishedAt) - Date.parse(b.publishedAt)),
    );
    if (order !== 'smart') return remaining;

    const ranked = rankContent(remaining);
    remaining.splice(0, remaining.length, ...ranked);
    const result: T[] = [];
    let previousSource: string | undefined;
    while (remaining.length) {
        // The first draw takes the newest episode. Later draws alternate shows whenever possible.
        const alternative = remaining.findIndex((podcast) => podcast.source !== previousSource);
        const [next] = remaining.splice(alternative < 0 ? 0 : alternative, 1);
        result.push(next);
        previousSource = next.source;
    }
    return result;
}

/** Keep one of Pavol's own show episodes visible among the four editorial highlights. */
export function selectPavolHomepagePodcasts(podcasts: readonly PavolPodcast[], limit = 4): PavolPodcast[] {
    const ranked = sortPavolPodcasts(podcasts.filter(podcast => podcast.prominence !== 0));
    const selected = ranked.slice(0, limit);
    const ownShow = ranked.find(podcast => podcast.source === 'AI ta Krajta');
    if (limit > 0 && ownShow && !selected.includes(ownShow)) selected.splice(Math.max(0, selected.length - 1), 1, ownShow);
    return selected;
}
