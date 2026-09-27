import { appendDirectoryRecordingChunk, readDirectoryRecording, readDirectoryRecordingChunk, reconnectRecordingDirectory, recordingChunkFilename, saveDirectoryRecording } from './recordingStudioDirectory';
import { addRecordingBytes, getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';

const RECORDING_DATABASE_NAME = 'promptbook-recording-studio';
const RECORDING_DATABASE_VERSION = 2;
const RECORDING_STORE = 'recordings';
const CHUNK_STORE = 'chunks';
const DIRECTORY_STORE = 'directories';
// Retain the authoritative checkpoint for this visit even when the origin cannot cache it.
const RECORDING_DIRECTORIES = new Map<string, { readonly directory: FileSystemDirectoryHandle; readonly recording: StudioRecording }>();

type RecordingChunk = {
    readonly recordingId: string;
    readonly trackId: string;
    readonly sequence: number;
    readonly data: Blob;
};

let databasePromise: Promise<IDBDatabase> | null = null;

/** Start a new visit only after acquiring the studio lock; another tab may have edited/deleted cached takes. */
export function resetRecordingDirectoryCache(): void {
    RECORDING_DIRECTORIES.clear();
}

function openRecordingDatabase(): Promise<IDBDatabase> {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(RECORDING_DATABASE_NAME, RECORDING_DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(RECORDING_STORE)) database.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
            if (!database.objectStoreNames.contains(CHUNK_STORE)) {
                const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: ['recordingId', 'trackId', 'sequence'] });
                chunks.createIndex('recordingId', 'recordingId');
            }
            if (!database.objectStoreNames.contains(DIRECTORY_STORE)) database.createObjectStore(DIRECTORY_STORE);
        };
        request.onsuccess = () => {
            request.result.onversionchange = () => { request.result.close(); databasePromise = null; };
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Zavřete ostatní karty nahrávacího studia a zkuste stránku obnovit.'));
    });
    void databasePromise.catch(() => { databasePromise = null; });
    return databasePromise;
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error ?? new Error('Uložení do prohlížeče se nezdařilo.'));
        transaction.onerror = () => reject(transaction.error);
    });
}

function readRequest<Result>(request: IDBRequest<Result>): Promise<Result> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function listStudioRecordings(): Promise<StudioRecording[]> {
    const database = await openRecordingDatabase();
    const recordings: StudioRecording[] = await readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).getAll());
    const byId = new Map(recordings.map((recording) => [recording.id, recording]));
    RECORDING_DIRECTORIES.forEach(({ recording }) => byId.set(recording.id, recording));
    return Array.from(byId.values()).sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

async function readStudioRecording(recordingId: string): Promise<StudioRecording | undefined> {
    const retained = RECORDING_DIRECTORIES.get(recordingId);
    if (retained) return retained.recording;
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).get(recordingId));
}

async function cacheDirectoryRecording(recording: StudioRecording, directory: FileSystemDirectoryHandle): Promise<void> {
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
    // Failure to remember the folder in this browser must never prevent export of its committed media.
    await cacheStudioRecording(recording).catch(() => undefined);
}

export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
    if (recording.storageDestination) {
        const directory = await requireRecordingDirectory(recording);
        await saveDirectoryRecording(directory, recording);
        // The closed folder checkpoint is authoritative. A full origin must not roll it back.
        await cacheDirectoryRecording(recording, directory);
        return;
    }
    await cacheStudioRecording(recording);
}

async function cacheStudioRecording(recording: StudioRecording): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction(RECORDING_STORE, 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Chunk and its byte counts commit atomically, so a crash never advertises data that was not saved. */
export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    if (recording.storageDestination) {
        const directory = await requireRecordingDirectory(recording);
        await appendDirectoryRecordingChunk(directory, recording, trackId, sequence, data);
        await cacheDirectoryRecording(recording, directory);
        return;
    }
    const database = await openRecordingDatabase();
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data } satisfies RecordingChunk);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Keep disk-backed Blob references; never read the entire recording into an ArrayBuffer. */
export async function readRecordingTrack(recordingId: string, track: RecordingTrack, signal?: AbortSignal): Promise<Blob> {
    const parts: Blob[] = [];
    for await (const data of iterateRecordingTrack(recordingId, track)) { signal?.throwIfAborted(); parts.push(data); }
    return new Blob(parts, { type: track.mimeType });
}

