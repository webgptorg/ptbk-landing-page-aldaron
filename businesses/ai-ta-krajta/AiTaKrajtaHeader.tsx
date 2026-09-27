'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import {
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_NAVIGATION_ITEMS,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_PLATFORMS,
} from '@/businesses/ai-ta-krajta/config';
import { cn } from '@/lib/utils';
import { Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * How far the visitor has to scroll before the header stops being see-through
 */
const SCROLLED_OFFSET_IN_PIXELS = 24;

/**
 * Header of the podcast page
 *
 * Note: The page does not use the header of the site on purpose. This one is dark, it navigates the show rather than
 *       the product, and its main button plays a recording instead of opening a form.
 */
export function AiTaKrajtaHeader() {
    const { newestPlayableEpisode, playingEpisode, viewState, playEpisode, setIsPlaying } = useAiTaKrajtaPageState();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > SCROLLED_OFFSET_IN_PIXELS);

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
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
        <header
            className={cn(
                'sticky top-0 z-40 border-b transition-colors duration-300',
                isScrolled
                    ? 'border-white/10 bg-[#1a201c]/90 backdrop-blur-md'
                    : 'border-transparent bg-transparent',
            )}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
                <Link href={AI_TA_KRAJTA_PATH} className="flex shrink-0 items-center gap-2.5 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#303832] p-1">
                        <AiTaKrajtaMark className="h-full w-full" />
                    </span>
                    <span className="text-[15px] font-semibold tracking-tight sm:text-base">{AI_TA_KRAJTA_NAME}</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex" aria-label="Sekce stránky">
                    {AI_TA_KRAJTA_NAVIGATION_ITEMS.map((navigationItem) => (
                        <a
                            key={navigationItem.href}
                            href={navigationItem.href}
                            className="text-sm text-white/65 transition-colors hover:text-white"
                        >
                            {navigationItem.label}
                        </a>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-4">
                    <nav className="hidden items-center gap-4 lg:flex" aria-label="Kde podcast vychází">
                        {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                            <a
                                key={platform.id}
                                href={platform.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-white/45 transition-colors hover:text-white"
                            >
                                {platform.label}
                            </a>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={handleListenClick}
                        disabled={newestPlayableEpisode === null}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[#ff6b6b] px-4 text-sm font-semibold text-[#1a201c] transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                    >
                        {isNewestEpisodePlaying ? (
                            <Pause className="h-4 w-4 fill-current" />
                        ) : (
                            <Play className="h-4 w-4 fill-current" />
                        )}
                        Poslouchat
                    </button>
                </div>
            </div>

            {/* Note: The bar above has no room for the navigation on a phone, so it moves into a strip which scrolls
                      sideways rather than behind a menu nobody opens. */}
            <nav
                className="flex gap-5 overflow-x-auto border-t border-white/[0.07] px-4 py-2.5 text-sm md:hidden"
                aria-label="Sekce stránky a kde podcast vychází"
            >
                {[...AI_TA_KRAJTA_NAVIGATION_ITEMS, ...AI_TA_KRAJTA_PLATFORMS.map(
                    (platform) => ({ label: platform.label, href: platform.url }),
                )].map((navigationItem) => (
                    <a
                        key={navigationItem.href}
                        href={navigationItem.href}
                        {...(navigationItem.href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}
                        className="shrink-0 whitespace-nowrap text-white/55 transition-colors hover:text-white"
                    >
                        {navigationItem.label}
                    </a>
                ))}
            </nav>
        </header>
    );
}
