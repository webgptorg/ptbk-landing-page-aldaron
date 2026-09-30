import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { readRecordingPart, readRecordingTrack, streamRecordingPart, streamRecordingTrack } from './recordingStudioStorage';
import { addRecordingBytes, getRecordingByteLength, getRecordingMissingRanges, validateRecordingTrim } from './recordingStudioTiming';
import { readRecordingIndexReport, RECORDING_INDEX_REPAIR_COMMAND } from './recordingStudioIndex';
import type { RecordingArchiveIndexState, RecordingArchiveManifest, RecordingArchiveTrack, RecordingMediaPart, RecordingTrack, StudioRecording } from './recordingStudioTypes';
import { createRecordingEditRecipe, getRecordingMediaParts, getRecordingPartForSelection, getRecordingPartTrack, getRecordingSessionDuration, getRecordingUnavailableRanges } from './recordingStudioSessionTime';
import { getRecordingDerivedFiles, getRecordingDerivedManifestEntries, type RecordingDerivedFile } from './recordingStudioDerivedExport';
import { createRecordingWorkshopSidecar } from './recordingStudioWorkshop';

const MAXIMUM_BUFFERED_EXPORT_BYTES = 256 * 1024 * 1024;

type RecordingWorkshopFile = { readonly filename: string; readonly content: string; readonly coordinate: 'original-session' | 'prepared-export';
    readonly sourceRevision: string; readonly currentRevision: string };

async function getRecordingWorkshopFiles(recording: StudioRecording, isPrepared: boolean): Promise<RecordingWorkshopFile[]> {
    if (!recording.workshopMetadata) return [];
    const sidecar = await createRecordingWorkshopSidecar(recording, isPrepared);
    if (!sidecar) return [];
    return [{ filename: `metadata/${isPrepared ? 'prepared' : 'original'}/${recordingFileStem(recording)}-workshop.json`,
        content: JSON.stringify(sidecar, null, 2), coordinate: isPrepared ? 'prepared-export' : 'original-session',
        sourceRevision: sidecar.sourceRevision, currentRevision: sidecar.currentRevision }];
}

type SaveFilePickerWindow = Window & {
    showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle>;
};

export function recordingFileStem(recording: StudioRecording): string {
    return `${recording.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'recording'}-${recording.id.slice(0, 8)}`;
}

function recordingMediaFileExtension(mimeType: string): string {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('ogg')) return 'ogg';
    return 'webm';
}

/** Must be invoked before imports/awaits in the export button's gesture. */
export function chooseRecordingArchiveDestination(recording: StudioRecording): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, {
        suggestedName: `${recordingFileStem(recording)}.zip`, types: [{ description: 'ZIP archiv', accept: { 'application/zip': ['.zip'] } }],
    }) : Promise.resolve(null);
}

export function recordingOriginalFilename(recording: StudioRecording, track: RecordingTrack): string {
    return `${recordingFileStem(recording)}-${recordingSourceNumber(recording, track.id)}-${track.kind}.${recordingMediaFileExtension(track.mimeType)}`;
}

export function recordingOriginalPartFilename(recording: StudioRecording, track: RecordingTrack, part: RecordingMediaPart): string {
    const partIndex = getRecordingMediaParts(track).findIndex((candidate) => candidate.id === part.id);
    return `${recordingFileStem(recording)}-${recordingSourceNumber(recording, track.id)}-${track.kind}-part-${String(partIndex + 1).padStart(3, '0')}.${recordingMediaFileExtension(part.mimeType)}`;
}

function getPartArchiveFiles(recording: StudioRecording, track: RecordingTrack, prefix: string) {
    return getRecordingMediaParts(track).map((part, index) => ({ part,
        file: `originals/${prefix}-part-${String(index + 1).padStart(3, '0')}.${recordingMediaFileExtension(part.mimeType)}` }));
}

/** Metadata-only manifests report what the capture already checked, without opening any media again. */
function describeRecordedPartIndex(part: RecordingMediaPart): Partial<RecordingArchiveIndexState> {
    return part.indexStatus ? { status: part.indexStatus, isIndexRebuilt: false } : {};
}

