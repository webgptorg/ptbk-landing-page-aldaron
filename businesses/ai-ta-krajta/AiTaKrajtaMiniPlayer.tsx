'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { useAudioPlayer } from '@/components/audio-player/AudioPlayerProvider';
import { getAiTaKrajtaEpisodePeople } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { AiTaKrajtaPersonAvatar } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonAvatar';
import { createAiTaKrajtaEpisodePath } from '@/businesses/ai-ta-krajta/aiTaKrajtaViewState';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { cn } from '@/lib/utils';
import { Check, Link2, Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react';
import { useState } from 'react';

/**
 * How far the rewind and the fast forward buttons jump, in seconds
 */
const REWIND_IN_SECONDS = 15;
const FAST_FORWARD_IN_SECONDS = 30;

/**
 * How long the copied link stays confirmed, in milliseconds
 */
const COPIED_CONFIRMATION_IN_MILLISECONDS = 2000;

const CONTROL_BUTTON_CLASS_NAME =
    'flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white';

/** The original show skin, rendered by the persistent global player on every show subpage. */
export function AiTaKrajtaMiniPlayer() {
    const { track, isPlaying, setIsPlaying, closePlayer, currentTime: currentTimeInSeconds, duration: durationInSeconds, seekTo } = useAudioPlayer();
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const playingEpisode = track?.kind === 'podcast' ? track.podcastEpisode : null;
    if (!playingEpisode) return null;
    const people = getAiTaKrajtaEpisodePeople(playingEpisode);
    const handleClosePlayer = closePlayer;

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(
            new URL(createAiTaKrajtaEpisodePath(playingEpisode.slug), window.location.origin).toString(),
        );
        setIsLinkCopied(true);
        window.setTimeout(() => setIsLinkCopied(false), COPIED_CONFIRMATION_IN_MILLISECONDS);
    };

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#1a201c]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
            data-ai-ta-krajta-mini-player
            data-fixed-bottom-control
        >
            <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#303832] p-1.5 sm:flex">
                        <AiTaKrajtaMark className="h-full w-full" />
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? 'Pozastavit' : 'Přehrát'}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff6b6b] text-[#1a201c] transition-transform hover:scale-105"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 fill-current" />
                        ) : (
                            <Play className="ml-0.5 h-5 w-5 fill-current" />
                        )}
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            onClick={() => seekTo(currentTimeInSeconds - REWIND_IN_SECONDS)}
                            aria-label={`Zpět o ${REWIND_IN_SECONDS} sekund`}
                            className={cn(CONTROL_BUTTON_CLASS_NAME, 'hidden sm:flex')}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => seekTo(currentTimeInSeconds + FAST_FORWARD_IN_SECONDS)}
                            aria-label={`Vpřed o ${FAST_FORWARD_IN_SECONDS} sekund`}
                            className={cn(CONTROL_BUTTON_CLASS_NAME, 'hidden sm:flex')}
                        >
                            <RotateCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {people.length > 0 && (
                                <ul className="hidden items-center md:flex">
                                    {people.map((person, personIndex) => (
                                        <li key={person.id} className={cn(personIndex > 0 && '-ml-2')}>
                                            <AiTaKrajtaPersonAvatar
                                                person={person}
                                                className="ring-2 ring-[#1a201c]"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="truncate text-sm font-medium text-white">
                                {playingEpisode.number !== null && (
                                    <span className="text-white/45">#{playingEpisode.number} </span>
                                )}
                                {playingEpisode.shortTitle}
                            </p>
                        </div>

                        <div className="mt-1.5 flex items-center gap-3">
                            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/45">
                                {formatPodcastEpisodeDuration(currentTimeInSeconds)}
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={Math.max(1, Math.round(durationInSeconds))}
                                value={Math.round(currentTimeInSeconds)}
                                onChange={(event) => seekTo(Number(event.target.value))}
                                aria-label="Pozice v dílu"
                                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#ff6b6b]"
                            />
                            <span className="w-10 shrink-0 text-[11px] tabular-nums text-white/45">
                                {durationInSeconds > 0 ? formatPodcastEpisodeDuration(durationInSeconds) : '--:--'}
                            </span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            aria-label="Zkopírovat odkaz na díl"
                            className={cn(CONTROL_BUTTON_CLASS_NAME, 'hidden sm:flex')}
                        >
                            {isLinkCopied ? <Check className="h-4 w-4 text-[#8fa4ff]" /> : <Link2 className="h-4 w-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClosePlayer}
                            aria-label="Zavřít přehrávač"
                            className={CONTROL_BUTTON_CLASS_NAME}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
