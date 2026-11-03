import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
import { syncRecordingBackups, recordingFile } from './messageRecordingClient';
import { saveRecordingPart, saveRecordingChunk, loadRecordingPart, loadRecordingChunks } from './messageRecordingStorage';
import type { MessageRecordingPart } from './messageRecordingTypes';
const part = (): MessageRecordingPart => ({ id: randomUUID(), recordingId: randomUUID(), scope: 'new', title: 'Offline meeting', mimeType: 'audio/webm', startedAt: new Date().toISOString(), endedAt: null, status: 'complete', chunkCount: 0, byteLength: 0 });
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });
describe('meeting backup and recovery client', () => {
    it('retains originals and retries uncertain upload receipts without marking an unconfirmed backup as saved', async () => {
        const recording = part(); await saveRecordingPart(recording);
        await saveRecordingChunk({ partId: recording.id, sequence: 0, bytes: new Blob(['original']), synced: false });
        let writes = 0;
        mocks.request.mockImplementation(async (_url, options) => {
            if (options.method === 'PUT' && ++writes === 1) throw new Error('Lost response after storage commit');
            return { saved: true };
        });
        await expect(syncRecordingBackups()).rejects.toThrow('Lost response');
        expect((await loadRecordingChunks(recording.id))[0].synced).toBe(false);
        expect((await loadRecordingPart(recording.id))!.backedUpChunks ?? 0).toBe(0);
        await syncRecordingBackups();
        expect(writes).toBe(2); expect((await loadRecordingPart(recording.id))!.backedUpChunks).toBe(1);
        expect(await (await recordingFile((await loadRecordingPart(recording.id))!)).text()).toBe('original');
        await syncRecordingBackups(); expect(writes).toBe(2);
    });
    it('rejects incomplete or corrupt remote backups before handing bytes to paid transcription', async () => {
        const recording = part();
        mocks.request.mockResolvedValueOnce({ chunks: [{ sequence: 1 }], expectedChunks: 2 });
        await expect(recordingFile(recording)).rejects.toThrow('není celá');
        mocks.request.mockResolvedValueOnce({ chunks: [{ sequence: 0, byteLength: 4, sha256: '0'.repeat(64), url: 'https://storage.example.test/private' }], expectedChunks: 1 });
        const fetch = vi.fn(async () => new Response('oops')); vi.stubGlobal('fetch', fetch);
        await expect(recordingFile(recording)).rejects.toThrow('nesouhlasí'); expect(fetch).toHaveBeenCalledOnce();
    });
});
