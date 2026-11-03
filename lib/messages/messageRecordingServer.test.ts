import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
    parts: new Map<string, Record<string, unknown>>(), chunks: new Map<string, Record<string, unknown>>(), objects: new Map<string, Uint8Array>(),
    upload: vi.fn(), download: vi.fn(), lostUploadResponse: false,
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/agents/agentDatabase', () => ({ getAgentDatabase: () => ({ from: (table: string) => {
    const rows = table === 'message_recording_parts' ? state.parts : state.chunks;
    const filters: [string, unknown][] = []; let operation = 'select', values: Record<string, unknown> = {};
    const execute = () => {
        if (operation === 'upsert') {
            const key = String(values.id ?? `${values.part_id}:${values.sequence}`);
            if (!rows.has(key)) rows.set(key, { ...(table === 'message_recording_parts' ? { transcript: null } : {}), ...values });
            return { data: null, error: null };
        }
        const found = Array.from(rows.values()).filter(row => filters.every(([key, value]) => row[key] === value));
        if (operation === 'update') for (const row of found) Object.assign(row, values);
        return { data: found, error: null };
    };
    const query = {
        select: () => query, eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
        is: (key: string, value: unknown) => { filters.push([key, value]); return query; },
        update: (value: Record<string, unknown>) => { operation = 'update'; values = value; return query; },
        upsert: (value: Record<string, unknown>) => { operation = 'upsert'; values = value; return query; },
        single: async () => { const result = execute(); return { ...result, data: result.data?.[0] ?? null }; },
        maybeSingle: async () => query.single(),
        then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(execute()).then(resolve, reject),
    };
    return query;
} }) }));
vi.mock('@/lib/storage/objectStorage', () => ({ getObjectStorage: () => ({ upload: state.upload, download: state.download }), signStoredObject: vi.fn() }));
import { storeRecordingBytes, storeRecordingMetadata } from './messageRecordingServer';
import type { MessageRecordingPart } from './messageRecordingTypes';
beforeEach(() => {
    vi.resetAllMocks(); state.parts.clear(); state.chunks.clear(); state.objects.clear(); state.lostUploadResponse = false;
    state.upload.mockImplementation(async (key: string, bytes: Uint8Array) => {
        state.objects.set(key, bytes.slice());
        return { error: state.lostUploadResponse ? { message: 'Response lost' } : null };
    });
    state.download.mockImplementation(async (key: string) => ({ data: state.objects.has(key) ? new Blob([new Uint8Array(state.objects.get(key)!)]) : null, error: null }));
});
describe('immutable private original-audio backups', () => {
    it('recovers an uncertain object upload, deduplicates retries, rejects conflicting bytes and preserves paid text', async () => {
        const part: MessageRecordingPart = { id: randomUUID(), recordingId: randomUUID(), scope: 'new', title: 'Meeting', mimeType: 'audio/webm', startedAt: new Date().toISOString(), endedAt: null, status: 'recording', chunkCount: 0, byteLength: 0 };
        await storeRecordingMetadata(part); state.lostUploadResponse = true;
        const bytes = new TextEncoder().encode('unchanged-original-audio');
        await storeRecordingBytes(part.id, 0, bytes);
        expect(state.download).toHaveBeenCalledOnce(); expect(state.chunks.size).toBe(1);
        await storeRecordingBytes(part.id, 0, bytes);
        expect(state.upload).toHaveBeenCalledOnce();
        await expect(storeRecordingBytes(part.id, 0, new TextEncoder().encode('different-original'))).rejects.toMatchObject({ status: 409 });
        expect(Array.from(state.objects.values())[0]).toEqual(bytes);
        await storeRecordingMetadata({ ...part, transcript: 'Paid original transcript.', attempted: true });
        await storeRecordingMetadata(part);
        expect(state.parts.get(part.id)!.transcript).toBe('Paid original transcript.');
        await expect(storeRecordingMetadata({ ...part, transcript: 'Replacement.' })).rejects.toMatchObject({ status: 409 });
        expect(state.parts.get(part.id)!.transcript).toBe('Paid original transcript.');
    });
});
