import { getRecordingClockSeconds, RECORDING_SEEK_TOLERANCE_SECONDS, RECORDING_SYNC_TOLERANCE_SECONDS, sessionToRecordingMediaTime } from './recordingStudioSessionTime';
import type { RecordingTrack } from './recordingStudioTypes';

const MEDIA_OPERATION_TIMEOUT_MILLISECONDS = 8_000;
const TRANSPORT_TICK_MILLISECONDS = 40;
const DRIFT_SEEK_THRESHOLD_SECONDS = 0.25;
const MAXIMUM_RATE_CORRECTION_FRACTION = 0.15;
const DRIFT_CORRECTION_GAIN = 2;
type SourceState = 'loading' | 'ready' | 'gap' | 'buffering' | 'error';
export type RecordingTransportSnapshot = {
    readonly seconds: number;
    readonly speed: number;
    readonly isPlaying: boolean;
    readonly isPlayRequested: boolean;
    readonly isSettling: boolean;
    readonly sources: Readonly<Record<string, SourceState>>;
    readonly errors: Readonly<Record<string, string>>;
};
type TransportSource = {
    readonly track: RecordingTrack;
    readonly media: HTMLMediaElement;
    readonly firstTimestampSeconds: number;
    readonly endTimestampSeconds: number;
    readonly availableStartTimestampSeconds: number;
    readonly dispose: () => void;
};

/** One wall clock; decoder readiness is a barrier, never an independent transport. */
export class RecordingStudioTransport {
    private readonly sources = new Map<string, TransportSource>();
    private readonly listeners = new Set<() => void>();
    private snapshot: RecordingTransportSnapshot;
    private operation: AbortController | null = null;
    private isDisposed = false;
    private anchorMilliseconds = 0;
    private anchorSeconds = 0;
    private timer: ReturnType<typeof setInterval> | null = null;