function describeOriginalParts(recording: StudioRecording, track: RecordingTrack) {
    return getRecordingMediaParts(track).map((part) => ({ partId: part.id, takeId: part.takeId,
        file: recordingOriginalPartFilename(recording, track, part), sessionStartSeconds: part.sessionStartSeconds,
        durationSeconds: part.durationSeconds, ...describeRecordedPartIndex(part) }));
}

/**
 * Hands over one recorded part with a seek index whenever this browser can build one
 *
 * Note: A recorder writes a live container, so an original leaving the studio is a file an editor can play but not
 *       seek in. Copying its packets into an indexed container is the studio's own `ffmpeg -map 0 -c copy` and
 *       changes no media. Where that copy is impossible the recorder's own bytes are handed over unchanged and the
 *       reason is written into the manifest, so an export never waits on an index it cannot produce.
 *
 * @returns what the delivered file says about its index, as the manifest records it
 */
async function deliverRecordingOriginal(options: {
    readonly recording: StudioRecording;
    readonly part: RecordingMediaPart;
    readonly signal: AbortSignal;
    readonly onProgress?: (message: string) => void;
    /** Without a disk picker a rebuilt container has to be detached into memory, which only small files allow. */
    readonly maximumBufferedBytes?: number;
    readonly deliverIndexed: (file: File) => Promise<void>;
    readonly deliverRecorded: () => Promise<void>;
}): Promise<RecordingArchiveIndexState> {
    const media = await readRecordingPart(options.recording.id, options.part, options.signal);
    // An unanswerable question about the index leaves the export exactly as it was before the index was ever checked.
    const report = await readRecordingIndexReport(media).catch(() => null);
    if (!report || report.status !== 'unindexed') {
        await options.deliverRecorded();
        return { status: report?.status ?? 'unknown', isIndexRebuilt: false, reason: report?.detail };
    }
    const { withRebuiltRecordingIndex, RecordingIndexRebuildUnavailable } = await import('./recordingStudioReindex');
    try {
        return await withRebuiltRecordingIndex({
            blob: media, format: report.format, signal: options.signal, expectedMedia: options.part.mediaBounds,
            onProgress: (progress) => options.onProgress?.(`Doplňuji index kontejneru: ${Math.round(progress * 100)} %`),
            consume: async (file) => {
                if (options.maximumBufferedBytes !== undefined && file.size > options.maximumBufferedBytes) {
                    throw new RecordingIndexRebuildUnavailable(`Kontejner s doplněným indexem přesahuje ${Math.round(options.maximumBufferedBytes / 1024 ** 2)} MiB a bez přímého ukládání na disk jej nelze stáhnout. Předává se originál; index doplňte příkazem ${RECORDING_INDEX_REPAIR_COMMAND}.`);
                }
                await options.deliverIndexed(file);
                return { status: 'indexed' as const, isIndexRebuilt: true, reason: report.detail };
            },
        });
    } catch (error) {
        options.signal.throwIfAborted();
        if (!(error instanceof RecordingIndexRebuildUnavailable)) throw error;
        options.onProgress?.(error.message);
        await options.deliverRecorded();
        return { status: report.status, isIndexRebuilt: false, reason: error.message };
    }
}

/** Storage returns fresh objects; filenames follow the stable source identity. */
function recordingSourceNumber(recording: StudioRecording, sourceId: string): number {
    const index = recording.tracks.findIndex((track) => track.id === sourceId);
    if (index < 0) throw new Error('Zdroj nepatří k tomuto záznamu.');
    return index + 1;
}

export function chooseRecordingOriginalDestination(recording: StudioRecording, track: RecordingTrack, part?: RecordingMediaPart): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, { suggestedName: part ? recordingOriginalPartFilename(recording, track, part) : recordingOriginalFilename(recording, track), types: [] }) : Promise.resolve(null);
}

