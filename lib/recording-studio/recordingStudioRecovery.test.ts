import 'fake-indexeddb/auto';
import { afterEach, expect, it, vi } from 'vitest';
import { importStudioRecordingDirectory, listStudioRecordings, readRecordingTrack, reconnectStudioRecording, recoverStudioRecordings, streamRecordingTrack } from './recordingStudioStorage';
import { createTestStudioRecording } from './recordingStudioTestUtilities';

afterEach(() => vi.restoreAllMocks());

it('recovers and exports a readable folder when both folder and origin writes fail', async () => {
    const base = createTestStudioRecording();
    const recording = {
        ...base, status: 'recording' as const, storageDestination: { kind: 'directory' as const, name: 'saved-take' },
        tracks: [{ ...base.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 5 }],
    };
    const manifest = new Blob([JSON.stringify({ schemaVersion: 1, recording })]);
    const createWritable = vi.fn().mockRejectedValue(new DOMException('Disk full', 'QuotaExceededError'));
    const directory = {
        name: 'saved-take',
        getFileHandle: async (name: string) => ({ getFile: async () => name === 'recording.json' ? manifest : new Blob(['take']), createWritable }),
    } as unknown as FileSystemDirectoryHandle;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('Origin full', 'QuotaExceededError'); });

    const recovered = await importStudioRecordingDirectory(directory);
    expect(recovered.status).toBe('interrupted');
    expect(recovered.captureEndSeconds).toBeNull();
    expect(recovered.durationSeconds).toBe(5);
    expect(await readRecordingTrack(recovered.id, recovered.tracks[0]).then((blob) => blob.text())).toBe('take');
    expect(await new Response(streamRecordingTrack(recovered.id, recovered.tracks[0])).text()).toBe('take');
    expect(await listStudioRecordings()).toContainEqual(recovered);
    expect(await recoverStudioRecordings()).toContainEqual(recovered);
    expect(await reconnectStudioRecording(recovered.id)).toEqual(recovered);
    expect(createWritable).not.toHaveBeenCalled();
});
