import { getRecordingErrorMessage } from './recordingStudioDevices';
import { appendRecordingChunk, saveStudioRecording } from './recordingStudioStorage';
import { getCommonRecordingDuration } from './recordingStudioTiming';
import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_CHUNK_MILLISECONDS, RECORDING_MAX_PENDING_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingSource, type RecordingTrack, type StudioRecording,
} from './recordingStudioTypes';

const VIDEO_MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
const AUDIO_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

type CaptureOptions = {
    readonly onProgress: (recording: StudioRecording) => void;
    readonly onStopping: () => void;
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
    private errorMessage: string | null = null;
    private readonly removeListeners: (() => void)[] = [];

    public constructor(private readonly options: CaptureOptions) {
        this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
    }

    public async start(sources: readonly RecordingSource[]): Promise<void> {
        try {
            if (sources.length === 0) throw new Error('Nejprve přidejte zdroj.');
            for (const source of sources) this.entries.push(this.prepareRecorder(source));
            this.recording = {
                id: crypto.randomUUID(), title: `Záznam ${new Date().toLocaleString('cs-CZ')}`, createdAt: new Date().toISOString(),
                status: 'recording', durationSeconds: 0, trim: null, errorMessage: null,
                tracks: this.entries.map((entry) => this.describeTrack(entry)),
            };
            await saveStudioRecording(this.recording);
            this.savedRecording = this.recording;
            this.startedAt = performance.now();
            this.recording = { ...this.recording, createdAt: new Date().toISOString() };
            // No await between start calls: each recorder receives the same browser event-loop turn.
            for (const entry of this.entries) {
                if (entry.source.stream.getTracks().some((track) => track.readyState !== 'live')) throw new Error('Jeden ze zdrojů byl odpojen.');
                this.updateTrack(entry.source.id, { startOffsetSeconds: this.elapsedSeconds() });
                entry.recorder.start(RECORDING_CHUNK_MILLISECONDS);
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
            else if (entry.recorder.state !== 'inactive') entry.recorder.stop();
        }
        void this.finalize();
        return this.finished;
    }

    private elapsedSeconds(): number {
        return Math.max(0, ((this.stoppedAt ?? performance.now()) - this.startedAt) / 1000);
    }

    private prepareRecorder(source: RecordingSource): RecorderEntry {
        const isVideo = source.stream.getVideoTracks().length > 0;
        const mimeType = (isVideo ? VIDEO_MIME_TYPES : AUDIO_MIME_TYPES).find((candidate) => MediaRecorder.isTypeSupported(candidate));
        if (!mimeType) throw new Error('Prohlížeč nenabízí podporovaný formát záznamu. Zkuste Chrome nebo Edge.');
        const recorder = new MediaRecorder(source.stream, {
            mimeType, videoBitsPerSecond: RECORDING_VIDEO_BITS_PER_SECOND, audioBitsPerSecond: RECORDING_AUDIO_BITS_PER_SECOND,
        });
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
            track.addEventListener('ended', handleEnded);
            this.removeListeners.push(() => track.removeEventListener('ended', handleEnded));
        }
        return { source, recorder, stopped, finish, isStarted: false };
    }

    private describeTrack({ source, recorder }: RecorderEntry): RecordingTrack {
        const settings = source.stream.getVideoTracks()[0]?.getSettings();
        return {
            id: source.id, kind: source.kind, label: source.label, mimeType: recorder.mimeType,
            byteLength: 0, chunkCount: 0, startOffsetSeconds: 0, durationSeconds: 0,
            width: settings?.width ?? null, height: settings?.height ?? null, frameRate: settings?.frameRate ?? null,
            isAudioIncluded: source.stream.getAudioTracks().length > 0,
        };
    }

    private updateTrack(trackId: string, changes: Partial<RecordingTrack>): void {
        if (!this.recording) return;
        this.recording = { ...this.recording, tracks: this.recording.tracks.map((track) => track.id === trackId ? { ...track, ...changes } : track) };
    }

    private enqueueChunk(trackId: string, data: Blob): void {
        if (data.size === 0 || !this.recording || this.isWriteFailed) return;
        const track = this.recording.tracks.find((candidate) => candidate.id === trackId)!;
        this.updateTrack(trackId, {
            byteLength: track.byteLength + data.size, chunkCount: track.chunkCount + 1,
            durationSeconds: Math.max(0, this.elapsedSeconds() - track.startOffsetSeconds),
        });
        this.recording = { ...this.recording, durationSeconds: this.elapsedSeconds() };
        const snapshot = this.recording;
        this.pendingBytes += data.size;
        this.writeQueue = this.writeQueue.then(async () => {
            if (this.isWriteFailed) return;
            await appendRecordingChunk(snapshot, trackId, track.chunkCount, data);
            this.savedRecording = snapshot;
            this.options.onProgress(snapshot);
        }).catch((error: unknown) => {
            // Never append beyond a failed chunk: that would create an undecodable gap.
            this.isWriteFailed = true;
            void this.stop(getRecordingErrorMessage(error));
        }).finally(() => { this.pendingBytes -= data.size; });
        if (this.pendingBytes > RECORDING_MAX_PENDING_BYTES) {
            void this.stop('Úložiště nestíhá ukládat záznam. Nahrávání všech stop bylo zastaveno.');
        }
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
        let result: StudioRecording = {
            ...saved, durationSeconds: getCommonRecordingDuration(saved.tracks),
            status: this.errorMessage ? 'interrupted' : 'complete', errorMessage: this.errorMessage,
        };
        try {
            await saveStudioRecording(result);
        } catch (error) {
            result = { ...result, status: 'interrupted', errorMessage: getRecordingErrorMessage(error) };
        }
        this.options.onProgress(result);
        this.resolveFinished(result);
    }
}
