'use client';

import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { getAiTaKrajtaEpisodeLink, type AiTaKrajtaEpisodeLink } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeLink';
import { getAiTaKrajtaEpisodePeople } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { formatAiTaKrajtaDate } from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import { AiTaKrajtaPersonAvatar } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonAvatar';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import {
    getPodcastEpisodePlaybackStatus,
    getPodcastEpisodePlayedRatio,
    getPodcastEpisodeRemainingInSeconds,
    type PodcastEpisodePlaybackProgress,
    type PodcastEpisodePlaybackStatus,
} from '@/lib/podcast/podcastPlaybackProgress';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, Pause, Play } from 'lucide-react';

/**
 * What the round button of an episode does, said so that a half-played episode is told from a new one without seeing
 * the card
 */
function getEpisodeControlLabel(
    episode: AiTaKrajtaEpisode,
    isPlaying: boolean,
    playbackStatus: PodcastEpisodePlaybackStatus,
): string {
    if (isPlaying) {
        return `Pozastavit ${episode.title}`;
    }

    if (playbackStatus === 'partiallyPlayed') {
        return `Pokračovat v ${episode.title}`;
    }

    return `Přehrát ${episode.title}`;
}

/**
 * The round button an episode is started from
 *
 * Note: An episode whose video is already out while its recording is not has nothing to play here, so the very same
 *       button opens that video rather than doing nothing. An episode which is neither playable nor linked anywhere
 *       is left with a button which says so by being dimmed.
 */