export function recordingPreparedFilename(recording: StudioRecording, track: RecordingTrack): string {
    const extension = track.mimeType.includes('mp4') ? 'mp4' : 'webm';
    return `${recordingFileStem(recording)}-${recordingSourceNumber(recording, track.id)}-${track.kind}-prepared.${extension}`;
}

export function chooseRecordingPreparedDestination(recording: StudioRecording, track: RecordingTrack): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, { suggestedName: recordingPreparedFilename(recording, track), types: [] }) : Promise.resolve(null);
}

/** One disk-backed output and its explicit sidecar, also available without a whole-session archive. */
export async function exportRecordingPrepared(recording: StudioRecording, track: RecordingTrack, destination: FileSystemFileHandle | null, signal: AbortSignal, onProgress: (message: string) => void): Promise<void> {
    if (!recording.trim) throw new Error('Nejprve vyberte společný interval.');
    const workshopFiles = await getRecordingWorkshopFiles(recording, true);
    const part = getRecordingPartForSelection(track, recording.trim);
    if (!part) throw new Error('Výběr přesahuje více samostatných částí. ZIP obsahuje originály a společný časový předpis; jeden soubor nelze bez dalšího spojování bezpečně připravit.');
    const partTrack = getRecordingPartTrack(track, part);
    const { withTrimmedRecordingTrack } = await import('./recordingStudioTrim');
    await withTrimmedRecordingTrack({ blob: await readRecordingPart(recording.id, part, signal), track: partTrack, trim: recording.trim, signal,
        onProgress: (progress) => onProgress(`Ořez: ${Math.round(progress * 100)} %`),
        consume: async (file, _extension, timing) => {
            const { originalMedia, ...preparedTiming } = timing;
            const filename = recordingPreparedFilename(recording, track);
            if (destination) await file.stream().pipeTo(await destination.createWritable(), { signal });
            else downloadBlobFile({ fileName: filename, blob: await bufferRecordingPreparedDownload(file, signal) });
            const derivedFiles = getRecordingDerivedFiles(recording, recordingFileStem(recording), true).filter((candidate) => candidate.sourceId === track.id);
            for (const derivedFile of derivedFiles) downloadBlobFile({ fileName: derivedFile.filename.split('/').pop()!, blob: new Blob([derivedFile.content], { type: derivedFile.type }) });
            for (const workshopFile of workshopFiles) downloadBlobFile({ fileName: workshopFile.filename.split('/').pop()!, blob: new Blob([workshopFile.content], { type: 'application/json' }) });
            const manifest = createRecordingArchiveManifest(recording, recording.tracks.map((candidate) => ({
                ...candidate, originalFile: getRecordingMediaParts(candidate).length === 1 ? recordingOriginalFilename(recording, candidate) : null,
                originalParts: describeOriginalParts(recording, candidate),
                trimmedFile: candidate.id === track.id ? filename : null,
                ...(candidate.id === track.id ? { originalMedia, preparation: { status: 'prepared' as const, processing: 'Video/audio transcoded, timestamp-clipped; video resampled to videoFrameRate when available, otherwise original cadence. No spatial crop. Boundary tolerance 0.05 seconds per component.', preparedTimeZeroSessionSeconds: recording.trim!.startSeconds, ...preparedTiming } } : {}),
            })), recording.tracks.length === 1, derivedFiles, workshopFiles);
            downloadBlobFile({ fileName: `${filename}.json`, blob: new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }) });
        },
    });
}

/** A browser download can outlive OPFS cleanup. Detach only bounded small outputs; large ones need a disk stream. */
export async function bufferRecordingPreparedDownload(file: Blob, signal: AbortSignal): Promise<Blob> {
    signal.throwIfAborted();
    if (file.size > MAXIMUM_BUFFERED_EXPORT_BYTES) {
        throw new Error('Ořez nad 256 MiB vyžaduje přímé ukládání na disk. V tomto prohlížeči stáhněte originál a časový předpis; velký ořez se do paměti nenačítá.');
    }
    const bytes = await file.arrayBuffer();
    signal.throwIfAborted();
    return new Blob([bytes], { type: file.type });
}

