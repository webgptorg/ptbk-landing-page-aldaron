import { cache } from 'react';
import { fetchAiTaKrajtaEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaArchive';
import { fetchPodcastFeed } from '@/lib/podcast/fetchPodcastFeed';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { PAVOL_PODCAST_APPEARANCES } from './pavolPodcastAppearances';
import { getPavolAiTaKrajtaPodcasts, resolvePavolPodcastAppearance } from './pavolPodcasts';

/** The page and its server-only sources share the same hourly revalidation window. */
const fetchPodcastSources = cache(async (revalidateSeconds: number) => {
    const [episodes, feeds] = await Promise.all([
        fetchAiTaKrajtaEpisodes(revalidateSeconds),
        Promise.all(PAVOL_PODCAST_APPEARANCES.map((appearance) => fetchPodcastFeed({
            feedUrl: appearance.feedUrl, showTitle: appearance.source, summaryStopPhrases: [], revalidateSeconds,
        }))),
    ]);
    return { episodes, feeds };
});

export async function fetchPavolPodcasts(language: SupportedHomepageLanguage, revalidateSeconds: number) {
    const { episodes, feeds } = await fetchPodcastSources(revalidateSeconds);
    return {
        appearances: PAVOL_PODCAST_APPEARANCES.map((appearance, index) =>
            resolvePavolPodcastAppearance(appearance, feeds[index].episodes, language),
        ).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)),
        aiTaKrajta: getPavolAiTaKrajtaPodcasts(episodes),
    };
}
