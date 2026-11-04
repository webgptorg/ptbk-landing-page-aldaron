'use client';

import type { AiTaKrajtaArchive } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AiTaKrajtaCollaborationSection } from '@/businesses/ai-ta-krajta/AiTaKrajtaCollaborationSection';
import { AiTaKrajtaEpisodeList } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeList';
import { AiTaKrajtaFooter } from '@/businesses/ai-ta-krajta/AiTaKrajtaFooter';
import { AiTaKrajtaHeader } from '@/businesses/ai-ta-krajta/AiTaKrajtaHeader';
import { AiTaKrajtaHero } from '@/businesses/ai-ta-krajta/AiTaKrajtaHero';
import { AiTaKrajtaPageStateProvider } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { AiTaKrajtaPeopleSection } from '@/businesses/ai-ta-krajta/AiTaKrajtaPeopleSection';
import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import { AI_TA_KRAJTA_EPISODES_PATH, AI_TA_KRAJTA_PATH } from './config';
import { useSearchParams } from 'next/navigation';
import { AiTaKrajtaPrototypePage } from './prototypes/AiTaKrajtaPrototypePage';

const CODER_BADGE_OBSTACLE_SELECTOR = '[data-ai-ta-krajta-mini-player], .cookie-consent__panel';
const CODER_BADGE_PLAYMATE_SELECTOR = '[data-ai-ta-krajta-terrarium]';

/**
 * The page of the AI ta Krajta podcast
 *
 * Note: The provider shares the archive and its shareable URL state. The game keeps its own local state, while the
 *       mini player is last so that it lies over the whole page and the padding at the bottom leaves room for it.
 *
 * @param archive episodes of the show as they were read from its feed on the server
 */
export function AiTaKrajtaPage({ archive, isEpisodeArchive = false, isPrototypeEnabled = false }: {
    readonly archive: AiTaKrajtaArchive;
    readonly isEpisodeArchive?: boolean;
    readonly isPrototypeEnabled?: boolean;
}) {
    const params = useSearchParams();
    const variant = params.get('variant');
    if (isPrototypeEnabled && (variant === 'A' || variant === 'B' || variant === 'C')) {
        return <AiTaKrajtaPrototypePage archive={archive} variant={variant} />;
    }
    return (
        <AiTaKrajtaPageStateProvider archive={archive}>
            <div className="min-h-screen bg-[#232a25] pb-24 font-sans antialiased">
                <AiTaKrajtaHeader activePath={isEpisodeArchive ? AI_TA_KRAJTA_EPISODES_PATH : AI_TA_KRAJTA_PATH} />

                <main>
                    {!isEpisodeArchive && <AiTaKrajtaHero />}
                    <AiTaKrajtaEpisodeList isArchive={isEpisodeArchive} />
                    {!isEpisodeArchive && <AiTaKrajtaPeopleSection />}
                    {!isEpisodeArchive && <AiTaKrajtaCollaborationSection />}
                </main>

                <AiTaKrajtaFooter />
                <PromptbookCoderBadge
                    obstacleSelector={CODER_BADGE_OBSTACLE_SELECTOR}
                    playmateSelector={CODER_BADGE_PLAYMATE_SELECTOR}
                />
            </div>
        </AiTaKrajtaPageStateProvider>
    );
}
