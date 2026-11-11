import { MESSAGE_AUDIO_ACCEPT } from './messageTranscription';

const VIDEO_EXTENSIONS = ['.mov', '.m4v', '.mkv'];
const SHARED_MEDIA_EXTENSION = /\.(mp4|webm|3gp|3gpp|ogg)$/i;

export const MESSAGE_MEDIA_ACCEPT = [MESSAGE_AUDIO_ACCEPT, 'video/*', ...VIDEO_EXTENSIONS].join(',');
export type MessageMediaInspection = {
    selectedAudioTrackId: number;
    audioTracks: { id: number; codec: string | null; channels: number; sampleRate: number; durationSeconds: number }[];
};

export function isMessageVideoImport(file: File): boolean {
    const name = file.name.toLowerCase();
    return file.type.startsWith('video/') || VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension))
        || (!file.type.startsWith('audio/') && SHARED_MEDIA_EXTENSION.test(name));
}

/** Read the selected file locally and send only its primary audio track for transcription. */
export async function extractMessageAudio(file: File, onProgress: (progress: number) => void,
    onInspection?: (inspection: MessageMediaInspection) => void): Promise<File> {
    const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, WebMOutputFormat } = await import('mediabunny');
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    const unsupported = 'Zvuk z tohoto souboru se nepodařilo oddělit. Zkuste video MP4 se zvukem AAC nebo samostatný audio soubor.';
    try {
        const audio = await input.getPrimaryAudioTrack().catch(() => { throw new Error(unsupported); });
        if (!audio) throw new Error('V souboru není zvuková stopa k přepisu.');
        if (onInspection) {
            const tracks = await input.getAudioTracks();
            onInspection({ selectedAudioTrackId: audio.id, audioTracks: await Promise.all(tracks.map(async track => ({
                id: track.id, codec: await track.getCodec(), channels: await track.getNumberOfChannels(),
                sampleRate: await track.getSampleRate(), durationSeconds: await track.computeDuration(),
            }))) });
        }

        // A generic file type can also be an ordinary audio recording in a shared container.
        if (!file.type.startsWith('video/') && SHARED_MEDIA_EXTENSION.test(file.name) && !(await input.getVideoTracks()).length) {
            return file;
        }

        const isAac = await audio.getCodec() === 'aac';
        const target = new BufferTarget();
        const output = new Output({ format: isAac ? new Mp4OutputFormat() : new WebMOutputFormat(), target });
        try {
            const conversion = await Conversion.init({ input, output, tracks: 'primary', video: { discard: true }, tags: {} });
            if (!conversion.isValid) throw new Error(unsupported);
            conversion.onProgress = onProgress;
            await conversion.execute();
        } catch {
            await output.cancel().catch(() => undefined);
            throw new Error(unsupported);
        }

        if (!target.buffer?.byteLength) throw new Error('Zvuková stopa je prázdná.');
        const basename = file.name.replace(/\.[^.]+$/, '') || 'nahravka';
        return new File([target.buffer], basename + (isAac ? '.m4a' : '.webm'), { type: isAac ? 'audio/mp4' : 'audio/webm' });
    } finally {
        input.dispose();
    }
}
