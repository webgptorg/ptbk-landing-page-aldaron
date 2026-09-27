import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, expect, it, vi } from 'vitest';
import { createTestStudioRecording } from './recordingStudioTestUtilities';

afterEach(() => vi.unstubAllGlobals());

it('upgrades the original IndexedDB format without losing media or trim and streams its bytes', async () => {
    const factory = new IDBFactory();
    vi.stubGlobal('indexedDB', factory); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open('promptbook-recording-studio', 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('recordings', { keyPath: 'id' });
            request.result.createObjectStore('chunks', { keyPath: ['recordingId', 'trackId', 'sequence'] }).createIndex('recordingId', 'recordingId');
        };
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const base = createTestStudioRecording();
    const recording = { ...base, trim: { startSeconds: 1, endSeconds: 5 }, tracks: [{ ...base.tracks[0], chunkCount: 2, byteLength: 6 }] };
    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(['recordings', 'chunks'], 'readwrite');
        transaction.objectStore('recordings').put(recording);
        ['abc', 'def'].forEach((text, sequence) => transaction.objectStore('chunks').put({ recordingId: recording.id, trackId: recording.tracks[0].id, sequence, data: new Blob([text]) }));
        transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error);
    });
    database.close();
    const storage = await import('./recordingStudioStorage');
    expect(await storage.listStudioRecordings()).toEqual([recording]);
    expect(await (await storage.readRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('abcdef');
    expect(await new Response(storage.streamRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('abcdef');
    await storage.deleteStudioRecording(recording.id);
    expect(await storage.listStudioRecordings()).toEqual([]);
});
