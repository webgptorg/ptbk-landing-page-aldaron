import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createTestStudioRecording } from './recordingStudioTestUtilities';

const DATABASE_NAME = 'promptbook-recording-studio';
let factory: IDBFactory;

beforeEach(() => {
    factory = new IDBFactory();
    vi.stubGlobal('indexedDB', factory); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
});
afterEach(() => vi.unstubAllGlobals());

/** Builds the database the way an earlier version of the studio left it, and closes it again. */
async function seedEarlierDatabase(version: number, laterStoreNames: readonly string[], write: (transaction: IDBTransaction) => void): Promise<void> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open(DATABASE_NAME, version);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('recordings', { keyPath: 'id' });
            request.result.createObjectStore('chunks', { keyPath: ['recordingId', 'trackId', 'sequence'] }).createIndex('recordingId', 'recordingId');
            laterStoreNames.forEach((storeName) => request.result.createObjectStore(storeName));
        };
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(Array.from(database.objectStoreNames), 'readwrite');
        write(transaction);
        transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error);
    });
    database.close();
}

/** Loads the studio as a tab which was just opened does, without the connection of the case before it. */
async function openStudioModules() {
    vi.resetModules();
    const [storage, { claimTestRecordingStudioAuthority }] = await Promise.all([import('./recordingStudioStorage'), import('./recordingStudioTestUtilities')]);
    return { storage, claimTestRecordingStudioAuthority };
}

/** Looks at the schema the studio left behind, the way a tab which does not own it looks. */
async function readUpgradedSchema(): Promise<{ readonly version: number; readonly storeNames: string[] }> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open(DATABASE_NAME);
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    try { return { version: database.version, storeNames: Array.from(database.objectStoreNames) }; }
    finally { database.close(); }
}