function AiTaKrajtaEpisodeControl({
    episode,
    episodeLink,
    isLoaded,
    isPlaying,
    playbackStatus,
    onPlayToggle,
}: {
    readonly episode: AiTaKrajtaEpisode;
    readonly episodeLink: AiTaKrajtaEpisodeLink | null;
    readonly isLoaded: boolean;
    readonly isPlaying: boolean;
    readonly playbackStatus: PodcastEpisodePlaybackStatus;
    readonly onPlayToggle: () => void;
}) {
    const controlClassName = cn(
        'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform',
        isLoaded ? 'bg-[#ff6b6b] text-[#1a201c]' : 'bg-white/10 text-white group-hover:bg-white/20',
    );

    if (episode.audioUrl !== null) {
        return (
            <button
                type="button"
                onClick={onPlayToggle}
                aria-label={getEpisodeControlLabel(episode, isPlaying, playbackStatus)}
                className={cn(controlClassName, 'hover:scale-105')}
            >
                {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
            </button>
        );
    }

    if (episodeLink === null) {
        return (
            <span aria-hidden="true" className={cn(controlClassName, 'opacity-40')}>
                <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
        );
    }

    return (
        <a
            href={episodeLink.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${episodeLink.label}: ${episode.title}`}
            className={cn(controlClassName, 'hover:scale-105')}
        >
            <ArrowUpRight className="h-5 w-5" />
        </a>
    );
}

/**
 * What this browser already heard of the episode, the way a podcast application marks it
 *
 * Note: An episode nobody started is marked with nothing at all, because an archive of untouched episodes should look
 *       like an archive rather than like a checklist.
 */
function AiTaKrajtaEpisodePlaybackMark({
    episode,
    playbackStatus,
    playbackProgress,
}: {
    readonly episode: AiTaKrajtaEpisode;
    readonly playbackStatus: PodcastEpisodePlaybackStatus;
    readonly playbackProgress: PodcastEpisodePlaybackProgress | null;
}) {
    if (playbackStatus === 'played') {
        return (
            <span className="inline-flex items-center gap-1 text-[#8fa4ff]">
                <Check className="h-3.5 w-3.5" />
                Přehráno
            </span>
        );
    }

    if (playbackStatus !== 'partiallyPlayed') {
        return null;
    }

    const playedRatio = getPodcastEpisodePlayedRatio(playbackProgress, episode.durationInSeconds);
    const remainingInSeconds = getPodcastEpisodeRemainingInSeconds(playbackProgress, episode.durationInSeconds);

    return (
        <span className="inline-flex items-center gap-2 text-[#ff9b8f]">
            {playedRatio !== null && (
                <span aria-hidden="true" className="h-1 w-12 overflow-hidden rounded-full bg-white/15">
                    <span
                        className="block h-full rounded-full bg-[#ff6b6b]"
                        style={{ width: `${Math.round(playedRatio * 100)}%` }}
                    />
                </span>
            )}
            {remainingInSeconds === null
                ? 'Rozposlouchané'
                : `Zbývá ${formatPodcastEpisodeDuration(remainingInSeconds)}`}
        </span>
    );
}

/**
 * The complete credit line kept independently of portrait profiles, so a guest never disappears merely because the
 * archive does not have a portrait for them yet.
 */
function AiTaKrajtaEpisodeHostList({ hostNames }: { readonly hostNames: readonly string[] }) {
    if (hostNames.length === 0) {
        return null;
    }

    return <p className="mt-3 text-sm leading-relaxed text-white/55">U mikrofonu: {hostNames.join(', ')}</p>;
}

/**
 * One episode of the archive, with everything a listener decides by before pressing play
 */
export function AiTaKrajtaEpisodeCard({
    episode,
    isLoaded,
    isPlaying,
    playbackProgress,
    selectedPersonId,
    onPlayToggle,
    onPersonClick,
}: {
    readonly episode: AiTaKrajtaEpisode;

    /**
     * Whether this is the episode the mini player has loaded
     */
    readonly isLoaded: boolean;

    /**
     * Whether this episode is playing right now
     */
    readonly isPlaying: boolean;

    /**
     * How far this browser got in the episode, `null` for an episode nobody here ever started
     */
    readonly playbackProgress: PodcastEpisodePlaybackProgress | null;

    readonly selectedPersonId: string | null;
    readonly onPlayToggle: () => void;
    readonly onPersonClick: (personId: string) => void;
}) {
    const people = getAiTaKrajtaEpisodePeople(episode);
    const episodeLink = getAiTaKrajtaEpisodeLink(episode);
    const playbackStatus = getPodcastEpisodePlaybackStatus(playbackProgress);

    return (
        <article
            className={cn(
                'group relative rounded-2xl border p-5 transition-colors sm:p-6',
                isLoaded
                    ? 'border-[#ff6b6b]/60 bg-[#ff6b6b]/[0.07]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25',
            )}
        >
            <div className="flex gap-4 sm:gap-5">
                <AiTaKrajtaEpisodeControl
                    episode={episode}
                    episodeLink={episodeLink}
                    isLoaded={isLoaded}
                    isPlaying={isPlaying}
                    playbackStatus={playbackStatus}
                    onPlayToggle={onPlayToggle}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                        {episode.number !== null && (
                            <span className="font-semibold text-white/70">#{episode.number}</span>
                        )}
                        <time dateTime={episode.publishedAt}>{formatAiTaKrajtaDate(episode.publishedAt)}</time>
                        {episode.durationInSeconds !== null && (
                            <span>{formatPodcastEpisodeDuration(episode.durationInSeconds)}</span>
                        )}
                        <AiTaKrajtaEpisodePlaybackMark
                            episode={episode}
                            playbackStatus={playbackStatus}
                            playbackProgress={playbackProgress}
                        />
                    </div>

                    <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white">{episode.shortTitle}</h3>

                    {episode.summary !== '' && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">{episode.summary}</p>
                    )}

                    <AiTaKrajtaEpisodeHostList hostNames={episode.hosts} />

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                        {people.length > 0 && (
                            <ul className="flex items-center">
                                {people.map((person, personIndex) => (
                                    <li key={person.id} className={cn(personIndex > 0 && '-ml-2')}>
                                        <button
                                            type="button"
                                            onClick={() => onPersonClick(person.id)}
                                            title={`Filtrovat díly s ${person.name}`}
                                            className={cn(
                                                'block rounded-full ring-2 transition-transform hover:z-10 hover:scale-110',
                                                selectedPersonId === person.id
                                                    ? 'ring-[#ff6b6b]'
                                                    : 'ring-[#232a25] hover:ring-white/40',
                                            )}
                                        >
                                            <AiTaKrajtaPersonAvatar person={person} />
                                            <span className="sr-only">{person.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {episodeLink !== null && (
                            <a
                                href={episodeLink.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-white/45 transition-colors hover:text-white"
                            >
                                {episodeLink.label}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
