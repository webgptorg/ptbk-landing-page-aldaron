import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { readRecordingTrack, streamRecordingTrack } from './recordingStudioStorage';
import { addRecordingBytes, getRecordingByteLength, getRecordingMissingRanges, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingArchiveManifest, RecordingArchiveTrack, RecordingTrack, StudioRecording } from './recordingStudioTypes';

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
    return `${recordingFileStem(recording)}-${recording.tracks.indexOf(track) + 1}-${track.kind}.${recordingMediaFileExtension(track.mimeType)}`;
}

export function chooseRecordingOriginalDestination(recording: StudioRecording, track: RecordingTrack): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, { suggestedName: recordingOriginalFilename(recording, track), types: [] }) : Promise.resolve(null);
}

export async function exportRecordingOriginal(recording: StudioRecording, track: RecordingTrack, destination: FileSystemFileHandle | null, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    if (destination) {
        await streamRecordingTrack(recording.id, track).pipeTo(await destination.createWritable(), { signal });
    } else {
        // Disk-backed Blob references, no byte-sized JS buffer or whole-session ZIP.
        const blob = await readRecordingTrack(recording.id, track, signal);
        signal.throwIfAborted();
        downloadBlobFile({ fileName: recordingOriginalFilename(recording, track), blob });
    }
}

function createRecordingArchiveManifest(recording: StudioRecording, tracks: readonly RecordingArchiveTrack[], isTrimIncluded: boolean): RecordingArchiveManifest {
    return {
        schemaVersion: 2, id: recording.id, title: recording.title, createdAt: recording.createdAt,
        status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds,
        trim: recording.trim, isTrimIncluded, tracks, sourceConfiguration: recording.sourceConfiguration,
        captureEndSeconds: recording.captureEndSeconds, missingRanges: getRecordingMissingRanges(recording),
        timing: 'Seconds on the shared session clock. startOffsetSeconds measures browser start-call offsets, not hardware genlock.',
    };
}

/** Preserve timing/edit metadata even when a browser can download only the individual large originals. */
export function exportRecordingManifest(recording: StudioRecording): void {
    const manifest = createRecordingArchiveManifest(recording, recording.tracks.map((track) => ({
        ...track, originalFile: track.byteLength > 0 ? recordingOriginalFilename(recording, track) : null, trimmedFile: null,
    })), false);
    downloadBlobFile({ fileName: `${recordingFileStem(recording)}.json`, blob: new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }) });
}

type ArchiveExportOptions = {
    readonly recording: StudioRecording;
    readonly destination: FileSystemFileHandle | null;
    readonly isTrimIncluded: boolean;
    readonly signal: AbortSignal;
    readonly onProgress: (message: string) => void;
};

/** ZIP64 supports long takes; already-compressed video is stored without another compression pass. */
export async function exportRecordingArchive({ recording, destination, isTrimIncluded, signal, onProgress }: ArchiveExportOptions): Promise<void> {
    const isTrimmed = isTrimIncluded && recording.trim !== null;
    if (isTrimmed) validateRecordingTrim(recording.trim!, recording.durationSeconds);
    if (!destination && getRecordingByteLength(recording) * (isTrimmed ? 2 : 1) > MAXIMUM_BUFFERED_EXPORT_BYTES) {
        throw new Error('Pro velký ZIP je potřeba přímé ukládání na disk. V tomto prohlížeči stáhněte jednotlivé originály u stop. Záznamy v úložišti jednoho prohlížeče nejsou dostupné v jiném.');
    }
    const writable = destination ? await destination.createWritable() : null;
    const archive = new ZipWriter(writable ?? new BlobWriter('application/zip'), { level: 0, zip64: true, useWebWorkers: false });
    const exportedTracks: RecordingArchiveTrack[] = [];
    let bufferedBytes = 0;
    try {
        for (let index = 0; index < recording.tracks.length; index += 1) {
            const track = recording.tracks[index];
            signal.throwIfAborted();
            if (track.byteLength === 0) { exportedTracks.push({ ...track, originalFile: null, trimmedFile: null }); continue; }
            const prefix = `${String(index + 1).padStart(2, '0')}-${track.kind}`;
            const originalFile = `originals/${prefix}.${recordingMediaFileExtension(track.mimeType)}`;
            onProgress(`Balení originálu ${index + 1}/${recording.tracks.length}: ${track.label}`);
            const addFile = async (filename: string, content: Blob | ReadableStream<Uint8Array>, size: number) => {
                bufferedBytes = addRecordingBytes(bufferedBytes, size);
                if (!destination && bufferedBytes > MAXIMUM_BUFFERED_EXPORT_BYTES) throw new Error('ZIP je příliš velký pro stažení v tomto prohlížeči. Použijte přímé ukládání v Chrome nebo Edge.');
                await archive.add(filename, content instanceof Blob ? new BlobReader(content) : content, { signal });
            };
            await addFile(originalFile, streamRecordingTrack(recording.id, track), track.byteLength);
            let trimmedFile: string | null = null;
            if (isTrimmed) {
                const { withTrimmedRecordingTrack } = await import('./recordingStudioTrim');
                await withTrimmedRecordingTrack({
                    blob: await readRecordingTrack(recording.id, track, signal), track, trim: recording.trim!, signal,
                    onProgress: (progress) => onProgress(`Ořez stopy ${index + 1}/${recording.tracks.length}: ${Math.round(progress * 100)} %`),
                    consume: async (file, extension) => {
                        trimmedFile = `trimmed/${prefix}.${extension}`;
                        await addFile(trimmedFile, file, file.size);
                    },
                });
            }
            exportedTracks.push({ ...track, originalFile, trimmedFile });
        }
        const manifest = createRecordingArchiveManifest(recording, exportedTracks, isTrimmed);
        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
        await archive.add('README.txt', new TextReader([
            recording.title, '', 'ORIGINALS: unmodified source files, one file per camera, screen share or microphone.',
            'A camera file can contain its selected microphone audio. Separate microphone and screen audio remain separate files when they were configured as separate sources.',
            'recording.json contains source and selected-device preferences, embedded-audio presence, dimensions, byte sizes, timing offsets, missingRanges and the shared trim range in seconds. A null missing-range end means unknown.',
            'All MediaRecorders are started/stopped in one browser turn. This is not hardware frame synchronization.',
            isTrimmed ? 'TRIMMED: copies of every recorded source, cut to the same session range. A trim can re-encode video/audio; originals preserve capture quality.' :
                'No trimmed copies are included. The original source files and any saved trim decision are preserved.',
            recording.status === 'interrupted' ? 'INTERRUPTED TAKE: only successfully saved chunks are present; the tail may be incomplete. Check each source before editing.' : '',
        ].join('\n')), { signal });
        signal.throwIfAborted();
        const result = await archive.close();
        if (!destination && result instanceof Blob) downloadBlobFile({ fileName: `${recordingFileStem(recording)}.zip`, blob: result });
    } catch (error) {
        // Abort a direct-to-disk export instead of publishing a deceptively complete partial ZIP.
        await writable?.abort().catch(() => undefined);
        throw error;
    }
}
