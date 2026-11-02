import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
const mocks = vi.hoisted(() => ({ agents: vi.fn(), respond: vi.fn() }));
vi.mock('@/lib/agents/agentDatabase', () => ({ listManagedAgents: mocks.agents }));
vi.mock('@/lib/messages/respondToPublicChat', () => ({ respondToPublicChat: mocks.respond }));
import { POST } from './route';
const request = (host:string,origin?:string) => new Request(`https://${host}/api/pavol/chat`,{method:'POST',headers:{host,...(origin?{origin}:{})},body:'{}'});
beforeEach(() => { vi.resetAllMocks(); mocks.agents.mockResolvedValue([{id:'the-existing-agent',name:'Pavol Hejný',isEnabled:true}]);mocks.respond.mockResolvedValue(Response.json({reply:'Hello'})); });
afterEach(() => vi.resetAllMocks());
describe('homepage conversation scope', () => {
    it('uses the existing Book and shared history pipeline without message context', async () => {
        expect((await POST(request('pavolhejny.com'))).status).toBe(200);
        expect(mocks.respond.mock.calls[0][1]).toMatchObject({source:{sourceKey:'pavol-en'},agentId:'the-existing-agent',rateKey:'pavol-en'});
        expect(mocks.respond.mock.calls[0][1].instructions).toContain('No message-specific context');
    });
    it('keeps Czech histories separate and accepts the canonical www alias', async () => {
        await POST(request('www.pavolhejny.cz'));
        expect(mocks.respond.mock.calls[0][1].source).toEqual({sourceKey:'pavol-cs'});
    });
    it('rejects other sites and cross-origin requests before accessing any agent', async () => {
        expect((await POST(request('ptbk.io'))).status).toBe(404);
        expect((await POST(request('pavolhejny.cz','https://unrelated.example'))).status).toBe(403);
        expect(mocks.agents).not.toHaveBeenCalled();
    });
    it('does not silently select a disabled or ambiguous agent', async () => {
        mocks.agents.mockResolvedValue([{id:'disabled',name:'Pavol Hejný',isEnabled:false}]);
        expect((await POST(request('pavolhejny.cz'))).status).toBe(503);
        expect(mocks.respond).not.toHaveBeenCalled();
    });
});
