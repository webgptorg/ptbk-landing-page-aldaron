import 'fake-indexeddb/auto';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { importStudioRecordingDirectory, listStudioRecordings, readRecordingTrack, reconnectStudioRecording, recoverStudioRecordings, saveStudioRecording, streamRecordingTrack } from './recordingStudioStorage';
import { claimTestRecordingStudioAuthority, createTestStudioRecording } from './recordingStudioTestUtilities';

// Becoming the studio is the one write these tests need to succeed; everything after it may be refused.
beforeEach(async () => { await claimTestRecordingStudioAuthority(); });
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

it('keeps the appended project clock when an intentionally absent source has no later media', async () => {
    const base = createTestStudioRecording();
    const originalTrack = { ...base.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 4 };
    const appendedTrack = { ...originalTrack, id: `${originalTrack.id}-added`, startOffsetSeconds: 4, durationSeconds: 2,
        parts: [{ id: 'appended-part', takeId: 'second-take', sessionStartSeconds: 4, durationSeconds: 2,
            byteLength: 4, chunkCount: 1, mimeType: originalTrack.mimeType }] };
    const recording = { ...base, id: 'recovered-appended-project', status: 'recording' as const,
        durationSeconds: 6, tracks: [originalTrack, appendedTrack],
        takes: [{ id: 'first-take', startedAt: base.createdAt, sessionStartSeconds: 0, durationSeconds: 4, sourceIds: [originalTrack.id] },
            { id: 'second-take', startedAt: base.createdAt, sessionStartSeconds: 4, durationSeconds: 2, sourceIds: [appendedTrack.id] }] };
    await saveStudioRecording(recording);
    const recovered = (await recoverStudioRecordings()).find((item) => item.id === recording.id);
    expect(recovered?.status).toBe('interrupted');
    expect(recovered?.durationSeconds).toBe(6);
    expect(recovered?.takes).toEqual(recording.takes);
});
