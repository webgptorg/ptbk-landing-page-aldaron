import { AiTaKrajtaPage } from '@/businesses/ai-ta-krajta/_AiTaKrajtaPage';
import { fetchAiTaKrajtaArchive } from '@/businesses/ai-ta-krajta/aiTaKrajtaArchive';
import { AI_TA_KRAJTA_EPISODES_METADATA, AI_TA_KRAJTA_VIEWPORT } from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { Suspense } from 'react';

export const metadata = AI_TA_KRAJTA_EPISODES_METADATA;
export const viewport = AI_TA_KRAJTA_VIEWPORT;
export const revalidate = 3600;

export default async function AiTaKrajtaEpisodesRoute() {
    const archive = await fetchAiTaKrajtaArchive(revalidate);

    return (
        <Suspense>
            <AiTaKrajtaPage archive={archive} isEpisodeArchive />
        </Suspense>
    );
}
