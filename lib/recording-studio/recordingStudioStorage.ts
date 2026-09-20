import { getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingStorageEstimate, RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';

const RECORDING_DATABASE_NAME = 'promptbook-recording-studio';
const RECORDING_DATABASE_VERSION = 1;
const RECORDING_STORE = 'recordings';
const CHUNK_STORE = 'chunks';

type RecordingChunk = {
    readonly recordingId: string;
    readonly trackId: string;
    readonly sequence: number;
    readonly data: Blob;
};

let databasePromise: Promise<IDBDatabase> | null = null;

function openRecordingDatabase(): Promise<IDBDatabase> {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(RECORDING_DATABASE_NAME, RECORDING_DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            database.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
            const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: ['recordingId', 'trackId', 'sequence'] });
            chunks.createIndex('recordingId', 'recordingId');
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
    return recordings.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction(RECORDING_STORE, 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Chunk and its byte counts commit atomically, so a crash never advertises data that was not saved. */
export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data } satisfies RecordingChunk);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Keep disk-backed Blob references; never read the entire recording into an ArrayBuffer. */
export async function readRecordingTrack(recordingId: string, track: RecordingTrack): Promise<Blob> {
    const database = await openRecordingDatabase();
    const range = IDBKeyRange.bound([recordingId, track.id, 0], [recordingId, track.id, Number.MAX_SAFE_INTEGER]);
    const chunks: RecordingChunk[] = await readRequest(database.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).getAll(range));
    if (chunks.length !== track.chunkCount || chunks.some((chunk, index) => chunk.sequence !== index)) {
        throw new Error(`Stopa „${track.label}“ není úplná. Ponechte uložená data v prohlížeči.`);
    }
    const blob = new Blob(chunks.map((chunk) => chunk.data), { type: track.mimeType });
    if (blob.size !== track.byteLength) throw new Error(`Velikost stopy „${track.label}“ neodpovídá uloženému záznamu.`);
    return blob;
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
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).delete(recordingId);
    const request = transaction.objectStore(CHUNK_STORE).index('recordingId').openCursor(IDBKeyRange.only(recordingId));
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
    };
    await completion;
}

/** Only called while the browser-wide studio lock is held; never interrupts another tab's capture. */
export async function recoverStudioRecordings(): Promise<StudioRecording[]> {
    const recordings = await listStudioRecordings();
    return Promise.all(recordings.map(async (recording) => {
        if (recording.status !== 'recording') return recording;
        const recovered: StudioRecording = {
            ...recording, status: 'interrupted', durationSeconds: getCommonRecordingDuration(recording.tracks),
            errorMessage: 'Nahrávání bylo přerušeno. Obnovené jsou pouze části, které prohlížeč stihl uložit.',
        };
        await saveStudioRecording(recovered);
        return recovered;
    }));
}

export async function estimateRecordingStorage(): Promise<RecordingStorageEstimate> {
    const [estimate, isPersistent] = await Promise.all([
        navigator.storage?.estimate?.().catch(() => null), navigator.storage?.persisted?.().catch(() => false),
    ]);
    return {
        availableBytes: estimate?.quota === undefined || estimate.usage === undefined ? null : Math.max(0, estimate.quota - estimate.usage),
        quotaBytes: estimate?.quota ?? null,
        isPersistent: isPersistent ?? false,
    };
}