/** @returns what the delivered file says about its index, so the studio can report it instead of a bare success. */
export async function exportRecordingOriginal(recording: StudioRecording, track: RecordingTrack, destination: FileSystemFileHandle | null, signal: AbortSignal,
    selectedPart?: RecordingMediaPart, onProgress?: (message: string) => void): Promise<RecordingArchiveIndexState> {
    signal.throwIfAborted();
    const workshopFiles = await getRecordingWorkshopFiles(recording, false);
    const parts = getRecordingMediaParts(track);
    const part = selectedPart ?? (parts.length === 1 ? parts[0] : null);
    if (!part) throw new Error('Stopa má více samostatných částí. Stáhněte je jednotlivě nebo jako ZIP.');
    const fileName = selectedPart ? recordingOriginalPartFilename(recording, track, part) : recordingOriginalFilename(recording, track);
    const indexState = await deliverRecordingOriginal({
        recording, part, signal, onProgress,
        maximumBufferedBytes: destination ? undefined : MAXIMUM_BUFFERED_EXPORT_BYTES,
        deliverIndexed: async (file) => {
            if (destination) await file.stream().pipeTo(await destination.createWritable(), { signal });
            // The temporary file is removed as soon as this step returns, so a plain download has to be detached.
            else downloadBlobFile({ fileName, blob: await bufferRecordingPreparedDownload(file, signal) });
        },
        deliverRecorded: async () => {
            if (destination) { await streamRecordingPart(recording.id, part).pipeTo(await destination.createWritable(), { signal }); return; }
            // Disk-backed Blob references, no byte-sized JS buffer or whole-session ZIP.
            const blob = await readRecordingPart(recording.id, part, signal);
            signal.throwIfAborted();
            downloadBlobFile({ fileName, blob });
        },
    });
    signal.throwIfAborted();
    for (const sidecar of getRecordingDerivedFiles(recording, recordingFileStem(recording), false).filter((file) => file.sourceId === track.id)) {
        downloadBlobFile({ fileName: sidecar.filename.split('/').pop()!, blob: new Blob([sidecar.content], { type: sidecar.type }) });
    }
    for (const workshopFile of workshopFiles) downloadBlobFile({ fileName: workshopFile.filename.split('/').pop()!, blob: new Blob([workshopFile.content], { type: 'application/json' }) });
    return indexState;
}

/** One sentence about the index of a delivered original, so a fallback is never reported as a plain success. */
export function describeRecordingOriginalIndexState(indexState: RecordingArchiveIndexState): string {
    if (indexState.isIndexRebuilt) return 'Originál je připravený; chybějící index kontejneru byl doplněn bez překódování médií.';
    if (indexState.status !== 'unindexed') return 'Originál je připravený.';
    return `Originál je připravený, ale zůstal bez indexu pro vyhledávání. ${indexState.reason ?? ''} Index doplňte příkazem ${RECORDING_INDEX_REPAIR_COMMAND}.`.replace(/\s+/g, ' ');
}

