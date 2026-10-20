'use client';

import {
    isPlayableAiTaKrajtaEpisode,
    type AiTaKrajtaArchive,
    type AiTaKrajtaEpisode,
    type PlayableAiTaKrajtaEpisode,
} from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { filterAiTaKrajtaEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { useAiTaKrajtaEpisodeTranscriptSearch } from '@/businesses/ai-ta-krajta/useAiTaKrajtaEpisodeTranscriptSearch';
import {
    parseAiTaKrajtaViewState,
    serializeAiTaKrajtaViewState,
    type AiTaKrajtaViewState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { useAudioPlayerControls, type AudioTrack } from '@/components/audio-player/AudioPlayerProvider';
import { createAiTaKrajtaEpisodePath } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import type { PodcastEpisodePlaybackProgress } from '@/lib/podcast/podcastPlaybackProgress';
import type { PodcastPlaybackProgressByEpisodeSlug } from '@/lib/podcast/podcastPlaybackProgressStorage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Everything the sections of the page share, which is the archive of the show and what the visitor did with it
 */
type AiTaKrajtaPageStateValue = {
    readonly archive: AiTaKrajtaArchive;

    /**
     * Episodes left after the filter of the visitor, newest first
     */
    readonly filteredEpisodes: readonly AiTaKrajtaEpisode[];

    /**
     * Whether the current search still waits for the server-only transcript matches
     */
    readonly isTranscriptSearchPending: boolean;

    /**
     * Episode loaded in the mini player, `null` when the player is closed
     */
    readonly playingEpisode: PlayableAiTaKrajtaEpisode | null;

    /**
     * Newest episode there is a recording of, which is what the buttons offering to listen play
     *
     * Note: This is not always the newest episode. The video of an episode regularly comes out before its recording
     *       is published, and an episode which cannot be played must not be what a `Poslouchat` button loads.
     */
    readonly newestPlayableEpisode: PlayableAiTaKrajtaEpisode | null;

    readonly viewState: AiTaKrajtaViewState;

    /**
     * How far this browser got in every episode it ever played, so the archive can mark them
     *
     * Note: This is empty until the page is mounted, because only a browser knows what it remembers.
     */
    readonly playbackProgressByEpisodeSlug: PodcastPlaybackProgressByEpisodeSlug;

    /**
     * Whether the browser has already said what it remembers, which the player waits for before resuming an episode
     * it was opened straight on
     */
    readonly isPlaybackProgressRestored: boolean;

    /**
     * How far this browser got in one episode, as it stands at this very moment rather than as it was last rendered
     */
    readonly getEpisodePlaybackProgress: (episodeSlug: string | null) => PodcastEpisodePlaybackProgress | null;

    /**
     * Loads one episode into the mini player and starts it
     */
    readonly playEpisode: (episode: PlayableAiTaKrajtaEpisode) => void;

    /**
     * Starts the loaded episode or pauses it
     */
    readonly setIsPlaying: (isPlaying: boolean) => void;

    readonly closePlayer: () => void;

    /**
     * Narrows the archive down to one person, or widens it back when that person is already chosen
     */
    readonly togglePersonFilter: (personId: string) => void;

    readonly setSearchQuery: (searchQuery: string) => void;
    readonly showWholeArchive: () => void;
};

const AiTaKrajtaPageStateContext = createContext<AiTaKrajtaPageStateValue | null>(null);

/**
 * Holds the one state of the page and keeps it in the address bar
 *
 * Note: The filter and chosen episode live in the query parameters. The game is deliberately local to its terrarium,
 *       because a copied link should not start an interactive animation unexpectedly.
 */
export function AiTaKrajtaPageStateProvider({
    archive,
    children,
}: {
    readonly archive: AiTaKrajtaArchive;
    readonly children: ReactNode;
}) {
    const [urlViewState, changeViewState] = useUrlSynchronizedViewState<AiTaKrajtaViewState>({
        parseViewState: parseAiTaKrajtaViewState,
        serializeViewState: serializeAiTaKrajtaViewState,
    });

    const audio = useAudioPlayerControls();
    const { track, isPlaying, isRestored: isPlaybackProgressRestored, history } = audio;
    const [isPlayerConnected, setIsPlayerConnected] = useState(false);
    const lastObservedEpisodeRef = useRef<string | null>(null);
    const viewState = {
        ...urlViewState,
        playingEpisodeSlug: track?.kind === 'podcast' ? track.podcastEpisode?.slug ?? null : null,
        isPlaying: track?.kind === 'podcast' && isPlaying,
    };
    const playbackProgressByEpisodeSlug = useMemo<PodcastPlaybackProgressByEpisodeSlug>(() => Object.fromEntries(
        Object.entries(history).filter(([id]) => id.startsWith('ai-ta-krajta:')).map(([id, progress]) => [id.slice('ai-ta-krajta:'.length), progress]),
    ), [history]);
    const getEpisodePlaybackProgress = useCallback((slug: string | null) => slug ? audio.getProgress(`ai-ta-krajta:${slug}`) : null, [audio.getProgress]);

    const { transcriptMatchingEpisodeSlugs, isTranscriptSearchPending } = useAiTaKrajtaEpisodeTranscriptSearch(
        viewState.searchQuery,
    );

    const filteredEpisodes = useMemo(
        () =>
            filterAiTaKrajtaEpisodes(archive.episodes, {
                personId: viewState.personId,
                searchQuery: viewState.searchQuery,
                transcriptMatchingEpisodeSlugs,
            }),
        [archive.episodes, transcriptMatchingEpisodeSlugs, viewState.personId, viewState.searchQuery],
    );

    const playableEpisodes = useMemo(
        () => archive.episodes.filter(isPlayableAiTaKrajtaEpisode),
        [archive.episodes],
    );

    const playingEpisode = track?.kind === 'podcast' ? track.podcastEpisode ?? null : null;
    const newestPlayableEpisode = playableEpisodes[0] ?? null;
    const toTrack = useCallback((episode: PlayableAiTaKrajtaEpisode): AudioTrack => ({
        id: `ai-ta-krajta:${episode.slug}`, src: episode.audioUrl, title: episode.shortTitle,
        author: 'AI ta Krajta', href: createAiTaKrajtaEpisodePath(episode.slug), language: 'cs',
        kind: 'podcast', podcastEpisode: episode, durationInSeconds: episode.durationInSeconds,
        artwork: '/ai-ta-krajta/logo.png',
    }), []);

    // A shared link selects its recording, while a reload always restores it paused.
    useEffect(() => {
        if (!isPlaybackProgressRestored) return;
        if (!isPlayerConnected || urlViewState.playingEpisodeSlug !== lastObservedEpisodeRef.current) {
            const episode = playableEpisodes.find((item) => item.slug === urlViewState.playingEpisodeSlug);
            if (episode && track?.id !== `ai-ta-krajta:${episode.slug}`) audio.playTrack(toTrack(episode), false);
            lastObservedEpisodeRef.current = urlViewState.playingEpisodeSlug;
            setIsPlayerConnected(true);
        }
    }, [isPlaybackProgressRestored, isPlayerConnected, urlViewState.playingEpisodeSlug, playableEpisodes, track?.id, audio.playTrack, toTrack]);

    // The persistent player also changes from system controls and from another subpage.
    useEffect(() => {
        if (!isPlayerConnected) return;
        const slug = track?.kind === 'podcast' ? track.podcastEpisode?.slug ?? null : null;
        lastObservedEpisodeRef.current = slug;
        if (urlViewState.playingEpisodeSlug !== slug || urlViewState.isPlaying !== isPlaying) {
            changeViewState((previous) => ({ ...previous, playingEpisodeSlug: slug, isPlaying: !!slug && isPlaying }));
        }
    }, [isPlayerConnected, track?.id, isPlaying, changeViewState]);

    const playEpisode = useCallback((episode: PlayableAiTaKrajtaEpisode) => {
        lastObservedEpisodeRef.current = episode.slug;
        audio.playTrack(toTrack(episode));
        changeViewState((previous) => ({ ...previous, playingEpisodeSlug: episode.slug, isPlaying: true }));
    }, [audio.playTrack, changeViewState, toTrack]);

    const setIsPlaying = useCallback((playing: boolean) => {
        audio.setIsPlaying(playing);
        changeViewState((previous) => ({ ...previous, isPlaying: playing }));
    }, [audio.setIsPlaying, changeViewState]);

    const closePlayer = useCallback(() => {
        lastObservedEpisodeRef.current = null;
        audio.closePlayer();
        changeViewState((previous) => ({ ...previous, playingEpisodeSlug: null, isPlaying: false }));
    }, [audio.closePlayer, changeViewState]);

    const togglePersonFilter = useCallback(
        (personId: string) =>
            changeViewState((previousViewState) => ({
                ...previousViewState,
                personId: previousViewState.personId === personId ? null : personId,
            })),
        [changeViewState],
    );

    const setSearchQuery = useCallback(
        (searchQuery: string) => changeViewState((previousViewState) => ({ ...previousViewState, searchQuery })),
        [changeViewState],
    );

    const showWholeArchive = useCallback(
        () => changeViewState((previousViewState) => ({ ...previousViewState, isWholeArchiveShown: true })),
        [changeViewState],
    );

    const pageState = useMemo<AiTaKrajtaPageStateValue>(
        () => ({
            archive,
            filteredEpisodes,
            isTranscriptSearchPending,
            playingEpisode,
            newestPlayableEpisode,
            viewState,
            playbackProgressByEpisodeSlug,
            isPlaybackProgressRestored,
            getEpisodePlaybackProgress,
            playEpisode,
            setIsPlaying,
            closePlayer,
            togglePersonFilter,
            setSearchQuery,
            showWholeArchive,
        }),
        [
            archive,
            filteredEpisodes,
            isTranscriptSearchPending,
            playingEpisode,
            newestPlayableEpisode,
            viewState,
            playbackProgressByEpisodeSlug,
            isPlaybackProgressRestored,
            getEpisodePlaybackProgress,
            playEpisode,
            setIsPlaying,
            closePlayer,
            togglePersonFilter,
            setSearchQuery,
            showWholeArchive,
        ],
    );

    return <AiTaKrajtaPageStateContext.Provider value={pageState}>{children}</AiTaKrajtaPageStateContext.Provider>;
}

/**
 * Reads the state of the page from any of its sections
 */
export function useAiTaKrajtaPageState(): AiTaKrajtaPageStateValue {
    const pageState = useContext(AiTaKrajtaPageStateContext);

    if (pageState === null) {
        throw new Error('The section is rendered outside of AiTaKrajtaPageStateProvider');
    }

    return pageState;
}
