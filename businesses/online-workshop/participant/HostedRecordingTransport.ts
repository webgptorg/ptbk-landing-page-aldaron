import { prepareRecordingMediaPlayback, settleRecordingMedia } from '@/lib/recording-studio/RecordingStudioTransport';
import { RECORDING_SYNC_TOLERANCE_SECONDS } from '@/lib/recording-studio/recordingStudioSessionTime';
import { getHostedRecordingLivePlaybackSeconds, getHostedRecordingLiveSeconds,
    getHostedRecordingNextSpeedBoundary,
    getHostedRecordingScene, getHostedRecordingSpeedAt, type HostedRecordingMetadata,
    type HostedRecordingRole, type HostedRecordingSpeed, type HostedRecordingView } from
    '@/lib/workshops/hostedRecording/hostedRecordingTimeline';

const TRANSPORT_TICK_MILLISECONDS = 40;
const ACCELERATED_FRAME_SAMPLE_MILLISECONDS = 180;
const DRIFT_SEEK_THRESHOLD_SECONDS = 0.25;
const RATE_CORRECTION_LIMIT = 0.15;

type SourceState = 'loading' | 'ready' | 'buffering' | 'gap' | 'error';
export type HostedRecordingSnapshot = {
    readonly seconds: number;
    readonly isPlaying: boolean;
    readonly isPlayRequested: boolean;
    readonly isSettling: boolean;
    readonly view: HostedRecordingView;
    readonly speed: HostedRecordingSpeed;
    readonly effectiveSpeed: number;
    readonly sourceStates: Readonly<Partial<Record<HostedRecordingRole, SourceState>>>;
    readonly isMuted: boolean;
    readonly volume: number;
    readonly audioRole: HostedRecordingRole | null;
};

/** The server supplies the live clock; replay has one monotonic clock independent of all decoder clocks. */
export class HostedRecordingTransport {
    private readonly media = new Map<HostedRecordingRole, HTMLVideoElement>();
    private readonly mediaOffsets = new Map<HostedRecordingRole, number>();
    private readonly listeners = new Set<() => void>();
    private snapshot: HostedRecordingSnapshot;
    private timer: ReturnType<typeof setInterval> | null = null;
    private operation: AbortController | null = null;
    private sampleOperation: AbortController | null = null;
    private anchorMilliseconds = 0;
    private anchorSeconds = 0;
    private lastSampleMilliseconds = 0;
    private isDisposed = false;

    public constructor(private readonly metadata: HostedRecordingMetadata,
        private readonly isLiveLocked: boolean, private readonly serverClockOffsetMilliseconds: number) {
        this.snapshot = {
            seconds: isLiveLocked ? this.liveSeconds() : 0, isPlaying: false, isPlayRequested: isLiveLocked,
            isSettling: false, view: 'auto', speed: 'auto', effectiveSpeed: 1,
            sourceStates: Object.fromEntries(metadata.tracks.map((track) => [track.role, 'loading'])),
            isMuted: true, volume: 1, audioRole: null,
        };
    }

