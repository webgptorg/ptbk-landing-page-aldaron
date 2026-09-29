import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { readRecordingPart, readRecordingTrack, streamRecordingPart, streamRecordingTrack } from './recordingStudioStorage';
import { addRecordingBytes, getRecordingByteLength, getRecordingMissingRanges, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingArchiveManifest, RecordingArchiveTrack, RecordingMediaPart, RecordingTrack, StudioRecording } from './recordingStudioTypes';
import { createRecordingEditRecipe, getRecordingMediaParts, getRecordingPartForSelection, getRecordingPartTrack, getRecordingSessionDuration, getRecordingUnavailableRanges } from './recordingStudioSessionTime';
import { getRecordingDerivedFiles, getRecordingDerivedManifestEntries, type RecordingDerivedFile } from './recordingStudioDerivedExport';

const MAXIMUM_BUFFERED_EXPORT_BYTES = 256 * 1024 * 1024;

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
            const manifest = createRecordingArchiveManifest(recording, recording.tracks.map((candidate) => ({
                ...candidate, originalFile: getRecordingMediaParts(candidate).length === 1 ? recordingOriginalFilename(recording, candidate) : null,
                originalParts: getRecordingMediaParts(candidate).map((sourcePart) => ({ partId: sourcePart.id, takeId: sourcePart.takeId,
                    file: recordingOriginalPartFilename(recording, candidate, sourcePart), sessionStartSeconds: sourcePart.sessionStartSeconds,
                    durationSeconds: sourcePart.durationSeconds })),
                trimmedFile: candidate.id === track.id ? filename : null,
                ...(candidate.id === track.id ? { originalMedia, preparation: { status: 'prepared' as const, processing: 'Video/audio transcoded, timestamp-clipped; video resampled to videoFrameRate when available, otherwise original cadence. No spatial crop. Boundary tolerance 0.05 seconds per component.', preparedTimeZeroSessionSeconds: recording.trim!.startSeconds, ...preparedTiming } } : {}),
            })), recording.tracks.length === 1, derivedFiles);
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

export async function exportRecordingOriginal(recording: StudioRecording, track: RecordingTrack, destination: FileSystemFileHandle | null, signal: AbortSignal, selectedPart?: RecordingMediaPart): Promise<void> {
    signal.throwIfAborted();
    const parts = getRecordingMediaParts(track);
    const part = selectedPart ?? (parts.length === 1 ? parts[0] : null);
    if (!part) throw new Error('Stopa má více samostatných částí. Stáhněte je jednotlivě nebo jako ZIP.');
    if (destination) {
        await streamRecordingPart(recording.id, part).pipeTo(await destination.createWritable(), { signal });
    } else {
        // Disk-backed Blob references, no byte-sized JS buffer or whole-session ZIP.
        const blob = await readRecordingPart(recording.id, part, signal);
        signal.throwIfAborted();
        downloadBlobFile({ fileName: selectedPart ? recordingOriginalPartFilename(recording, track, part) : recordingOriginalFilename(recording, track), blob });
    }
    signal.throwIfAborted();
    for (const sidecar of getRecordingDerivedFiles(recording, recordingFileStem(recording), false).filter((file) => file.sourceId === track.id)) {
        downloadBlobFile({ fileName: sidecar.filename.split('/').pop()!, blob: new Blob([sidecar.content], { type: sidecar.type }) });
    }
}

function createRecordingArchiveManifest(recording: StudioRecording, tracks: readonly RecordingArchiveTrack[], isTrimIncluded: boolean, derivedFiles: readonly RecordingDerivedFile[] = []): RecordingArchiveManifest {
    return {
        schemaVersion: 4, timeUnit: 'seconds', editRecipe: createRecordingEditRecipe(recording), id: recording.id, title: recording.title, createdAt: recording.createdAt,
        status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds, takes: recording.takes,
        trim: recording.trim, isTrimIncluded, tracks, sourceConfiguration: recording.sourceConfiguration,
        derivedTracks: getRecordingDerivedManifestEntries(recording, derivedFiles),
        captureEndSeconds: recording.captureEndSeconds, missingRanges: [
            ...tracks.flatMap((track) => getRecordingUnavailableRanges(track, getRecordingSessionDuration(recording),
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.firstTimestampSeconds,
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.endTimestampSeconds,
                track.parts && track.parts.length > 1 ? undefined : track.originalMedia?.availableStartTimestampSeconds).map((range) => ({ trackId: track.id, ...range }))),
            ...getRecordingMissingRanges(recording).filter((range) => range.endSeconds === null),
        ],
        timing: 'All time values: seconds. Original derived metadata and media use the original session clock. Prepared metadata and media clip to editRecipe.selection and subtract preparedTimeZeroSessionSeconds; out-of-range entries are omitted. Disabled cues remain only in JSON metadata. Each original part is an independent playable container and maps from its own media zero to originalParts.sessionStartSeconds at rate 1. Paused wall time is excluded from the session clock. Part start/stop times are browser observations, not hardware genlock. No gaps are collapsed and monitoring never excludes files. Video frame rate is frames per second; null retains original cadence. Encoder availability remains unverified where originalMedia is absent.',
    };
}

