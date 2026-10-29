/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AudioTrack } from '@/lib/audio-player/audioPlayerState';

const state = vi.hoisted(() => ({ track: null as AudioTrack | null, pathname: '/', seekTo: vi.fn(), setTrackingEnabled: vi.fn(), setIsPlaying: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));
vi.mock('./AudioPlayerProvider', () => ({ useAudioPlayer: () => ({
    track: state.track, isPlaying: false, currentTime: 20, duration: 100, error: null, history: {},
    trackingEnabled: false, setTrackingEnabled: state.setTrackingEnabled, setIsPlaying: state.setIsPlaying, closePlayer: vi.fn(), seekTo: state.seekTo,
}) }));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="original-show-player" /> }));
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
const track: AudioTrack = { id: 'recording', src: '/recording.mp3', title: 'Recording', author: 'Publisher', href: 'https://example.com/episode', language: 'en', kind: 'podcast', appearance: 'personal' };
afterEach(() => { cleanup(); state.track = null; state.pathname = '/'; vi.clearAllMocks(); });

describe('shared player appearance', () => {
    it('uses article controls, the source link, and seek actions for a personal podcast', () => {
        state.track = track;
        render(<GlobalAudioPlayer />);
        expect(screen.getByRole('complementary', { name: 'Podcast audio player' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Recording' }).getAttribute('href')).toBe(track.href);
        expect(screen.getByRole('link', { name: 'Recording' }).getAttribute('target')).toBe('_blank');
        const source = screen.getByRole('link', { name: /Go to source/ });
        expect(source.getAttribute('href')).toBe(track.href);
        expect(source.getAttribute('target')).toBe('_blank');
        expect(source.getAttribute('rel')).toContain('noopener');
        expect(screen.queryByRole('button', { name: 'Follow text' })).toBeNull();
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
    it('switches from internal source navigation to following text only on the playing article', () => {
        state.track = { ...track, kind: 'article', href: '/articles/recording', trackingAvailable: true };
        const view = render(<GlobalAudioPlayer />);
        const source = screen.getByRole('link', { name: 'Go to source' });
        expect(source.getAttribute('href')).toBe('/articles/recording');
        expect(source.getAttribute('target')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Follow text' })).toBeNull();
        state.pathname = '/articles/recording';
        view.rerender(<GlobalAudioPlayer />);
        expect(screen.queryByRole('link', { name: /Go to source/ })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Follow text' }));
        expect(state.setTrackingEnabled).toHaveBeenCalledWith(true);
        expect(state.setIsPlaying).not.toHaveBeenCalled();
        state.pathname = '/articles/another';
        view.rerender(<GlobalAudioPlayer />);
        expect(screen.getByRole('link', { name: 'Go to source' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Follow text' })).toBeNull();
    });
    it('does not offer tracking when the current article has no reviewed timing', () => {
        state.track = { ...track, kind: 'article', href: '/articles/recording', trackingAvailable: false };
        state.pathname = '/articles/recording';
        render(<GlobalAudioPlayer />);
        expect(screen.queryByRole('button', { name: 'Follow text' })).toBeNull();
        expect(screen.queryByRole('link', { name: /Go to source/ })).toBeNull();
    });
    it('localizes the source action in Czech', () => {
        state.track = { ...track, language: 'cs' };
        render(<GlobalAudioPlayer />);
        expect(screen.getByRole('link', { name: /Přejít na zdroj/ }).getAttribute('target')).toBe('_blank');
    });
});
