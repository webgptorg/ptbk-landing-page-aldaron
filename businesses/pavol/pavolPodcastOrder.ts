import type { PavolPodcast } from './pavolPodcasts';

export type PavolPodcastOrder = 'smart' | 'newest' | 'oldest';

/** Keep recency within each show, promoting the newest alternative when a show would repeat. */
export function sortPavolPodcasts<T extends Pick<PavolPodcast, 'source' | 'publishedAt'>>(
    podcasts: readonly T[],
    order: PavolPodcastOrder = 'smart',
): T[] {
    const direction = order === 'oldest' ? 1 : -1;
    const remaining = [...podcasts].sort((a, b) =>
        direction * (Date.parse(a.publishedAt) - Date.parse(b.publishedAt)),
    );
    if (order !== 'smart') return remaining;

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
