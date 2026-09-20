import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { readRecordingTrack } from './recordingStudioStorage';
import { getRecordingByteLength, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingArchiveManifest, RecordingArchiveTrack, StudioRecording } from './recordingStudioTypes';

const MAXIMUM_BUFFERED_EXPORT_BYTES = 256 * 1024 * 1024;

type SaveFilePickerWindow = Window & {
    showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle>;
};

export function recordingFileStem(recording: StudioRecording): string {
    return `${recording.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'recording'}-${recording.id.slice(0, 8)}`;
}

/** Must be invoked before imports/awaits in the export button's gesture. */
export function chooseRecordingArchiveDestination(recording: StudioRecording): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, {
        suggestedName: `${recordingFileStem(recording)}.zip`, types: [{ description: 'ZIP archiv', accept: { 'application/zip': ['.zip'] } }],
    }) : Promise.resolve(null);
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
        throw new Error('Pro velký ZIP je potřeba přímé ukládání na disk. Otevřete studio v desktopovém Chrome nebo Edge na tomto zařízení a stejné adrese.');
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
            const originalFile = `originals/${prefix}.${track.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
            const blob = await readRecordingTrack(recording.id, track);
            onProgress(`Balení originálu ${index + 1}/${recording.tracks.length}: ${track.label}`);
            const addFile = async (filename: string, content: Blob) => {
                bufferedBytes += content.size;
                if (!destination && bufferedBytes > MAXIMUM_BUFFERED_EXPORT_BYTES) throw new Error('ZIP je příliš velký pro stažení v tomto prohlížeči. Použijte přímé ukládání v Chrome nebo Edge.');
                await archive.add(filename, new BlobReader(content), { signal });
            };
            await addFile(originalFile, blob);
            let trimmedFile: string | null = null;
            if (isTrimmed) {
                const { withTrimmedRecordingTrack } = await import('./recordingStudioTrim');
                await withTrimmedRecordingTrack({
                    blob, track, trim: recording.trim!, signal,
                    onProgress: (progress) => onProgress(`Ořez stopy ${index + 1}/${recording.tracks.length}: ${Math.round(progress * 100)} %`),
                    consume: async (file, extension) => {
                        trimmedFile = `trimmed/${prefix}.${extension}`;
                        await addFile(trimmedFile, file);
                    },
                });
            }
            exportedTracks.push({ ...track, originalFile, trimmedFile });
        }
        const manifest: RecordingArchiveManifest = {
            schemaVersion: 1, id: recording.id, title: recording.title, createdAt: recording.createdAt,
            status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds,
            trim: recording.trim, isTrimIncluded: isTrimmed, tracks: exportedTracks,
            timing: 'Seconds on the shared session clock. startOffsetSeconds measures browser start-call offsets, not hardware genlock.',
        };
        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
        await archive.add('README.txt', new TextReader([
            recording.title, '', 'ORIGINALS: unmodified source files, one file per camera, screen share or microphone.',
            'Keep embedded screen audio and microphone audio as separate sources when editing.',
            'recording.json contains source names, dimensions, byte sizes, timing offsets and the shared trim range in seconds.',
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
