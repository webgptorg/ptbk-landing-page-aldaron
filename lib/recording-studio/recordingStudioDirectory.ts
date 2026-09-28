import { z } from 'zod';
import type { RecordingTrack, StudioRecording } from './recordingStudioTypes';
import { isRecordingSegmentMapValid } from './recordingStudioSessionTime';

const DIRECTORY_MANIFEST_NAME = 'recording.json';
const MAXIMUM_MANIFEST_BYTES = 4 * 1024 * 1024;
const SAFE_IDENTIFIER = /^[a-zA-Z0-9_-]+$/;
const NONNEGATIVE_NUMBER = z.number().finite().nonnegative();
const BYTE_COUNT = NONNEGATIVE_NUMBER.int().max(Number.MAX_SAFE_INTEGER);
const TIME_SEGMENT_SCHEMA = z.object({ sourceStartSeconds: NONNEGATIVE_NUMBER, sessionStartSeconds: NONNEGATIVE_NUMBER, durationSeconds: NONNEGATIVE_NUMBER });
const TRIM_SCHEMA = z.object({ startSeconds: NONNEGATIVE_NUMBER, endSeconds: NONNEGATIVE_NUMBER });
const SOURCE_CONFIGURATION_SCHEMA = z.object({
    id: z.string().regex(SAFE_IDENTIFIER), kind: z.enum(['camera', 'screen', 'microphone']), label: z.string().max(200),
    cameraDeviceId: z.string(), cameraDeviceLabel: z.string().max(200).nullable(),
    microphoneDeviceId: z.string(), microphoneDeviceLabel: z.string().max(200).nullable(),
    displaySurface: z.enum(['browser', 'window', 'monitor']).nullable().default(null),
    displaySourceLabel: z.string().max(200).nullable().default(null),
    isCaptureEnabled: z.boolean().default(true), isAudioEnabled: z.boolean(),
});
const RECORDING_SCHEMA = z.object({
    id: z.string().regex(SAFE_IDENTIFIER), title: z.string(), createdAt: z.string().datetime(),
    status: z.enum(['recording', 'complete', 'interrupted']), durationSeconds: NONNEGATIVE_NUMBER,
    errorMessage: z.string().nullable(), trim: TRIM_SCHEMA.nullable(),
    editRecipe: z.object({
        schemaVersion: z.literal(1), timeUnit: z.literal('seconds'), selection: TRIM_SCHEMA,
        preparedTimeZeroSessionSeconds: NONNEGATIVE_NUMBER,
        sources: z.array(z.object({ sourceId: z.string().regex(SAFE_IDENTIFIER), segments: z.array(TIME_SEGMENT_SCHEMA) })),
    }).optional(),
    storageDestination: z.object({ kind: z.literal('directory'), name: z.string() }),
    captureEndSeconds: NONNEGATIVE_NUMBER.nullable().optional(),
    sourceConfiguration: z.array(SOURCE_CONFIGURATION_SCHEMA).optional(),
    tracks: z.array(z.object({
        id: z.string().regex(SAFE_IDENTIFIER), kind: z.enum(['camera', 'screen', 'microphone']), label: z.string(), mimeType: z.string(),
        byteLength: BYTE_COUNT, chunkCount: BYTE_COUNT, startOffsetSeconds: NONNEGATIVE_NUMBER, durationSeconds: NONNEGATIVE_NUMBER,
        width: NONNEGATIVE_NUMBER.nullable(), height: NONNEGATIVE_NUMBER.nullable(), frameRate: NONNEGATIVE_NUMBER.nullable(), isAudioIncluded: z.boolean(),
        audioSourceLabel: z.string().nullable().optional(),
        segments: z.array(TIME_SEGMENT_SCHEMA).optional(),
    })),
});

type DirectoryPickerWindow = Window & {
    showDirectoryPicker?: (options: { mode: 'read' | 'readwrite'; id: string }) => Promise<FileSystemDirectoryHandle>;
};