/** Export reads one persisted chunk at a time, independent of session length. */
async function* iterateRecordingTrack(recordingId: string, track: RecordingTrack): AsyncGenerator<Blob> {
    const recording = await readStudioRecording(recordingId);
    if (!recording) throw new Error('Místní záznam není dostupný.');
    const directory = recording.storageDestination ? await requireRecordingDirectory(recording) : null;
    const database = directory ? null : await openRecordingDatabase();
    let byteLength = 0;
    for (let sequence = 0; sequence < track.chunkCount; sequence += 1) {
        const data = directory ? await readDirectoryRecordingChunk(directory, track, sequence) :
            (await readRequest<RecordingChunk | undefined>(database!.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).get([recordingId, track.id, sequence])))?.data;
        if (!data) throw new Error(`Stopa „${track.label}“ není úplná. Ponechte uložená data k obnově.`);
        byteLength = addRecordingBytes(byteLength, data.size);
        if (byteLength > track.byteLength) throw new Error(`Velikost stopy „${track.label}“ neodpovídá uloženému záznamu.`);
        yield data;
    }
    if (byteLength !== track.byteLength) throw new Error(`Velikost stopy „${track.label}“ neodpovídá uloženému záznamu.`);
}

export function streamRecordingTrack(recordingId: string, track: RecordingTrack): ReadableStream<Uint8Array> {
    const iterator = iterateRecordingTrack(recordingId, track);
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    return new ReadableStream({
        async pull(controller) {
            try {
                for (;;) {
                    if (!reader) {
                        const part = await iterator.next();
                        if (part.done) { controller.close(); return; }
                        reader = part.value.stream().getReader();
                    }
                    const result = await reader.read();
                    if (!result.done) { controller.enqueue(result.value); return; }
                    reader.releaseLock(); reader = null;
                }
            } catch (error) { controller.error(error); }
        },
        async cancel() { await reader?.cancel(); await iterator.return(undefined); },
    });
}

async function requireRecordingDirectory(recording: StudioRecording): Promise<FileSystemDirectoryHandle> {
    const retained = RECORDING_DIRECTORIES.get(recording.id);
    if (retained) return retained.directory;
    const database = await openRecordingDatabase();
    const directory = await readRequest<FileSystemDirectoryHandle | undefined>(database.transaction(DIRECTORY_STORE).objectStore(DIRECTORY_STORE).get(recording.id));
    if (!directory) throw new Error('Připojte znovu složku záznamu.');
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
    return directory;
}

