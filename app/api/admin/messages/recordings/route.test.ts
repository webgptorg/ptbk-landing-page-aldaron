import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), metadata: vi.fn(), bytes: vi.fn(), manifest: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
vi.mock('@/lib/messages/messageRecordingServer', () => ({ listRemoteRecordingParts: mocks.list, storeRecordingMetadata: mocks.metadata, storeRecordingBytes: mocks.bytes, remoteRecordingManifest: mocks.manifest }));
import { GET, POST } from './route';
import { GET as manifest, PUT } from './[id]/route';
const id = 'e22c409c-aa2f-4cd3-a891-3f82fd4a9172';
const context = { params: Promise.resolve({ id }) };
beforeEach(() => { vi.resetAllMocks(); mocks.guard.mockResolvedValue(null); });
afterEach(() => vi.resetAllMocks());
describe('private meeting recording API boundaries', () => {
    it.each([401,403])('checks existing messages authorization before reading or writing private audio (%s)', async status => {
        mocks.guard.mockResolvedValue(Response.json({ error: 'Denied' }, { status }));
        const base = 'https://ptbk.io/api/admin/messages/recordings';
        expect((await GET(new NextRequest(base))).status).toBe(status);
        expect((await POST(new NextRequest(base, { method: 'POST' }))).status).toBe(status);
        expect((await manifest(new NextRequest(`${base}/${id}`), context)).status).toBe(status);
        expect((await PUT(new NextRequest(`${base}/${id}?sequence=0`, { method: 'PUT', body: 'raw' }), context)).status).toBe(status);
        expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.metadata).not.toHaveBeenCalled(); expect(mocks.bytes).not.toHaveBeenCalled(); expect(mocks.manifest).not.toHaveBeenCalled();
    });
    it('retires every server audio write without reaching object storage', async () => {
        const base = `https://ptbk.io/api/admin/messages/recordings/${id}`;
        expect((await PUT(new NextRequest(base, { method: 'PUT', body: 'raw' }), context)).status).toBe(410);
        expect((await PUT(new NextRequest(`${base}?sequence=0`, { method: 'PUT', body: new Uint8Array(1024 * 1024 + 1) }), context)).status).toBe(410);
        expect((await POST(new NextRequest('https://ptbk.io/api/admin/messages/recordings', { method: 'POST', body: '{}' }))).status).toBe(410);
        expect(mocks.bytes).not.toHaveBeenCalled(); expect(mocks.metadata).not.toHaveBeenCalled();
    });
});
