import type { PlayableAiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import {
    createPodcastEpisodePlaybackProgress,
    isPodcastEpisodePlaybackProgress,
    type PodcastEpisodePlayback,
    type PodcastEpisodePlaybackProgress,
} from '@/lib/podcast/podcastPlaybackProgress';

/** One stable recording identity shared by the web player and its podcast feeds. */
export type AudioTrack = {
    readonly id: string;
    readonly src: string;
    readonly title: string;
    readonly author: string;
    readonly href: string;
    readonly language: 'cs' | 'en';
    readonly kind: 'article' | 'podcast';
    readonly artwork?: string;
    readonly durationInSeconds?: number | null;
    readonly trackingAvailable?: boolean;
    readonly appearance?: 'promptbook' | 'personal';
    readonly podcastEpisode?: PlayableAiTaKrajtaEpisode;
};

export type AudioHistory = Readonly<Record<string, PodcastEpisodePlaybackProgress>>;
export const AUDIO_PLAYER_STORAGE_KEY = 'promptbook.audio-player.v1';
export const AUDIO_HISTORY_STORAGE_KEY = 'promptbook.audio-history.v1';
export const AUDIO_TRACKING_STORAGE_KEY = 'promptbook.audio-tracking.v1';

/** Articles count as completed on the actual ended event; the established podcast outro policy stays intact. */
export function createAudioProgress(track: AudioTrack, playback: PodcastEpisodePlayback): PodcastEpisodePlaybackProgress {
    const progress = createPodcastEpisodePlaybackProgress(playback);
    return track.kind === 'podcast' ? progress : { ...progress, positionInSeconds: Math.max(0, playback.positionInSeconds), isPlayed: playback.isEnded };
}

export function readAudioHistory(value: string | null): AudioHistory {
    try {
        const parsed: unknown = JSON.parse(value ?? '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return Object.fromEntries(Object.entries(parsed).filter(([id, progress]) => id && isPodcastEpisodePlaybackProgress(progress)));
    } catch { return {}; }
}

/** Bound local history without involving a server or another hostname. */
export function limitAudioHistory(history: AudioHistory): AudioHistory {
    return Object.fromEntries(Object.entries(history).sort(([, a], [, b]) => b.updatedAt - a.updatedAt).slice(0, 500));
}

function isMediaUrl(value: unknown): value is string {
    return typeof value === 'string' && (value.startsWith('/') && !value.startsWith('//') || /^https?:\/\//.test(value));
}

export function readRememberedAudioTrack(value: string | null): AudioTrack | null {
    try {
        const track = JSON.parse(value ?? 'null') as AudioTrack | null;
        if (!track || typeof track.id !== 'string' || !track.id || typeof track.title !== 'string' || typeof track.author !== 'string' || !isMediaUrl(track.src) || !isMediaUrl(track.href)) return null;
        if (track.language !== 'cs' && track.language !== 'en') return null;
        if (track.kind !== 'article' && track.kind !== 'podcast') return null;
        if (track.durationInSeconds !== undefined && track.durationInSeconds !== null && (!Number.isFinite(track.durationInSeconds) || track.durationInSeconds < 0)) return null;
        if (track.artwork !== undefined && !isMediaUrl(track.artwork)) return null;
        // A remembered show skin needs the same safe episode structure as a freshly selected show recording.
        if (track.kind === 'podcast') {
            if (track.podcastEpisode && (!Array.isArray(track.podcastEpisode.personIds) || typeof track.podcastEpisode.slug !== 'string')) return null;
            if (!track.podcastEpisode && track.appearance !== 'personal') return null;
        }
        return track;
    } catch { return null; }
}
