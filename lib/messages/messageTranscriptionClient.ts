import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { JsonRequestError } from '@/lib/api/requestJson';
import { formatMessageTranscript, validateMessageAudioFile } from './messageTranscription';
import { extractMessageAudio, isMessageVideoImport } from './messageVideoImport';

type FileMetadata = Pick<File, 'name' | 'size' | 'type' | 'lastModified'>;
export type MessageTranscriptionReport = {
    attemptId: string;
    startedAt: string;
    finishedAt?: string;
    outcome: 'running' | 'completed' | 'failed';
    stage: string;
    source: FileMetadata;
    audio?: FileMetadata;
    browser: { userAgent: string; language: string; online: boolean };
    request: { endpoint: string; parameters?: Record<string, string> };
    events: { at: string; stage: string }[];
    upload?: { loaded: number; total: number | null };
    response?: { status: number; statusText: string; contentType: string | null; requestId: string | null; body: string };
    error?: { name: string; message: string; stack?: string; cause?: string; status?: number };
};

function fileMetadata(file: File): FileMetadata {
    return { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified };
}

/** Only a short-lived, single-use credential reaches the browser; media never crosses a Vercel function. */
export function transcribeMessageFile(file: File, onProgress: (status: string) => void,
    onDiagnostics?: (report: MessageTranscriptionReport) => void): Promise<string> {
    const report: MessageTranscriptionReport = {
        attemptId: crypto.randomUUID(), startedAt: new Date().toISOString(), outcome: 'running', stage: 'validation',
        source: fileMetadata(file), browser: { userAgent: navigator.userAgent, language: navigator.language, online: navigator.onLine },
        request: { endpoint: 'https://api.elevenlabs.io/v1/speech-to-text' }, events: [],
    };
    const stage = (value: string) => {
        report.stage = value;
        report.events.push({ at: new Date().toISOString(), stage: value });
    };
    let credential: string | undefined;
    const redact = (value: string) => credential ? value.replaceAll(credential, '[REDACTED]') : value;
    return protectAdminMutation(async () => {
        try {
            stage('validation');
            let audioFile = file;
            if (isMessageVideoImport(file)) {
                stage('audio-extraction');
                onProgress('Odděluji zvuk na tomto zařízení…');
                audioFile = await extractMessageAudio(file, (progress) => onProgress(`Odděluji zvuk na tomto zařízení… ${Math.floor(progress * 100)} %`));
            }
            report.audio = fileMetadata(audioFile);
            validateMessageAudioFile(audioFile);
            stage('single-use-token');
            onProgress('Připravuji přepis…');
            const { token, modelId } = await requestAdminJson<{ token: string; modelId: string }>('/api/admin/messages/transcribe', { method: 'POST' });
            credential = token;
            const parameters = {
                model_id: modelId, diarize: 'true', tag_audio_events: 'true', timestamps_granularity: 'word',
                no_verbatim: 'false', webhook: 'false', use_multi_channel: 'false',
            };
            report.request.parameters = parameters;
            const form = new FormData();
            form.append('file', audioFile, audioFile.name);
            for (const name of Object.keys(parameters) as (keyof typeof parameters)[]) form.append(name, parameters[name]);
            const result = await new Promise<unknown>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${report.request.endpoint}?token=${encodeURIComponent(token)}`);
                // Preserve the actual response even if JSON parsing or transcript validation fails.
                xhr.responseType = 'text';
                xhr.timeout = 60 * 60 * 1000;
                const captureResponse = () => {
                    report.response = {
                        status: xhr.status, statusText: xhr.statusText,
                        contentType: xhr.getResponseHeader('content-type'),
                        requestId: xhr.getResponseHeader('request-id') ?? xhr.getResponseHeader('x-request-id'),
                        body: redact(xhr.responseText),
                    };
                };
                xhr.upload.onprogress = (event) => {
                    report.upload = { loaded: event.loaded, total: event.lengthComputable ? event.total : null };
                    onProgress(event.lengthComputable
                        ? `Nahrávám audio do ElevenLabs… ${Math.floor(event.loaded / event.total * 100)} %` : 'Nahrávám audio do ElevenLabs…');
                };
                xhr.upload.onload = () => {
                    stage('provider-transcription');
                    onProgress('ElevenLabs přepisuje audio a rozlišuje řečníky…');
                };
                xhr.onload = () => {
                    stage('provider-response');
                    captureResponse();
                    if (xhr.status === 202) {
                        reject(new Error('ElevenLabs přijalo asynchronní přepis, ale zatím nevrátilo text. Identifikátory jsou v technickém reportu. Před dalším pokusem zkontrolujte historii přepisů.'));
                    } else if (xhr.status < 200 || xhr.status >= 300) {
                        reject(new Error(`ElevenLabs odmítlo přepis (HTTP ${xhr.status}). Podrobnosti jsou v technickém reportu.`));
                    } else {
                        try { resolve(JSON.parse(xhr.responseText)); }
                        catch (cause) { reject(new Error('ElevenLabs nevrátilo platný JSON. Surová odpověď je v technickém reportu. Před dalším pokusem zkontrolujte historii přepisů.', { cause })); }
                    }
                };
                const interrupted = (event: string) => {
                    stage(event);
                    captureResponse();
                    reject(new Error('Spojení s ElevenLabs bylo přerušeno. Před dalším pokusem zkontrolujte historii přepisů; původní kontext zůstal zachovaný.'));
                };
                xhr.onerror = () => interrupted('network-error');
                xhr.ontimeout = () => interrupted('timeout');
                xhr.onabort = () => interrupted('aborted');
                stage('upload');
                onProgress('Nahrávám audio do ElevenLabs…');
                // Do not set Content-Type: the browser supplies the multipart boundary. Never automatically retry a billed request.
                xhr.send(form);
            });
            stage('transcript-formatting');
            const transcript = formatMessageTranscript(file.name, result);
            report.outcome = 'completed';
            stage('complete');
            return transcript;
        } catch (error) {
            report.outcome = 'failed';
            report.error = error instanceof Error ? {
                name: error.name, message: redact(error.message), stack: error.stack && redact(error.stack),
                cause: error.cause instanceof Error ? redact(error.cause.message) : undefined,
                status: error instanceof JsonRequestError ? error.status : undefined,
            } : { name: 'UnknownError', message: redact(String(error)) };
            throw error;
        } finally {
            report.finishedAt = new Date().toISOString();
            onDiagnostics?.(report);
        }
    });
}
