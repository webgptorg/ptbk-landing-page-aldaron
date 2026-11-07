import { getPavolEpisodeCopy, getPavolAppearanceCopy } from './pavolPodcastCopy';
import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AI_TA_KRAJTA_COVER_IMAGE_PATH, AI_TA_KRAJTA_NAME } from '@/businesses/ai-ta-krajta/config';
import { createAiTaKrajtaEpisodePath } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { AudioTrack } from '@/lib/audio-player/audioPlayerState';
import type { PodcastEpisode } from '@/lib/podcast/PodcastFeed';

export type PavolPodcast = {
    readonly id: string;
    readonly prominence?: number;
    readonly source: string;
    readonly title: string;
    readonly originalTitle?: string;
    readonly episodeLabel?: string;
    readonly textLanguage?: SupportedHomepageLanguage;
    readonly description: string;
    readonly href: string;
    readonly publishedAt: string;
    readonly language: SupportedHomepageLanguage;
    readonly audioUrl: string | null;
    readonly audioByteLength?: number;
    readonly durationInSeconds: number | null;
    readonly imageSrc?: string;
    readonly episodeArtworkUrl?: string;
};

export type PavolPodcastAppearance = Omit<PavolPodcast, 'description'> & {
    readonly description: Readonly<Record<SupportedHomepageLanguage, string>>;
    readonly feedUrl: string;
    readonly feedEpisodeId?: string;
    /** Used only within the reviewed show's own feed. */
    readonly feedTitleIncludes?: string;
};

/** The show's resolved roster remains the single authority for participation. */
export function getPavolAiTaKrajtaPodcasts(episodes: readonly AiTaKrajtaEpisode[], language: SupportedHomepageLanguage = 'cs'): PavolPodcast[] {
    return episodes.filter((episode) => episode.personIds.includes('pavol-hejny')).map((episode) => ({
        id: `ai-ta-krajta:${episode.slug}`,
        source: AI_TA_KRAJTA_NAME,
        prominence: 2,
        ...getPavolEpisodeCopy(episode, language),
        episodeLabel: /^\d+(?:-\d+)?$/.test(episode.slug) ? `#${episode.slug}` : episode.number !== null ? `#${episode.number}` : undefined,
        textLanguage: language,
        href: createPublicUrl(createAiTaKrajtaEpisodePath(episode.slug)),
        publishedAt: episode.publishedAt,
        language: 'cs' as const,
        audioUrl: episode.audioUrl,
        audioByteLength: episode.audioByteLength,
        durationInSeconds: episode.durationInSeconds,
        imageSrc: AI_TA_KRAJTA_COVER_IMAGE_PATH,
        episodeArtworkUrl: episode.imageUrl ?? undefined,
    })).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/** Refresh reviewed appearances only; a failed feed retains verified recordings and source links. */
export function resolvePavolPodcastAppearance(
    appearance: PavolPodcastAppearance,
    episodes: readonly PodcastEpisode[],
    language: SupportedHomepageLanguage,
): PavolPodcast {
    const episode = episodes.find((candidate) => appearance.feedEpisodeId
        ? candidate.id === appearance.feedEpisodeId
        : Boolean(appearance.feedTitleIncludes && candidate.title.includes(appearance.feedTitleIncludes)));
    return {
        id: appearance.id,
        source: appearance.source,
        prominence: appearance.prominence,
        title: getPavolAppearanceCopy(appearance.id, language)?.title ?? appearance.title,
        textLanguage: language,
        description: appearance.description[language],
        href: appearance.href,
        publishedAt: appearance.publishedAt,
        language: appearance.language,
        imageSrc: appearance.imageSrc,
        audioUrl: episode?.audioUrl ?? appearance.audioUrl,
        audioByteLength: episode?.audioByteLength ?? appearance.audioByteLength,
        durationInSeconds: episode?.durationInSeconds ?? appearance.durationInSeconds,
    };
}

/** Stable show recording IDs share local history while personal pages use the article player's appearance. */
export function createPavolPodcastTrack(podcast: PavolPodcast, language: SupportedHomepageLanguage): AudioTrack | null {
    if (!podcast.audioUrl) return null;
    return {
        id: podcast.id, src: podcast.audioUrl, title: podcast.title, author: podcast.source, href: podcast.href,
        language, kind: 'podcast', appearance: 'personal', durationInSeconds: podcast.durationInSeconds, artwork: podcast.imageSrc,
    };
}

/** Every show belongs to one timeline; sorting never changes a source's cached order. */
export function mergePavolPodcasts(...sources: ReadonlyArray<readonly PavolPodcast[]>): PavolPodcast[] {
    return sources.flat().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
