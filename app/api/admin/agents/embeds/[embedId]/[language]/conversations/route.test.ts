import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ denied: false, list: vi.fn(), turns: vi.fn() }));
vi.mock('@/lib/messages/messageAdminApi', () => ({
    withMessagesAdmin: (_request: Request, action: () => Promise<Response>) => mocks.denied ? Response.json({}, { status: 401 }) : action(),
    requireRecordId: (id: string) => id,
}));
vi.mock('@/lib/messages/messageConversationDatabase', () => ({ listMessageConversations: mocks.list, listMessageConversationTurns: mocks.turns }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
import { GET } from './route';
const params = (language = 'cs') => ({ params: Promise.resolve({ embedId: 'comparison', language }) });
const request = (query = '') => new NextRequest(`https://www.ptbk.io/api/admin/agents/embeds/comparison/cs/conversations${query}`);
beforeEach(() => { vi.clearAllMocks(); mocks.denied = false; mocks.list.mockResolvedValue({ conversations: [], hasMore: false }); mocks.turns.mockResolvedValue({ turns: [], hasMore: false }); });
describe('private adviser conversation administration', () => {
    it('goes through the existing agents administration authorization before reading history', async () => {
        mocks.denied = true;
        expect((await GET(request(), params())).status).toBe(401);
        expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.turns).not.toHaveBeenCalled();
    });
    it('isolates languages and paginates through the existing private history reader', async () => {
        await GET(request('?offset=50'), params('en'));
        expect(mocks.list).toHaveBeenCalledWith({ sourceKey: 'site-comparison-en' }, 50);
        expect((await GET(request('?offset=-1'), params())).status).toBe(400);
        expect((await GET(request(), params('de'))).status).toBe(404);
    });
});
