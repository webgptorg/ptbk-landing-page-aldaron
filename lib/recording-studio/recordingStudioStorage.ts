import { RECORDING_STUDIO_AUTHORITY, rethrowLostRecordingStudioAuthority } from './recordingStudioAuthority';
import { CHUNK_STORE, openRecordingDatabase, readRequest, RECORDING_STORE, STUDIO_PROJECT_STORE, STUDIO_ASSET_STORE } from './recordingStudioDatabase';
import { addRecordingBytes, getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingDerivedTrack, RecordingMediaPart, RecordingTrack, RecordingTrim, RecordingWorkshopMetadata, StudioRecording } from './recordingStudioTypes';
import { createRecordingEditRecipe, getRecordingMediaParts, getRecordingSessionDuration } from './recordingStudioSessionTime';

const DEFAULT_INTERRUPTION_MESSAGE = 'Nahrávání bylo přerušeno. Obnovené jsou pouze potvrzené části; délka chybějícího konce není známá.';

type RecordingChunk = {
    readonly recordingId: string;
    readonly trackId: string;
    readonly sequence: number;
    readonly data: Blob;
};

// Every write below is committed through `RECORDING_STUDIO_AUTHORITY`, which is what makes one ownership out of
// recording, recovery, editing and deletion: the storage refuses all of them alike to a tab which is not the studio.

export async function listStudioRecordings(): Promise<StudioRecording[]> {
    const database = await openRecordingDatabase();
    const recordings: StudioRecording[] = await readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).getAll());
    return recordings.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function readStudioRecording(recordingId: string): Promise<StudioRecording | undefined> {
    const database = await openRecordingDatabase();
    return readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).get(recordingId));
}

/** Saves the description of a take, whether that take is new or already has media. */
export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE], (transaction) => {
        transaction.objectStore(RECORDING_STORE).put(recording);
    });
}

/** Chunk and its byte counts commit atomically, so a crash never advertises data that was not saved. */
export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE, CHUNK_STORE], (transaction) => {
        const part = recording.tracks.flatMap(getRecordingMediaParts).find((candidate) => candidate.id === trackId);
        const byteStart = (part?.byteLength ?? recording.tracks.find((track) => track.id === trackId)?.byteLength ?? data.size) - data.size;
        transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data, byteStart });
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
    const database = await openRecordingDatabase();
    let byteLength = 0;
    for (let sequence = 0; sequence < chunkCount; sequence += 1) {
        const chunk = await readRequest<RecordingChunk | undefined>(database.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).get([recordingId, storageId, sequence]));
        if (!chunk) throw new Error(`Část média „${storageId}“ není úplná. Ponechte uložená data k obnově.`);
        byteLength = addRecordingBytes(byteLength, chunk.data.size);
        if (byteLength > expectedByteLength) throw new Error(`Velikost části „${storageId}“ neodpovídá uloženému záznamu.`);
        yield chunk.data;
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

export async function editStudioRecording(recording: StudioRecording, title: string, trim: RecordingTrim,
    derivedTracks = recording.derivedTracks ?? [] as readonly RecordingDerivedTrack[],
    workshopMetadata: RecordingWorkshopMetadata | undefined = recording.workshopMetadata): Promise<StudioRecording> {
    validateRecordingTrim(trim, getRecordingSessionDuration(recording));
    if (!title.trim()) throw new Error('Vyplňte název záznamu.');
    const updated = { ...recording, title: title.trim(), trim, editRecipe: createRecordingEditRecipe(recording, trim), derivedTracks, workshopMetadata };
    await saveStudioRecording(updated);
    return updated;
}

/** The take and every chunk of its media go in one transaction, so neither can be left behind without the other. */
export async function deleteStudioRecording(recordingId: string): Promise<void> {
    let isReferenced = false;
    await RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE, CHUNK_STORE, STUDIO_PROJECT_STORE, STUDIO_ASSET_STORE], (transaction) => {
        const assets = transaction.objectStore(STUDIO_ASSET_STORE).getAll();
        assets.onsuccess = () => {
            const referencedAssetIds = new Set(assets.result.filter((asset) => asset.original?.kind === 'recording' && asset.original.recordingId === recordingId).map((asset) => asset.id));
            const projects = transaction.objectStore(STUDIO_PROJECT_STORE).getAll();
            projects.onsuccess = () => {
                isReferenced = projects.result.some((project) => project.clips.some((clip: { assetId: string }) => referencedAssetIds.has(clip.assetId)));
                if (isReferenced) return;
                transaction.objectStore(RECORDING_STORE).delete(recordingId);
                transaction.objectStore(CHUNK_STORE).delete(IDBKeyRange.bound([recordingId], [recordingId, []]));
            };
        };
    }, true);
    if (isReferenced) throw new Error('Záznam používá projekt Střižny. Nejdříve odstraňte jeho odkazy z projektů; zdrojová média se při střihu nemažou.');
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
        if (recording.status !== 'recording') return recording;
        const recovered = interruptRecording(recording, interruptionMessage);
        // Full storage may reject even metadata. Still offer the committed chunks in this visit.
        await saveStudioRecording(recovered).catch(rethrowLostRecordingStudioAuthority);
        return recovered;
    }));
}

/** What is left of a take nobody is recording any more: its committed media, and an end which is not known. */
function interruptRecording(recording: StudioRecording, interruptionMessage: string): StudioRecording {
    return {
        ...recording, status: 'interrupted', durationSeconds: recording.takes?.length
            ? getRecordingSessionDuration(recording) : getCommonRecordingDuration(recording.tracks), captureEndSeconds: null,
        errorMessage: interruptionMessage,
    };
}
