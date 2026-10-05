import { RECORDING_STUDIO_AUTHORITY, rethrowLostRecordingStudioAuthority } from './recordingStudioAuthority';
import { CHUNK_STORE, DIRECTORY_STORE, openRecordingDatabase, readRequest, RECORDING_STORE } from './recordingStudioDatabase';
import { appendDirectoryRecordingChunk, readDirectoryRecording, readDirectoryRecordingChunk, reconnectRecordingDirectory, recordingChunkFilename, saveDirectoryRecording } from './recordingStudioDirectory';
import { addRecordingBytes, getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingDerivedTrack, RecordingMediaPart, RecordingTrack, RecordingTrim, RecordingWorkshopMetadata, StudioRecording } from './recordingStudioTypes';
import { createRecordingEditRecipe, getRecordingMediaParts, getRecordingSessionDuration } from './recordingStudioSessionTime';

/** How many files of a folder are removed while a takeover is held off, so that one never waits for a whole take. */
const DIRECTORY_REMOVAL_BATCH_SIZE = 50;
const DEFAULT_INTERRUPTION_MESSAGE = 'Nahrávání bylo přerušeno. Obnovené jsou pouze potvrzené části; délka chybějícího konce není známá.';
// Retain the authoritative checkpoint for this visit even when the origin cannot cache it.
const RECORDING_DIRECTORIES = new Map<string, { readonly directory: FileSystemDirectoryHandle; readonly recording: StudioRecording }>();

type RecordingChunk = {
    readonly recordingId: string;
    readonly trackId: string;
    readonly sequence: number;
    readonly data: Blob;
};

// Every write below is committed through `RECORDING_STUDIO_AUTHORITY`, which is what makes one ownership out of
// recording, recovery, editing and deletion: the storage refuses all of them alike to a tab which is not the studio.

/** Start a new visit only after acquiring the studio lock; another tab may have edited/deleted cached takes. */
export function resetRecordingDirectoryCache(): void {
    RECORDING_DIRECTORIES.clear();
}

export async function listStudioRecordings(): Promise<StudioRecording[]> {
    const database = await openRecordingDatabase();
    const recordings: StudioRecording[] = await readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).getAll());
    const byId = new Map(recordings.map((recording) => [recording.id, recording]));
    RECORDING_DIRECTORIES.forEach(({ recording }) => byId.set(recording.id, recording));
    return Array.from(byId.values()).sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function readStudioRecording(recordingId: string): Promise<StudioRecording | undefined> {
    const retained = RECORDING_DIRECTORIES.get(recordingId);
    if (retained) return retained.recording;
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).get(recordingId));
}

async function cacheDirectoryRecording(recording: StudioRecording, directory: FileSystemDirectoryHandle): Promise<void> {
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
    // Failure to remember the folder in this browser must never prevent export of its committed media.
    await cacheStudioRecording(recording).catch(rethrowLostRecordingStudioAuthority);
}

export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
    if (recording.storageDestination) {
        const directory = await requireRecordingDirectory(recording);
        // A folder is not part of the database, so its checkpoint is committed while no takeover can happen.
        await RECORDING_STUDIO_AUTHORITY.commit(() => saveDirectoryRecording(directory, recording));
        // The closed folder checkpoint is authoritative. A full origin must not roll it back.
        await cacheDirectoryRecording(recording, directory);
        return;
    }
    await cacheStudioRecording(recording);
}

async function cacheStudioRecording(recording: StudioRecording): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE], (transaction) => {
        transaction.objectStore(RECORDING_STORE).put(recording);
    });
}

/** Chunk and its byte counts commit atomically, so a crash never advertises data that was not saved. */
export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    if (recording.storageDestination) {
        const directory = await requireRecordingDirectory(recording);
        await RECORDING_STUDIO_AUTHORITY.commit(() => appendDirectoryRecordingChunk(directory, recording, trackId, sequence, data));
        await cacheDirectoryRecording(recording, directory);
        return;
    }
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE, CHUNK_STORE], (transaction) => {
        transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data } satisfies RecordingChunk);
        transaction.objectStore(RECORDING_STORE).put(recording);
    });
}

/** Keep disk-backed Blob references; never read the entire recording into an ArrayBuffer. */
export async function readRecordingTrack(recordingId: string, track: RecordingTrack, signal?: AbortSignal): Promise<Blob> {
    const parts = getRecordingMediaParts(track);
    if (parts.length !== 1) throw new Error('Stopa má více samostatných částí. Otevřete konkrétní část nebo stáhněte ZIP s časovým předpisem.');
    return readRecordingPart(recordingId, parts[0], signal);
}