/** Preserve timing/edit metadata even when a browser can download only the individual large originals. */
export function exportRecordingManifest(recording: StudioRecording): void {
    const manifest = createRecordingArchiveManifest(recording, recording.tracks.map((track) => ({
        ...track, originalFile: getRecordingMediaParts(track).length === 1 ? recordingOriginalFilename(recording, track) : null,
        originalParts: getRecordingMediaParts(track).map((part) => ({ partId: part.id, takeId: part.takeId,
            file: recordingOriginalPartFilename(recording, track, part), sessionStartSeconds: part.sessionStartSeconds,
            durationSeconds: part.durationSeconds })), trimmedFile: null,
    })), false);
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
export async function exportRecordingArchive({ recording, destination, isTrimIncluded, signal, onProgress }: ArchiveExportOptions): Promise<{ readonly preparedCount: number; readonly fallbackCount: number }> {
    const isTrimmed = isTrimIncluded && recording.trim !== null;
    if (isTrimmed) validateRecordingTrim(recording.trim!, getRecordingSessionDuration(recording));
    if (!destination && getRecordingByteLength(recording) * (isTrimmed ? 2 : 1) > MAXIMUM_BUFFERED_EXPORT_BYTES) {
        throw new Error('Pro velký ZIP je potřeba přímé ukládání na disk. V tomto prohlížeči stáhněte jednotlivé originály u stop. Záznamy v úložišti jednoho prohlížeče nejsou dostupné v jiném.');
    }
    const writable = destination ? await destination.createWritable() : null;
    const archive = new ZipWriter(writable ?? new BlobWriter('application/zip'), { level: 0, zip64: true, useWebWorkers: false });
    const exportedTracks: RecordingArchiveTrack[] = [];
    let bufferedBytes = 0;
    let preparedCount = 0;
    let fallbackCount = 0;
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
            for (const { part, file } of partFiles) await addFile(file, streamRecordingPart(recording.id, part), part.byteLength);
            const originalParts = partFiles.map(({ part, file }) => ({ partId: part.id, takeId: part.takeId, file,
                sessionStartSeconds: part.sessionStartSeconds, durationSeconds: part.durationSeconds }));
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
        const manifest = createRecordingArchiveManifest(recording, exportedTracks, isTrimmed && fallbackCount === 0, derivedFiles);
        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
        await archive.add('README.txt', new TextReader([
            recording.title, '', 'ORIGINALS: unmodified, independently playable media parts for every camera, screen share or microphone.',
            'A camera file can contain its selected microphone audio. Separate microphone and screen audio remain separate files when they were configured as separate sources.',
            'recording.json contains source and selected-device preferences, embedded-audio presence, dimensions, byte sizes, timing offsets, missingRanges and the shared trim range in seconds. A null missing-range end means unknown.',
            'All sources share one session clock. Each pause closes all source containers before resume creates new parts. Start/stop calls are browser observations, not hardware frame synchronization.',
            isTrimmed ? `PREPARATION: ${preparedCount} real trimmed files; ${fallbackCount} sources require originals + recipe. Inspect each track preparation.status/reason. Only prepared files use the common selected interval and time zero; originals keep original timing. Video/audio are re-encoded; actual bounds are recorded (50 ms validation tolerance).` :
                'No trimmed copies are included. The original source files and any saved trim decision are preserved.',
            'METADATA: subtitle SRT/WebVTT plus JSON edits, and independent speech-activity JSON/CSV, are in metadata/original and metadata/prepared. Their coordinate systems and selected source/revision/settings are recorded in each JSON and recording.json. VAD intervals are suggestions, not automatic cuts; no confidence is fabricated.',
            recording.status === 'interrupted' ? 'INTERRUPTED TAKE: only successfully saved chunks are present; the tail may be incomplete. Check each source before editing.' : '',
        ].join('\n')), { signal });
        signal.throwIfAborted();
        const result = await archive.close();
        if (!destination && result instanceof Blob) downloadBlobFile({ fileName: `${recordingFileStem(recording)}.zip`, blob: result });
        return { preparedCount, fallbackCount };
    } catch (error) {
        // Abort a direct-to-disk export instead of publishing a deceptively complete partial ZIP.
        await writable?.abort().catch(() => undefined);
        throw error;
    }
}
