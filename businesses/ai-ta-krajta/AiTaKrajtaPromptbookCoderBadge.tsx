'use client';

import { PROMPTBOOK_CODER_URL } from '@/businesses/ai-ta-krajta/aiTaKrajtaPromptbookCoder';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { useAiTaKrajtaPromptbookCoderBadge } from '@/businesses/ai-ta-krajta/useAiTaKrajtaPromptbookCoderBadge';

/**
 * A small, friendly terminal credit for the coding agent behind this page
 *
 * Note: It deliberately sits outside the content flow. The page keeps its ordinary reading and game interactions,
 *       while this opens the coder in a new tab for anyone curious about the little octopus.
 */
export function AiTaKrajtaPromptbookCoderBadge() {
    const { playingEpisode } = useAiTaKrajtaPageState();
    const {
        badgeReference,
        displayedAscii,
        isInitialCommandComplete,
        handlePointerEnter,
        handlePointerLeave,
    } = useAiTaKrajtaPromptbookCoderBadge();
    const bottomPositionClassName =
        playingEpisode === null
            ? 'bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:bottom-6'
            : 'bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] sm:bottom-28';

    return (
        <a
            ref={badgeReference}
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Otevřít Promptbook coder"
            title="Done by Promptbook coder"
            data-ai-ta-krajta-promptbook-coder-badge
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            className={`group fixed right-3 z-40 flex min-w-[13.5rem] max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-xl border border-cyan-100/20 bg-[#101916]/95 px-3 py-2 font-mono text-xs text-[#84f5e8] shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#84f5e8]/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84f5e8] ${bottomPositionClassName}`}
        >
            <span aria-hidden="true" className="flex shrink-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b6b]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#84f5e8]" />
            </span>
            <code
                aria-hidden="true"
                data-ai-ta-krajta-promptbook-coder-ascii
                className="min-w-0 flex-1 whitespace-pre text-[#d5fff9]"
            >
                {displayedAscii}
                <span
                    aria-hidden="true"
                    className={
                        isInitialCommandComplete
                            ? 'ml-0.5 text-[#84f5e8]/70 motion-safe:animate-pulse'
                            : 'ml-0.5 text-[#84f5e8] motion-safe:animate-pulse'
                    }
                >
                    ▍
                </span>
            </code>
        </a>
    );
}
