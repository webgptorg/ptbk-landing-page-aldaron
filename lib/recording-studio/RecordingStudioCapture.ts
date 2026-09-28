import { getRecordingErrorMessage } from './recordingStudioDevices';
import { getRecordingStorageErrorMessage } from './recordingStudioCapacity';
import { appendRecordingChunk, createStudioRecording, saveStudioRecording } from './recordingStudioStorage';
import { addRecordingBytes, getCommonRecordingDuration, getRecordingByteLength } from './recordingStudioTiming';
import { toRecordingSourceConfiguration } from './recordingStudioSourceConfiguration';
import { getRecordingClockSeconds } from './recordingStudioSessionTime';
import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_CHUNK_MILLISECONDS, RECORDING_DIRECTORY_CHUNK_MILLISECONDS, RECORDING_MAX_PENDING_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingSource, type RecordingTrack, type StudioRecording,
} from './recordingStudioTypes';

const VIDEO_WITH_AUDIO_MIME_TYPES = [
    'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4',
];
const VIDEO_ONLY_MIME_TYPES = [
    'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm',
    'video/mp4;codecs=avc1.42E01E', 'video/mp4',
];
const AUDIO_MIME_TYPES = [
    'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/ogg;codecs=opus',
];

type CaptureOptions = {
    readonly onProgress: (recording: StudioRecording) => void;
    readonly onStopping: () => void;
    readonly onPendingBytes?: (bytes: number) => void;
    readonly directory?: FileSystemDirectoryHandle | null;
};

type RecorderEntry = {
    readonly source: RecordingSource;
    readonly recorder: MediaRecorder;
    readonly stopped: Promise<void>;
    readonly finish: () => void;
    isStarted: boolean;
};

/** Owns one shared clock, the all-source start/stop barrier, and an ordered, bounded disk-write queue. */
export class RecordingStudioCapture {
    public readonly finished: Promise<StudioRecording | null>;
    private resolveFinished!: (recording: StudioRecording | null) => void;
    private entries: RecorderEntry[] = [];
    private recording: StudioRecording | null = null;
    private savedRecording: StudioRecording | null = null;
    private writeQueue = Promise.resolve();
    private pendingBytes = 0;
    private startedAt = 0;
    private stoppedAt: number | null = null;
    private isStarting = true;
    private isStopping = false;
    private isWriteFailed = false;
    private isBufferFull = false;
    private errorMessage: string | null = null;
    private readonly removeListeners: (() => void)[] = [];

    public constructor(private readonly options: CaptureOptions) {
        this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
    }

    public async start(sources: readonly RecordingSource[]): Promise<void> {
        try {
            if (sources.length === 0) throw new Error('Nejprve přidejte zdroj.');
            for (const source of sources) this.validateRequiredTracks(source);
            for (const source of sources) this.entries.push(this.prepareRecorder(source));
            this.recording = {
                id: crypto.randomUUID(), title: `Záznam ${new Date().toLocaleString('cs-CZ')}`, createdAt: new Date().toISOString(),
                status: 'recording', durationSeconds: 0, trim: null, errorMessage: null,
                sourceConfiguration: sources.map(toRecordingSourceConfiguration),
                tracks: this.entries.map((entry) => this.describeTrack(entry)),
            };
            try { this.recording = await createStudioRecording(this.recording, this.options.directory); }
            catch (error) { throw new Error(getRecordingStorageErrorMessage(error, false)); }
            this.savedRecording = this.recording;
            this.startedAt = performance.now();
            this.recording = { ...this.recording, createdAt: new Date().toISOString() };
            // No await between start calls: each recorder receives the same browser event-loop turn.
            for (const entry of this.entries) {
                if (entry.source.stream.getTracks().some((track) => track.readyState !== 'live')) throw new Error('Jeden ze zdrojů byl odpojen.');
                this.validateRequiredTracks(entry.source);
                this.updateTrack(entry.source.id, { startOffsetSeconds: this.elapsedSeconds() });
                entry.recorder.start(this.options.directory ? RECORDING_DIRECTORY_CHUNK_MILLISECONDS : RECORDING_CHUNK_MILLISECONDS);
                entry.isStarted = true;
            }
            this.options.onProgress(this.recording);
        } catch (error) {
            this.errorMessage = getRecordingErrorMessage(error);
            this.isStopping = true;
        } finally {
            this.isStarting = false;
        }
        if (this.isStopping) this.stop(this.errorMessage);
    }

    public stop(errorMessage: string | null = null): Promise<StudioRecording | null> {
        if (errorMessage && !this.errorMessage) this.errorMessage = errorMessage;
        this.isStopping = true;
        if (this.isStarting || this.stoppedAt !== null) return this.finished;
        this.stoppedAt = performance.now();
        this.options.onStopping();
        // Final dataavailable is delivered BEFORE stop. Wait for every stop and then all queued writes.
        for (const entry of this.entries) {
            if (!entry.isStarted) entry.finish();
            else if (entry.recorder.state !== 'inactive') {
                try { entry.recorder.stop(); }
                catch { this.errorMessage ??= `Stopu „${entry.source.label}“ se nepodařilo dokončit.`; entry.finish(); }
            }
        }
        void this.finalize();
        return this.finished;
    }

