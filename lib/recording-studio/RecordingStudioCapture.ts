import { getRecordingErrorMessage } from './recordingStudioDevices';
import { getRecordingStorageErrorMessage } from './recordingStudioCapacity';
import { appendRecordingChunk, createStudioRecording, readRecordingPart, saveStudioRecording } from './recordingStudioStorage';
import { inspectRecordingBlob } from './recordingStudioMedia';
import { addRecordingBytes, getRecordingByteLength } from './recordingStudioTiming';
import { toRecordingSourceConfiguration } from './recordingStudioSourceConfiguration';
import { createRecordingEditRecipe, getRecordingMediaParts, getRecordingPartTrack, getRecordingSelection, getRecordingSessionDuration, getRecordingTrackEndSeconds } from './recordingStudioSessionTime';
import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_CHUNK_MILLISECONDS, RECORDING_DIRECTORY_CHUNK_MILLISECONDS, RECORDING_MAX_PENDING_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingMediaPart, type RecordingSource, type RecordingTrack, type StudioRecording,
} from './recordingStudioTypes';

const RECORDER_STOP_TIMEOUT_MILLISECONDS = 15_000;
export type CapturePhase = 'starting' | 'recording' | 'pausing' | 'paused' | 'resuming' | 'stopping';

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
    readonly existingRecording?: StudioRecording;
    readonly isSourceSetChangeAllowed?: boolean;
    readonly onPhaseChange?: (phase: CapturePhase) => void;
};

type RecorderEntry = {
    readonly source: RecordingSource;
    readonly recorder: MediaRecorder;
    readonly partId: string;
    readonly stopped: Promise<void>;
    readonly finish: () => void;
    isStarted: boolean;
    isStopConfirmed: boolean;
    startedAt: number;
};

