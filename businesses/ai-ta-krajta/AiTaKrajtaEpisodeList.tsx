'use client';

import { AiTaKrajtaEpisodeCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeCard';
import { AiTaKrajtaLink } from '@/businesses/ai-ta-krajta/AiTaKrajtaLink';
import { serializeAiTaKrajtaViewState } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { isPlayableAiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { getAiTaKrajtaPersonById } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    AI_TA_KRAJTA_INITIAL_EPISODE_COUNT,
    AI_TA_KRAJTA_EPISODES_PATH,
    MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH,
    AI_TA_KRAJTA_PLATFORMS,
    AI_TA_KRAJTA_SECTION_IDS,
} from '@/businesses/ai-ta-krajta/config';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { ArchiveSearchField } from '@/components/podcast/ArchiveSearchField';
import { X } from 'lucide-react';

/**
 * What the section says when the filter matches nothing
 */
function AiTaKrajtaEmptyArchive({ hasEpisodes }: { readonly hasEpisodes: boolean }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/70">
                {hasEpisodes
                    ? 'Nic jsme nenašli. Zkuste jiné slovo nebo zrušte filtr.'
                    : 'Díly se teď nepodařilo načíst. Zatím je najdete na těchto platformách:'}
            </p>

            {!hasEpisodes && (
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                        <li key={platform.id}>
                            <a
                                href={platform.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
                            >
                                {platform.label}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * The whole archive of the show with its filter, its search and the button which plays a díl right here
 */
export function AiTaKrajtaEpisodeList({ isArchive = false }: { readonly isArchive?: boolean }) {
    const {
        archive,
        filteredEpisodes,
        isTranscriptSearchPending,
        playingEpisode,
        playbackProgressByEpisodeSlug,
        viewState,
        playEpisode,
        setIsPlaying,
        setSearchQuery,
        togglePersonFilter,
    } = useAiTaKrajtaPageState();

    const selectedPerson = getAiTaKrajtaPersonById(viewState.personId);
    const shownEpisodes = isArchive
        ? filteredEpisodes
        : filteredEpisodes.slice(0, AI_TA_KRAJTA_INITIAL_EPISODE_COUNT);
    const hiddenEpisodeCount = filteredEpisodes.length - shownEpisodes.length;
    const archiveSearchParams = serializeAiTaKrajtaViewState(
        { ...viewState, isWholeArchiveShown: false },
        new URLSearchParams(),
    ).toString();
    const archivePath = AI_TA_KRAJTA_EPISODES_PATH + (archiveSearchParams ? `?${archiveSearchParams}` : '');
    const Heading = isArchive ? 'h1' : 'h2';

    return (
        <section id={AI_TA_KRAJTA_SECTION_IDS.EPISODES} className="scroll-mt-28 md:scroll-mt-20 border-t border-white/10 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <Heading className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Díly</Heading>
                        <p className="mt-3 max-w-xl text-white/60">
                            Pusťte si díl rovnou tady. Přehrávač zůstane dole, i když sjedete dál.
                        </p>
                    </div>

                    <ArchiveSearchField value={viewState.searchQuery} onChange={setSearchQuery}
                        wrapperClassName="w-full md:w-72" iconClassName="text-white/35"
                        label="Hledat v dílech" placeholder="Hledat téma, model, jméno nebo slovo z dílu"
                        maxLength={MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH}
                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-white/40" />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/50">
                    <span>
                        {formatCzechCountedNoun(filteredEpisodes.length, ['díl', 'díly', 'dílů'])}
                        {filteredEpisodes.length !== archive.episodes.length &&
                            ` z ${archive.episodes.length}`}
                    </span>

                    {selectedPerson !== null && (
                        <button
                            type="button"
                            onClick={() => togglePersonFilter(selectedPerson.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6b6b]/15 py-1 pl-3 pr-2 text-[#ff9b8f] transition-colors hover:bg-[#ff6b6b]/25"
                        >
                            {selectedPerson.name}
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {viewState.searchQuery !== '' && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-3 pr-2 text-white/70 transition-colors hover:bg-white/15"
                        >
                            {viewState.searchQuery}
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {isTranscriptSearchPending && (
                        <span aria-live="polite" className="text-white/50">
                            Prohledávám přepisy.
                        </span>
                    )}
                </div>

                <div className="mt-8">
                    {shownEpisodes.length === 0 ? (
                        <AiTaKrajtaEmptyArchive hasEpisodes={archive.episodes.length > 0} />
                    ) : (
                        <ul aria-label="Díly podcastu" className="grid gap-4">
                            {shownEpisodes.map((episode) => {
                                const isLoaded = playingEpisode?.slug === episode.slug;

                                return (
                                    <li key={episode.id}>
                                        <AiTaKrajtaEpisodeCard
                                            episode={episode}
                                            isLoaded={isLoaded}
                                            isPlaying={isLoaded && viewState.isPlaying}
                                            playbackProgress={playbackProgressByEpisodeSlug[episode.slug] ?? null}
                                            selectedPersonId={viewState.personId}
                                            onPlayToggle={() => {
                                                if (isLoaded) {
                                                    setIsPlaying(!viewState.isPlaying);
                                                } else if (isPlayableAiTaKrajtaEpisode(episode)) {
                                                    playEpisode(episode);
                                                }
                                            }}
                                            onPersonClick={togglePersonFilter}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {hiddenEpisodeCount > 0 && (
                    <div className="mt-8 text-center">
                        <AiTaKrajtaLink
                            href={archivePath}
                            className="inline-flex h-11 items-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition-colors hover:border-white/50"
                        >
                            Zobrazit více
                        </AiTaKrajtaLink>
                    </div>
                )}
            </div>
        </section>
    );
}
