import { changeAdminWorkshopAgentAudioSession, sendAdminWorkshopAgentAudio } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES, WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS, WORKSHOP_AGENT_AUDIO_MIME_TYPES } from '@/lib/workshops/agents/workshopAgentTypes';

const MINIMAL_UPLOAD_INTERVAL_MILLISECONDS = 6_000;
const MAXIMAL_PENDING_AUDIO_CHUNKS = 3;

type WorkshopAgentAudioCaptureOptions = {
    readonly workshopId: string;
    readonly onTranscript: (transcript: string) => void;
    readonly onStop: (errorMessage: string | null) => void;
};

/** One explicit browser capture, with independently decodable files and bounded upload backpressure. */
export class WorkshopAgentAudioCapture {
    private readonly sessionId = crypto.randomUUID();
    private readonly controller = new AbortController();
    private sourceStream: MediaStream | null = null;
    private recorder: MediaRecorder | null = null;
    private recordingTimer: ReturnType<typeof setTimeout> | undefined;
    private uploadTimer: ReturnType<typeof setTimeout> | undefined;
    private uploadQueue: Promise<void> = Promise.resolve();
    private pendingChunkCount = 0;
    private sequence = 0;
    private lastUploadStartedAt = 0;
    private isStopped = false;
    private isSessionStarted = false;

    constructor(private readonly options: WorkshopAgentAudioCaptureOptions) {}

    async start(source: 'tab' | 'microphone'): Promise<void> {
        try {
            if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices) {
                throw new Error('Tento prohlížeč neumí sdílet zvuk. Použijte Chrome nebo Edge na počítači.');
            }
            // Must run in the button's gesture, before any network request.
            const stream = source === 'tab'
                ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                : await navigator.mediaDevices.getUserMedia({ audio: true });
            this.sourceStream = stream;
            if (this.isStopped) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            if (stream.getAudioTracks().length === 0) {
                throw new Error('Vybraná karta nesdílí zvuk. Spusťte znovu a zaškrtněte „Sdílet zvuk karty“.');
            }
            stream.getTracks().forEach((track) => track.addEventListener('ended', () => this.stop(), { once: true }));
            await changeAdminWorkshopAgentAudioSession(this.options.workshopId, this.sessionId, true);
            this.isSessionStarted = true;
            if (this.isStopped) {
                this.releaseSession();
                return;
            }
            this.recordChunk();
        } catch (error) {
            this.stop(error instanceof Error ? error.message : 'Sdílení zvuku se nezdařilo.');
        }
    }

    stop(errorMessage: string | null = null): void {
        if (this.isStopped) return;
        this.isStopped = true;
        clearTimeout(this.recordingTimer);
        clearTimeout(this.uploadTimer);
        this.controller.abort();
        if (this.recorder?.state !== 'inactive') this.recorder?.stop();
        this.sourceStream?.getTracks().forEach((track) => track.stop());
        this.releaseSession();
        this.options.onStop(errorMessage);
    }

    private releaseSession(): void {
        if (!this.isSessionStarted) return;
        this.isSessionStarted = false;
        void changeAdminWorkshopAgentAudioSession(this.options.workshopId, this.sessionId, false).catch(() => undefined);
    }

    private recordChunk(): void {
        if (this.isStopped || this.sourceStream === null) return;
        try {
            const mimeType = WORKSHOP_AGENT_AUDIO_MIME_TYPES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
            if (!mimeType) throw new Error('Prohlížeč nenabízí podporovaný formát zvuku.');
            // Capture permissions can include video, but only audio reaches the recorder or server.
            const recorder = new MediaRecorder(new MediaStream(this.sourceStream.getAudioTracks()), { mimeType });
            this.recorder = recorder;
            const parts: Blob[] = [];
            recorder.ondataavailable = (event) => { if (event.data.size > 0) parts.push(event.data); };
            recorder.onerror = () => this.stop('Záznam zvuku se přerušil. Spusťte naslouchání znovu.');
            recorder.onstop = () => {
                if (this.isStopped) return;
                const audio = new Blob(parts, { type: recorder.mimeType });
                this.recordChunk();
                this.enqueueChunk(audio);
            };
            // Restart the recorder per chunk: MediaRecorder timeslices after the first are not standalone WebM files.
            recorder.start();
            this.recordingTimer = setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, WORKSHOP_AGENT_AUDIO_CHUNK_MILLISECONDS);
        } catch (error) {
            this.stop((error as Error).message);
        }
    }

    private enqueueChunk(audio: Blob): void {
        if (audio.size === 0 || this.isStopped) return;
        if (audio.size > MAXIMAL_WORKSHOP_AGENT_AUDIO_BYTES || this.pendingChunkCount >= MAXIMAL_PENDING_AUDIO_CHUNKS) {
            this.stop('Přepis nestíhá živý zvuk. Zkontrolujte připojení a spusťte naslouchání znovu.');
            return;
        }
        this.pendingChunkCount += 1;
        const sequence = this.sequence++;
        this.uploadQueue = this.uploadQueue.then(async () => {
            if (this.isStopped) return;
            const delay = MINIMAL_UPLOAD_INTERVAL_MILLISECONDS - (Date.now() - this.lastUploadStartedAt);
            if (delay > 0) await new Promise<void>((resolve) => {
                const finish = () => { this.controller.signal.removeEventListener('abort', finish); resolve(); };
                this.controller.signal.addEventListener('abort', finish, { once: true });
                this.uploadTimer = setTimeout(finish, delay);
            });
            if (this.isStopped) return;
            this.lastUploadStartedAt = Date.now();
            const { transcript } = await sendAdminWorkshopAgentAudio(this.options.workshopId, this.sessionId, sequence, audio, this.controller.signal);
            if (!this.isStopped && transcript !== null) this.options.onTranscript(transcript);
        }).catch((error: unknown) => {
            if (!this.isStopped) this.stop(error instanceof Error ? error.message : 'Přepis zvuku se nezdařil.');
        }).finally(() => { this.pendingChunkCount -= 1; });
    }
}
