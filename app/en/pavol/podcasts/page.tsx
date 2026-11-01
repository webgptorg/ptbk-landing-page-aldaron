import { PavolPodcastIndex } from '@/businesses/pavol/PavolPodcastIndex';
import { PAVOL_PODCAST_METADATA } from '@/businesses/pavol/pavolPodcastMetadata';

export const metadata = PAVOL_PODCAST_METADATA.en;
export const revalidate = 3600;

export default function PodcastsPage() {
    return <PavolPodcastIndex language="en" revalidateSeconds={revalidate} />;
}
