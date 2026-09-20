import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { appendRecordingChunk, deleteStudioRecording, editStudioRecording, listStudioRecordings, readRecordingTrack, recoverStudioRecordings, saveStudioRecording } from './recordingStudioStorage';
import { createTestStudioRecording } from './recordingStudioTestUtilities';

describe('durable recording storage', () => {
    beforeEach(async () => {
        for (const recording of await listStudioRecordings()) await deleteStudioRecording(recording.id);
    });
    it('restores ordered track bytes and atomically persists matching metadata', async () => {
        const recording = createTestStudioRecording();
        await saveStudioRecording(recording);
        const first = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
        await appendRecordingChunk(first, first.tracks[0].id, 0, new Blob(['abc']));
        const complete = { ...first, tracks: [{ ...first.tracks[0], byteLength: 6, chunkCount: 2 }] };
        await appendRecordingChunk(complete, first.tracks[0].id, 1, new Blob(['def']));
        expect(await listStudioRecordings()).toEqual([complete]);
        expect(await (await readRecordingTrack(complete.id, complete.tracks[0])).text()).toBe('abcdef');
        // Duplicate sequence aborts the entire transaction, including metadata replacement.
        await expect(appendRecordingChunk({ ...complete, title: 'Must not be saved' }, first.tracks[0].id, 1, new Blob(['bad']))).rejects.toThrow();
        expect((await listStudioRecordings())[0].title).toBe(recording.title);
    });
    it('recovers interrupted takes without changing finalized recordings or their original data', async () => {
        const recording = createTestStudioRecording();
        const interrupted = { ...recording, status: 'recording' as const, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 4 }] };
        await appendRecordingChunk(interrupted, interrupted.tracks[0].id, 0, new Blob(['take']));
        const recovered = (await recoverStudioRecordings())[0];
        expect(recovered.status).toBe('interrupted');
        expect(recovered.durationSeconds).toBe(4);
        expect(await (await readRecordingTrack(recovered.id, recovered.tracks[0])).text()).toBe('take');
        const edited = await editStudioRecording(recovered, 'Renamed', { startSeconds: 1, endSeconds: 3 });
        expect(await recoverStudioRecordings()).toEqual([edited]);
        expect(await (await readRecordingTrack(edited.id, edited.tracks[0])).text()).toBe('take');
    });
    it('deletes every chunk of a take while preserving another take', async () => {
        const recording = createTestStudioRecording();
        const stored = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
        await appendRecordingChunk(stored, stored.tracks[0].id, 0, new Blob(['one']));
        await appendRecordingChunk({ ...stored, id: 'another' }, stored.tracks[0].id, 0, new Blob(['two']));
        await deleteStudioRecording(stored.id);
        expect((await listStudioRecordings()).map((entry) => entry.id)).toEqual(['another']);
        await expect(readRecordingTrack(stored.id, stored.tracks[0])).rejects.toThrow();
        expect(await (await readRecordingTrack('another', stored.tracks[0])).text()).toBe('two');
    });
});