export function createRecordingArchiveManifest(recording: StudioRecording, tracks: readonly RecordingArchiveTrack[], isTrimIncluded: boolean,
    derivedFiles: readonly RecordingDerivedFile[] = [], workshopFiles: readonly RecordingWorkshopFile[] = []): RecordingArchiveManifest {
    const workshopFile = workshopFiles[0];
    return {
        schemaVersion: 5, timeUnit: 'seconds', editRecipe: createRecordingEditRecipe(recording), id: recording.id, title: recording.title, createdAt: recording.createdAt,
        status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds, takes: recording.takes,
        trim: recording.trim, isTrimIncluded, tracks, sourceConfiguration: recording.sourceConfiguration,
        derivedTracks: getRecordingDerivedManifestEntries(recording, derivedFiles),
        workshopMetadata: recording.workshopMetadata ? { sourceRevision: recording.workshopMetadata.sourceRevision,
            currentRevision: workshopFile?.currentRevision ?? recording.workshopMetadata.sourceRevision,
            isSourceRevisionStale: workshopFile ? workshopFile.currentRevision !== workshopFile.sourceRevision : false,
            originalFile: workshopFiles.find((file) => file.coordinate === 'original-session')?.filename ?? null,
            preparedFile: workshopFiles.find((file) => file.coordinate === 'prepared-export')?.filename ?? null } : null,
        workshopMetadataData: recording.workshopMetadata,
        captureEndSeconds: recording.captureEndSeconds, missingRanges: [
            ...tracks.flatMap((track) => getRecordingUnavailableRanges(track, getRecordingSessionDuration(recording),
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.firstTimestampSeconds,
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.endTimestampSeconds,
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.availableStartTimestampSeconds).map((range) => ({ trackId: track.id, ...range }))),
            ...getRecordingMissingRanges(recording).filter((range) => range.endSeconds === null),
        ],
        timing: 'All time values: seconds. Original metadata and media use the original session clock. Prepared metadata and media clip to editRecipe.selection and subtract preparedTimeZeroSessionSeconds; out-of-range entries are omitted. Workshop sidecars retain original coordinates, calibration, commit availability and source revision. Unclassified activity plays at 1x; speech does not infer automatic coding. Disabled cues remain only in JSON metadata and transcripts are not player subtitles. Each original part is an independent playable container and maps from its own media zero to originalParts.sessionStartSeconds at rate 1. Paused wall time is excluded from the session clock. Part start/stop times are browser observations, not hardware genlock. No gaps are collapsed and monitoring never excludes files. Video frame rate is frames per second; null retains original cadence. Encoder availability remains unverified where originalMedia is absent.',
    };
}

/** Preserve timing/edit metadata even when a browser can download only the individual large originals. */
export async function exportRecordingManifest(recording: StudioRecording): Promise<void> {
    const workshopFiles = await getRecordingWorkshopFiles(recording, false);
    const manifest = createRecordingArchiveManifest(recording, recording.tracks.map((track) => ({
        ...track, originalFile: getRecordingMediaParts(track).length === 1 ? recordingOriginalFilename(recording, track) : null,
        originalParts: describeOriginalParts(recording, track), trimmedFile: null,
    })), false, [], workshopFiles);
    const backup = { ...manifest, derivedTrackData: recording.derivedTracks ?? [] };
    downloadBlobFile({ fileName: `${recordingFileStem(recording)}.json`, blob: new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }) });
}

type ArchiveExportOptions = {
    readonly recording: StudioRecording;
    readonly destination: FileSystemFileHandle | null;
    readonly isTrimIncluded: boolean;
    readonly signal: AbortSignal;
    readonly onProgress: (message: string) => void;
};

