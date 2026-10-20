'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readBrowserLocalStorageItem, removeBrowserLocalStorageItem, writeBrowserLocalStorageItem } from '@/lib/browser/browserStorage';
import { createAudioProgress, limitAudioHistory, readAudioHistory, readRememberedAudioTrack, AUDIO_PLAYER_STORAGE_KEY, AUDIO_HISTORY_STORAGE_KEY, AUDIO_TRACKING_STORAGE_KEY, type AudioHistory, type AudioTrack } from '@/lib/audio-player/audioPlayerState';
import { getPodcastEpisodeResumePositionInSeconds, type PodcastEpisodePlaybackProgress } from '@/lib/podcast/podcastPlaybackProgress';
import { loadPodcastPlaybackProgress, savePodcastPlaybackProgress } from '@/lib/podcast/podcastPlaybackProgressStorage';
import { AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY } from '@/businesses/ai-ta-krajta/config';

export type { AudioTrack } from '@/lib/audio-player/audioPlayerState';

type AudioPlayerValue = {
    track: AudioTrack | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    error: string | null;
    isRestored: boolean;
    history: AudioHistory;
    trackingEnabled: boolean;
    setTrackingEnabled: (enabled: boolean) => void;
    playTrack: (track: AudioTrack, autoplay?: boolean) => void;
    setIsPlaying: (playing: boolean) => void;
    seekTo: (seconds: number) => void;
    closePlayer: () => void;
    getProgress: (id: string) => PodcastEpisodePlaybackProgress | null;
};

const AudioPlayerContext = createContext<AudioPlayerValue | null>(null);
type AudioPlayerControls = Omit<AudioPlayerValue, 'currentTime' | 'duration'>;
const AudioPlayerControlsContext = createContext<AudioPlayerControls | null>(null);
const SAVE_INTERVAL_SECONDS = 5;