export async function readRecordingPart(recordingId: string, part: RecordingMediaPart, signal?: AbortSignal): Promise<Blob> {
    const parts: Blob[] = [];
    for await (const data of iterateRecordingMedia(recordingId, part.id, part.chunkCount, part.byteLength)) { signal?.throwIfAborted(); parts.push(data); }
    return new Blob(parts, { type: part.mimeType });
}

/** Export reads one persisted chunk at a time, independent of session length. */
async function* iterateRecordingMedia(recordingId: string, storageId: string, chunkCount: number, expectedByteLength: number): AsyncGenerator<Blob> {
    const recording = await readStudioRecording(recordingId);
    if (!recording) throw new Error('Místní záznam není dostupný.');
    const directory = recording.storageDestination ? await requireRecordingDirectory(recording) : null;
    const database = directory ? null : await openRecordingDatabase();
    let byteLength = 0;
    for (let sequence = 0; sequence < chunkCount; sequence += 1) {
        const data = directory ? await readDirectoryRecordingChunk(directory, storageId, sequence) :
            (await readRequest<RecordingChunk | undefined>(database!.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).get([recordingId, storageId, sequence])))?.data;
        if (!data) throw new Error(`Část média „${storageId}“ není úplná. Ponechte uložená data k obnově.`);
        byteLength = addRecordingBytes(byteLength, data.size);
        if (byteLength > expectedByteLength) throw new Error(`Velikost části „${storageId}“ neodpovídá uloženému záznamu.`);
        yield data;
    }
    if (byteLength !== expectedByteLength) throw new Error(`Velikost části „${storageId}“ neodpovídá uloženému záznamu.`);
}

export function streamRecordingTrack(recordingId: string, track: RecordingTrack): ReadableStream<Uint8Array> {
    const parts = getRecordingMediaParts(track);
    if (parts.length !== 1) throw new Error('Stopa má více samostatných částí. Stáhněte jejich originály odděleně.');
    return streamRecordingPart(recordingId, parts[0]);
}

export function streamRecordingPart(recordingId: string, part: RecordingMediaPart): ReadableStream<Uint8Array> {
    const iterator = iterateRecordingMedia(recordingId, part.id, part.chunkCount, part.byteLength);
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
    await RECORDING_STUDIO_AUTHORITY.runTransaction([DIRECTORY_STORE, RECORDING_STORE], (transaction) => {
        transaction.objectStore(DIRECTORY_STORE).put(directory, recording.id);
        transaction.objectStore(RECORDING_STORE).put(recording);
    });
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
}

export async function createStudioRecording(recording: StudioRecording, parentDirectory?: FileSystemDirectoryHandle | null): Promise<StudioRecording> {
    if (!parentDirectory) { await saveStudioRecording(recording); return recording; }
    // The new folder and its first checkpoint appear together, or not at all for a tab which is no longer the studio.
    const { stored, directory } = await RECORDING_STUDIO_AUTHORITY.commit(async () => {
        const createdDirectory = await parentDirectory.getDirectoryHandle(`promptbook-recording-${recording.id}`, { create: true });
        const storedRecording: StudioRecording = { ...recording, storageDestination: { kind: 'directory', name: `${parentDirectory.name}/${createdDirectory.name}` } };
        await saveDirectoryRecording(createdDirectory, storedRecording);
        return { stored: storedRecording, directory: createdDirectory };
    });
    await registerRecordingDirectory(stored, directory);
    return stored;
}