export function isRecordingDirectorySupported(): boolean {
    return typeof window !== 'undefined' && typeof (window as DirectoryPickerWindow).showDirectoryPicker === 'function';
}

/** Must run in the button gesture. This is a user-visible filesystem directory, never getDirectory()/OPFS. */
export function chooseRecordingDirectory(isReadOnly = false): Promise<FileSystemDirectoryHandle> {
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
    if (!picker) return Promise.reject(new Error('Výběr složky tento prohlížeč nepodporuje. Použijte úložiště prohlížeče.'));
    return picker.call(window, { mode: isReadOnly ? 'read' : 'readwrite', id: 'recording-studio' });
}

export function recordingChunkFilename(trackId: string, sequence: number): string {
    if (!SAFE_IDENTIFIER.test(trackId) || !Number.isSafeInteger(sequence) || sequence < 0) throw new Error('Neplatná část záznamu.');
    return `${trackId}-${String(sequence).padStart(8, '0')}.part`;
}

async function writeDirectoryFile(directory: FileSystemDirectoryHandle, filename: string, data: Blob | string): Promise<void> {
    const handle = await directory.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    try {
        await writable.write(data);
        // close is the commit boundary. A take never leaves a ten-hour writable uncommitted.
        await writable.close();
    } catch (error) {
        await writable.abort().catch(() => undefined);
        throw error;
    }
}

export async function saveDirectoryRecording(directory: FileSystemDirectoryHandle, recording: StudioRecording): Promise<void> {
    await writeDirectoryFile(directory, DIRECTORY_MANIFEST_NAME, JSON.stringify({ schemaVersion: 1, recording }));
}

export async function appendDirectoryRecordingChunk(directory: FileSystemDirectoryHandle, recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    // Immutable chunks avoid createWritable({keepExistingData:true}) copying an ever-growing video.
    await writeDirectoryFile(directory, recordingChunkFilename(trackId, sequence), data);
    // A crash here can leave an unindexed part, but never a manifest advertising an unclosed file.
    await saveDirectoryRecording(directory, recording);
}

export async function readDirectoryRecording(directory: FileSystemDirectoryHandle): Promise<StudioRecording> {
    const manifest = await (await directory.getFileHandle(DIRECTORY_MANIFEST_NAME)).getFile();
    if (manifest.size > MAXIMUM_MANIFEST_BYTES) throw new Error('Soubor popisu záznamu je příliš velký.');
    const content = await manifest.text();
    let envelope: { schemaVersion: 1; recording: StudioRecording };
    try { envelope = z.object({ schemaVersion: z.literal(1), recording: RECORDING_SCHEMA }).parse(JSON.parse(content)); }
    catch { throw new Error('Složka neobsahuje platný popis záznamu. Vyberte podsložku konkrétního záznamu se souborem recording.json.'); }
    if (new Set(envelope.recording.tracks.map((track) => track.id)).size !== envelope.recording.tracks.length) throw new Error('Záznam má duplicitní stopy.');
    if (envelope.recording.tracks.some((track) => track.segments && !isRecordingSegmentMapValid(track.segments))) throw new Error('Záznam obsahuje překrývající se nebo neplatné časové úseky.');
    return envelope.recording;
}

export async function readDirectoryRecordingChunk(directory: FileSystemDirectoryHandle, track: RecordingTrack, sequence: number): Promise<File> {
    return (await directory.getFileHandle(recordingChunkFilename(track.id, sequence))).getFile();
}

/** Requests only access to the already selected recording folder, and only from an explicit reconnect action. */
export async function reconnectRecordingDirectory(directory: FileSystemDirectoryHandle): Promise<void> {
    const handle = directory as FileSystemDirectoryHandle & { requestPermission?: (options: { mode: 'readwrite' }) => Promise<PermissionState> };
    if (handle.requestPermission && await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
        throw new DOMException('Přístup ke složce nebyl povolen.', 'NotAllowedError');
    }
}
