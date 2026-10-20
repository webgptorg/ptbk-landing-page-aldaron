/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayerProvider, useAudioPlayer, type AudioTrack } from './AudioPlayerProvider';
import { AUDIO_HISTORY_STORAGE_KEY, AUDIO_PLAYER_STORAGE_KEY } from '@/lib/audio-player/audioPlayerState';

const trackA: AudioTrack = { id: 'a', src: '/a.mp3', title: 'Article A', author: 'Author', href: '/articles/a', language: 'cs', kind: 'article', durationInSeconds: 100 };
const trackB: AudioTrack = { ...trackA, id: 'b', src: '/b.mp3', title: 'Article B' };
let play: ReturnType<typeof vi.fn>;
const mediaHandlers = new Map<string, MediaSessionActionHandler | null>();

beforeEach(() => {
    localStorage.clear();
    play = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: { setActionHandler: (action: string, handler: MediaSessionActionHandler | null) => mediaHandlers.set(action, handler), setPositionState: vi.fn(), playbackState: 'none', metadata: null } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); mediaHandlers.clear(); });
function setup() { return renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider }); }
function loadedAudio() {
    const audio = document.querySelector('audio')!;
    Object.defineProperty(audio, 'duration', { configurable: true, value: 100 });
    Object.defineProperty(audio, 'readyState', { configurable: true, value: 1 });
    fireEvent.loadedMetadata(audio);
    return audio;
}

describe('persistent shared audio owner', () => {
    it('restores the last open recording at its position, always paused', () => {
        localStorage.setItem(AUDIO_PLAYER_STORAGE_KEY, JSON.stringify(trackA));
        localStorage.setItem(AUDIO_HISTORY_STORAGE_KEY, JSON.stringify({ a: { positionInSeconds: 42.25, durationInSeconds: 100, isPlayed: false, updatedAt: 1 } }));
        const { result } = setup();
        const audio = loadedAudio();
        expect(result.current.track?.id).toBe('a');
        expect(result.current.isPlaying).toBe(false);
        expect(audio.currentTime).toBe(42.25);
        expect(play).not.toHaveBeenCalled();
    });
    it('owns one element, preserves A when switching to B, and resumes A independently', () => {
        const { result } = setup();
        act(() => result.current.playTrack(trackA));
        const audio = loadedAudio();
        act(() => result.current.seekTo(37.5));
        act(() => result.current.playTrack(trackB));
        loadedAudio();
        act(() => result.current.seekTo(12));
        act(() => result.current.playTrack(trackA));
        loadedAudio();
        expect(document.querySelectorAll('audio')).toHaveLength(1);
        expect(result.current.getProgress('a')?.positionInSeconds).toBe(37.5);
        expect(result.current.getProgress('b')?.positionInSeconds).toBe(12);
        expect(audio.currentTime).toBe(37.5);
    });
    it('keeps the same live recording when the page content unmounts for a subpage', () => {
        let player: ReturnType<typeof useAudioPlayer>;
        function Probe() { player = useAudioPlayer(); return null; }
        const { rerender } = render(<AudioPlayerProvider><Probe /><main>Article page</main></AudioPlayerProvider>);
        act(() => player.playTrack(trackA));
        const audio = loadedAudio();
        act(() => player.seekTo(24));
        const pauses = vi.mocked(HTMLMediaElement.prototype.pause).mock.calls.length;
        rerender(<AudioPlayerProvider><Probe /><main>Another subpage</main></AudioPlayerProvider>);
        expect(document.querySelector('audio')).toBe(audio);
        expect(player!.track?.id).toBe('a');
        expect(player!.isPlaying).toBe(true);
        expect(audio.currentTime).toBe(24);
        expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.calls).toHaveLength(pauses);
    });
    it('uses exactly the same seek path for hardware media controls', () => {
        const { result } = setup();
        act(() => result.current.playTrack(trackA));
        const audio = loadedAudio();
        act(() => mediaHandlers.get('seekto')?.({ action: 'seekto', seekTime: 65 }));
        expect(audio.currentTime).toBe(65);
        expect(result.current.currentTime).toBe(65);
        expect(result.current.getProgress('a')?.positionInSeconds).toBe(65);
    });
    it('restarts a completed recording only when the listener presses play', () => {
        const { result } = setup();
        act(() => result.current.playTrack(trackA));
        const audio = loadedAudio();
        audio.currentTime = 100;
        fireEvent.ended(audio);
        expect(result.current.getProgress('a')?.isPlayed).toBe(true);
        expect(result.current.isPlaying).toBe(false);
        act(() => result.current.setIsPlaying(true));
        expect(audio.currentTime).toBe(0);
        expect(result.current.getProgress('a')?.isPlayed).toBe(false);
    });
    it('closing the player retains history and prevents restoration as open', () => {
        const { result } = setup();
        act(() => result.current.playTrack(trackA));
        loadedAudio();
        act(() => result.current.seekTo(33));
        act(() => result.current.closePlayer());
        expect(result.current.track).toBeNull();
        expect(result.current.getProgress('a')?.positionInSeconds).toBe(33);
        expect(localStorage.getItem(AUDIO_PLAYER_STORAGE_KEY)).toBeNull();
    });
});