    public getSnapshot = () => this.snapshot;
    public subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    private publish(changes: Partial<HostedRecordingSnapshot>) {
        if (this.isDisposed) return;
        this.snapshot = { ...this.snapshot, ...changes };
        this.listeners.forEach((listener) => listener());
    }
    private setSourceState(role: HostedRecordingRole, state: SourceState) {
        if (this.snapshot.sourceStates[role] === state) return;
        const sourceStates = { ...this.snapshot.sourceStates, [role]: state };
        const readyAudioRoles = this.metadata.tracks.filter((track) => track.hasAudio &&
            this.media.has(track.role) && sourceStates[track.role] === 'ready').map((track) => track.role);
        const audioRole = readyAudioRoles.includes('camera') ? 'camera' : readyAudioRoles[0] ?? null;
        this.publish({ sourceStates, audioRole });
        this.applyAudio();
    }
    private liveSeconds() {
        const wallClockMilliseconds = Date.now() + this.serverClockOffsetMilliseconds;
        return this.metadata.delivery?.mode === 'live-window' ?
            getHostedRecordingLivePlaybackSeconds(this.metadata, wallClockMilliseconds) :
            getHostedRecordingLiveSeconds(this.metadata, wallClockMilliseconds);
    }
    private currentSeconds() {
        if (this.isLiveLocked) return this.liveSeconds();
        if (!this.snapshot.isPlaying) return this.snapshot.seconds;
        // Accelerated mode advances in decoded steps. Slow decoders reduce actual throughput
        // instead of allowing the visible frames to fall behind the shared session clock.
        if (this.snapshot.effectiveSpeed === 10) return this.snapshot.seconds;
        const elapsedSeconds = (performance.now() - this.anchorMilliseconds) / 1000;
        const boundary = this.snapshot.speed === 'auto' ?
            getHostedRecordingNextSpeedBoundary(this.metadata, this.anchorSeconds) : this.metadata.durationSeconds;
        return Math.max(0, Math.min(this.metadata.durationSeconds, boundary,
            this.anchorSeconds + elapsedSeconds * this.snapshot.effectiveSpeed));
    }
    private availableRoles(): readonly HostedRecordingRole[] {
        return this.metadata.tracks.map((track) => track.role).filter((role) =>
            this.media.has(role) && this.snapshot.sourceStates[role] === 'ready');
    }
    public getVisibleRole(): HostedRecordingRole | null {
        if (this.snapshot.view === 'auto') return getHostedRecordingScene(this.metadata, this.snapshot.seconds, this.availableRoles());
        return this.availableRoles().includes(this.snapshot.view) ? this.snapshot.view : null;
    }
    public getOverlayRole(): HostedRecordingRole | null {
        return this.snapshot.view === 'auto' && this.getVisibleRole() !== 'camera' &&
            this.availableRoles().includes('camera') ? 'camera' : null;
    }
    private applyAudio() {
        for (const media of Array.from(this.media.values())) {
            media.volume = this.snapshot.volume;
            media.muted = true;
        }
        if (this.snapshot.isMuted || this.snapshot.effectiveSpeed === 10 ||
            this.isLiveLocked && !this.snapshot.isPlaying) return;
        const selectedMedia = this.snapshot.audioRole ? this.media.get(this.snapshot.audioRole) : null;
        if (selectedMedia) selectedMedia.muted = false;
    }
    public register(role: HostedRecordingRole, media: HTMLVideoElement, mediaOffsetSeconds = 0): () => void {
        this.media.set(role, media);
        this.mediaOffsets.set(role, mediaOffsetSeconds);
        this.setSourceState(role, 'loading');
        const onWaiting = () => {
            this.setSourceState(role, 'buffering');
            if (this.snapshot.isPlaying && this.snapshot.effectiveSpeed !== 10) void this.synchronize();
        };
        const onError = () => {
            this.setSourceState(role, 'error');
            if (this.snapshot.isPlaying) void this.synchronize();
        };
        const onEnded = () => {
            if (this.currentSeconds() < this.metadata.durationSeconds - RECORDING_SYNC_TOLERANCE_SECONDS) {
                this.setSourceState(role, 'gap');
                if (this.snapshot.isPlaying) void this.synchronize();
            }
        };
        media.addEventListener('waiting', onWaiting);
        media.addEventListener('stalled', onWaiting);
        media.addEventListener('error', onError);
        media.addEventListener('ended', onEnded);
        media.playsInline = true;
        media.controls = false;
        this.applyAudio();
        void this.synchronize();
        return () => {
            media.pause();
            media.removeEventListener('waiting', onWaiting);
            media.removeEventListener('stalled', onWaiting);
            media.removeEventListener('error', onError);
            media.removeEventListener('ended', onEnded);
            if (this.media.get(role) === media) {
                this.media.delete(role);
                this.mediaOffsets.delete(role);
                this.setSourceState(role, 'loading');
            }
        };
    }
    public setView(view: HostedRecordingView) {
        this.publish({ view });
    }
    public setMuted(isMuted: boolean) { this.publish({ isMuted }); this.applyAudio(); }
    public retry() {
        for (const [role, media] of Array.from(this.media.entries())) {
            if (this.snapshot.sourceStates[role] === 'error') {
                media.load();
                this.setSourceState(role, 'loading');
            }
        }
        void this.synchronize();
    }
    public setVolume(volume: number) {
        if (!Number.isFinite(volume)) return;
        this.publish({ volume: Math.max(0, Math.min(1, volume)) });
        this.applyAudio();
    }
    public setSpeed(speed: HostedRecordingSpeed) {
        if (this.isLiveLocked || this.snapshot.speed === speed) return;
        this.freeze();
        this.publish({ speed });
        void this.synchronize();
    }
    public seek(seconds: number) {
        if (this.isLiveLocked || !Number.isFinite(seconds)) return;
        this.freeze();
        this.publish({ seconds: Math.max(0, Math.min(this.metadata.durationSeconds, seconds)) });
        void this.synchronize();
    }
    public play() {
        if (this.snapshot.seconds >= this.metadata.durationSeconds && !this.isLiveLocked) this.publish({ seconds: 0 });
        this.publish({ isPlayRequested: true });
        void this.synchronize();
    }
    public pause() {
        if (this.isLiveLocked) return;
        this.publish({ isPlayRequested: false });
        this.freeze();
        void this.synchronize();
    }
    private freeze() {
        const seconds = this.currentSeconds();
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.sampleOperation?.abort();
        this.sampleOperation = null;
        for (const media of Array.from(this.media.values())) media.pause();
        this.publish({ seconds, isPlaying: false });
    }
    private async settleAll(seconds: number, signal: AbortSignal) {
        await Promise.all(Array.from(this.media, async ([role, media]) => {
            if (this.snapshot.sourceStates[role] === 'error') return;
            const mediaSeconds = seconds - (this.mediaOffsets.get(role) ?? 0);
            if (mediaSeconds < -RECORDING_SYNC_TOLERANCE_SECONDS ||
                Number.isFinite(media.duration) && mediaSeconds >= media.duration) {
                this.setSourceState(role, 'gap');
                return;
            }
            this.setSourceState(role, 'buffering');
            try {
                await settleRecordingMedia(media, Math.max(0, Math.min(mediaSeconds,
                    Math.max(0, (Number.isFinite(media.duration) ? media.duration : this.metadata.durationSeconds) - 0.04))), signal);
                signal.throwIfAborted();
                this.setSourceState(role, Number.isFinite(media.duration) && mediaSeconds >= media.duration
                    ? 'gap' : 'ready');
            } catch {
                if (!signal.aborted) this.setSourceState(role, 'error');
            }
        }));
    }
    private async synchronize() {
        if (this.isDisposed) return;
        this.freeze();
        this.operation?.abort();
        const controller = new AbortController();
        this.operation = controller;
        const seconds = this.isLiveLocked ? this.liveSeconds() : this.snapshot.seconds;
        const effectiveSpeed = this.isLiveLocked ? 1 : getHostedRecordingSpeedAt(this.metadata, seconds, this.snapshot.speed);
        this.publish({ seconds, effectiveSpeed, isSettling: true });
        await this.settleAll(seconds, controller.signal);
        if (controller.signal.aborted || this.isDisposed) return;
        if (!this.snapshot.isPlayRequested || seconds >= this.metadata.durationSeconds) {
            this.publish({ isSettling: false });
            this.operation = null;
            return;
        }
        if (effectiveSpeed !== 10) {
            await Promise.all(Array.from(this.media, async ([role, media]) => {
                if (this.snapshot.sourceStates[role] !== 'ready') return;
                try { await prepareRecordingMediaPlayback(media, controller.signal); }
                catch { if (!controller.signal.aborted) this.setSourceState(role, 'error'); }
            }));
            if (controller.signal.aborted || this.isDisposed) return;
            for (const [role, media] of Array.from(this.media.entries())) {
                if (this.snapshot.sourceStates[role] === 'ready') media.playbackRate = effectiveSpeed;
            }
        }
        if (!Array.from(this.media.keys()).some((role) => this.snapshot.sourceStates[role] === 'ready')) {
            this.operation = null;
            this.publish({ isPlaying: false, isSettling: false });
            return;
        }
        this.anchorSeconds = seconds;
        this.anchorMilliseconds = performance.now();
        this.lastSampleMilliseconds = this.anchorMilliseconds;
        this.operation = null;
        this.publish({ isPlaying: true, isSettling: false });
        this.applyAudio();
        this.timer = setInterval(() => this.tick(), TRANSPORT_TICK_MILLISECONDS);
    }
    private tick() {
        if (!this.snapshot.isPlaying) return;
        const seconds = this.currentSeconds();
        this.publish({ seconds });
        if (seconds >= this.metadata.durationSeconds) {
            if (this.isLiveLocked) {
                if (this.timer) clearInterval(this.timer);
                this.timer = null;
                for (const media of Array.from(this.media.values())) media.pause();
                this.publish({ isPlaying: false });
            } else this.pause();
            return;
        }
        const nextSpeed = this.isLiveLocked ? 1 : getHostedRecordingSpeedAt(this.metadata, seconds, this.snapshot.speed);
        if (nextSpeed !== this.snapshot.effectiveSpeed) { void this.synchronize(); return; }
        if (nextSpeed === 10) {
            if (!this.sampleOperation && performance.now() - this.lastSampleMilliseconds >= ACCELERATED_FRAME_SAMPLE_MILLISECONDS)
                void this.advanceAccelerated();
            return;
        }
        for (const [role, media] of Array.from(this.media.entries())) {
            if (this.snapshot.sourceStates[role] === 'error' || this.snapshot.sourceStates[role] === 'gap') continue;
            const mediaOffsetSeconds = this.mediaOffsets.get(role) ?? 0;
            if (this.isLiveLocked && this.metadata.delivery?.mode === 'live-window' &&
                seconds >= mediaOffsetSeconds + this.metadata.delivery.segmentSeconds) {
                media.pause();
                this.setSourceState(role, 'buffering');
                continue;
            }
            const drift = seconds - (mediaOffsetSeconds + media.currentTime);
            if (media.readyState < 2 || media.seeking || Math.abs(drift) > DRIFT_SEEK_THRESHOLD_SECONDS) {
                void this.synchronize();
                return;
            }
            const adjustment = Math.max(-RATE_CORRECTION_LIMIT, Math.min(RATE_CORRECTION_LIMIT, drift * 2));
            media.playbackRate = nextSpeed + (Math.abs(drift) <= RECORDING_SYNC_TOLERANCE_SECONDS / 2 ? 0 : adjustment);
            this.setSourceState(role, Math.abs(drift) <= RECORDING_SYNC_TOLERANCE_SECONDS ? 'ready' : 'buffering');
        }
    }
    private async advanceAccelerated() {
        const controller = new AbortController();
        this.sampleOperation = controller;
        const boundary = this.snapshot.speed === 'auto' ?
            getHostedRecordingNextSpeedBoundary(this.metadata, this.snapshot.seconds) : this.metadata.durationSeconds;
        const nextSeconds = Math.min(this.metadata.durationSeconds, boundary,
            this.snapshot.seconds + ACCELERATED_FRAME_SAMPLE_MILLISECONDS / 1000 * 10);
        this.publish({ isSettling: true });
        await this.settleAll(nextSeconds, controller.signal);
        if (controller.signal.aborted || this.isDisposed) return;
        this.sampleOperation = null;
        if (!Array.from(this.media.keys()).some((role) => this.snapshot.sourceStates[role] === 'ready')) {
            if (this.timer) clearInterval(this.timer);
            this.timer = null;
            this.publish({ isPlaying: false, isSettling: false });
            return;
        }
        this.lastSampleMilliseconds = performance.now();
        this.publish({ seconds: nextSeconds, isSettling: false });
        if (nextSeconds >= this.metadata.durationSeconds) { this.pause(); return; }
        if (getHostedRecordingSpeedAt(this.metadata, nextSeconds, this.snapshot.speed) !== 10)
            void this.synchronize();
    }
    public dispose() {
        this.freeze();
        this.isDisposed = true;
        this.operation?.abort();
        this.sampleOperation?.abort();
        this.listeners.clear();
        this.media.clear();
        this.mediaOffsets.clear();
    }
}
