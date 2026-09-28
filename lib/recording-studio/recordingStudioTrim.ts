import { ALL_FORMATS, BlobSource, Conversion, Input, Mp4OutputFormat, Output, StreamTarget, WebMOutputFormat } from 'mediabunny';
import { getRecordingPreparationRange } from './recordingStudioSessionTime';
import { inspectRecordingMedia } from './recordingStudioMedia';
import { RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_VIDEO_BITS_PER_SECOND, type RecordingMediaBounds, type RecordingMediaComponent, type RecordingTrack, type RecordingTrim } from './recordingStudioTypes';

const EXPORT_TEMPORARY_DIRECTORY = 'promptbook-recording-studio-exports';
const EXPORT_BOUNDARY_TOLERANCE_SECONDS = 0.05;

export type RecordingPreparedTiming = {
    readonly firstTimestampSeconds: number;
    readonly endTimestampSeconds: number;
    readonly originalContainerOriginSeconds: number;
    readonly originalMedia: RecordingMediaBounds;
    readonly components: readonly RecordingMediaComponent[];
    readonly videoFrameRate: number | null;
};

export class RecordingPreparationUnavailable extends Error {
    public constructor(message: string, public readonly originalMedia?: RecordingMediaBounds) { super(message); }
}

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
    readonly consume: (file: File, extension: string, timing: RecordingPreparedTiming) => Promise<Result>;
}): Promise<Result> {
    if (!navigator.storage?.getDirectory) throw new RecordingPreparationUnavailable('Tento prohlížeč nepodporuje pracovní úložiště pro ořez. K dispozici jsou originály a předpis.');
    const root = await navigator.storage.getDirectory();
    const directory = await root.getDirectoryHandle(EXPORT_TEMPORARY_DIRECTORY, { create: true });
    const filename = crypto.randomUUID();
    const handle = await directory.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(options.blob) });
    const isMp4 = options.track.mimeType.includes('mp4');
    const videoFrameRate = options.track.kind !== 'microphone' && options.track.frameRate !== null &&
        Number.isFinite(options.track.frameRate) && options.track.frameRate > 0 ? options.track.frameRate : null;
    const output = new Output({ format: isMp4 ? new Mp4OutputFormat() : new WebMOutputFormat(), target: new StreamTarget(writable) });
    let conversion: Conversion | null = null;
    const cancel = () => { void conversion?.cancel().catch(() => undefined); };
    options.signal.addEventListener('abort', cancel);
    try {
        options.signal.throwIfAborted();
        let bounds: RecordingMediaBounds;
        try { bounds = await inspectRecordingMedia(input, options.track); }
        catch (error) { throw new RecordingPreparationUnavailable(error instanceof Error ? error.message : 'Médium nelze přečíst.'); }
        let trim;
        try { trim = getRecordingPreparationRange(options.track, options.trim, bounds.firstTimestampSeconds, bounds.endTimestampSeconds, bounds.availableStartTimestampSeconds); }
        catch (error) { throw new RecordingPreparationUnavailable(error instanceof Error ? error.message : 'Nedostupný interval.', bounds); }
        conversion = await Conversion.init({
            input, output, trim,
            // Packet-copy defaults can include earlier keyframes. Re-encode both streams with exact timestamp
            // clipping and no additional per-file shift. Use the recorded nominal cadence when available:
            // WebM SimpleBlocks cannot retain an irregular final frame's duration. Resampling that cadence
            // also gives editors an explicit frame grid while keeping dimensions and embedded audio.
            copy: false,
            video: { forceTranscode: true, bitrate: RECORDING_VIDEO_BITS_PER_SECOND, frameRate: videoFrameRate ?? undefined },
            audio: { forceTranscode: true, bitrate: RECORDING_AUDIO_BITS_PER_SECOND },
        });
        if (!conversion.isValid || conversion.discardedTracks.length > 0) {
            throw new RecordingPreparationUnavailable(`Prohlížeč neumí oříznout všechny části stopy „${options.track.label}“. K dispozici je originál s předpisem.`, bounds);
        }
        options.signal.throwIfAborted();
        conversion.onProgress = options.onProgress;
        await conversion.execute();
        options.signal.throwIfAborted();
        const file = await handle.getFile();
        const prepared = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
        try {
            const preparedBounds = await inspectRecordingMedia(prepared, options.track);
            const { firstTimestampSeconds, components } = preparedBounds;
            const endTimestampSeconds = Math.max(...components.map((component) => component.endTimestampSeconds));
            const expectedDuration = options.trim.endSeconds - options.trim.startSeconds;
            const originalTracks = await input.getTracks();
            const preparedTracks = await prepared.getTracks();
            if (preparedTracks.length !== originalTracks.length || components.some((component) =>
                component.firstTimestampSeconds > EXPORT_BOUNDARY_TOLERANCE_SECONDS ||
                Math.abs(component.endTimestampSeconds - expectedDuration) > EXPORT_BOUNDARY_TOLERANCE_SECONDS)) {
                const measuredBounds = components.map((component) => `${component.kind}: ${component.firstTimestampSeconds.toFixed(3)}–${component.endTimestampSeconds.toFixed(3)} s`).join(', ');
                throw new RecordingPreparationUnavailable(`Zpracované médium nesplňuje hranice výběru (tolerance 50 ms pro obraz i zvuk; očekáváno 0–${expectedDuration.toFixed(3)} s, ${measuredBounds}). Výstup není vydáván za oříznutý; použijte originál a předpis.`, bounds);
            }
            return await options.consume(file, isMp4 ? 'mp4' : 'webm', { firstTimestampSeconds, endTimestampSeconds, components, videoFrameRate, originalContainerOriginSeconds: bounds.firstTimestampSeconds, originalMedia: bounds });
        } finally { prepared.dispose(); }
    } finally {
        options.signal.removeEventListener('abort', cancel);
        await conversion?.cancel().catch(() => undefined);
        input.dispose();
        await writable.abort().catch(() => undefined);
        await directory.removeEntry(filename);
    }
}