/** Owns one shared clock, the all-source start/stop barrier, and an ordered, bounded disk-write queue. */
export class RecordingStudioCapture {
    public readonly finished: Promise<StudioRecording | null>;
    private resolveFinished!: (recording: StudioRecording | null) => void;
    private entries: RecorderEntry[] = [];
    private sources: readonly RecordingSource[] = [];
    private recording: StudioRecording | null = null;
    private savedRecording: StudioRecording | null = null;
    private writeQueue = Promise.resolve();
    private pendingBytes = 0;
    private segmentStartedAt = 0;
    private recordedSeconds = 0;
    private phase: CapturePhase = 'starting';
    private transition: Promise<void> | null = null;
    private isStarting = true;
    private isStopping = false;
    private isFinalizing = false;
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
            if (new Set(sources.map((source) => source.id)).size !== sources.length) throw new Error('Zdrojová konfigurace obsahuje duplicitní identitu.');
            for (const source of sources) this.validateRequiredTracks(source);
            this.sources = sources;
            const existing = this.options.existingRecording;
            if (existing) {
                if (existing.status !== 'complete') throw new Error('Přerušený projekt nejprve zkontrolujte; další take nelze bezpečně připojit.');
                if (sources.some((source) => existing.tracks.some((track) => track.id === source.id && track.kind !== source.kind))) {
                    throw new Error('Typ existujícího zdroje nelze změnit pod stejnou identitou. Přidejte nový zdroj a změnu sady potvrďte.');
                }
                const previousTake = existing.takes?.[existing.takes.length - 1];
                const originalIds = [...(previousTake?.sourceIds ?? existing.tracks.map((track) => track.id))].sort();
                const incomingIds = sources.map((source) => source.id).sort();
                if (!this.options.isSourceSetChangeAllowed && JSON.stringify(originalIds) !== JSON.stringify(incomingIds)) throw new Error('Donahrání vyžaduje stejné zdroje. Změnu zdrojů potvrďte výslovně v pracovním prostoru.');
                this.recordedSeconds = getRecordingSessionDuration(existing);
            }
            const takeId = crypto.randomUUID();
            const startedAt = new Date().toISOString();
            const previousTakes = existing?.takes ?? (existing ? [{ id: existing.id, startedAt: existing.createdAt,
                sessionStartSeconds: 0, durationSeconds: this.recordedSeconds, sourceIds: existing.tracks.map((track) => track.id),
                sourceConfiguration: existing.sourceConfiguration }] : []);
            this.recording = existing ? { ...existing, status: 'recording', errorMessage: null,
                tracks: [...existing.tracks.map((track) => ({ ...track,
                    parts: track.parts ?? getRecordingMediaParts(track).map((part) => ({ ...part, takeId: previousTakes[0].id })),
                })), ...sources.filter((source) => !existing.tracks.some((track) => track.id === source.id)).map((source) => this.describeTrack(source))],
                takes: [...previousTakes, { id: takeId, startedAt, sessionStartSeconds: this.recordedSeconds, durationSeconds: 0, sourceIds: sources.map((source) => source.id), sourceConfiguration: sources.map(toRecordingSourceConfiguration) }],
            } : {
                id: crypto.randomUUID(), title: `Záznam ${new Date().toLocaleString('cs-CZ')}`, createdAt: new Date().toISOString(),
                status: 'recording', durationSeconds: 0, trim: null, errorMessage: null,
                sourceConfiguration: sources.map(toRecordingSourceConfiguration),
                tracks: sources.map((source) => this.describeTrack(source)),
                takes: [{ id: takeId, startedAt, sessionStartSeconds: 0, durationSeconds: 0, sourceIds: sources.map((source) => source.id), sourceConfiguration: sources.map(toRecordingSourceConfiguration) }],
            };
            // A rejected codec must not change an existing project before a new take has even started.
            const preparedEntries = existing ? sources.map((source) => this.prepareRecorder(source, crypto.randomUUID())) : undefined;
            try { this.recording = existing ? (await saveStudioRecording(this.recording), this.recording) : await createStudioRecording(this.recording, this.options.directory); }
            catch (error) { throw new Error(getRecordingStorageErrorMessage(error, false)); }
            this.savedRecording = this.recording;
            if (!this.isStopping) {
                this.listenToSources();
                this.beginSegment(preparedEntries);
                this.options.onProgress(this.recording);
            }
        } catch (error) {
            this.errorMessage = getRecordingErrorMessage(error);
            this.isStopping = true;
        } finally {
            this.isStarting = false;
        }
        if (this.isStopping) void this.stop(this.errorMessage);
    }

    public get elapsedRecordingSeconds(): number {
        return this.phase === 'recording' && !this.isStopping
            ? this.recordedSeconds + Math.max(0, (performance.now() - this.segmentStartedAt) / 1000)
            : this.recordedSeconds;
    }
    public get failureMessage(): string | null { return this.errorMessage; }
    public get currentPhase(): CapturePhase { return this.phase; }

    public pause(): Promise<void> {
        if (this.isStopping || this.phase !== 'recording' || this.transition) return this.transition ?? Promise.resolve();
        this.setPhase('pausing');
        this.transition = (async () => {
            await this.closeSegment();
            if (this.isStopping) return;
            if (!this.recording || this.isWriteFailed || this.errorMessage) throw new Error(this.errorMessage ?? 'Některá část se neuložila.');
            await saveStudioRecording(this.recording);
            this.savedRecording = this.recording;
            this.options.onProgress(this.recording);
            this.setPhase('paused');
        })().catch((error: unknown) => { void this.stop(getRecordingErrorMessage(error)); }).finally(() => { this.transition = null; });
        return this.transition;
    }

    public resume(): void {
        if (this.isStopping || this.phase !== 'paused' || this.transition) return;
        this.setPhase('resuming');
        try {
            this.sources.forEach((source) => this.validateRequiredTracks(source));
            this.beginSegment();
        } catch (error) { void this.stop(`Pokračování selhalo: ${getRecordingErrorMessage(error)} Všechny stopy byly zastaveny.`); }
    }

    public stop(errorMessage: string | null = null): Promise<StudioRecording | null> {
        if (errorMessage && !this.errorMessage) this.errorMessage = errorMessage;
        if (this.isFinalizing) return this.finished;
        this.isStopping = true;
        if (this.isStarting) return this.finished;
        this.isFinalizing = true;
        this.setPhase('stopping');
        this.options.onStopping();
        void this.finalize();
        return this.finished;
    }

    private setPhase(phase: CapturePhase): void {
        this.phase = phase;
        this.options.onPhaseChange?.(phase);
    }

    private beginSegment(preparedEntries?: RecorderEntry[]): void {
        if (!this.recording) throw new Error('Projekt není připraven.');
        const takeId = this.recording.takes![this.recording.takes!.length - 1].id;
        this.sources.forEach((source) => this.validateRequiredTracks(source));
        this.entries = preparedEntries ?? this.sources.map((source) => this.prepareRecorder(source, crypto.randomUUID()));
        this.segmentStartedAt = performance.now();
        try {
            for (const entry of this.entries) {
                const startedAt = performance.now();
                const sessionStartSeconds = this.recordedSeconds + Math.max(0, (startedAt - this.segmentStartedAt) / 1000);
                const videoSettings = entry.source.stream.getVideoTracks()[0]?.getSettings();
                const part: RecordingMediaPart = { id: entry.partId, takeId, sessionStartSeconds, durationSeconds: 0,
                    byteLength: 0, chunkCount: 0, mimeType: entry.recorder.mimeType,
                    isAudioIncluded: entry.source.stream.getAudioTracks().length > 0,
                    width: videoSettings?.width ?? null, height: videoSettings?.height ?? null,
                    frameRate: videoSettings?.frameRate ?? null };
                this.updateTrack(entry.source.id, (track) => ({ ...track,
                    startOffsetSeconds: track.parts?.length ? track.startOffsetSeconds : sessionStartSeconds,
                    isAudioIncluded: track.isAudioIncluded || part.isAudioIncluded === true,
                    parts: [...(track.parts ?? []), part],
                }));
                entry.startedAt = startedAt;
                entry.recorder.start(this.recording.storageDestination ? RECORDING_DIRECTORY_CHUNK_MILLISECONDS : RECORDING_CHUNK_MILLISECONDS);
                entry.isStarted = true;
            }
            this.setPhase('recording');
        } catch (error) {
            // A partially started group is an interrupted session, never a paused subset.
            void this.stop(`Zdroj se nepodařilo společně spustit: ${getRecordingErrorMessage(error)}`);
        }
    }

    private async closeSegment(): Promise<void> {
        if (this.entries.length === 0) return;
        const endedAt = performance.now();
        this.recordedSeconds += Math.max(0, (endedAt - this.segmentStartedAt) / 1000);
        for (const entry of this.entries) {
            const durationSeconds = entry.isStarted ? Math.max(0, (endedAt - entry.startedAt) / 1000) : 0;
            this.updateTrack(entry.source.id, (track) => ({ ...track,
                parts: track.parts?.map((part) => part.id === entry.partId ? { ...part, durationSeconds } : part),
            }));
            if (!entry.isStarted) entry.finish();
            else if (entry.recorder.state !== 'inactive') {
                try { entry.recorder.stop(); }
                catch {
                    this.errorMessage ??= `Stopu „${entry.source.label}“ se nepodařilo dokončit. Její další záznam byl přerušen.`;
                    // A failed stop must not leave one recorder gathering through a global pause.
                    entry.recorder.ondataavailable = null;
                    entry.recorder.onstop = null;
                    entry.source.stream.getTracks().forEach((track) => track.stop());
                    entry.finish();
                }
            }
        }
        const entries = this.entries;
        this.entries = [];
        const isStopped = await Promise.race([
            Promise.all(entries.map((entry) => entry.stopped)).then(() => true),
            new Promise<false>((resolve) => setTimeout(() => resolve(false), RECORDER_STOP_TIMEOUT_MILLISECONDS)),
        ]);
        if (!isStopped) {
            const unconfirmedEntries = entries.filter((entry) => !entry.isStopConfirmed);
            this.errorMessage ??= `Zdroje ${unconfirmedEntries.map((entry) => `„${entry.source.label}“`).join(', ')} nepotvrdily dokončení. Potvrzené části zůstávají uložené; chybějící konec je označený.`;
            unconfirmedEntries.forEach((entry) => {
                entry.recorder.ondataavailable = null;
                entry.recorder.onstop = null;
                if (entry.recorder.state !== 'inactive') {
                    try { entry.recorder.stop(); } catch { /* A failed recorder cannot be trusted to stop itself. */ }
                    entry.source.stream.getTracks().forEach((track) => track.stop());
                }
                entry.finish();
            });
        }
        await this.writeQueue;
        if (!this.errorMessage && !this.isWriteFailed && !this.isBufferFull) {
            try { await this.measureCommittedSegment(entries); }
            catch (error) { this.errorMessage = `Časování uzavřených částí se nepodařilo ověřit: ${getRecordingErrorMessage(error)} Uložená média zůstávají dostupná.`; }
        }
        if (this.recording) {
            const takes = this.recording.takes?.map((take, index, all) => index === all.length - 1
                ? { ...take, durationSeconds: this.recordedSeconds - take.sessionStartSeconds } : take);
            this.recording = { ...this.recording, takes, durationSeconds: this.recordedSeconds };
        }
    }

    /** Use encoded timestamps after the final recorder events, not the earlier Stop call, for the next shared boundary. */
    private async measureCommittedSegment(entries: readonly RecorderEntry[]): Promise<void> {
        if (!this.recording) return;
        let measuredEndSeconds = this.recording.takes?.at(-1)?.sessionStartSeconds ?? 0;
        for (const entry of entries) {
            if (!entry.isStarted) continue;
            const track = this.recording.tracks.find((candidate) => candidate.id === entry.source.id);
            const part = track?.parts?.find((candidate) => candidate.id === entry.partId);
            if (!track || !part || part.byteLength === 0) throw new Error(`Zdroj „${entry.source.label}“ nemá potvrzenou část média.`);
            const bounds = await inspectRecordingBlob(await readRecordingPart(this.recording.id, part), getRecordingPartTrack(track, part));
            const durationSeconds = Math.max(...bounds.components.map((component) => component.endTimestampSeconds)) - bounds.firstTimestampSeconds;
            if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error(`Zdroj „${entry.source.label}“ nemá čitelnou délku média.`);
            this.updateTrack(entry.source.id, (current) => {
                const parts = current.parts?.map((candidate) => candidate.id === entry.partId
                    ? { ...candidate, durationSeconds, mediaBounds: bounds } : candidate);
                const measuredTrack = { ...current, parts };
                return { ...measuredTrack, durationSeconds: Math.max(0, getRecordingTrackEndSeconds(measuredTrack) - current.startOffsetSeconds) };
            });
            measuredEndSeconds = Math.max(measuredEndSeconds, part.sessionStartSeconds + durationSeconds);
        }
        this.recordedSeconds = measuredEndSeconds;
    }

    private validateRequiredTracks(source: RecordingSource): void {
        const isVideoAvailable = source.stream.getVideoTracks().some((track) => track.readyState === 'live');
        const audioTrack = source.stream.getAudioTracks().find((track) => track.readyState === 'live');
        const isVideoRequired = source.kind !== 'microphone';
        const isAudioRequired = source.kind === 'microphone' || (source.kind === 'camera' && source.isAudioEnabled);
        if (isVideoRequired && !isVideoAvailable) {
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

    private prepareRecorder(source: RecordingSource, partId: string): RecorderEntry {
        const isVideo = source.stream.getVideoTracks().length > 0;
        const isAudioTrackIncluded = source.stream.getAudioTracks().length > 0;
        const mimeTypes = isVideo
            ? isAudioTrackIncluded ? VIDEO_WITH_AUDIO_MIME_TYPES : VIDEO_ONLY_MIME_TYPES
            : AUDIO_MIME_TYPES;
        const recorder = this.createRecorder(source, mimeTypes);
        let finish!: () => void;
        const stopped = new Promise<void>((resolve) => { finish = resolve; });
        const entry: RecorderEntry = { source, recorder, partId, stopped, finish, isStarted: false, isStopConfirmed: false, startedAt: 0 };
        recorder.ondataavailable = (event) => this.enqueueChunk(source.id, partId, event.data);
        recorder.onerror = () => { void this.stop(`Nahrávání zdroje „${source.label}“ selhalo. Všechny stopy byly zastaveny.`); };
        recorder.onstop = () => {
            entry.isStopConfirmed = true;
            finish();
            if (!this.isStopping && this.phase !== 'pausing') void this.stop(`Zdroj „${source.label}“ skončil. Všechny stopy byly zastaveny.`);
        };
        return entry;
    }

    private listenToSources(): void {
        for (const source of this.sources) {
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
        }
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

    private describeTrack(source: RecordingSource): RecordingTrack {
        const settings = source.stream.getVideoTracks()[0]?.getSettings();
        return {
            id: source.id, kind: source.kind, label: source.label, mimeType: '', parts: [],
            byteLength: 0, chunkCount: 0, startOffsetSeconds: 0, durationSeconds: 0,
            width: settings?.width ?? null, height: settings?.height ?? null, frameRate: settings?.frameRate ?? null,
            isAudioIncluded: source.stream.getAudioTracks().length > 0,
            audioSourceLabel: source.kind === 'camera' && source.stream.getAudioTracks().length > 0 ? source.microphoneLabel : null,
        };
    }

    private updateTrack(trackId: string, change: (track: RecordingTrack) => RecordingTrack): void {
        if (!this.recording) return;
        this.recording = { ...this.recording, tracks: this.recording.tracks.map((track) => track.id === trackId ? change(track) : track) };
    }

    private enqueueChunk(trackId: string, partId: string, data: Blob): void {
        if (data.size === 0 || !this.recording || this.isWriteFailed || this.isBufferFull) return;
        // Reject before retaining another Blob. Finish earlier writes, but never append after this gap.
        if (data.size > RECORDING_MAX_PENDING_BYTES - this.pendingBytes) {
            this.isBufferFull = true;
            void this.stop('Úložiště nestíhá ukládat záznam. Všechny stopy se zastavují; neuložený konec je označen jako chybějící.');
            return;
        }
        const track = this.recording.tracks.find((candidate) => candidate.id === trackId)!;
        const part = track.parts?.find((candidate) => candidate.id === partId);
        if (!part) return;
        let byteLength: number;
        let chunkCount: number;
        try {
            addRecordingBytes(getRecordingByteLength(this.recording), data.size);
            byteLength = addRecordingBytes(part.byteLength, data.size); chunkCount = addRecordingBytes(part.chunkCount, 1);
        }
        catch (error) { this.isBufferFull = true; void this.stop(getRecordingErrorMessage(error)); return; }
        this.updateTrack(trackId, (current) => ({ ...current, mimeType: current.mimeType || part.mimeType,
            byteLength: addRecordingBytes(current.byteLength, data.size), chunkCount: addRecordingBytes(current.chunkCount, 1),
            durationSeconds: Math.max(current.durationSeconds, this.elapsedRecordingSeconds - current.startOffsetSeconds),
            parts: current.parts?.map((item) => item.id === partId ? { ...item, byteLength, chunkCount,
                durationSeconds: Math.max(item.durationSeconds, this.elapsedRecordingSeconds - item.sessionStartSeconds) } : item),
        }));
        this.recording = { ...this.recording, durationSeconds: this.elapsedRecordingSeconds };
        const snapshot = this.recording;
        this.pendingBytes += data.size;
        this.options.onPendingBytes?.(this.pendingBytes);
        this.writeQueue = this.writeQueue.then(async () => {
            if (this.isWriteFailed) return;
            await appendRecordingChunk(snapshot, partId, part.chunkCount, data);
            this.savedRecording = snapshot;
            this.options.onProgress(snapshot);
        }).catch((error: unknown) => {
            // Never append beyond a failed chunk: that would create an undecodable gap.
            this.isWriteFailed = true;
            void this.stop(getRecordingStorageErrorMessage(error));
        }).finally(() => { this.pendingBytes -= data.size; this.options.onPendingBytes?.(this.pendingBytes); });
    }

    private async finalize(): Promise<void> {
        if (this.transition) await this.transition;
        if (this.entries.length > 0) await this.closeSegment();
        await this.writeQueue;
        this.removeListeners.forEach((remove) => remove());
        const saved = this.savedRecording;
        if (!saved || !this.recording) {
            this.resolveFinished(null);
            return;
        }
        const committedTracks = this.isWriteFailed ? saved.tracks : this.recording.tracks;
        const emptyTracks = committedTracks.flatMap((track) => (track.parts ?? []).filter((part) => part.byteLength === 0).map(() => track.label));
        if (emptyTracks.length > 0) this.errorMessage ??= `Chybí uložená média zdrojů: ${Array.from(new Set(emptyTracks)).join(', ')}. Záznam není úplný.`;
        const previous = this.options.existingRecording;
        const durationSeconds = Math.max(this.recordedSeconds, ...committedTracks.map(getRecordingTrackEndSeconds));
        const previousSelection = previous ? getRecordingSelection(previous) : null;
        const isFullSelection = Boolean(previous && previousSelection?.startSeconds === 0 &&
            Math.abs(previousSelection.endSeconds - getRecordingSessionDuration(previous)) < 0.001);
        const trim = isFullSelection && (previous?.trim || previous?.editRecipe)
            ? { startSeconds: 0, endSeconds: durationSeconds } : this.recording.trim;
        let result: StudioRecording = {
            ...this.recording, tracks: committedTracks, durationSeconds, trim,
            status: this.errorMessage ? 'interrupted' : 'complete', errorMessage: this.errorMessage,
            captureEndSeconds: this.recordedSeconds,
        };
        if (result.editRecipe) result = { ...result, editRecipe: createRecordingEditRecipe(result,
            isFullSelection ? { startSeconds: 0, endSeconds: durationSeconds } : undefined) };
        try {
            await saveStudioRecording(result);
        } catch (error) {
            result = { ...result, status: 'interrupted', errorMessage: getRecordingStorageErrorMessage(error) };
        }
        this.options.onProgress(result);
        this.resolveFinished(result);
    }
}