    public constructor(tracks: readonly RecordingTrack[], private readonly durationSeconds: number) {
        this.snapshot = { seconds: 0, speed: 1, isPlaying: false, isPlayRequested: false, isSettling: false,
            sources: Object.fromEntries(tracks.map((track) => [track.id, track.byteLength > 0 ? 'loading' : 'gap'])), errors: {} };
    }
    public getSnapshot = () => this.snapshot;
    public subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    private publish(changes: Partial<RecordingTransportSnapshot>) {
        if (this.isDisposed) return;
        this.snapshot = { ...this.snapshot, ...changes };
        this.listeners.forEach((listener) => listener());
    }
    private setSourceState(id: string, state: SourceState, error?: string) {
        const errors = { ...this.snapshot.errors };
        if (error) errors[id] = error;
        else if (state !== 'error') delete errors[id];
        this.publish({ sources: { ...this.snapshot.sources, [id]: state },
            errors });
    }
    public failSource(id: string, message: string) {
        this.sources.get(id)?.media.pause();
        this.setSourceState(id, 'error', message);
        if (!this.operation) void this.synchronize();
    }
    public register(track: RecordingTrack, media: HTMLMediaElement, firstTimestampSeconds: number, endTimestampSeconds: number, availableStartTimestampSeconds = firstTimestampSeconds): () => void {
        this.sources.get(track.id)?.dispose();
        const handleWaiting = () => {
            if (!this.operation && this.snapshot.isPlaying) void this.synchronize();
        };
        const handleError = () => this.failSource(track.id, 'Médium nelze přehrát. Originál zůstává uložený; zkuste načíst náhled znovu.');
        media.addEventListener('waiting', handleWaiting);
        media.addEventListener('stalled', handleWaiting);
        media.addEventListener('error', handleError);
        const dispose = () => {
            media.pause();
            media.removeEventListener('waiting', handleWaiting);
            media.removeEventListener('stalled', handleWaiting);
            media.removeEventListener('error', handleError);
        };
        this.sources.set(track.id, { track, media, firstTimestampSeconds, endTimestampSeconds, availableStartTimestampSeconds, dispose });
        this.setSourceState(track.id, 'buffering');
        void this.synchronize();
        return () => {
            dispose();
            if (this.sources.get(track.id)?.media === media) this.sources.delete(track.id);
        };
    }
    private currentSeconds() {
        return this.snapshot.isPlaying
            ? Math.min(this.durationSeconds, this.anchorSeconds + getRecordingClockSeconds(this.anchorMilliseconds, performance.now()) * this.snapshot.speed)
            : this.snapshot.seconds;
    }
    private freeze() {
        const seconds = this.currentSeconds();
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.sources.forEach(({ media }) => media.pause());
        this.publish({ seconds, isPlaying: false });
    }
    public pause = () => {
        this.publish({ isPlayRequested: false });
        this.freeze();
        // A paused frame must settle at the authoritative time too, including between timer ticks.
        void this.synchronize();
    };
    public play = () => {
        this.publish({ isPlayRequested: true });
        if (this.snapshot.seconds >= this.durationSeconds) this.publish({ seconds: 0 });
        void this.synchronize();
    };
    public seek = (seconds: number) => {
        if (!Number.isFinite(seconds)) return;
        this.freeze();
        this.publish({ seconds: Math.max(0, Math.min(this.durationSeconds, seconds)) });
        void this.synchronize();
    };
    public setSpeed = (speed: number) => {
        if (!Number.isFinite(speed) || speed < 0.25 || speed > 4) return;
        this.freeze();
        this.publish({ speed });
        void this.synchronize();
    };
    public resynchronize = () => { void this.synchronize(); };
    public retry = () => {
        this.sources.forEach((source) => {
            if (this.snapshot.sources[source.track.id] === 'error') {
                source.media.load();
                this.setSourceState(source.track.id, 'buffering');
            }
        });
        void this.synchronize();
    };
    private target(source: TransportSource) {
        return sessionToRecordingMediaTime(source.track, this.snapshot.seconds, source.firstTimestampSeconds,
            Math.min(source.endTimestampSeconds, Number.isFinite(source.media.duration) ? source.media.duration : Infinity), source.availableStartTimestampSeconds);
    }
    private async synchronize() {
        if (this.isDisposed) return;
        this.freeze();
        this.operation?.abort();
        const controller = new AbortController();
        this.operation = controller;
        this.publish({ isSettling: true });
        const playable: TransportSource[] = [];
        await Promise.all(Array.from(this.sources.values()).map(async (source) => {
            if (this.snapshot.sources[source.track.id] === 'error') return;
            const target = this.target(source);
            if (target === null) { this.setSourceState(source.track.id, 'gap'); return; }
            this.setSourceState(source.track.id, 'buffering');
            try {
                await settleRecordingMedia(source.media, target, controller.signal);
                controller.signal.throwIfAborted();
                this.setSourceState(source.track.id, 'ready');
                playable.push(source);
            } catch (error) {
                if (!controller.signal.aborted) this.setSourceState(source.track.id, 'error', error instanceof Error ? error.message : 'Náhled není dostupný.');
            }
        }));
        if (controller.signal.aborted || this.isDisposed) return;
        const isLoading = Object.values(this.snapshot.sources).includes('loading');
        if (!this.snapshot.isPlayRequested || isLoading) {
            this.publish({ isSettling: isLoading });
            this.operation = null;
            return;
        }
        // A zero playback rate lets each decoder complete its asynchronous play request without advancing.
        // Commit the common rate/clock only after every playable source is armed; fast sources cannot run ahead.
        await Promise.all(playable.map(async (source) => {
            try { await prepareRecordingMediaPlayback(source.media, controller.signal); }
            catch (error) {
                if (!this.isDisposed && !controller.signal.aborted) this.failSource(source.track.id, error instanceof Error ? error.message : 'Přehrávání je zablokované.');
            }
        }));
        // A superseded operation must never pause or start media owned by a newer seek/play.
        if (controller.signal.aborted || this.isDisposed) return;
        this.anchorSeconds = this.snapshot.seconds;
        this.anchorMilliseconds = performance.now();
        playable.forEach((source) => {
            if (this.snapshot.sources[source.track.id] === 'ready') source.media.playbackRate = this.snapshot.speed;
        });
        this.operation = null;
        this.publish({ isPlaying: true, isSettling: false });
        this.timer = setInterval(() => this.tick(), TRANSPORT_TICK_MILLISECONDS);
    }
    private tick() {
        if (!this.snapshot.isPlaying) return;
        const seconds = this.currentSeconds();
        this.publish({ seconds });
        if (seconds >= this.durationSeconds) { this.pause(); return; }
        let isCorrecting = false;
        for (const source of Array.from(this.sources.values())) {
            const state = this.snapshot.sources[source.track.id];
            if (state === 'error') continue;
            const target = this.target(source);
            if ((target === null) !== (state === 'gap') || (target !== null &&
                (source.media.readyState < 2 || source.media.seeking || source.media.ended ||
                    Math.abs(source.media.currentTime - target) > Math.max(DRIFT_SEEK_THRESHOLD_SECONDS, this.snapshot.speed * MAXIMUM_RATE_CORRECTION_FRACTION)))) {
                void this.synchronize();
                return;
            }
            if (target !== null) isCorrecting = this.correctSourceDrift(source, target) || isCorrecting;
        }
        if (isCorrecting !== this.snapshot.isSettling) this.publish({ isSettling: isCorrecting });
    }
    private correctSourceDrift(source: TransportSource, target: number): boolean {
        const drift = target - source.media.currentTime;
        const maximumAdjustment = this.snapshot.speed * MAXIMUM_RATE_CORRECTION_FRACTION;
        // Rate changes can have a small fixed decoder latency. Repeatedly pausing/restarting recreates it.
        // A bounded rate adjustment closes that gap without changing source/session timestamp mappings.
        const playbackRate = this.snapshot.speed + (Math.abs(drift) <= RECORDING_SEEK_TOLERANCE_SECONDS ? 0 :
            Math.max(-maximumAdjustment, Math.min(maximumAdjustment, drift * DRIFT_CORRECTION_GAIN)));
        if (Math.abs(source.media.playbackRate - playbackRate) > 0.001) source.media.playbackRate = playbackRate;
        const isCorrecting = Math.abs(drift) > RECORDING_SYNC_TOLERANCE_SECONDS / 2;
        const state = isCorrecting ? 'buffering' : 'ready';
        if (this.snapshot.sources[source.track.id] !== state) this.setSourceState(source.track.id, state);
        return isCorrecting;
    }
    public dispose() {
        this.publish({ isPlayRequested: false });
        this.freeze();
        this.isDisposed = true;
        this.operation?.abort();
        this.sources.forEach(({ dispose }) => dispose());
        this.sources.clear();
        this.listeners.clear();
    }
}

