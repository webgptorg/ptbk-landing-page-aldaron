import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioTransport } from './RecordingStudioTransport';
import { createTestStudioRecording } from './recordingStudioTestUtilities';

class DelayedMedia extends EventTarget {
    public duration = 36_000;
    public readyState = 2;
    public seeking = false;
    public paused = true;
    public ended = false;
    public error = null;
    private playbackSpeed = 1;
    public muted = true;
    public playDelayMilliseconds = 0;
    public presentedSeconds = 0;
    private seconds = 0;
    private anchor = 0;
    private playRequest = 0;
    public constructor(private readonly delay: number) { super(); }
    public get playbackRate() { return this.playbackSpeed; }
    public set playbackRate(value: number) { this.seconds = this.currentTime; this.anchor = performance.now(); this.playbackSpeed = value; }
    public get currentTime() { return this.seconds + (this.paused ? 0 : (performance.now() - this.anchor) / 1000 * this.playbackRate); }
    public set currentTime(value: number) {
        this.seconds = value; this.anchor = performance.now(); this.seeking = true;
        setTimeout(() => { this.presentedSeconds = value; this.seeking = false; this.dispatchEvent(new Event('seeked')); }, this.delay);
    }
    public pause() { this.seconds = this.currentTime; this.paused = true; this.playRequest += 1; }
    public async play() {
        const request = ++this.playRequest;
        if (this.playDelayMilliseconds) await new Promise((resolve) => setTimeout(resolve, this.playDelayMilliseconds));
        if (request !== this.playRequest) throw new DOMException('Playback interrupted', 'AbortError');
        this.anchor = performance.now(); this.paused = false;
    }
    public load() { this.readyState = 2; }
    public jump(seconds: number) { this.seconds += seconds; }
    public element() { return this as unknown as HTMLMediaElement; }
}

