import Image from 'next/image';
import { ArrowUpRight, ChevronDown, Clock3, Headphones } from 'lucide-react';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPavolPodcastTrack, type PavolPodcast } from './pavolPodcasts';
import { PavolPodcastAudioButton } from './PavolPodcastAudioButton';

export function PavolPodcastCard({ podcast, language, compact = false }: {
    readonly podcast: PavolPodcast; readonly language: SupportedHomepageLanguage; readonly compact?: boolean;
}) {
    const cs = language === 'cs';
    const track = createPavolPodcastTrack(podcast, language);
    const descriptionLanguage = podcast.source === 'AI ta Krajta' ? 'cs' : language;
    const hasFullDescription = podcast.description.length > 180;
    const preview = hasFullDescription
        ? podcast.description.slice(0, 180).replace(/\s+\S*$/, '').trimEnd() + '…'
        : podcast.description;

    return <article className={`pavol-podcast-card${compact ? ' pavol-podcast-card--compact' : ''}`}>
        <div className="pavol-podcast-topline">
            <div className="pavol-podcast-art" aria-hidden="true">
                {podcast.imageSrc
                    ? <Image src={podcast.imageSrc} alt="" fill sizes={compact ? '48px' : '64px'} className="object-contain" />
                    : <Headphones size={26} strokeWidth={1.5} />}
            </div>
            <div className="pavol-podcast-meta">
                <div className="pavol-podcast-source">
                    <span>{podcast.source}</span>
                    {language !== podcast.language && <span className="pavol-language-badge" aria-label={podcast.language === 'cs' ? 'Audio in Czech' : 'Audio in English'}>{podcast.language === 'cs' ? <svg viewBox="0 0 30 20" width="18" height="12" className="shrink-0 rounded-[1px]" aria-hidden="true"><rect width="30" height="20" fill="#fff" /><path d="M0 10h30v10H0z" fill="#d7141a" /><path d="M0 0l15 10L0 20z" fill="#11457e" /></svg> : <span aria-hidden="true">EN</span>} {podcast.language === 'cs' ? 'Czech' : 'English'}</span>}
                </div>
                <div className="pavol-recording-meta">
                    <time dateTime={podcast.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(podcast.publishedAt))}</time>
                    {podcast.durationInSeconds !== null && <span className="pavol-podcast-duration"><Clock3 size={12} aria-hidden="true" />{formatPodcastEpisodeDuration(podcast.durationInSeconds)}</span>}
                </div>
            </div>
        </div>
        <div className="pavol-podcast-content">
            <h4 lang={podcast.language}><a href={podcast.href}>{podcast.title}</a></h4>
            {hasFullDescription ? <details className="pavol-podcast-description">
                <summary>
                    <span className="pavol-podcast-excerpt" lang={descriptionLanguage}>{preview}</span>
                    <span className="pavol-description-toggle">
                        <span className="pavol-description-expand">{cs ? 'Celý popis' : 'Full description'}</span>
                        <span className="pavol-description-collapse">{cs ? 'Skrýt popis' : 'Hide description'}</span>
                        <ChevronDown size={14} aria-hidden="true" />
                    </span>
                </summary>
                <p lang={descriptionLanguage}>{podcast.description}</p>
            </details> : <p className="pavol-podcast-excerpt" lang={descriptionLanguage}>{preview}</p>}
            <div className="pavol-recording-actions">
                {track && <PavolPodcastAudioButton track={track} />}
                <a href={podcast.href} className="pavol-source-link">{cs ? 'Původní díl' : 'Original episode'}<ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
            {!track && <p className="pavol-recording-note">{cs ? 'Nahrávka je dostupná u vydavatele.' : 'The recording is available from the publisher.'}</p>}
        </div>
    </article>;
}
