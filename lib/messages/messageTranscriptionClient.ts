import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { formatMessageTranscript, validateMessageAudioFile } from './messageTranscription';

/** Only a short-lived, single-use credential reaches the browser; media never crosses a Vercel function. */
export function transcribeMessageFile(file: File, onProgress: (status: string) => void): Promise<string> {
    validateMessageAudioFile(file);
    return protectAdminMutation(async () => {
        onProgress('Připravuji přepis…');
        const { token, modelId } = await requestAdminJson<{ token: string; modelId: string }>('/api/admin/messages/transcribe', { method: 'POST' });
        const form = new FormData();
        form.append('file', file, file.name);
        form.append('model_id', modelId);
        form.append('diarize', 'true');
        form.append('tag_audio_events', 'true');
        form.append('timestamps_granularity', 'word');
        form.append('no_verbatim', 'false');
        const result = await new Promise<unknown>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.elevenlabs.io/v1/speech-to-text?token=${encodeURIComponent(token)}`);
            xhr.responseType = 'json';
            xhr.timeout = 60 * 60 * 1000;
            xhr.upload.onprogress = (event) => onProgress(event.lengthComputable
                ? `Nahrávám audio do ElevenLabs… ${Math.floor(event.loaded / event.total * 100)} %` : 'Nahrávám audio do ElevenLabs…');
            xhr.upload.onload = () => onProgress('ElevenLabs přepisuje audio a rozlišuje řečníky…');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
                else reject(new Error(`ElevenLabs odmítlo přepis (HTTP ${xhr.status}). Zkontrolujte soubor, přístup ke Speech to Text a kredity.`));
            };
            const interrupted = () => reject(new Error('Spojení s ElevenLabs bylo přerušeno. Před dalším pokusem zkontrolujte historii přepisů; původní kontext zůstal zachovaný.'));
            xhr.onerror = interrupted;
            xhr.ontimeout = interrupted;
            xhr.onabort = interrupted;
            onProgress('Nahrávám audio do ElevenLabs…');
            // Do not set Content-Type: the browser supplies the multipart boundary. Never automatically retry a billed request.
            xhr.send(form);
        });
        return formatMessageTranscript(file.name, result);
    });
}
