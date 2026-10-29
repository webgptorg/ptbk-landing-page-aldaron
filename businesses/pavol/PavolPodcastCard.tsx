import Image from 'next/image';
import { ArrowUpRight, Headphones } from 'lucide-react';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPavolPodcastTrack, type PavolPodcast } from './pavolPodcasts';
import { PavolPodcastAudioButton } from './PavolPodcastAudioButton';

export function PavolPodcastCard({ podcast, language, compact = false }: {
    readonly podcast: PavolPodcast; readonly language: SupportedHomepageLanguage; readonly compact?: boolean;
}) {
    const cs = language === 'cs';
    const track = createPavolPodcastTrack(podcast, language);
    return <article className={`pavol-podcast-card${compact ? ' pavol-podcast-card--compact' : ''}`}>
        {!compact && <a href={podcast.href} className="pavol-podcast-art" tabIndex={-1} aria-hidden="true">
            {podcast.imageSrc ? <Image src={podcast.imageSrc} alt="" fill sizes="(min-width: 1024px) 360px, (min-width: 768px) 44vw, 90vw" className="object-contain" />
                : <><Headphones size={32} strokeWidth={1} /><span>{podcast.source}</span></>}
        </a>}
        <div className="pavol-podcast-content">
            <div className="pavol-recording-meta">
                <span className="font-semibold text-[var(--pavol-accent)]">{podcast.source}</span>
                {language !== podcast.language && <span className="pavol-language-badge" aria-label={podcast.language === 'cs' ? 'Audio in Czech' : 'Audio in English'}>{podcast.language === 'cs' ? <svg viewBox="0 0 30 20" width="18" height="12" className="shrink-0 rounded-[1px]" aria-hidden="true"><rect width="30" height="20" fill="#fff" /><path d="M0 10h30v10H0z" fill="#d7141a" /><path d="M0 0l15 10L0 20z" fill="#11457e" /></svg> : <span aria-hidden="true">EN</span>} {podcast.language === 'cs' ? 'Czech' : 'English'}</span>}
                <time dateTime={podcast.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(podcast.publishedAt))}</time>
                {podcast.durationInSeconds !== null && <span>{formatPodcastEpisodeDuration(podcast.durationInSeconds)}</span>}
            </div>
            <h4 lang={podcast.language}><a href={podcast.href}>{podcast.title}</a></h4>
            <p lang={podcast.source === 'AI ta Krajta' ? 'cs' : language}>{podcast.description}</p>
            <div className="pavol-recording-actions">
                {track && <PavolPodcastAudioButton track={track} />}
                <a href={podcast.href} className="pavol-source-link">{cs ? 'Díl u vydavatele' : 'Publisher’s episode'}<ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
            {!track && <p className="pavol-recording-note">{cs ? 'Nahrávka je dostupná u vydavatele.' : 'The recording is available from the publisher.'}</p>}
        </div>
    </article>;
}