/** The audio element belongs to the persistent root layout, never to an article or a page skin. */
export function AudioPlayerProvider({ children }: { readonly children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const trackRef = useRef<AudioTrack | null>(null);
    const historyRef = useRef<AudioHistory>({});
    const pendingPositionRef = useRef<number | null>(null);
    const lastSavedPositionRef = useRef(0);
    const playingIntentRef = useRef(false);
    const [track, setTrack] = useState<AudioTrack | null>(null);
    const [isPlaying, updateIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [history, setHistory] = useState<AudioHistory>({});
    const [isRestored, setIsRestored] = useState(false);
    const [trackingEnabled, updateTrackingEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const remember = useCallback((ended = false) => {
        const currentTrack = trackRef.current;
        const audio = audioRef.current;
        if (!currentTrack || !audio) return;
        // Metadata can still be loading on pagehide. Keep the pending resume instead of replacing it with zero.
        const position = pendingPositionRef.current ?? audio.currentTime;
        const progress = createAudioProgress(currentTrack, {
            positionInSeconds: position,
            durationInSeconds: Number.isFinite(audio.duration) ? audio.duration : currentTrack.durationInSeconds ?? null,
            isEnded: ended || (historyRef.current[currentTrack.id]?.isPlayed === true && position === audio.duration),
        });
        const nextHistory = limitAudioHistory({ ...historyRef.current, [currentTrack.id]: progress });
        historyRef.current = nextHistory;
        setHistory(nextHistory);
        lastSavedPositionRef.current = position;
        writeBrowserLocalStorageItem(AUDIO_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
        // Retain the established archive progress schema, including existing listeners' histories.
        if (currentTrack.podcastEpisode) {
            savePodcastPlaybackProgress(AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY, {
                ...loadPodcastPlaybackProgress(AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY),
                [currentTrack.podcastEpisode.slug]: progress,
            });
        }
    }, []);

    useEffect(() => {
        const savedHistory = readAudioHistory(readBrowserLocalStorageItem(AUDIO_HISTORY_STORAGE_KEY));
        const legacyHistory = Object.fromEntries(Object.entries(loadPodcastPlaybackProgress(AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY)).map(([slug, progress]) => [`ai-ta-krajta:${slug}`, progress]));
        const restoredHistory = { ...legacyHistory, ...savedHistory };
        historyRef.current = restoredHistory;
        setHistory(restoredHistory);
        updateTrackingEnabled(readBrowserLocalStorageItem(AUDIO_TRACKING_STORAGE_KEY) !== 'off');
        const restoredTrack = readRememberedAudioTrack(readBrowserLocalStorageItem(AUDIO_PLAYER_STORAGE_KEY));
        if (restoredTrack) {
            const position = restoredHistory[restoredTrack.id]?.positionInSeconds ?? 0;
            trackRef.current = restoredTrack;
            pendingPositionRef.current = position;
            lastSavedPositionRef.current = position;
            setCurrentTime(position);
            setDuration(restoredTrack.durationInSeconds ?? 0);
            setTrack(restoredTrack);
            // Reload restoration deliberately does not set playback intent or call play().
        }
        setIsRestored(true);
        const persist = () => remember();
        const onVisibility = () => { if (document.visibilityState === 'hidden') persist(); };
        window.addEventListener('pagehide', persist);
        document.addEventListener('visibilitychange', onVisibility);
        return () => { persist(); window.removeEventListener('pagehide', persist); document.removeEventListener('visibilitychange', onVisibility); };
    }, [remember]);

    const getProgress = useCallback((id: string) => historyRef.current[id] ?? null, []);
    const seekTo = useCallback((seconds: number) => {
        const audio = audioRef.current;
        if (!audio || !trackRef.current || !Number.isFinite(seconds)) return;
        const knownDuration = Number.isFinite(audio.duration) ? audio.duration : trackRef.current.durationInSeconds ?? Infinity;
        const position = Math.min(Math.max(0, seconds), knownDuration);
        setCurrentTime(position);
        if (audio.readyState === 0) pendingPositionRef.current = position;
        else { pendingPositionRef.current = null; audio.currentTime = position; }
        remember();
    }, [remember]);

    const setIsPlaying = useCallback((playing: boolean) => {
        const audio = audioRef.current;
        if (!audio || !trackRef.current) return;
        setError(null);
        if (playing && (audio.ended || historyRef.current[trackRef.current.id]?.isPlayed)) seekTo(0);
        playingIntentRef.current = playing;
        updateIsPlaying(playing);
        if (!playing) { audio.pause(); remember(); }
    }, [remember, seekTo]);

    const playTrack = useCallback((nextTrack: AudioTrack, autoplay = true) => {
        if (trackRef.current?.id === nextTrack.id) { setIsPlaying(autoplay); return; }
        remember();
        const audio = audioRef.current;
        playingIntentRef.current = false;
        audio?.pause();
        const progress = historyRef.current[nextTrack.id] ?? null;
        const position = nextTrack.kind === 'podcast' ? getPodcastEpisodeResumePositionInSeconds(progress) : progress?.isPlayed ? 0 : progress?.positionInSeconds ?? 0;
        trackRef.current = nextTrack;
        pendingPositionRef.current = position;
        lastSavedPositionRef.current = position;
        setCurrentTime(position);
        setDuration(nextTrack.durationInSeconds ?? 0);
        setError(null);
        setTrack(nextTrack);
        writeBrowserLocalStorageItem(AUDIO_PLAYER_STORAGE_KEY, JSON.stringify(nextTrack));
        playingIntentRef.current = autoplay;
        updateIsPlaying(autoplay);
    }, [remember, setIsPlaying]);

    const closePlayer = useCallback(() => {
        remember();
        playingIntentRef.current = false;
        audioRef.current?.pause();
        trackRef.current = null;
        pendingPositionRef.current = null;
        setTrack(null);
        updateIsPlaying(false);
        removeBrowserLocalStorageItem(AUDIO_PLAYER_STORAGE_KEY);
    }, [remember]);

    const setTrackingEnabled = useCallback((enabled: boolean) => {
        updateTrackingEnabled(enabled);
        writeBrowserLocalStorageItem(AUDIO_TRACKING_STORAGE_KEY, enabled ? 'on' : 'off');
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !track || !isPlaying) return;
        void audio.play().catch(() => {
            if (trackRef.current?.id !== track.id) return;
            playingIntentRef.current = false;
            updateIsPlaying(false);
        });
    }, [track?.id, isPlaying]);

    // timeupdate can be 250 ms apart. Sampling the real media clock makes every aligned spoken word visible.
    useEffect(() => {
        if (!isPlaying) return;
        let frame = 0;
        let previous = 0;
        const update = (timestamp: number) => {
            if (timestamp - previous >= 40 && audioRef.current && pendingPositionRef.current === null) {
                setCurrentTime(audioRef.current.currentTime);
                previous = timestamp;
            }
            frame = requestAnimationFrame(update);
        };
        frame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frame);
    }, [isPlaying]);

    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        const session = navigator.mediaSession;
        if (!track) { session.metadata = null; session.playbackState = 'none'; return; }
        if (typeof MediaMetadata !== 'undefined') session.metadata = new MediaMetadata({ title: track.title, artist: track.author, album: track.kind === 'podcast' ? 'AI ta Krajta' : 'Články', artwork: track.artwork ? [{ src: new URL(track.artwork, window.location.origin).href }] : [] });
        const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
            play: () => setIsPlaying(true), pause: () => setIsPlaying(false), stop: closePlayer,
            seekbackward: (details) => seekTo((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 15)),
            seekforward: (details) => seekTo((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 30)),
            seekto: (details) => { if (details.seekTime !== undefined) seekTo(details.seekTime); },
        };
        for (const [action, handler] of Object.entries(handlers)) { try { session.setActionHandler(action as MediaSessionAction, handler); } catch { /* Browser may not support this hardware action. */ } }
        return () => { for (const action of Object.keys(handlers)) { try { session.setActionHandler(action as MediaSessionAction, null); } catch {} } };
    }, [track?.id, setIsPlaying, seekTo, closePlayer]);

    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = track ? isPlaying ? 'playing' : 'paused' : 'none';
        if (duration > 0 && Number.isFinite(duration)) {
            try { navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position: Math.min(duration, Math.max(0, currentTime)) }); } catch { /* Older browsers expose only metadata and controls. */ }
        }
    }, [track?.id, isPlaying, currentTime, duration]);

    const value = useMemo<AudioPlayerValue>(() => ({ track, isPlaying, currentTime, duration, error, isRestored, history, trackingEnabled, setTrackingEnabled, playTrack, setIsPlaying, seekTo, closePlayer, getProgress }), [track, isPlaying, currentTime, duration, error, isRestored, history, trackingEnabled, setTrackingEnabled, playTrack, setIsPlaying, seekTo, closePlayer, getProgress]);

    const controls = useMemo<AudioPlayerControls>(() => ({ track, isPlaying, error, isRestored, history, trackingEnabled, setTrackingEnabled, playTrack, setIsPlaying, seekTo, closePlayer, getProgress }), [track, isPlaying, error, isRestored, history, trackingEnabled, setTrackingEnabled, playTrack, setIsPlaying, seekTo, closePlayer, getProgress]);

    return <AudioPlayerControlsContext.Provider value={controls}><AudioPlayerContext.Provider value={value}>
        {children}
        <audio ref={audioRef} src={track?.src} preload="metadata" data-global-audio
            onLoadedMetadata={(event) => {
                const audio = event.currentTarget;
                const actualDuration = Number.isFinite(audio.duration) ? audio.duration : trackRef.current?.durationInSeconds ?? 0;
                setDuration(actualDuration);
                if (pendingPositionRef.current !== null) {
                    const position = Math.min(pendingPositionRef.current, actualDuration || pendingPositionRef.current);
                    audio.currentTime = position;
                    setCurrentTime(position);
                    pendingPositionRef.current = null;
                }
            }}
            onTimeUpdate={(event) => {
                if (pendingPositionRef.current !== null) return;
                setCurrentTime(event.currentTarget.currentTime);
                if (Math.abs(event.currentTarget.currentTime - lastSavedPositionRef.current) >= SAVE_INTERVAL_SECONDS) remember();
            }}
            onSeeked={(event) => { setCurrentTime(event.currentTarget.currentTime); remember(); }}
            onPlay={() => { playingIntentRef.current = true; updateIsPlaying(true); }}
            onPause={(event) => {
                if (!event.currentTarget.paused || event.currentTarget.readyState === 0 || playingIntentRef.current && event.currentTarget.currentSrc !== new URL(trackRef.current?.src ?? '/', window.location.origin).href) return;
                playingIntentRef.current = false;
                updateIsPlaying(false);
                remember();
            }}
            onEnded={() => { playingIntentRef.current = false; updateIsPlaying(false); remember(true); }}
            onError={() => { playingIntentRef.current = false; updateIsPlaying(false); setError(trackRef.current?.language === 'en' ? 'Audio could not be loaded. Please try again.' : 'Nahrávku se nepodařilo načíst. Zkuste to znovu.'); }}
        />
    </AudioPlayerContext.Provider></AudioPlayerControlsContext.Provider>;
}

export function useAudioPlayer(): AudioPlayerValue {
    const value = useContext(AudioPlayerContext);
    if (!value) throw new Error('Audio player must be inside AudioPlayerProvider');
    return value;
}

/** Controls/history subscribers do not re-render an entire archive on every word-clock tick. */
export function useAudioPlayerControls(): AudioPlayerControls {
    const value = useContext(AudioPlayerControlsContext);
    if (!value) throw new Error('Audio player must be inside AudioPlayerProvider');
    return value;
}
