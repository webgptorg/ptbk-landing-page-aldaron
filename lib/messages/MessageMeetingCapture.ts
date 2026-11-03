import { loadRecordingPart, patchRecordingPart, saveRecordingChunk, saveRecordingPart } from './messageRecordingStorage';
import { RECORDING_CHUNK_BYTES, RECORDING_SLICE_MS, type MessageRecordingPart } from './messageRecordingTypes';
import { acquireMessageStudio, createMessageStudioRecording, finishMessageStudioRecording } from './messageRecordingStudio';
import { RECORDING_STUDIO_AUTHORITY } from '@/lib/recording-studio/recordingStudioAuthority';
import { saveStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import { preserveMessageRecordingsInStudio } from './messageRecordingRecovery';

type Events = { changed: () => void; failed: (message: string) => void };

/** One container per recording, including pauses. Delivered chunks commit directly to Recording Studio. */
export class MessageMeetingCapture {
    private stream: MediaStream | null = null;
    private recorder: MediaRecorder | null = null;
    private persistence: Promise<void> = Promise.resolve();
    private heartbeat: ReturnType<typeof setInterval> | undefined;
    private releaseLock: (() => Promise<void>) | undefined;
    private unsubscribeAuthority: (() => void) | undefined;
    private wake: WakeLockSentinel | null = null;
    private finishing: Promise<void> | null = null;
    private stopped: Promise<void> = Promise.resolve();
    private part: MessageRecordingPart | null = null;
    private pendingBytes = 0;
    private active = false;
    private paused = false;
    private failed = false;
    private storageFailed = false;
    private microphoneMuted = false;
    private lastData = 0;
    private foregroundSince = 0;
    private generation = 0;
    private accumulatedMilliseconds = 0;
    private resumedAt = 0;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    readonly unsaved: Blob[] = [];
    constructor(private readonly events: Events) {}
    get isActive() { return this.active; }
    get isPaused() { return this.paused; }
    get isMicrophoneInterrupted() { return this.microphoneMuted; }
    get currentPart() { return this.part; }
    get elapsedSeconds() {
        return (this.accumulatedMilliseconds + (this.active && !this.paused ? Math.max(0, performance.now() - this.resumedAt) : 0)) / 1000;
    }
    get microphoneLevel(): number | null {
        if (!this.analyser || this.paused || this.microphoneMuted) return null;
        const samples = new Uint8Array(this.analyser.fftSize); this.analyser.getByteTimeDomainData(samples);
        return Math.min(1, Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length) * 4);
    }
    private fail(message: string) {
        if (this.failed) return;
        this.failed = true; this.events.failed(message);
        void this.stop(true).catch(() => this.events.failed('Poslední stav nahrávky se nepodařilo uložit. Před zavřením stáhněte dostupné audio a záchrannou kopii.'));
    }
    async start(scope: string, title: string, recordingId = crypto.randomUUID(), agentName = 'Pavol Hejný') {
        if (this.active || this.finishing || this.releaseLock) throw new Error('Nejprve dokončete současné nahrávání.');
        if (this.unsaved.length) throw new Error('Nejprve stáhněte neuložený konec nahrávky.');
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !navigator.locks) throw new Error('Tento prohlížeč nepodporuje bezpečné nahrávání. Otevřete stránku přes HTTPS v aktuálním prohlížeči.');
        const generation = ++this.generation;
        const release = await acquireMessageStudio();
        if (generation !== this.generation) { await release(); throw new Error('Spouštění nahrávání bylo přerušeno.'); }
        this.releaseLock = release;
        try {
            await preserveMessageRecordingsInStudio();
            this.failed = false; this.storageFailed = false; this.paused = false; this.microphoneMuted = false;
            this.accumulatedMilliseconds = 0; this.persistence = Promise.resolve();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
            if (this.generation !== generation) { stream.getTracks().forEach(track => track.stop()); throw new Error('Spouštění nahrávání bylo přerušeno.'); }
            this.stream = stream;
            try {
                this.audioContext = new AudioContext(); this.analyser = this.audioContext.createAnalyser();
                this.audioContext.createMediaStreamSource(stream).connect(this.analyser);
                void this.audioContext.resume().catch(() => undefined);
            } catch { /* The level meter is optional. */ }
            const mimeType = (['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'] as const).find(type => MediaRecorder.isTypeSupported(type));
            if (!mimeType) throw new Error('Prohlížeč nenabízí podporovaný audio formát.');
            const id = crypto.randomUUID();
            const part: MessageRecordingPart = { id, studioRecordingId: id, recordingId, scope, title, agentName, mimeType,
                startedAt: new Date().toISOString(), endedAt: null, status: 'recording', chunkCount: 0, byteLength: 0, durationSeconds: 0 };
            // Prove both stores work before starting. The studio owns raw media from the first chunk onward.
            await saveRecordingPart(part);
            await saveStudioRecording(createMessageStudioRecording(part, agentName));
            if (this.generation !== generation) throw new Error('Spouštění nahrávání bylo přerušeno.');
            this.part = part;
            const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 96_000 });
            this.recorder = recorder;
            let sequence = 0, resolveStopped!: () => void;
            this.stopped = new Promise<void>(resolve => { resolveStopped = resolve; });
            recorder.ondataavailable = event => {
                if (!event.data.size) return;
                this.lastData = Date.now(); this.pendingBytes += event.data.size;
                const durationSeconds = this.elapsedSeconds;
                for (let offset = 0; offset < event.data.size; offset += RECORDING_CHUNK_BYTES) {
                    const bytes = event.data.slice(offset, offset + RECORDING_CHUNK_BYTES), index = sequence++;
                    this.persistence = this.persistence.then(async () => {
                        try {
                            if (this.storageFailed) { this.unsaved.push(bytes); return; }
                            await saveRecordingChunk({ partId: id, sequence: index, bytes, synced: false, durationSeconds });
                        } catch {
                            this.storageFailed = true; this.unsaved.push(bytes);
                            this.fail('Místní úložiště nepřijalo audio. Záznam se zastavuje; uložený začátek zůstává v Recording Studiu a neuložený konec můžete stáhnout.');
                        } finally { this.pendingBytes -= bytes.size; }
                        this.events.changed();
                    });
                }
                if (this.pendingBytes > 16 * 1024 * 1024) this.fail('Ukládání nestíhá mikrofon. Záznam se zastavuje; dostupná data zůstávají zachovaná.');
            };
            recorder.onerror = () => this.fail('Rekordér ohlásil chybu. Zachované audio zůstává v Recording Studiu.');
            recorder.onstop = resolveStopped;
            for (const track of stream.getAudioTracks()) {
                track.addEventListener('ended', () => { if (this.active) this.fail('Mikrofon byl odpojen. Uložené audio zůstává v Recording Studiu.'); });
                track.addEventListener('mute', () => { this.microphoneMuted = true; this.events.changed(); });
                track.addEventListener('unmute', () => { this.microphoneMuted = false; this.lastData = Date.now(); this.events.changed(); });
            }
            this.unsubscribeAuthority = RECORDING_STUDIO_AUTHORITY.subscribeToLoss(() => this.fail('Studio převzala jiná záložka. Uložené audio zůstává zachované.'));
            this.resumedAt = performance.now(); this.lastData = this.foregroundSince = Date.now();
            recorder.start(RECORDING_SLICE_MS);
            this.active = true;
            await this.keepAwake();
            document.addEventListener('visibilitychange', this.visibility);
            if (typeof window !== 'undefined') window.addEventListener('pagehide', this.flush);
            // Android may delay dataavailable while locked. Being hidden alone never stops capture.
            this.heartbeat = setInterval(() => {
                if (this.active && !this.paused && document.visibilityState === 'visible'
                    && Date.now() - Math.max(this.lastData, this.foregroundSince) > 30_000) {
                    this.fail('Prohlížeč nepředává audio. Zachované části jsou uložené; zkontrolujte mikrofon a pokračujte novou částí.');
                }
            }, 5000);
            this.events.changed();
            void navigator.storage?.persist?.().catch(() => false);
        } catch (error) {
            if (this.active) await this.stop(true);
            else await this.cleanup();
            throw error;
        }
    }
    private flush = () => {
        try { if (this.recorder?.state === 'recording' || this.recorder?.state === 'paused') this.recorder.requestData(); }
        catch { /* Existing committed chunks survive even when the browser is already stopping. */ }
    };
    private visibility = () => {
        this.flush();
        if (document.visibilityState === 'visible' && this.active) {
            this.foregroundSince = Date.now(); void this.keepAwake(); void this.audioContext?.resume().catch(() => undefined);
        }
    };
    private async keepAwake() {
        if (this.wake && !this.wake.released) return;
        try { this.wake = await navigator.wakeLock?.request('screen') ?? null; }
        catch { /* Wake lock cannot override manual locking or OS suspension. */ }
    }
    async pause(): Promise<void> {
        if (!this.active || this.paused || this.recorder?.state !== 'recording') return;
        this.recorder.pause();
        this.accumulatedMilliseconds += Math.max(0, performance.now() - this.resumedAt);
        this.paused = true; this.flush();
        await this.persistence; this.events.changed();
    }
    resume(): void {
        if (!this.active || !this.paused || this.recorder?.state !== 'paused') return;
        this.recorder.resume(); this.resumedAt = performance.now(); this.lastData = this.foregroundSince = Date.now();
        this.paused = false; this.events.changed(); void this.keepAwake();
    }
    stop(interrupted = false): Promise<void> {
        this.generation++;
        if (this.finishing) return this.finishing;
        if (!this.active) return this.cleanup();
        if (interrupted) this.failed = true;
        if (!this.paused) this.accumulatedMilliseconds += Math.max(0, performance.now() - this.resumedAt);
        this.active = false; this.paused = false; clearInterval(this.heartbeat);
        this.finishing = (async () => {
            if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
            await this.stopped; // Final dataavailable precedes stop; only then drain writes.
            await this.persistence;
            if (this.part) {
                await finishMessageStudioRecording(this.part.id, this.failed, this.elapsedSeconds);
                if (await loadRecordingPart(this.part.id)) await patchRecordingPart(this.part.id, {
                    status: this.failed ? 'interrupted' : 'complete', endedAt: new Date().toISOString(), durationSeconds: this.elapsedSeconds });
            }
        })().finally(async () => { await this.cleanup(); this.finishing = null; this.events.changed(); });
        return this.finishing;
    }
    private async cleanup() {
        document.removeEventListener('visibilitychange', this.visibility);
        if (typeof window !== 'undefined') window.removeEventListener('pagehide', this.flush);
        clearInterval(this.heartbeat);
        this.unsubscribeAuthority?.(); this.unsubscribeAuthority = undefined;
        this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
        void this.audioContext?.close().catch(() => undefined); this.audioContext = null; this.analyser = null;
        void this.wake?.release().catch(() => undefined); this.wake = null;
        const release = this.releaseLock; this.releaseLock = undefined;
        await release?.();
    }
}
