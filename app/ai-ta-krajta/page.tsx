import { AiTaKrajtaPage } from '@/businesses/ai-ta-krajta/_AiTaKrajtaPage';
import { fetchAiTaKrajtaArchive } from '@/businesses/ai-ta-krajta/aiTaKrajtaArchive';
import {
    AI_TA_KRAJTA_METADATA,
    AI_TA_KRAJTA_VIEWPORT,
    createAiTaKrajtaStructuredData,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { StructuredData } from '@/components/structured-data';
import { Suspense } from 'react';

export const metadata = AI_TA_KRAJTA_METADATA;
export const viewport = AI_TA_KRAJTA_VIEWPORT;

/**
 * How long the built page and the feed it was built from are reused, in seconds
 *
 * A new episode comes out once a week, so an hour old page is never meaningfully behind, the publisher of the feed is
 * asked at most once an hour however many people open the page, and a new episode still appears without a deploy.
 *
 * Note: Next.js reads this out of the source of the route, so it has to be written here as a number and cannot be
 *       imported. The archive is therefore told about it instead of knowing it on its own.
 */
export const revalidate = 3600;

export default async function AiTaKrajtaRoute() {
    const archive = await fetchAiTaKrajtaArchive(revalidate);

    return (
        <>
            <StructuredData nodes={createAiTaKrajtaStructuredData(archive.episodes)} />
            {/* Note: The page reads its shareable state from the query parameters, which Next.js only hands over
                      inside a suspense boundary. */}
            <Suspense>
                <AiTaKrajtaPage archive={archive} isPrototypeEnabled={process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV !== 'production'} />
            </Suspense>
        </>
    );
}
