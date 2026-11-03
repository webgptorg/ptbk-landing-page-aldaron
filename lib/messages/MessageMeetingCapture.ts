import { loadRecordingPart, patchRecordingPart, saveRecordingChunk, saveRecordingPart } from './messageRecordingStorage';
import { RECORDING_CHUNK_BYTES, RECORDING_PART_MS, RECORDING_SLICE_MS, type MessageRecordingPart } from './messageRecordingTypes';

type Events = { changed: () => void; failed: (message: string) => void };
/** Short committed chunks within independently closed five-minute containers; no media is deleted. */
export class MessageMeetingCapture {
    private stream: MediaStream | null = null;
    private recorder: MediaRecorder | null = null;
    private persistence: Promise<void> = Promise.resolve();
    private rotation: ReturnType<typeof setTimeout> | undefined;
    private heartbeat: ReturnType<typeof setInterval> | undefined;
    private releaseLock: (() => void) | undefined;
    private wake: WakeLockSentinel | null = null;
    private finishing: Promise<void> | null = null;
    private readonly closingParts = new Set<Promise<void>>();
    private part: MessageRecordingPart | null = null;
    private pendingBytes = 0;
    private active = false;
    private failed = false;
    private lastData = 0;
    private generation = 0;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    // Retain a failed-to-commit tail until the user downloads it or leaves the editor.
    readonly unsaved: Blob[] = [];
    constructor(private readonly events: Events) {}
    get isActive() { return this.active; }
    get currentPart() { return this.part; }
    get microphoneLevel(): number | null {
        if (!this.analyser) return null;
        const samples = new Uint8Array(this.analyser.fftSize); this.analyser.getByteTimeDomainData(samples);
        return Math.min(1, Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length) * 4);
    }
    private fail(message: string) {
        if (this.failed) return;
        this.failed = true; this.events.failed(message);
        void this.stop(true).catch(() => this.events.failed('Poslední stav nahrávky se nepodařilo uložit. Stáhněte dostupné audio a záchrannou kopii před zavřením.'));
    }
    async start(scope: string, title: string, recordingId = crypto.randomUUID()) {
        if (this.active || this.finishing) throw new Error('Nejprve dokončete současné nahrávání.');
        if (this.unsaved.length) throw new Error('Nejprve stáhněte neuložený konec nahrávky a obnovte stránku.');
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !navigator.locks) throw new Error('Tento prohlížeč nepodporuje bezpečné nahrávání. Otevřete stránku přes HTTPS v aktuálním Chrome, Edge, Safari nebo Firefoxu.');
        const generation = ++this.generation;
        await new Promise<void>((resolve, reject) => {
            void navigator.locks.request('ptbk-message-meeting-capture', { ifAvailable: true }, async lock => {
                if (!lock) { reject(new Error('Nahrávání už používá jiná záložka. Dokončete je v ní.')); return; }
                await new Promise<void>(release => { this.releaseLock = release; resolve(); });
            }).catch(reject);
        });
        try {
            if (this.generation !== generation) throw new Error('Spouštění nahrávání bylo přerušeno.');
            this.failed = false;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
            if (this.generation !== generation) { stream.getTracks().forEach(track => track.stop()); throw new Error('Spouštění nahrávání bylo přerušeno.'); }
            this.stream = stream;
            try {
                this.audioContext = new AudioContext(); this.analyser = this.audioContext.createAnalyser();
                this.audioContext.createMediaStreamSource(stream).connect(this.analyser);
                void this.audioContext.resume().catch(() => undefined);
            } catch { /* The optional level meter never prevents recording. */ }
            // Prove durable storage works before starting the microphone recorder.
            const mimeType = (['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'] as const).find(type => MediaRecorder.isTypeSupported(type));
            if (!mimeType) throw new Error('Prohlížeč nenabízí podporovaný audio formát.');
            this.active = true;
            for (const track of this.stream.getAudioTracks()) {
                track.addEventListener('ended', () => this.fail('Mikrofon byl odpojen. Uložené audio zůstává dostupné; pokračujte novou částí.'));
                track.addEventListener('mute', () => this.fail('Prohlížeč přerušil mikrofon. Uložené audio zůstává dostupné; zkontrolujte telefon a pokračujte novou částí.'));
            }
            await this.beginPart(scope, title, recordingId, mimeType);
            await this.keepAwake();
            document.addEventListener('visibilitychange', this.visibility);
            this.heartbeat = setInterval(() => {
                if (this.active && Date.now() - this.lastData > 20_000) this.fail('Prohlížeč déle než 20 sekund nepředal audio. Nahrávání bylo zastaveno; dostupná data zůstávají uložená.');
            }, 5000);
        } catch (error) {
            this.active = false; this.cleanup(); throw error;
        }
    }
    private visibility = () => { if (document.visibilityState === 'visible' && this.active) void this.keepAwake(); };
    private async keepAwake() {
        if (this.wake && !this.wake.released) return;
        try { this.wake = await navigator.wakeLock?.request('screen') ?? null; }
        catch { /* UI always explains the requirement to keep the browser visible. */ }
    }
    private async beginPart(scope: string, title: string, recordingId: string, mimeType: MessageRecordingPart['mimeType']) {
        if (!this.stream || !this.active) return;
        const part: MessageRecordingPart = { id: crypto.randomUUID(), recordingId, scope, title, mimeType,
            startedAt: new Date().toISOString(), endedAt: null, status: 'recording', chunkCount: 0, byteLength: 0 };
        await saveRecordingPart(part);
        if (!this.active) return;
        this.part = part; let sequence = 0;
        const recorder = new MediaRecorder(this.stream, { mimeType, audioBitsPerSecond: 96_000 });
        this.recorder = recorder; this.lastData = Date.now();
        let resolveStopped!: () => void;
        const stopped = new Promise<void>(resolve => { resolveStopped = resolve; });
        this.closingParts.add(stopped);
        recorder.ondataavailable = event => {
            if (!event.data.size) return;
            this.lastData = Date.now(); this.pendingBytes += event.data.size;
            // Split unexpectedly large Android background bursts below the server request limit.
            for (let offset = 0; offset < event.data.size; offset += RECORDING_CHUNK_BYTES) {
                const bytes = event.data.slice(offset, offset + RECORDING_CHUNK_BYTES), index = sequence++;
                this.persistence = this.persistence.then(async () => {
                    try { await saveRecordingChunk({ partId: part.id, sequence: index, bytes, synced: false }); }
                    catch (error) { this.unsaved.push(bytes); throw error; }
                    finally { this.pendingBytes -= bytes.size; }
                    this.events.changed();
                }).catch(() => this.fail('Místní úložiště přestalo přijímat audio. Nahrávání bylo zastaveno. Stáhněte uložený záznam i neuložený konec.'));
            }
            if (this.pendingBytes > 16 * 1024 * 1024) this.fail('Ukládání nestíhá mikrofon. Nahrávání bylo zastaveno, aby se neztratila další data.');
        };
        recorder.onerror = () => this.fail('Rekordér ohlásil chybu. Zachované části můžete stáhnout nebo přepsat.');
        recorder.onstop = () => { void this.persistence.then(async () => {
            try { await patchRecordingPart(part.id, { status: this.failed ? 'interrupted' : 'complete', endedAt: new Date().toISOString() }); }
            catch { this.events.failed('Poslední stav se nepodařilo uložit. Zachované audio nemažte; je dostupné v zálohách.'); }
            this.events.changed();
        }).finally(() => { this.closingParts.delete(stopped); resolveStopped(); }); };
        recorder.start(RECORDING_SLICE_MS); this.events.changed();
        this.rotation = setTimeout(() => {
            if (!this.active || this.recorder !== recorder || recorder.state === 'inactive') return;
            // Start the next independent container before stopping the old encoder: a short overlap is safer
            // than deliberately dropping microphone samples while waiting for final disk writes.
            void this.beginPart(scope, title, recordingId, mimeType).then(() => {
                if (recorder.state !== 'inactive') recorder.stop();
            }).catch(() => this.fail('Další část nahrávky se nepodařilo zahájit. Předchozí části zůstávají uložené.'));
        }, RECORDING_PART_MS);
    }
    stop(interrupted = false): Promise<void> {
        this.generation++;
        if (this.finishing) return this.finishing;
        if (!this.active && (!this.recorder || this.recorder.state === 'inactive')) { this.cleanup(); return Promise.resolve(); }
        if (interrupted) this.failed = true;
        this.active = false; clearTimeout(this.rotation); clearInterval(this.heartbeat);
        const stopped = Promise.all(Array.from(this.closingParts));
        if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
        // MediaRecorder's stop event follows its final dataavailable event.
        this.finishing = (async () => {
            await stopped;
            await this.persistence;
            if (this.part && await loadRecordingPart(this.part.id)) await patchRecordingPart(this.part.id, { status: this.failed ? 'interrupted' : 'complete', endedAt: new Date().toISOString() });
        })().finally(() => { this.cleanup(); this.finishing = null; this.events.changed(); });
        return this.finishing;
    }
    private cleanup() {
        document.removeEventListener('visibilitychange', this.visibility);
        clearTimeout(this.rotation); clearInterval(this.heartbeat);
        this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
        void this.audioContext?.close().catch(() => undefined); this.audioContext = null; this.analyser = null;
        void this.wake?.release().catch(() => undefined); this.wake = null;
        this.releaseLock?.(); this.releaseLock = undefined;
    }
}