describe('master decoder transport', () => {
    let transport: RecordingStudioTransport;
    beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] }); });
    afterEach(() => { transport?.dispose(); vi.useRealTimers(); });
    function setup() {
        const tracks = createTestStudioRecording().tracks.map((track, index) => ({ ...track, byteLength: 10, startOffsetSeconds: index * 0.23, durationSeconds: 36_000 }));
        transport = new RecordingStudioTransport(tracks, 36_000);
        const fast = new DelayedMedia(20);
        const slow = new DelayedMedia(350);
        transport.register(tracks[0], fast.element(), 0, 36_000);
        transport.register(tracks[1], slow.element(), 0, 36_000);
        return { fast, slow };
    }
    it('waits for delayed seeking at ten hours, then corrects drift against one clock', async () => {
        const { fast, slow } = setup();
        transport.seek(35_900);
        transport.play();
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().isPlaying).toBe(false);
        expect(fast.paused).toBe(true);
        await vi.advanceTimersByTimeAsync(300);
        expect(transport.getSnapshot().isPlaying).toBe(true);
        await vi.advanceTimersByTimeAsync(5_000);
        expect(Math.abs(fast.currentTime - (slow.currentTime + 0.23))).toBeLessThan(0.1);
        slow.jump(-0.4);
        await vi.advanceTimersByTimeAsync(400);
        expect(Math.abs(fast.currentTime - slow.currentTime - 0.23)).toBeLessThan(0.1);
    });
    it('freezes every source while buffering and resumes at the same session moment', async () => {
        const { fast, slow } = setup();
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(400);
        slow.readyState = 1; slow.dispatchEvent(new Event('waiting'));
        const frozenSeconds = transport.getSnapshot().seconds;
        await vi.advanceTimersByTimeAsync(2_000);
        expect(transport.getSnapshot().seconds).toBe(frozenSeconds);
        expect(fast.paused).toBe(true);
        slow.readyState = 2; slow.dispatchEvent(new Event('canplay'));
        await vi.advanceTimersByTimeAsync(100);
        expect(transport.getSnapshot().isPlaying).toBe(true);
    });
    it('cancels stale scrubs, respects pause during seek, and keeps speed shared', async () => {
        const { fast, slow } = setup();
        transport.seek(10); transport.play(); transport.seek(200); transport.seek(1_000); transport.pause();
        await vi.advanceTimersByTimeAsync(400);
        expect(transport.getSnapshot().seconds).toBe(1_000);
        expect(fast.paused && slow.paused).toBe(true);
        transport.setSpeed(2); transport.play();
        await vi.advanceTimersByTimeAsync(2_000);
        expect(fast.playbackRate).toBe(2); expect(slow.playbackRate).toBe(2);
        expect(transport.getSnapshot().seconds).toBeGreaterThan(1_003);
    });
    it('marks timed-out sources unavailable and allows a retry without shifting the timeline', async () => {
        const { slow } = setup();
        slow.readyState = 1;
        transport.seek(100); transport.play();
        await vi.advanceTimersByTimeAsync(8_100);
        expect(transport.getSnapshot().sources['track-1']).toBe('error');
        transport.retry();
        await vi.advanceTimersByTimeAsync(400);
        expect(transport.getSnapshot().sources['track-1']).toBe('ready');
        expect(slow.currentTime + 0.23).toBeCloseTo(transport.getSnapshot().seconds, 1);
    });

    it('holds the session clock and already-started media until delayed play promises settle', async () => {
        const { fast, slow } = setup();
        slow.playDelayMilliseconds = 600;
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(800);
        expect(transport.getSnapshot()).toMatchObject({ seconds: 5, isPlaying: false, isPlayRequested: true, isSettling: true });
        expect(fast.currentTime).toBe(5);
        await vi.advanceTimersByTimeAsync(500);
        expect(transport.getSnapshot().isPlaying).toBe(true);
        expect(Math.abs(fast.currentTime - slow.currentTime - 0.23)).toBeLessThan(0.1);
        expect(transport.getSnapshot().errors).toEqual({});
    });

    it('cancels a pending playback start without allowing a late promise to resume it', async () => {
        const { fast, slow } = setup();
        slow.playDelayMilliseconds = 600;
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(500);
        transport.pause();
        await vi.advanceTimersByTimeAsync(1_000);
        expect(transport.getSnapshot()).toMatchObject({ seconds: 5, isPlaying: false, isPlayRequested: false, isSettling: false });
        expect(fast.paused && slow.paused).toBe(true);
        expect(transport.getSnapshot().errors).toEqual({});
    });

    it('settles the decoded frame even when a paused media clock already reports the target time', async () => {
        const { fast } = setup();
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(600);
        transport.pause();
        await vi.advanceTimersByTimeAsync(400);
        expect(Math.abs(fast.presentedSeconds - transport.getSnapshot().seconds)).toBeLessThan(0.025);
    });

    it('times out a stalled playback start and rejoins that source on explicit retry', async () => {
        const { fast, slow } = setup();
        slow.playDelayMilliseconds = 9_000;
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(8_400);
        expect(transport.getSnapshot().sources['track-1']).toBe('error');
        expect(transport.getSnapshot().errors['track-1']).toContain('nespustil');
        expect(slow.paused).toBe(true);
        slow.playDelayMilliseconds = 0;
        transport.retry();
        await vi.advanceTimersByTimeAsync(400);
        expect(transport.getSnapshot().sources['track-1']).toBe('ready');
        expect(Math.abs(fast.currentTime - slow.currentTime - 0.23)).toBeLessThan(0.1);
    });

    it('closes modest decoder start latency without repeatedly restarting all sources', async () => {
        const { fast, slow } = setup();
        transport.seek(5); transport.play();
        await vi.advanceTimersByTimeAsync(400);
        slow.jump(-0.12);
        await vi.advanceTimersByTimeAsync(40);
        expect(transport.getSnapshot()).toMatchObject({ isPlaying: true, isSettling: true });
        expect(slow.playbackRate).toBeGreaterThan(1);
        await vi.advanceTimersByTimeAsync(1_500);
        expect(transport.getSnapshot()).toMatchObject({ isPlaying: true, isSettling: false });
        expect(slow.playbackRate).toBe(1);
        expect(Math.abs(fast.currentTime - slow.currentTime - 0.23)).toBeLessThan(0.025);
    });
});