it('upgrades the original IndexedDB format without losing media or trim and streams its bytes', async () => {
    const base = createTestStudioRecording();
    const recording = { ...base, trim: { startSeconds: 1, endSeconds: 5 }, tracks: [{ ...base.tracks[0], chunkCount: 2, byteLength: 6 }] };
    await seedEarlierDatabase(1, [], (transaction) => {
        transaction.objectStore('recordings').put(recording);
        ['abc', 'def'].forEach((text, sequence) => transaction.objectStore('chunks').put({ recordingId: recording.id, trackId: recording.tracks[0].id, sequence, data: new Blob([text]) }));
    });
    const { storage, claimTestRecordingStudioAuthority } = await openStudioModules();
    expect(await storage.listStudioRecordings()).toEqual([recording]);
    await claimTestRecordingStudioAuthority();
    expect(await (await storage.readRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('abcdef');
    expect(await new Response(storage.streamRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('abcdef');
    const edited = await storage.editStudioRecording(recording, 'Same stable recording', { startSeconds: 2, endSeconds: 4 });
    const reloaded = await storage.readStudioRecording(recording.id);
    expect(reloaded).toEqual(edited);
    expect(reloaded?.editRecipe).toMatchObject({ schemaVersion: 1, selection: { startSeconds: 2, endSeconds: 4 }, preparedTimeZeroSessionSeconds: 2 });
    expect(reloaded?.editRecipe?.sources[0].sourceId).toBe(recording.tracks[0].id);
    expect(await new Response(storage.streamRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('abcdef');
    await storage.deleteStudioRecording(recording.id);
    expect(await storage.listStudioRecordings()).toEqual([]);
});

it('forgets a take which was recorded into a folder and keeps every take recorded into the browser', async () => {
    const base = createTestStudioRecording();
    const browserRecording = { ...base, id: 'browser-take', tracks: [{ ...base.tracks[0], chunkCount: 2, byteLength: 6 }] };
    // Its media was only ever in the folder; here it left a copy of its description and the handle of that folder.
    const folderRecordings = (['complete', 'recording'] as const).map((status) => ({
        ...base, id: `folder-take-${status}`, status, storageDestination: { kind: 'directory', name: `Recordings/promptbook-recording-folder-take-${status}` },
        tracks: [{ ...base.tracks[0], chunkCount: 1, byteLength: 4 }],
    }));
    await seedEarlierDatabase(3, ['directories', 'authority'], (transaction) => {
        [browserRecording, ...folderRecordings].forEach((recording) => transaction.objectStore('recordings').put(recording));
        ['abc', 'def'].forEach((text, sequence) => transaction.objectStore('chunks').put({ recordingId: browserRecording.id, trackId: browserRecording.tracks[0].id, sequence, data: new Blob([text]) }));
        folderRecordings.forEach((recording) => transaction.objectStore('directories').put({ kind: 'directory', name: recording.storageDestination.name }, recording.id));
        transaction.objectStore('authority').put({ generation: 5, ownerInstanceId: 'previous-studio', claimedAt: 1 }, 'owner');
    });

    const { storage, claimTestRecordingStudioAuthority } = await openStudioModules();
    expect(await storage.listStudioRecordings()).toEqual([browserRecording]);
    expect(await readUpgradedSchema()).toEqual({ version: 4, storeNames: ['authority', 'chunks', 'recordings'] });
    // The right to write goes on from where the previous studio left it, so a tab it had fenced stays fenced.
    expect(await claimTestRecordingStudioAuthority()).toMatchObject({ generation: 6 });
    // Starting the studio neither fails over such a take nor brings it back as one to reconnect.
    expect(await storage.recoverStudioRecordings()).toEqual([browserRecording]);
    for (const { id } of folderRecordings) expect(await storage.readStudioRecording(id)).toBeUndefined();
    expect(await (await storage.readRecordingTrack(browserRecording.id, browserRecording.tracks[0])).text()).toBe('abcdef');
    expect(await new Response(storage.streamRecordingTrack(browserRecording.id, browserRecording.tracks[0])).text()).toBe('abcdef');
});

it('gives a fresh installation no store for folders at all', async () => {
    const { storage } = await openStudioModules();
    expect(await storage.listStudioRecordings()).toEqual([]);
    expect(await readUpgradedSchema()).toEqual({ version: 4, storeNames: ['authority', 'chunks', 'recordings'] });
});

it.each([2, 3])('forgets orphaned directory metadata without a handle store in schema %i', async (version) => {
    const base = createTestStudioRecording();
    const browserRecording = { ...base, id: 'browser-take', tracks: [{ ...base.tracks[0], chunkCount: 1, byteLength: 4 }] };
    await seedEarlierDatabase(version, version === 3 ? ['authority'] : [], (transaction) => {
        transaction.objectStore('recordings').put(browserRecording);
        transaction.objectStore('recordings').put({ ...base, id: 'orphaned-directory-take', status: 'recording',
            storageDestination: { kind: 'directory', name: 'Retired' } });
        transaction.objectStore('chunks').put({ recordingId: browserRecording.id, trackId: browserRecording.tracks[0].id,
            sequence: 0, data: new Blob(['take']) });
    });

    const { storage, claimTestRecordingStudioAuthority } = await openStudioModules();
    await claimTestRecordingStudioAuthority();
    expect(await storage.recoverStudioRecordings()).toEqual([browserRecording]);
    expect(await storage.readStudioRecording('orphaned-directory-take')).toBeUndefined();
    expect(await (await storage.readRecordingTrack(browserRecording.id, browserRecording.tracks[0])).text()).toBe('take');
});

it('preserves IndexedDB media with unrelated metadata and leaves other stores untouched', async () => {
    const base = createTestStudioRecording();
    const recordings = [null, {}, { kind: 'indexeddb' }, 'unrelated'].map((storageDestination, index) => ({
        ...base, id: `browser-take-${index}`, storageDestination,
        tracks: [{ ...base.tracks[0], chunkCount: 1, byteLength: 4 }],
    }));
    await seedEarlierDatabase(3, ['directories', 'authority', 'unrelated'], (transaction) => {
        for (const recording of recordings) {
            transaction.objectStore('recordings').put(recording);
            transaction.objectStore('chunks').put({ recordingId: recording.id, trackId: recording.tracks[0].id,
                sequence: 0, data: new Blob(['take']) });
        }
        transaction.objectStore('unrelated').put('Keep this data', 'unrelated-key');
    });

    const { storage } = await openStudioModules();
    expect(await storage.listStudioRecordings()).toEqual(recordings);
    for (const recording of recordings) {
        expect(await (await storage.readRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('take');
    }
    const { openRecordingDatabase, readRequest } = await import('./recordingStudioDatabase');
    const database = await openRecordingDatabase();
    expect(await readRequest(database.transaction('unrelated').objectStore('unrelated').get('unrelated-key'))).toBe('Keep this data');
});
