import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HostedRecordingTransport } from './HostedRecordingTransport';
import type { HostedRecordingMetadata } from '@/lib/workshops/hostedRecording/hostedRecordingTimeline';

class DelayedVideo extends EventTarget {
    public duration = 12;
    public readyState = 2;
    public seeking = false;
    public error: Error | null = null;
    public paused = true;
    public muted = true;
    public volume = 1;
    public playsInline = true;
    public controls = false;
    public playbackRate = 1;
    public presentedSeconds = 0;
    private seconds = 0;
    private anchorMilliseconds = 0;
    public constructor(private readonly delayMilliseconds: number) { super(); }
    public get currentTime() {
        return this.seconds + (this.paused ? 0 :
            (performance.now() - this.anchorMilliseconds) / 1000 * this.playbackRate);
    }
    public set currentTime(seconds: number) {
        this.seconds = seconds;
        this.anchorMilliseconds = performance.now();
        this.seeking = true;
        setTimeout(() => {
            this.presentedSeconds = seconds;
            this.seeking = false;
            this.dispatchEvent(new Event('seeked'));
        }, this.delayMilliseconds);
    }
    public pause() { this.seconds = this.currentTime; this.paused = true; }
    public async play() { this.anchorMilliseconds = performance.now(); this.paused = false; }
    public element() { return this as unknown as HTMLVideoElement; }
}

const METADATA: HostedRecordingMetadata = {
    schemaVersion: 1, durationSeconds: 12, liveStartAt: '2026-09-30T10:00:00.000Z',
    tracks: [{ role: 'editor', contentType: 'video/webm', hasAudio: true },
        { role: 'camera', contentType: 'video/webm', hasAudio: true }],
    activityIntervals: [{ startSeconds: 0, endSeconds: 2, classification: 'active' },
        { startSeconds: 2, endSeconds: 5, classification: 'automatic-coding' },
        { startSeconds: 5, endSeconds: 12, classification: 'unclassified' }],
    autoView: { defaultScene: 'editor' },
};

describe('hosted recording common transport', () => {
    let transport: HostedRecordingTransport;
    beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] }); });
    afterEach(() => { transport?.dispose(); vi.useRealTimers(); });

    it('waits for the slow camera frame and keeps both sources within the studio 100 ms tolerance', async () => {
        transport = new HostedRecordingTransport(METADATA, false, 0);
        const editor = new DelayedVideo(15);
        const camera = new DelayedVideo(350);
        transport.register('editor', editor.element());
        transport.register('camera', camera.element());
        transport.seek(1);
        transport.play();
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().isPlaying).toBe(false);
        await vi.advanceTimersByTimeAsync(400);
        expect(transport.getSnapshot().isPlaying).toBe(true);
        transport.setView('camera');
        expect(transport.getSnapshot().seconds).toBeCloseTo(1, 0);
        await vi.advanceTimersByTimeAsync(200);
        expect(Math.abs(editor.currentTime - camera.currentTime)).toBeLessThan(0.1);
        expect(editor.muted || camera.muted).toBe(true);
    });

    it('crosses Auto 1×, 10×, 1× boundaries and leaves manual speed fixed', async () => {
        transport = new HostedRecordingTransport(METADATA, false, 0);
        const editor = new DelayedVideo(5);
        transport.register('editor', editor.element());
        transport.seek(1.8);
        transport.play();
        await vi.advanceTimersByTimeAsync(300);
        expect(transport.getSnapshot().effectiveSpeed).toBe(10);
        await vi.advanceTimersByTimeAsync(800);
        expect(transport.getSnapshot().seconds).toBeGreaterThan(3);
        await vi.advanceTimersByTimeAsync(600);
        expect(transport.getSnapshot().effectiveSpeed).toBe(1);
        transport.seek(2.5);
        await vi.advanceTimersByTimeAsync(30);
        expect(transport.getSnapshot().effectiveSpeed).toBe(10);
        transport.setSpeed(1.5);
        await vi.advanceTimersByTimeAsync(50);
        expect(transport.getSnapshot().effectiveSpeed).toBe(1.5);
        expect(transport.getSnapshot().view).toBe('auto');
    });

    it('selects one ready audio source and falls back when camera sound is unavailable', async () => {
        transport = new HostedRecordingTransport(METADATA, false, 0);
        const editor = new DelayedVideo(5);
        const camera = new DelayedVideo(5);
        transport.register('editor', editor.element());
        transport.register('camera', camera.element());
        transport.play();
        await vi.advanceTimersByTimeAsync(100);
        transport.setMuted(false);
        expect(transport.getSnapshot().audioRole).toBe('camera');
        expect(camera.muted).toBe(false);
        expect(editor.muted).toBe(true);
        camera.error = new Error('camera unavailable');
        camera.dispatchEvent(new Event('error'));
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().audioRole).toBe('editor');
        expect(editor.muted).toBe(false);
        expect(camera.muted).toBe(true);
    });

    it('freezes on a delayed buffer and falls back when the preferred screen fails', async () => {
        transport = new HostedRecordingTransport(METADATA, false, 0);
        const editor = new DelayedVideo(5);
        const camera = new DelayedVideo(5);
        transport.register('editor', editor.element());
        transport.register('camera', camera.element());
        transport.play();
        await vi.advanceTimersByTimeAsync(100);
        camera.readyState = 1;
        camera.dispatchEvent(new Event('waiting'));
        const frozenSeconds = transport.getSnapshot().seconds;
        await vi.advanceTimersByTimeAsync(500);
        expect(transport.getSnapshot().isPlaying).toBe(false);
        expect(transport.getSnapshot().seconds).toBeCloseTo(frozenSeconds, 1);
        camera.readyState = 2;
        camera.dispatchEvent(new Event('canplay'));
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().isPlaying).toBe(true);
        editor.duration = 0.05;
        editor.dispatchEvent(new Event('ended'));
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().sourceStates.editor).toBe('gap');
        expect(transport.getVisibleRole()).toBe('camera');
        transport.seek(0);
        await vi.advanceTimersByTimeAsync(50);
        expect(transport.getSnapshot().sourceStates.editor).toBe('ready');
        transport.seek(1);
        await vi.advanceTimersByTimeAsync(50);
        expect(transport.getSnapshot().sourceStates.editor).toBe('gap');
        editor.error = new Error('missing source');
        editor.dispatchEvent(new Event('error'));
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().sourceStates.editor).toBe('error');
        expect(transport.getVisibleRole()).toBe('camera');
    });

    it('ignores replay, speed and pause commands for a free live viewer', () => {
        vi.setSystemTime(new Date('2026-09-30T10:00:08.000Z'));
        transport = new HostedRecordingTransport({ ...METADATA,
            delivery: { mode: 'live-window', segmentSeconds: 2, serverTime: '2026-09-30T10:00:08.000Z' },
        }, true, 0);
        expect(transport.getSnapshot().seconds).toBe(6);
        transport.seek(0); transport.setSpeed(4); transport.pause(); transport.setView('camera');
        expect(transport.getSnapshot()).toMatchObject({ seconds: 6, speed: 'auto',
            isPlayRequested: true, view: 'camera' });
    });
});
