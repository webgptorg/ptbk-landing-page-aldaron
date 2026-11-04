'use client';

import { AiTaKrajtaNavigation } from './AiTaKrajtaNavigation';
import { useAiTaKrajtaPageState } from './AiTaKrajtaPageState';
import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Header of the podcast page
 *
 * Note: The page does not use the header of the site on purpose. This one is dark, it navigates the show rather than
 *       the product, and its main button plays a recording instead of opening a form.
 */
export function AiTaKrajtaHeader() {
    const { newestPlayableEpisode, playingEpisode, viewState, playEpisode, setIsPlaying } = useAiTaKrajtaPageState();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const isNewestEpisodePlaying =
        viewState.isPlaying && newestPlayableEpisode !== null && playingEpisode?.slug === newestPlayableEpisode.slug;

    const handleListenClick = () => {
        if (newestPlayableEpisode === null) {
            return;
        }

        if (isNewestEpisodePlaying) {
            setIsPlaying(false);
            return;
        }

        playEpisode(newestPlayableEpisode);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a201c]/90 backdrop-blur-md">
            <AiTaKrajtaNavigation>
                <button
                    type="button"
                    onClick={handleListenClick}
                    disabled={newestPlayableEpisode === null || !isHydrated}
                    aria-label={isNewestEpisodePlaying ? 'Pozastavit poslední díl' : 'Poslouchat poslední díl'}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#ff6b6b] px-3 text-sm font-semibold text-[#1a201c] transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                >
                    {isNewestEpisodePlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                    ) : (
                        <Play className="h-4 w-4 fill-current" />
                    )}
                    <span className="hidden sm:inline">Poslouchat</span>
                </button>
            </AiTaKrajtaNavigation>
        </header>
    );
}
