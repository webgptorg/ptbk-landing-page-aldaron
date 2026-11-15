import Image from 'next/image';
import { Headphones } from 'lucide-react';
import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AI_TA_KRAJTA_COLORS, AI_TA_KRAJTA_NAME } from '@/businesses/ai-ta-krajta/config';
import type { PavolPodcast } from './pavolPodcasts';

/** Reuses the show's real artwork rather than inventing a separate personal-site logo. */
export function PavolPodcastIdentity({ podcast, featured = false }: {
    readonly podcast: PavolPodcast;
    readonly featured?: boolean;
}) {
    const krajta = podcast.id.startsWith('ai-ta-krajta:') || podcast.source === AI_TA_KRAJTA_NAME;
    const size = featured ? 64 : 48;
    return <span role="img" aria-label={podcast.source}
        className={`pavol-podcast-identity relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${featured ? 'h-16 w-16' : 'h-12 w-12'}`}
        style={krajta ? { backgroundColor: AI_TA_KRAJTA_COLORS.MOSS } : undefined}>
        {krajta ? <AiTaKrajtaMark className="h-full w-full p-1.5" />
            : podcast.imageSrc ? <Image src={podcast.imageSrc} alt="" fill sizes={`${size}px`} className="object-contain" />
                : <Headphones size={featured ? 30 : 24} strokeWidth={1.5} aria-hidden="true" />}
    </span>;
}
