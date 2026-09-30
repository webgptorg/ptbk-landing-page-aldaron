import { ALL_FORMATS, BlobSource, Conversion, Input, Mp4OutputFormat, Output, StreamTarget, WebMOutputFormat } from 'mediabunny';
import { inspectRecordingMedia } from './recordingStudioMedia';
import { readRecordingIndexReport, RECORDING_INDEX_REPAIR_COMMAND, type RecordingContainerFormat } from './recordingStudioIndex';
import { isRecordingTemporaryFileSupported, withRecordingTemporaryFile } from './recordingStudioTemporaryFile';
import type { RecordingMediaBounds } from './recordingStudioTypes';

/** The rebuilt container must land on the very same media timeline as the recorder wrote it. */
const REBUILD_BOUNDARY_TOLERANCE_SECONDS = 0.05;

/** Raised whenever the recorded media has to be handed over exactly as the recorder wrote it. */
export class RecordingIndexRebuildUnavailable extends Error {}

type RebuildOptions = {
    readonly blob: Blob;
    readonly format: RecordingContainerFormat;
    readonly signal: AbortSignal;
    readonly onProgress?: (progress: number) => void;
    /** The bounds measured when the part closed, checked against the rebuilt container. */
    readonly expectedMedia?: RecordingMediaBounds;
};

function describeRebuildFailure(reason: string): RecordingIndexRebuildUnavailable {
    return new RecordingIndexRebuildUnavailable(`${reason} Předává se originál; index doplňte příkazem ${RECORDING_INDEX_REPAIR_COMMAND}.`);
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Neznámá chyba.';
}

function createIndexedOutputFormat(format: RecordingContainerFormat) {
    if (format === 'matroska') return new WebMOutputFormat();
    if (format === 'isobmff') return new Mp4OutputFormat();
    throw describeRebuildFailure('Index lze doplnit jen do kontejneru Matroska nebo MP4.');
}

function openIndexedInput(blob: Blob): Input {
    return new Input({ formats: ALL_FORMATS, source: new BlobSource(blob) });
}

/**
 * Whether this browser could copy every recorded packet into an indexed container
 *
 * Note: This reads codecs from the container header only, so it stays cheap enough to run while a recording is
 *       still going on. It answers whether an index can be built at all, not whether building it will succeed.
 */
export async function canRebuildRecordingIndex(blob: Blob, format: RecordingContainerFormat): Promise<boolean> {
    if (format === 'unknown' || !isRecordingTemporaryFileSupported()) return false;
    const input = openIndexedInput(blob);
    try {
        const supportedCodecs = createIndexedOutputFormat(format).getSupportedCodecs();
        const tracks = await input.getTracks();
        const codecs = await Promise.all(tracks.map((track) => track.getCodec()));
        return codecs.length > 0 && codecs.every((codec) => codec !== null && supportedCodecs.includes(codec));
    } catch {
        return false;
    } finally { input.dispose(); }
}

/**
 * Rewrites one recorded part into an indexed container and hands that file over, without re-encoding a packet
 *
 * Note: This is the browser's own `ffmpeg -map 0 -c copy`. Every failure of the rewriting itself becomes a
 *       `RecordingIndexRebuildUnavailable`, because an index is an improvement on the recorder's own bytes and must
 *       never be able to fail an export which would otherwise have succeeded. A failure of `consume`, on the other
 *       hand, belongs to the caller: the file was already being handed over and must not be handed over twice.
 */
export async function withRebuiltRecordingIndex<Result>(options: RebuildOptions & {
    readonly consume: (file: File) => Promise<Result>;
}): Promise<Result> {
    if (!isRecordingTemporaryFileSupported()) {
        throw describeRebuildFailure('Tento prohlížeč nepodporuje pracovní úložiště pro doplnění indexu.');
    }
    let isDelivering = false;
    try {
        return await withRecordingTemporaryFile(async ({ writable, readFile }) => {
            const file = await rebuildIndexedRecordingContainer(options, writable, readFile);
            isDelivering = true;
            return options.consume(file);
        });
    } catch (error) {
        options.signal.throwIfAborted();
        if (isDelivering || error instanceof RecordingIndexRebuildUnavailable) throw error;
        throw describeRebuildFailure(`Doplnění indexu selhalo: ${getErrorMessage(error)}`);
    }
}

/** Copies encoded packets into a seekable output and refuses anything which is not exactly the recorded media. */
async function rebuildIndexedRecordingContainer(options: RebuildOptions,
    writable: FileSystemWritableFileStream, readFile: () => Promise<File>): Promise<File> {
    const input = openIndexedInput(options.blob);
    const output = new Output({ format: createIndexedOutputFormat(options.format), target: new StreamTarget(writable) });
    let conversion: Conversion | null = null;
    const cancel = () => { void conversion?.cancel().catch(() => undefined); };
    options.signal.addEventListener('abort', cancel);
    try {
        options.signal.throwIfAborted();
        // Copying is forced, so a codec which would need transcoding discards its track instead of quietly producing
        // different media. No timestamp may shift either: the take's session mapping was measured against these.
        conversion = await Conversion.init({ input, output, copy: { mode: 'forced', shiftTolerance: 0 } });
        if (!conversion.isValid || conversion.discardedTracks.length > 0) {
            throw describeRebuildFailure('Tento prohlížeč neumí zkopírovat všechny zaznamenané stopy do indexovaného kontejneru bez překódování.');
        }
        if (options.onProgress) conversion.onProgress = options.onProgress;
        await conversion.execute();
        options.signal.throwIfAborted();
        const file = await readFile();
        await verifyRebuiltRecordingIndex(file, options.expectedMedia);
        return file;
    } finally {
        options.signal.removeEventListener('abort', cancel);
        await conversion?.cancel().catch(() => undefined);
        input.dispose();
    }
}

/** A rebuilt file is only handed over once it really is seekable and really covers the recorded media. */
async function verifyRebuiltRecordingIndex(file: File, expectedMedia?: RecordingMediaBounds): Promise<void> {
    const report = await readRecordingIndexReport(file).catch((error: unknown) => {
        throw describeRebuildFailure(`Kontejner s doplněným indexem nelze přečíst: ${getErrorMessage(error)}`);
    });
    if (report.status !== 'indexed') throw describeRebuildFailure(`Doplněný index se nepodařilo ověřit: ${report.detail}`);
    if (!expectedMedia) return;
    const rebuilt = openIndexedInput(file);
    try {
        const bounds = await inspectRecordingMedia(rebuilt).catch((error: unknown) => {
            throw describeRebuildFailure(`Média s doplněným indexem nelze přečíst: ${getErrorMessage(error)}`);
        });
        const isSameShape = bounds.components.length === expectedMedia.components.length &&
            Math.abs(bounds.firstTimestampSeconds - expectedMedia.firstTimestampSeconds) <= REBUILD_BOUNDARY_TOLERANCE_SECONDS &&
            Math.abs(bounds.endTimestampSeconds - expectedMedia.endTimestampSeconds) <= REBUILD_BOUNDARY_TOLERANCE_SECONDS;
        if (!isSameShape) {
            throw describeRebuildFailure(`Kontejner s doplněným indexem nepokrývá zaznamenaný rozsah (očekáváno ${expectedMedia.firstTimestampSeconds.toFixed(3)}–${expectedMedia.endTimestampSeconds.toFixed(3)} s ve ${expectedMedia.components.length} složkách, změřeno ${bounds.firstTimestampSeconds.toFixed(3)}–${bounds.endTimestampSeconds.toFixed(3)} s ve ${bounds.components.length} složkách).`);
        }
    } finally { rebuilt.dispose(); }
}
