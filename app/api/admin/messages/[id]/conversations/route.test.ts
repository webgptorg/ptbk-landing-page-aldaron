import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), message: vi.fn(), list: vi.fn(), turns: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: mocks.guard }));
vi.mock('@/lib/messages/messageDatabase', () => ({ loadManagedMessage: mocks.message, MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
vi.mock('@/lib/messages/messageConversationDatabase', () => ({ listMessageConversations: mocks.list, listMessageConversationTurns: mocks.turns }));
import { GET } from './route';
const id = '431c6e37-fdc4-4b8c-a6ed-2d9f8d62a630';
const conversation = 'c1f530e3-19c6-482d-a276-70cf5efde084';
const params = { params: Promise.resolve({ id }) };
const request = (query = '') => new NextRequest(`https://ptbk.io/api/admin/messages/${id}/conversations${query}`);
beforeEach(() => { vi.resetAllMocks(); mocks.guard.mockResolvedValue(null); mocks.message.mockResolvedValue({ id }); mocks.list.mockResolvedValue({ conversations: [], hasMore: false }); mocks.turns.mockResolvedValue({ turns: [], hasMore: false }); });
describe('message history administration', () => {
    it.each([401,403])('refuses access (%s) before reading a message or transcript', async (status) => {
        mocks.guard.mockResolvedValueOnce(Response.json({ error: 'Denied' }, { status }));
        expect((await GET(request(), params)).status).toBe(status);
        expect(mocks.message).not.toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.turns).not.toHaveBeenCalled();
    });
    it('scopes list and detail pages to the stored message, without caching private data', async () => {
        const response = await GET(request('?offset=50'), params);
        expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toContain('no-store');
        expect(mocks.list).toHaveBeenCalledWith(id, 50);
        await GET(request(`?conversationId=${conversation}&offset=100`), params);
        expect(mocks.turns).toHaveBeenCalledWith(id, conversation, 100);
    });
    it('validates pagination and identifiers and reports deleted messages', async () => {
        expect((await GET(request('?offset=-1'), params)).status).toBe(400);
        expect((await GET(request('?conversationId=forged'), params)).status).toBe(404);
        mocks.message.mockResolvedValueOnce(null);
        expect((await GET(request(), params)).status).toBe(404);
        expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.turns).not.toHaveBeenCalled();
    });
});