/** ZIP64 supports long takes; already-compressed video is stored without another compression pass. */
export async function exportRecordingArchive({ recording, destination, isTrimIncluded, signal, onProgress }: ArchiveExportOptions):
    Promise<{ readonly preparedCount: number; readonly fallbackCount: number; readonly unindexedOriginalCount: number }> {
    const isTrimmed = isTrimIncluded && recording.trim !== null;
    if (isTrimmed) validateRecordingTrim(recording.trim!, getRecordingSessionDuration(recording));
    const workshopFiles = [
        ...await getRecordingWorkshopFiles(recording, false),
        ...(isTrimmed ? await getRecordingWorkshopFiles(recording, true) : []),
    ];
    if (!destination && getRecordingByteLength(recording) * (isTrimmed ? 2 : 1) > MAXIMUM_BUFFERED_EXPORT_BYTES) {
        throw new Error('Pro velký ZIP je potřeba přímé ukládání na disk. V tomto prohlížeči stáhněte jednotlivé originály u stop. Záznamy v úložišti jednoho prohlížeče nejsou dostupné v jiném.');
    }
    const writable = destination ? await destination.createWritable() : null;
    const archive = new ZipWriter(writable ?? new BlobWriter('application/zip'), { level: 0, zip64: true, useWebWorkers: false });
    const exportedTracks: RecordingArchiveTrack[] = [];
    let bufferedBytes = 0;
    let preparedCount = 0;
    let fallbackCount = 0;
    let unindexedOriginalCount = 0;
    try {
        for (let index = 0; index < recording.tracks.length; index += 1) {
            const track = recording.tracks[index];
            signal.throwIfAborted();
            if (track.byteLength === 0) { fallbackCount += isTrimmed ? 1 : 0; exportedTracks.push({ ...track, originalFile: null, trimmedFile: null, preparation: { status: 'original-and-recipe', reason: 'No committed source media.', preparedTimeZeroSessionSeconds: recording.trim?.startSeconds ?? 0 } }); continue; }
            const prefix = `${String(index + 1).padStart(2, '0')}-${track.kind}`;
            const partFiles = getPartArchiveFiles(recording, track, prefix);
            const originalFile = partFiles.length === 1 ? partFiles[0].file : null;
            onProgress(`Balení originálu ${index + 1}/${recording.tracks.length}: ${track.label}`);
            const addFile = async (filename: string, content: Blob | ReadableStream<Uint8Array>, size: number) => {
                bufferedBytes = addRecordingBytes(bufferedBytes, size);
                if (!destination && bufferedBytes > MAXIMUM_BUFFERED_EXPORT_BYTES) throw new Error('ZIP je příliš velký pro stažení v tomto prohlížeči. Použijte přímé ukládání v Chrome nebo Edge.');
                await archive.add(filename, content instanceof Blob ? new BlobReader(content) : content, { signal });
            };
            const indexStates = new Map<string, RecordingArchiveIndexState>();
            for (const { part, file } of partFiles) {
                const indexState = await deliverRecordingOriginal({
                    recording, part, signal,
                    onProgress: (message) => onProgress(`Originál ${index + 1}/${recording.tracks.length} (${track.label}): ${message}`),
                    deliverIndexed: (rebuilt) => addFile(file, rebuilt, rebuilt.size),
                    deliverRecorded: () => addFile(file, streamRecordingPart(recording.id, part), part.byteLength),
                });
                if (indexState.status === 'unindexed') unindexedOriginalCount += 1;
                indexStates.set(part.id, indexState);
            }
            const originalParts = partFiles.map(({ part, file }) => ({ partId: part.id, takeId: part.takeId, file,
                sessionStartSeconds: part.sessionStartSeconds, durationSeconds: part.durationSeconds, ...indexStates.get(part.id)! }));
            let trimmedFile: string | null = null;
            let preparation: RecordingArchiveTrack['preparation'];
            let originalMedia: RecordingArchiveTrack['originalMedia'];
            if (isTrimmed) {
                const { withTrimmedRecordingTrack, RecordingPreparationUnavailable } = await import('./recordingStudioTrim');
                const selectedPart = getRecordingPartForSelection(track, recording.trim!);
                if (!selectedPart) {
                    fallbackCount += 1;
                    preparation = { status: 'original-and-recipe', reason: 'The selected interval crosses separate media parts or a real source gap.',
                        preparedTimeZeroSessionSeconds: recording.trim!.startSeconds };
                } else try { await withTrimmedRecordingTrack({
                    blob: await readRecordingPart(recording.id, selectedPart, signal), track: getRecordingPartTrack(track, selectedPart), trim: recording.trim!, signal,
                    onProgress: (progress) => onProgress(`Ořez stopy ${index + 1}/${recording.tracks.length}: ${Math.round(progress * 100)} %`),
                    consume: async (file, extension, timing) => {
                        const { originalMedia: inspectedMedia, ...preparedTiming } = timing;
                        originalMedia = inspectedMedia;
                        trimmedFile = `trimmed/${prefix}.${extension}`;
                        await addFile(trimmedFile, file, file.size);
                        preparation = { status: 'prepared', processing: 'Video and audio transcoded at original dimensions; video resampled to videoFrameRate when available, otherwise original cadence. Timestamp-clipped common interval; boundary tolerance 0.05 seconds per component. No spatial crop, layout or source mixing.', preparedTimeZeroSessionSeconds: recording.trim!.startSeconds, ...preparedTiming };
                        preparedCount += 1;
                    },
                }); } catch (error) {
                    signal.throwIfAborted();
                    if (!(error instanceof RecordingPreparationUnavailable)) throw error;
                    originalMedia = error.originalMedia;
                    fallbackCount += 1;
                    preparation = { status: 'original-and-recipe', reason: error.message, preparedTimeZeroSessionSeconds: recording.trim!.startSeconds };
                    onProgress(`${track.label}: pouze originál a předpis — ${error.message}`);
                }
            }
            exportedTracks.push({ ...track, originalFile, originalParts, trimmedFile, preparation, originalMedia });
        }
        const preparedSourceIds = new Set(exportedTracks.filter((track) => track.trimmedFile !== null).map((track) => track.id));
        const derivedFiles = [
            ...getRecordingDerivedFiles(recording, recordingFileStem(recording), false),
            ...(isTrimmed ? getRecordingDerivedFiles(recording, recordingFileStem(recording), true)
                .filter((file) => preparedSourceIds.has(file.sourceId)) : []),
        ];
        for (const file of derivedFiles) await archive.add(file.filename, new TextReader(file.content), { signal });
        for (const file of workshopFiles) await archive.add(file.filename, new TextReader(file.content), { signal });
        const manifest = createRecordingArchiveManifest(recording, exportedTracks, isTrimmed && fallbackCount === 0, derivedFiles, workshopFiles);
        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
        await archive.add('README.txt', new TextReader([
            recording.title, '', 'ORIGINALS: independently playable media parts for every camera, screen share or microphone, with the recorded media data unchanged.',
            'A camera file can contain its selected microphone audio. Separate microphone and screen audio remain separate files when they were configured as separate sources.',
            `SEEK INDEX: MediaRecorder writes a live container without a seek index or stored duration, so every original is remuxed by packet copy (the browser's own "${RECORDING_INDEX_REPAIR_COMMAND}") into an indexed container. No packet is re-encoded and no timestamp is shifted. Each recording.json originalParts entry reports status, isIndexRebuilt and, where the index could not be rebuilt, the reason; such a file is the recorder's own bytes and needs that ffmpeg command before an editor can seek in it.`,
            'recording.json contains source and selected-device preferences, embedded-audio presence, dimensions, byte sizes, timing offsets, missingRanges and the shared trim range in seconds. A null missing-range end means unknown.',
            'All sources share one session clock. Each pause closes all source containers before resume creates new parts. Start/stop calls are browser observations, not hardware frame synchronization.',
            isTrimmed ? `PREPARATION: ${preparedCount} real trimmed files; ${fallbackCount} sources require originals + recipe. Inspect each track preparation.status/reason. Only prepared files use the common selected interval and time zero; originals keep original timing. Video/audio are re-encoded; actual bounds are recorded (50 ms validation tolerance).` :
                'No trimmed copies are included. The original source files and any saved trim decision are preserved.',
            'METADATA: subtitle SRT/WebVTT plus JSON edits, and independent speech-activity JSON/CSV, are in metadata/original and metadata/prepared. Their coordinate systems and selected source/revision/settings are recorded in each JSON and recording.json. VAD intervals are suggestions, not automatic cuts; no confidence is fabricated.',
            'WORKSHOP METADATA: workshop JSON sidecars describe activity, events, Auto-view and reviewed Git anchors on the same original/prepared clock. They do not publish media or display the transcript as player subtitles. Check source revision and commit availability before use.',
            recording.status === 'interrupted' ? 'INTERRUPTED TAKE: only successfully saved chunks are present; the tail may be incomplete. Check each source before editing.' : '',
        ].join('\n')), { signal });
        signal.throwIfAborted();
        const result = await archive.close();
        if (!destination && result instanceof Blob) downloadBlobFile({ fileName: `${recordingFileStem(recording)}.zip`, blob: result });
        return { preparedCount, fallbackCount, unindexedOriginalCount };
    } catch (error) {
        // Abort a direct-to-disk export instead of publishing a deceptively complete partial ZIP.
        await writable?.abort().catch(() => undefined);
        throw error;
    }
}