/** Install listeners before assigning currentTime; cached seeks may complete immediately. */
export function settleRecordingMedia(media: HTMLMediaElement, seconds: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        let isSeekAssigned = false;
        let isFinished = false;
        const cleanup = () => {
            clearTimeout(timeout);
            for (const name of ['loadedmetadata', 'loadeddata', 'canplay', 'seeked', 'timeupdate']) media.removeEventListener(name, check);
            media.removeEventListener('error', fail);
            signal.removeEventListener('abort', cancel);
        };
        const finish = (error?: Error) => {
            if (isFinished) return;
            isFinished = true;
            cleanup(); if (error) reject(error); else resolve();
        };
        const cancel = () => finish(new DOMException('Přesun zrušen.', 'AbortError'));
        const fail = () => finish(new Error('Poškozené nebo nepodporované médium. Originál se nemění.'));
        const check = () => {
            if (signal.aborted) { cancel(); return; }
            if (media.error) { fail(); return; }
            if (media.readyState < 1) return;
            if (!isSeekAssigned) {
                isSeekAssigned = true;
                // A paused clock may be correct while its last decoded frame is stale. Always request a seek
                // and wait for the decoder, even at the same timestamp (particularly after hidden playback).
                try { media.currentTime = seconds; } catch { fail(); }
                return;
            }
            if (!media.seeking && media.readyState >= 2 && Math.abs(media.currentTime - seconds) <= RECORDING_SEEK_TOLERANCE_SECONDS) finish();
        };
        const timeout = setTimeout(() => finish(new Error('Zdroj nedokončil přesun do 8 sekund. Zkuste náhled znovu; ostatní zdroje zachovají čas.')), MEDIA_OPERATION_TIMEOUT_MILLISECONDS);
        for (const name of ['loadedmetadata', 'loadeddata', 'canplay', 'seeked', 'timeupdate']) media.addEventListener(name, check);
        media.addEventListener('error', fail);
        signal.addEventListener('abort', cancel);
        check();
    });
}

/** HTML supports playing at rate zero without advancing; an unresolved start never advances the master clock. */
function prepareRecordingMediaPlayback(media: HTMLMediaElement, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const finish = (error?: unknown) => {
            clearTimeout(timeout);
            signal.removeEventListener('abort', cancel);
            if (error) reject(error); else resolve();
        };
        const cancel = () => finish(new DOMException('Přehrávání zrušeno.', 'AbortError'));
        const timeout = setTimeout(() => finish(new Error('Zdroj nespustil přehrávání do 8 sekund. Zkuste náhled znovu.')), MEDIA_OPERATION_TIMEOUT_MILLISECONDS);
        signal.addEventListener('abort', cancel);
        if (signal.aborted) { cancel(); return; }
        try {
            media.playbackRate = 0;
            void media.play().then(() => finish(), finish);
        } catch (error) { finish(error); }
    });
}
