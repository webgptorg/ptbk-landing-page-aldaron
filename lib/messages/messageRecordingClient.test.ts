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
    it('keeps audio local without sending metadata or bytes to the former CDN backup API', async () => {
        const recording = part(); await saveRecordingPart(recording);
        await saveRecordingChunk({ partId: recording.id, sequence: 0, bytes: new Blob(['original']), synced: false });
        await syncRecordingBackups(); await syncRecordingBackups();
        expect(mocks.request).not.toHaveBeenCalled();
        expect(await (await recordingFile((await loadRecordingPart(recording.id))!)).text()).toBe('original');
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
