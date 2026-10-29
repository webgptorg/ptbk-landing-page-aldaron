'use client';

import { Headphones, Pause, Play } from 'lucide-react';
import { useAudioPlayerControls, type AudioTrack } from '@/components/audio-player/AudioPlayerProvider';

export function PavolPodcastAudioButton({ track }: { readonly track: AudioTrack }) {
    const player = useAudioPlayerControls();
    const isCurrent = player.track?.id === track.id;
    const isPlaying = isCurrent && player.isPlaying;
    const en = track.language === 'en';
    const label = isPlaying ? en ? 'Pause' : 'Pozastavit' : en ? 'Listen' : 'Poslechnout';
    return <button type="button" className="pavol-play-button" aria-label={`${label}: ${track.title}`} aria-pressed={isPlaying}
        onClick={() => isCurrent ? player.setIsPlaying(!player.isPlaying) : player.playTrack(track)}>
        {isPlaying ? <Pause size={17} aria-hidden="true" /> : isCurrent ? <Play size={17} aria-hidden="true" /> : <Headphones size={17} aria-hidden="true" />}
        {label}
    </button>;
}
