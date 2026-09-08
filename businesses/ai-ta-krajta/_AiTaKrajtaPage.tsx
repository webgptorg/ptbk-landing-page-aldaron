'use client';

import type { AiTaKrajtaArchive } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import { AiTaKrajtaCollaborationSection } from '@/businesses/ai-ta-krajta/AiTaKrajtaCollaborationSection';
import { AiTaKrajtaEpisodeList } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeList';
import { AiTaKrajtaFooter } from '@/businesses/ai-ta-krajta/AiTaKrajtaFooter';
import { AiTaKrajtaHeader } from '@/businesses/ai-ta-krajta/AiTaKrajtaHeader';
import { AiTaKrajtaHero } from '@/businesses/ai-ta-krajta/AiTaKrajtaHero';
import { AiTaKrajtaMiniPlayer } from '@/businesses/ai-ta-krajta/AiTaKrajtaMiniPlayer';
import { AiTaKrajtaPageStateProvider } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { AiTaKrajtaPeopleSection } from '@/businesses/ai-ta-krajta/AiTaKrajtaPeopleSection';

/**
 * The page of the AI ta Krajta podcast
 *
 * Note: The provider shares the archive and its shareable URL state. The game keeps its own local state, while the
 *       mini player is last so that it lies over the whole page and the padding at the bottom leaves room for it.
 *
 * @param archive episodes of the show as they were read from its feed on the server
 */
export function AiTaKrajtaPage({ archive }: { readonly archive: AiTaKrajtaArchive }) {
    return (
        <AiTaKrajtaPageStateProvider archive={archive}>
            <div className="min-h-screen bg-[#232a25] pb-24 font-sans antialiased">
                <AiTaKrajtaHeader />

                <main>
                    <AiTaKrajtaHero />
                    <AiTaKrajtaEpisodeList />
                    <AiTaKrajtaPeopleSection />
                    <AiTaKrajtaCollaborationSection />
                </main>

                <AiTaKrajtaFooter />
                <AiTaKrajtaMiniPlayer />
            </div>
        </AiTaKrajtaPageStateProvider>
    );
}