    private elapsedSeconds(): number {
        return getRecordingClockSeconds(this.startedAt, this.stoppedAt ?? performance.now());
    }

    public get elapsedRecordingSeconds(): number { return this.elapsedSeconds(); }
    public get failureMessage(): string | null { return this.errorMessage; }

    private validateRequiredTracks(source: RecordingSource): void {
        const hasVideo = source.stream.getVideoTracks().some((track) => track.readyState === 'live');
        const audioTrack = source.stream.getAudioTracks().find((track) => track.readyState === 'live');
        const isVideoRequired = source.kind !== 'microphone';
        const isAudioRequired = source.kind === 'microphone' || (source.kind === 'camera' && source.isAudioEnabled);
        if (isVideoRequired && !hasVideo) {
            throw new Error(source.kind === 'screen'
                ? `Sdílené okno, karta nebo obrazovka „${source.label}“ už neposkytuje obraz. Znovu připojte zdroj a vyberte jej v dialogu prohlížeče.`
                : `Kamera „${source.label}“ už neposkytuje obraz. Připojte ji znovu.`);
        }
        if (isVideoRequired && source.stream.getVideoTracks().some((track) => track.readyState === 'live' && track.muted)) {
            throw new Error(`Prohlížeč nebo systém dočasně přestal poskytovat obraz ze zdroje „${source.label}“. Záznam nelze bezpečně zahájit; počkejte, až bude zdroj dostupný, a připojte jej znovu.`);
        }
        if (isAudioRequired && !audioTrack) throw new Error(`Požadovaná zvuková stopa mikrofonu „${source.microphoneLabel || source.label}“ chybí. Připojte mikrofon znovu, vyberte jiný nebo výslovně zvolte video bez zvuku.`);
        if (isAudioRequired && audioTrack?.muted) throw new Error(`Mikrofon „${source.microphoneLabel || source.label}“ právě neposílá zvuk. Připojte ho znovu nebo výslovně zvolte tiché video.`);
    }

    private prepareRecorder(source: RecordingSource): RecorderEntry {
        const isVideo = source.stream.getVideoTracks().length > 0;
        const isAudioTrackIncluded = source.stream.getAudioTracks().length > 0;
        const mimeTypes = isVideo
            ? isAudioTrackIncluded ? VIDEO_WITH_AUDIO_MIME_TYPES : VIDEO_ONLY_MIME_TYPES
            : AUDIO_MIME_TYPES;
        const recorder = this.createRecorder(source, mimeTypes);
        let finish!: () => void;
        const stopped = new Promise<void>((resolve) => { finish = resolve; });
        recorder.ondataavailable = (event) => this.enqueueChunk(source.id, event.data);
        recorder.onerror = () => { void this.stop(`Nahrávání zdroje „${source.label}“ selhalo. Všechny stopy byly zastaveny.`); };
        recorder.onstop = () => {
            finish();
            if (!this.isStopping) void this.stop(`Zdroj „${source.label}“ skončil. Všechny stopy byly zastaveny.`);
        };
        for (const track of source.stream.getTracks()) {
            const handleEnded = () => { void this.stop(`Zdroj „${source.label}“ byl odpojen. Všechny stopy byly zastaveny.`); };
            const isRequiredMicrophone = track.kind === 'audio' &&
                (source.kind === 'microphone' || (source.kind === 'camera' && source.isAudioEnabled));
            const isRequiredVideo = track.kind === 'video' && source.kind !== 'microphone';
            const handleMuted = () => {
                if (isRequiredMicrophone) void this.stop(`Mikrofon „${source.microphoneLabel || source.label}“ přestal posílat zvuk. Všechny stopy byly zastaveny; uložené části zůstávají dostupné.`);
                if (isRequiredVideo) void this.stop(`Prohlížeč nebo systém dočasně přestal poskytovat obraz ze zdroje „${source.label}“ (video stopa byla ztlumena). Záznam byl přerušen, nejde o běžnou pauzu; uložené části zůstávají dostupné. Připojte zdroj znovu a potvrďte nový výběr.`);
            };
            track.addEventListener('ended', handleEnded);
            track.addEventListener('mute', handleMuted);
            this.removeListeners.push(() => {
                track.removeEventListener('ended', handleEnded);
                track.removeEventListener('mute', handleMuted);
            });
        }
        return { source, recorder, stopped, finish, isStarted: false };
    }

