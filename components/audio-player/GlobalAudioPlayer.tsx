'use client';

import dynamic from 'next/dynamic';
import { useAudioPlayer } from './AudioPlayerProvider';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { ArrowRight, ArrowUpRight, Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import { getAudioSourceNavigation } from '@/lib/audio-player/audioSourceNavigation';
import './audioPlayer.css';

// The podcast's portrait roster and artwork are unnecessary on article/product pages until that skin is opened.
const AiTaKrajtaMiniPlayer = dynamic(() => import('@/businesses/ai-ta-krajta/AiTaKrajtaMiniPlayer').then((module) => module.AiTaKrajtaMiniPlayer));

/** Different branded controls share the same audio element and its local history. */
export function GlobalAudioPlayer() {
    const { track, isPlaying, currentTime, duration, error, trackingEnabled, setTrackingEnabled, setIsPlaying, seekTo, closePlayer, history } = useAudioPlayer();
    const pathname = usePathname();
    const [origin, setOrigin] = useState<string | null>(null);
    useEffect(() => { setOrigin(window.location.origin); }, []);
    if (!track) return null;
    if (track.kind === 'podcast' && track.appearance !== 'personal') return <AiTaKrajtaMiniPlayer />;
    const en = track.language === 'en';
    const completed = history[track.id]?.isPlayed;
    const source = origin ? getAudioSourceNavigation(track, new URL(pathname, origin).href) : null;
    const sourceLabel = en ? 'Go to source' : 'Přejít na zdroj';
    const sourceLinkProps = source?.external ? {
        target: '_blank', rel: 'noopener noreferrer',
        'aria-label': `${sourceLabel} (${en ? 'opens in a new tab' : 'otevře se v nové kartě'})`,
    } : {};
    return <aside className="article-global-player" data-appearance={track.appearance ?? 'personal'} data-fixed-bottom-control data-article-player aria-label={track.kind === 'podcast' ? en ? 'Podcast audio player' : 'Přehrávač podcastu' : en ? 'Article audio player' : 'Přehrávač článku'}>
        <div className="article-global-player__inner">
            <button type="button" className="article-global-player__play" onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? en ? 'Pause' : 'Pozastavit' : en ? 'Play' : 'Přehrát'}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button type="button" className="article-global-player__skip" onClick={() => seekTo(currentTime - 15)} aria-label={en ? 'Back 15 seconds' : 'Zpět o 15 sekund'}><RotateCcw size={18} /></button>
            <div className="article-global-player__recording">
                {source?.external
                    ? <a href={source.href} target="_blank" rel="noopener noreferrer" className="article-global-player__title">{track.title}</a>
                    : <Link href={source?.href ?? track.href} className="article-global-player__title">{track.title}</Link>}
                <div className="article-global-player__timeline">
                    <span>{formatPodcastEpisodeDuration(currentTime)}</span>
                    <input type="range" min={0} max={Math.max(1, duration)} step={0.1} value={Math.min(currentTime, duration || currentTime)} style={{ '--audio-progress': `${duration > 0 ? Math.max(0, Math.min(100, currentTime / duration * 100)) : 0}%` } as CSSProperties} onChange={(event) => seekTo(Number(event.target.value))} aria-label={en ? 'Audio position' : 'Pozice v nahrávce'} />
                    <span>{duration ? formatPodcastEpisodeDuration(duration) : '–:–'}</span>
                </div>
                {error && <p role="status">{error}</p>}
                {completed && !isPlaying && <span className="article-global-player__completed">{en ? 'Completed' : 'Přehráno'}</span>}
            </div>
            <button type="button" className="article-global-player__skip" onClick={() => seekTo(currentTime + 30)} aria-label={en ? 'Forward 30 seconds' : 'Vpřed o 30 sekund'}><RotateCw size={18} /></button>
            {source?.isCurrentArticle && track.trackingAvailable
                ? <button type="button" className="article-global-player__tracking" aria-pressed={trackingEnabled} onClick={() => setTrackingEnabled(!trackingEnabled)}>{en ? 'Follow text' : 'Sledovat text'}</button>
                : source && !source.isCurrentArticle && (source.external
                    ? <a href={source.href} {...sourceLinkProps} className="article-global-player__tracking article-global-player__source">{sourceLabel}<ArrowUpRight size={14} aria-hidden="true" /></a>
                    : <Link href={source.href} className="article-global-player__tracking article-global-player__source">{sourceLabel}<ArrowRight size={14} aria-hidden="true" /></Link>)}
            <button type="button" className="article-global-player__close" onClick={closePlayer} aria-label={en ? 'Close player' : 'Zavřít přehrávač'}><X size={20} /></button>
        </div>
    </aside>;
}
