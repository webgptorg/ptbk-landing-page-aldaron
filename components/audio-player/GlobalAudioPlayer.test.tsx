/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AudioTrack } from '@/lib/audio-player/audioPlayerState';

const state = vi.hoisted(() => ({ track: null as AudioTrack | null, seekTo: vi.fn() }));
vi.mock('./AudioPlayerProvider', () => ({ useAudioPlayer: () => ({
    track: state.track, isPlaying: false, currentTime: 20, duration: 100, error: null, history: {},
    trackingEnabled: false, setTrackingEnabled: vi.fn(), setIsPlaying: vi.fn(), closePlayer: vi.fn(), seekTo: state.seekTo,
}) }));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="original-show-player" /> }));
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
const track: AudioTrack = { id: 'recording', src: '/recording.mp3', title: 'Recording', author: 'Publisher', href: 'https://example.com/episode', language: 'en', kind: 'podcast', appearance: 'personal' };
afterEach(() => { cleanup(); state.track = null; vi.clearAllMocks(); });

describe('shared player appearance', () => {
    it('uses article controls, the source link, and seek actions for a personal podcast', () => {
        state.track = track;
        render(<GlobalAudioPlayer />);
        expect(screen.getByRole('complementary', { name: 'Podcast audio player' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Recording' }).getAttribute('href')).toBe(track.href);
        expect(screen.queryByTestId('original-show-player')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Back 15 seconds' }));
        expect(state.seekTo).toHaveBeenLastCalledWith(5);
    });
    it('retains the original controls for the show website', () => {
        state.track = { ...track, appearance: undefined };
        render(<GlobalAudioPlayer />);
        expect(screen.getByTestId('original-show-player')).toBeTruthy();
        expect(screen.queryByRole('complementary')).toBeNull();
    });
    it('retains article labels and controls', () => {
        state.track = { ...track, kind: 'article' };
        render(<GlobalAudioPlayer />);
        expect(screen.getByRole('complementary', { name: 'Article audio player' })).toBeTruthy();
    });
});
