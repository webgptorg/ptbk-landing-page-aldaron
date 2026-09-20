import { ALL_FORMATS, BlobSource, Conversion, Input, Mp4OutputFormat, Output, StreamTarget, WebMOutputFormat } from 'mediabunny';
import { getTrackTrim } from './recordingStudioTiming';
import type { RecordingTrack, RecordingTrim } from './recordingStudioTypes';

const EXPORT_TEMPORARY_DIRECTORY = 'promptbook-recording-studio-exports';

export async function clearRecordingExportTemporaryFiles(): Promise<void> {
    if (!navigator.storage?.getDirectory) return;
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(EXPORT_TEMPORARY_DIRECTORY, { recursive: true }).catch((error: unknown) => {
        if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    });
}

/** A seekable disk-backed output avoids holding an entire transcoded camera track in memory. */
export async function withTrimmedRecordingTrack<Result>(options: {
    readonly blob: Blob;
    readonly track: RecordingTrack;
    readonly trim: RecordingTrim;
    readonly signal: AbortSignal;
    readonly onProgress: (progress: number) => void;
    readonly consume: (file: File, extension: string) => Promise<Result>;
}): Promise<Result> {
    if (!navigator.storage?.getDirectory) throw new Error('Tento prohlížeč nepodporuje pracovní úložiště pro ořez. Stáhněte originály nebo použijte Chrome či Edge.');
    const root = await navigator.storage.getDirectory();
    const directory = await root.getDirectoryHandle(EXPORT_TEMPORARY_DIRECTORY, { create: true });
    const filename = crypto.randomUUID();
    const handle = await directory.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(options.blob) });
    const isMp4 = options.track.mimeType.includes('mp4');
    const output = new Output({ format: isMp4 ? new Mp4OutputFormat() : new WebMOutputFormat(), target: new StreamTarget(writable) });
    let conversion: Conversion | null = null;
    const cancel = () => { void conversion?.cancel().catch(() => undefined); };
    options.signal.addEventListener('abort', cancel);
    try {
        options.signal.throwIfAborted();
        conversion = await Conversion.init({
            input, output, trim: getTrackTrim(options.trim, options.track, await input.getFirstTimestamp()),
        });
        if (!conversion.isValid || conversion.discardedTracks.length > 0) {
            throw new Error(`Prohlížeč neumí oříznout všechny části stopy „${options.track.label}“. Stáhněte originály s údaji o ořezu nebo použijte Chrome či Edge.`);
        }
        options.signal.throwIfAborted();
        conversion.onProgress = options.onProgress;
        await conversion.execute();
        options.signal.throwIfAborted();
        return await options.consume(await handle.getFile(), isMp4 ? 'mp4' : 'webm');
    } finally {
        options.signal.removeEventListener('abort', cancel);
        await conversion?.cancel().catch(() => undefined);
        input.dispose();
        await writable.abort().catch(() => undefined);
        await directory.removeEntry(filename);
    }
}
