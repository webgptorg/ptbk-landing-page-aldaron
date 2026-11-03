import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ load: vi.fn(), sign: vi.fn(), db: vi.fn(), denied: vi.fn() }));
vi.mock('@/lib/messages/messageAttachmentDatabase', () => ({ loadChatAttachment: mocks.load }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
vi.mock('@/lib/storage/objectStorage', () => ({ signStoredObject: mocks.sign }));
vi.mock('@/lib/agents/agentDatabase', () => ({ getAgentDatabase: mocks.db }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.denied }));
import { GET } from './route';
import { GET as adminGet } from '@/app/api/admin/messages/attachments/[id]/route';
import { NextRequest } from 'next/server';
const id = '6c21d70d-0991-4a1d-a2f9-39d599148b5b';
const params = { params: Promise.resolve({ id }) };
const request = (host = 'pavolhejny.cz') => new Request(`https://${host}/api/chat/attachments/${id}`, { headers: { host } });
beforeEach(() => {
    mocks.load.mockResolvedValue({ id, message_id: null, source_key: 'pavol-cs', object_key: 'private/original' });
    mocks.sign.mockResolvedValue('https://cdn.example/temporary-read'); mocks.denied.mockResolvedValue(null);
});
afterEach(() => vi.resetAllMocks());
describe('durable attachment links', () => {
    it('signs only a known file on its own domain and lets the CDN serve its original bytes', async () => {
        const response = await GET(request(), params);
        expect(response.status).toBe(307); expect(response.headers.get('location')).toBe('https://cdn.example/temporary-read');
        expect(response.headers.get('cache-control')).toContain('no-store');
        expect(mocks.sign).toHaveBeenCalledWith('private/original');
        mocks.sign.mockClear();
        expect((await GET(request('pavolhejny.com'), params)).status).toBe(404);
        expect(mocks.sign).not.toHaveBeenCalled();
    });
    it('rechecks a message current domain and rejects invalid or unknown IDs without signing storage', async () => {
        mocks.load.mockResolvedValue({ id, message_id: 'message', source_key: null, object_key: 'private/original' });
        const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { domain: 'pavolhejny.com' }, error: null }) };
        mocks.db.mockReturnValue({ from: () => query });
        expect((await GET(request(), params)).status).toBe(404);
        expect((await GET(request(), { params: Promise.resolve({ id: 'invalid' }) })).status).toBe(404);
        mocks.load.mockResolvedValueOnce(null);
        expect((await GET(request(), params)).status).toBe(404);
        expect(mocks.sign).not.toHaveBeenCalled();
    });
    it('requires messages administration permission for attachment links in the recorded report', async () => {
        mocks.denied.mockResolvedValueOnce(new Response(null, { status: 403 }));
        const admin = new NextRequest(`https://ptbk.io/api/admin/messages/attachments/${id}`);
        expect((await adminGet(admin, params)).status).toBe(403);
        expect(mocks.load).not.toHaveBeenCalled(); expect(mocks.sign).not.toHaveBeenCalled();
        expect((await adminGet(admin, params)).status).toBe(307);
    });
});
