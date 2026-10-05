import 'fake-indexeddb/auto';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { appendRecordingChunk, readRecordingTrack, readStudioRecording, recoverStudioRecordings, saveStudioRecording, streamRecordingTrack } from './recordingStudioStorage';
import { claimTestRecordingStudioAuthority, createTestStudioRecording } from './recordingStudioTestUtilities';

// Becoming the studio is the one write these tests need to succeed; everything after it may be refused.
beforeEach(async () => { await claimTestRecordingStudioAuthority(); });
afterEach(() => vi.restoreAllMocks());

it('recovers and exports the committed chunks of a take when the origin refuses to save its recovered status', async () => {
    const base = createTestStudioRecording();
    const recording = {
        ...base, id: 'recovered-on-a-full-origin', status: 'recording' as const,
        tracks: [{ ...base.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 5 }],
    };
    await appendRecordingChunk(recording, recording.tracks[0].id, 0, new Blob(['take']));
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('Origin full', 'QuotaExceededError'); });

    const recovered = (await recoverStudioRecordings()).find((item) => item.id === recording.id);
    expect(recovered?.status).toBe('interrupted');
    expect(recovered?.captureEndSeconds).toBeNull();
    expect(recovered?.durationSeconds).toBe(5);
    expect(await readRecordingTrack(recording.id, recording.tracks[0]).then((blob) => blob.text())).toBe('take');
    expect(await new Response(streamRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('take');
    // Nothing was written, so the stored take is exactly the committed prefix it was before the recovery.
    expect(await readStudioRecording(recording.id)).toEqual(recording);
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