async function registerRecordingDirectory(recording: StudioRecording, directory: FileSystemDirectoryHandle): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction([DIRECTORY_STORE, RECORDING_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(DIRECTORY_STORE).put(directory, recording.id);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
}

export async function createStudioRecording(recording: StudioRecording, parentDirectory?: FileSystemDirectoryHandle | null): Promise<StudioRecording> {
    if (!parentDirectory) { await saveStudioRecording(recording); return recording; }
    const directory = await parentDirectory.getDirectoryHandle(`promptbook-recording-${recording.id}`, { create: true });
    const stored: StudioRecording = { ...recording, storageDestination: { kind: 'directory', name: `${parentDirectory.name}/${directory.name}` } };
    await saveDirectoryRecording(directory, stored);
    await registerRecordingDirectory(stored, directory);
    return stored;
}

/** The directory checkpoint survives even if the origin's metadata cache is cleared or full. */
export async function importStudioRecordingDirectory(directory: FileSystemDirectoryHandle): Promise<StudioRecording> {
    const recording = { ...recoverRecording(await readDirectoryRecording(directory)), storageDestination: { kind: 'directory' as const, name: directory.name } };
    const existing = (await listStudioRecordings()).find((candidate) => candidate.id === recording.id);
    if (existing && !existing.storageDestination) throw new Error('Toto ID už patří záznamu v prohlížeči.');
    // Recovery is read-only in the folder: a full disk or revoked write access must still allow reading.
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
    await registerRecordingDirectory(recording, directory).catch(() => undefined);
    return recording;
}

export async function reconnectStudioRecording(recordingId: string): Promise<StudioRecording> {
    const recording = await readStudioRecording(recordingId);
    if (!recording?.storageDestination) throw new Error('Složka záznamu není dostupná.');
    const directory = await requireRecordingDirectory(recording);
    await reconnectRecordingDirectory(directory);
    if ((await readDirectoryRecording(directory)).id !== recordingId) throw new Error('Složka obsahuje jiný záznam.');
    return importStudioRecordingDirectory(directory);
}

export async function editStudioRecording(recording: StudioRecording, title: string, trim: RecordingTrim): Promise<StudioRecording> {
    validateRecordingTrim(trim, recording.durationSeconds);
    if (!title.trim()) throw new Error('Vyplňte název záznamu.');
    const updated = { ...recording, title: title.trim(), trim };
    await saveStudioRecording(updated);
    return updated;
}

export async function deleteStudioRecording(recordingId: string): Promise<void> {
    const database = await openRecordingDatabase();
    const recording = await readStudioRecording(recordingId);
    if (recording?.storageDestination) {
        const directory = await requireRecordingDirectory(recording);
        // The IndexedDB cache may lag after an origin quota error. Delete the authoritative committed set.
        const checkpoint = await readDirectoryRecording(directory).catch((error: unknown) => {
            ignoreMissingFile(error);
            return recording;
        });
        if (checkpoint.id !== recordingId) throw new Error('Složka obsahuje jiný záznam. Nejprve ji znovu připojte.');
        // Delete only files the manifest owns. Never recursively delete a user-selected folder.
        for (const track of checkpoint.tracks) {
            for (let sequence = 0; sequence < track.chunkCount; sequence += 1) {
                await directory.removeEntry(recordingChunkFilename(track.id, sequence)).catch(ignoreMissingFile);
            }
        }
        await directory.removeEntry('recording.json').catch(ignoreMissingFile);
    }
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE, DIRECTORY_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).delete(recordingId);
    transaction.objectStore(DIRECTORY_STORE).delete(recordingId);
    const request = transaction.objectStore(CHUNK_STORE).index('recordingId').openCursor(IDBKeyRange.only(recordingId));
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
    };
    await completion;
    RECORDING_DIRECTORIES.delete(recordingId);
}

/** Only called while the browser-wide studio lock is held; never interrupts another tab's capture. */
export async function recoverStudioRecordings(): Promise<StudioRecording[]> {
    const recordings = await listStudioRecordings();
    return Promise.all(recordings.map(async (recording) => {
        if (recording.storageDestination) {
            try {
                const directory = await requireRecordingDirectory(recording);
                const recovered = recoverRecording(await readDirectoryRecording(directory));
                if (recovered.id !== recording.id) throw new Error('Složka obsahuje jiný záznam.');
                await cacheDirectoryRecording(recovered, directory);
                return recovered;
            } catch {
                return { ...recoverRecording(recording), errorMessage: 'Složka není přístupná. Připojte ji znovu pro ověření uložených částí a export.' };
            }
        }
        if (recording.status !== 'recording') return recording;
        const recovered = recoverRecording(recording);
        // Full storage may reject even metadata. Still offer the committed chunks in this visit.
        await cacheStudioRecording(recovered).catch(() => undefined);
        return recovered;
    }));
}

function recoverRecording(recording: StudioRecording): StudioRecording {
    if (recording.status !== 'recording') return recording;
    return {
        ...recording, status: 'interrupted', durationSeconds: getCommonRecordingDuration(recording.tracks), captureEndSeconds: null,
        errorMessage: 'Nahrávání bylo přerušeno. Obnovené jsou pouze potvrzené části; délka chybějícího konce není známá.',
    };
}

function ignoreMissingFile(error: unknown): void {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
}
