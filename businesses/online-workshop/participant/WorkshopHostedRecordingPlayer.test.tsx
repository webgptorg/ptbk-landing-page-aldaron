/** @vitest-environment jsdom */

import { WorkshopRecordingTimelineProvider, useWorkshopRecordingCommitSelection } from './WorkshopRecordingTimelineContext';
import { WorkshopHostedRecordingPlayer, type PlayerManifest } from './WorkshopHostedRecordingPlayer';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./HostedRecordingTransport', () => ({
    HostedRecordingTransport: class {
        private readonly listeners = new Set<() => void>();
        private snapshot = { seconds: 0, isPlaying: false, isPlayRequested: false, isSettling: false,
            view: 'auto', speed: 'auto', effectiveSpeed: 1,
            sourceStates: { editor: 'ready', application: 'ready', camera: 'ready' },
            isMuted: true, volume: 1, audioRole: 'camera' };
        public getSnapshot = () => this.snapshot;
        public subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
        private publish(changes: object) { this.snapshot = { ...this.snapshot, ...changes }; this.listeners.forEach((listener) => listener()); }
        public register = () => () => undefined;
        public getVisibleRole = () => this.snapshot.view === 'auto' ? this.snapshot.seconds >= 10 ? 'application' : 'editor' : this.snapshot.view;
        public getOverlayRole = () => this.snapshot.view === 'auto' ? 'camera' : null;
        public setView = (view: 'auto') => this.publish({ view });
        public seek = (seconds: number) => this.publish({ seconds });
        public setSpeed = (speed: 'auto') => this.publish({ speed });
        public setMuted = (isMuted: boolean) => this.publish({ isMuted });
        public setVolume = (volume: number) => this.publish({ volume });
        public play = () => this.publish({ isPlayRequested: true });
        public pause = () => this.publish({ isPlayRequested: false });
        public dispose = () => undefined;
    },
}));

const SHA_ONE = '1'.repeat(40);
const SHA_TWO = '2'.repeat(40);
const MANIFEST: PlayerManifest = {
    schemaVersion: 1, durationSeconds: 30, liveStartAt: new Date(Date.now() - 8_000).toISOString(),
    tracks: [
        { role: 'editor', contentType: 'video/webm', hasAudio: false },
        { role: 'application', contentType: 'video/webm', hasAudio: false },
        { role: 'camera', contentType: 'video/webm', hasAudio: true },
    ],
    autoView: { defaultScene: 'editor', transitions: [{ seconds: 10, scene: 'application' }] },
    activityIntervals: [{ startSeconds: 0, endSeconds: 30, classification: 'active' }],
    events: [{ seconds: 12, title: 'Nasazení', detail: 'Aplikace běží.' }],
    repository: { owner: 'owner', name: 'project' },
    startingCommit: { sha: SHA_ONE, availability: 'verified' },
    commitAnchors: [{ seconds: 10, commit: { sha: SHA_TWO, availability: 'verified' } }],
};

function CurrentCommit() {
    const selection = useWorkshopRecordingCommitSelection();
    return <output data-testid="selected-commit">{selection.sha ?? selection.state}</output>;
}

function renderPlayer(manifest: PlayerManifest) {
    return render(<WorkshopRecordingTimelineProvider workshopSlug="example"
        repository={{ owner: 'owner', name: 'project' }}>
        <WorkshopHostedRecordingPlayer adminPreview={{ manifest,
            trackUrls: { editor: '/editor.webm', application: '/application.webm', camera: '/camera.webm' } }}
            serverTime={new Date().toISOString()} />
        <CurrentCommit />
    </WorkshopRecordingTimelineProvider>);
}

describe('hosted workshop player controls', () => {
    afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

    it('keeps tabs, timeline markers and anchored commit on one session second', async () => {
        vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('probably');
        const rendered = renderPlayer(MANIFEST);
        await waitFor(() => expect(screen.getByRole('tab', { name: 'Auto' }).getAttribute('aria-selected')).toBe('true'));
        expect(screen.getByTestId('selected-commit').textContent).toBe(SHA_ONE);
        fireEvent.click(screen.getByRole('button', { name: 'Přehrát' }));
        fireEvent.change(screen.getByRole('combobox', { name: 'Rychlost přehrávání' }),
            { target: { value: '1.5' } });
        fireEvent.change(screen.getByRole('slider', { name: 'Čas záznamu' }), { target: { value: '12' } });
        await waitFor(() => expect(screen.getByTestId('selected-commit').textContent).toBe(SHA_TWO));
        for (const label of ['Editor', 'Aplikace', 'Kamera', 'Auto']) {
            fireEvent.click(screen.getByRole('tab', { name: label }));
            expect(screen.getByRole('tab', { name: label }).getAttribute('aria-selected')).toBe('true');
            expect((screen.getByRole('slider', { name: 'Čas záznamu' }) as HTMLInputElement).value).toBe('12');
            expect(screen.getByRole('button', { name: 'Pozastavit' })).toBeTruthy();
            expect((screen.getByRole('combobox', { name: 'Rychlost přehrávání' }) as HTMLSelectElement).value).toBe('1.5');
        }
        expect(rendered.container.querySelector('video[src="/camera.webm"]')?.className).toContain('bottom-3');
        expect(screen.getByRole('button', { name: /Nasazení.*Aplikace běží/ })).toBeTruthy();
    });

    it('locks replay controls when the authorized manifest declares a live window', async () => {
        vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('probably');
        const liveManifest: PlayerManifest = { ...MANIFEST, liveStartAt: new Date(Date.now() - 8_000).toISOString(),
            delivery: { mode: 'live-window', segmentSeconds: 2, serverTime: new Date().toISOString() } };
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => liveManifest })));
        const rendered = render(<WorkshopRecordingTimelineProvider workshopSlug="example">
            <WorkshopHostedRecordingPlayer workshopSlug="example" revisionId="revision-one"
                isLive serverTime={new Date().toISOString()} />
        </WorkshopRecordingTimelineProvider>);
        await waitFor(() => expect(rendered.container.querySelector('video[src*="?segment="]')).toBeTruthy());
        expect((screen.getByRole('slider', { name: 'Čas záznamu' }) as HTMLInputElement).disabled).toBe(true);
        expect((screen.getByRole('combobox', { name: 'Rychlost přehrávání' }) as HTMLSelectElement).disabled).toBe(true);
        expect(screen.getByRole('button', { name: 'Přejít živě' })).toBeTruthy();
        expect(screen.getByText(/nemá připojený repozitář/)).toBeTruthy();
    });
});
