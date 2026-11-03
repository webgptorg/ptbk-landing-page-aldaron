import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { loadRecordingPart, saveRecordingPart, saveRecordingChunk, loadRecordingChunks, localRecordingFile, patchRecordingPart } from './messageRecordingStorage';
import type { MessageRecordingPart } from './messageRecordingTypes';
export const testRecordingPart = (): MessageRecordingPart => ({ id: randomUUID(), recordingId: randomUUID(), scope: 'new', title: 'Meeting',
    startedAt: new Date().toISOString(), endedAt: null, mimeType: 'audio/webm;codecs=opus', status: 'recording', chunkCount: 0, byteLength: 0 });
describe('durable original meeting audio', () => {
    it('reopens committed audio in byte order after an interrupted session, independently of transcript edits', async () => {
        const part = testRecordingPart(); await saveRecordingPart(part);
        await saveRecordingChunk({ partId: part.id, sequence: 0, bytes: new Blob(['container-header|']), synced: false });
        await saveRecordingChunk({ partId: part.id, sequence: 1, bytes: new Blob(['original-audio']), synced: false });
        await patchRecordingPart(part.id, { status: 'interrupted', transcript: 'Paid verbatim text.' });
        const recovered = (await loadRecordingPart(part.id))!;
        expect(recovered.chunkCount).toBe(2); expect(recovered.byteLength).toBe(31);
        expect(await (await localRecordingFile(recovered))!.text()).toBe('container-header|original-audio');
        expect(recovered.transcript).toBe('Paid verbatim text.');
        expect((await loadRecordingChunks(part.id)).map(chunk => chunk.sequence)).toEqual([0, 1]);
    });
    it('rejects missing or duplicate sequences atomically and keeps the previous prefix intact', async () => {
        const part = testRecordingPart(); await saveRecordingPart(part);
        await expect(saveRecordingChunk({ partId: part.id, sequence: 1, bytes: new Blob(['bad']), synced: false })).rejects.toThrow();
        expect((await loadRecordingPart(part.id))!.chunkCount).toBe(0);
        await saveRecordingChunk({ partId: part.id, sequence: 0, bytes: new Blob(['good']), synced: false });
        await expect(saveRecordingChunk({ partId: part.id, sequence: 0, bytes: new Blob(['replacement']), synced: false })).rejects.toThrow();
        expect(await (await localRecordingFile((await loadRecordingPart(part.id))!))!.text()).toBe('good');
    });
});
