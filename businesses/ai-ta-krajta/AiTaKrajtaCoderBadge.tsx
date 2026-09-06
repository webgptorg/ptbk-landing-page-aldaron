'use client';

import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { PromptbookCoderFloatingBadge } from '@/components/promptbook-coder/PromptbookCoderFloatingBadge';

/**
 * How high above the bottom edge the badge floats while an episode plays
 *
 * Note: The mini player is fixed to that edge and is taller than the corner the badge rests in, so the badge steps
 *       over it rather than being covered by it.
 */
const CODER_BADGE_LIFTED_CLASS_NAME = 'bottom-24';

/**
 * The badge of the tool this page was written with, kept out of the way of the mini player
 */
export function AiTaKrajtaCoderBadge() {
    const { playingEpisode } = useAiTaKrajtaPageState();

    return (
        <PromptbookCoderFloatingBadge className={playingEpisode === null ? undefined : CODER_BADGE_LIFTED_CLASS_NAME} />
    );
}