/** The directory checkpoint survives even if the origin's metadata cache is cleared or full. */
export async function importStudioRecordingDirectory(directory: FileSystemDirectoryHandle): Promise<StudioRecording> {
    const recording = { ...recoverRecording(await readDirectoryRecording(directory)), storageDestination: { kind: 'directory' as const, name: directory.name } };
    const existing = (await listStudioRecordings()).find((candidate) => candidate.id === recording.id);
    if (existing && !existing.storageDestination) throw new Error('Toto ID už patří záznamu v prohlížeči.');
    // A folder picked in a tab which has since handed the studio over is not imported behind the new owner's back.
    // Asking the storage would need a write, which a full disk refuses, and reading a folder must survive that.
    RECORDING_STUDIO_AUTHORITY.assertHeld();
    // Recovery is read-only in the folder: a full disk or revoked write access must still allow reading.
    RECORDING_DIRECTORIES.set(recording.id, { recording, directory });
    await registerRecordingDirectory(recording, directory).catch(rethrowLostRecordingStudioAuthority);
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

export async function editStudioRecording(recording: StudioRecording, title: string, trim: RecordingTrim,
    derivedTracks = recording.derivedTracks ?? [] as readonly RecordingDerivedTrack[],
    workshopMetadata: RecordingWorkshopMetadata | undefined = recording.workshopMetadata): Promise<StudioRecording> {
    validateRecordingTrim(trim, getRecordingSessionDuration(recording));
    if (!title.trim()) throw new Error('Vyplňte název záznamu.');
    const updated = { ...recording, title: title.trim(), trim, editRecipe: createRecordingEditRecipe(recording, trim), derivedTracks, workshopMetadata };
    await saveStudioRecording(updated);
    return updated;
}

export async function deleteStudioRecording(recordingId: string): Promise<void> {
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
        const filenames = checkpoint.tracks.flatMap((track) => getRecordingMediaParts(track).flatMap((part) =>
            Array.from({ length: part.chunkCount }, (_, sequence) => recordingChunkFilename(part.id, sequence))));
        // The checkpoint goes last, so a deletion which is cut short still says which recording the folder holds.
        filenames.push('recording.json');
        for (let index = 0; index < filenames.length; index += DIRECTORY_REMOVAL_BATCH_SIZE) {
            const batch = filenames.slice(index, index + DIRECTORY_REMOVAL_BATCH_SIZE);
            await RECORDING_STUDIO_AUTHORITY.commit(async () => {
                for (const filename of batch) await directory.removeEntry(filename).catch(ignoreMissingFile);
            });
        }
    }
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE, CHUNK_STORE, DIRECTORY_STORE], (transaction) => {
        transaction.objectStore(RECORDING_STORE).delete(recordingId);
        transaction.objectStore(DIRECTORY_STORE).delete(recordingId);
        // Every chunk key begins with its recording, and an array sorts after any track identity which can follow it.
        transaction.objectStore(CHUNK_STORE).delete(IDBKeyRange.bound([recordingId], [recordingId, []]));
    });
    RECORDING_DIRECTORIES.delete(recordingId);
}

/**
 * Turns every take which was still being recorded into an interrupted one
 *
 * Note: Only called by the tab which has just become the studio, after the previous one released the lock or lost
 *       its right to write; it never interrupts a capture which can still be finished.
 *
 * @param interruptionMessage why those takes were cut short, when the new studio knows more than that they were
 */
export async function recoverStudioRecordings(interruptionMessage = DEFAULT_INTERRUPTION_MESSAGE): Promise<StudioRecording[]> {
    const recordings = await listStudioRecordings();
    return Promise.all(recordings.map(async (recording) => {
        if (recording.storageDestination) {
            try {
                const directory = await requireRecordingDirectory(recording);
                const recovered = recoverRecording(await readDirectoryRecording(directory), interruptionMessage);
                if (recovered.id !== recording.id) throw new Error('Složka obsahuje jiný záznam.');
                await cacheDirectoryRecording(recovered, directory);
                return recovered;
            } catch (error) {
                rethrowLostRecordingStudioAuthority(error);
                return { ...recoverRecording(recording, interruptionMessage), errorMessage: 'Složka není přístupná. Připojte ji znovu pro ověření uložených částí a export.' };
            }
        }
        if (recording.status !== 'recording') return recording;
        const recovered = recoverRecording(recording, interruptionMessage);
        // Full storage may reject even metadata. Still offer the committed chunks in this visit.
        await cacheStudioRecording(recovered).catch(rethrowLostRecordingStudioAuthority);
        return recovered;
    }));
}

function recoverRecording(recording: StudioRecording, interruptionMessage = DEFAULT_INTERRUPTION_MESSAGE): StudioRecording {
    if (recording.status !== 'recording') return recording;
    return {
        ...recording, status: 'interrupted', durationSeconds: recording.takes?.length
            ? getRecordingSessionDuration(recording) : getCommonRecordingDuration(recording.tracks), captureEndSeconds: null,
        errorMessage: interruptionMessage,
    };
}

function ignoreMissingFile(error: unknown): void {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
}