    private createRecorder(source: RecordingSource, mimeTypes: readonly string[]): MediaRecorder {
        for (const mimeType of mimeTypes) {
            try {
                if (!MediaRecorder.isTypeSupported(mimeType)) continue;
                return new MediaRecorder(source.stream, {
                    mimeType,
                    ...(source.stream.getVideoTracks().length > 0 ? { videoBitsPerSecond: RECORDING_VIDEO_BITS_PER_SECOND } : {}),
                    ...(source.stream.getAudioTracks().length > 0 ? { audioBitsPerSecond: RECORDING_AUDIO_BITS_PER_SECOND } : {}),
                });
            } catch {
                // Some engines report support but still reject a codec combination at construction time.
            }
        }
        const isVideo = source.stream.getVideoTracks().length > 0;
        throw new Error(isVideo
            ? 'Tento prohlížeč nenabízí ověřený kontejner a kodeky pro tuto video stopu. Zkuste aktuální Safari, Chrome nebo Edge.'
            : 'Tento prohlížeč nenabízí ověřený zvukový kontejner a kodek. Zkuste aktuální Safari, Chrome nebo Edge.');
    }

    private describeTrack({ source, recorder }: RecorderEntry): RecordingTrack {
        const settings = source.stream.getVideoTracks()[0]?.getSettings();
        return {
            id: source.id, kind: source.kind, label: source.label, mimeType: recorder.mimeType,
            byteLength: 0, chunkCount: 0, startOffsetSeconds: 0, durationSeconds: 0,
            width: settings?.width ?? null, height: settings?.height ?? null, frameRate: settings?.frameRate ?? null,
            isAudioIncluded: source.stream.getAudioTracks().length > 0,
            audioSourceLabel: source.kind === 'camera' && source.stream.getAudioTracks().length > 0 ? source.microphoneLabel : null,
        };
    }

    private updateTrack(trackId: string, changes: Partial<RecordingTrack>): void {
        if (!this.recording) return;
        this.recording = { ...this.recording, tracks: this.recording.tracks.map((track) => track.id === trackId ? { ...track, ...changes } : track) };
    }

    private enqueueChunk(trackId: string, data: Blob): void {
        if (data.size === 0 || !this.recording || this.isWriteFailed || this.isBufferFull) return;
        // Reject before retaining another Blob. Finish earlier writes, but never append after this gap.
        if (data.size > RECORDING_MAX_PENDING_BYTES - this.pendingBytes) {
            this.isBufferFull = true;
            void this.stop('Úložiště nestíhá ukládat záznam. Všechny stopy se zastavují; neuložený konec je označen jako chybějící.');
            return;
        }
        const track = this.recording.tracks.find((candidate) => candidate.id === trackId)!;
        let byteLength: number;
        let chunkCount: number;
        try {
            addRecordingBytes(getRecordingByteLength(this.recording), data.size);
            byteLength = addRecordingBytes(track.byteLength, data.size); chunkCount = addRecordingBytes(track.chunkCount, 1);
        }
        catch (error) { this.isBufferFull = true; void this.stop(getRecordingErrorMessage(error)); return; }
        this.updateTrack(trackId, {
            byteLength, chunkCount,
            durationSeconds: Math.max(0, this.elapsedSeconds() - track.startOffsetSeconds),
        });
        this.recording = { ...this.recording, durationSeconds: this.elapsedSeconds() };
        const snapshot = this.recording;
        this.pendingBytes += data.size;
        this.options.onPendingBytes?.(this.pendingBytes);
        this.writeQueue = this.writeQueue.then(async () => {
            if (this.isWriteFailed) return;
            await appendRecordingChunk(snapshot, trackId, track.chunkCount, data);
            this.savedRecording = snapshot;
            this.options.onProgress(snapshot);
        }).catch((error: unknown) => {
            // Never append beyond a failed chunk: that would create an undecodable gap.
            this.isWriteFailed = true;
            void this.stop(getRecordingStorageErrorMessage(error));
        }).finally(() => { this.pendingBytes -= data.size; this.options.onPendingBytes?.(this.pendingBytes); });
    }

    private async finalize(): Promise<void> {
        await Promise.all(this.entries.map((entry) => entry.stopped));
        await this.writeQueue;
        this.removeListeners.forEach((remove) => remove());
        const saved = this.savedRecording;
        if (!saved) {
            this.resolveFinished(null);
            return;
        }
        const emptyTracks = saved.tracks.filter((track) => track.byteLength === 0 || track.chunkCount === 0);
        if (emptyTracks.length > 0) this.errorMessage ??= `Chybí uložená média zdrojů: ${emptyTracks.map((track) => track.label).join(', ')}. Záznam není úplný.`;
        let result: StudioRecording = {
            ...saved, durationSeconds: getCommonRecordingDuration(saved.tracks),
            status: this.errorMessage ? 'interrupted' : 'complete', errorMessage: this.errorMessage,
            captureEndSeconds: this.elapsedSeconds(),
        };
        try {
            await saveStudioRecording(result);
        } catch (error) {
            result = { ...result, status: 'interrupted', errorMessage: getRecordingStorageErrorMessage(error) };
        }
        this.options.onProgress(result);
        this.resolveFinished(result);
    }
}
