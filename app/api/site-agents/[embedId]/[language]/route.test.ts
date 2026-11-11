import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
const mocks = vi.hoisted(() => ({ respond: vi.fn() }));
vi.mock('@/lib/messages/respondToPublicChat', () => ({ respondToPublicChat: mocks.respond }));
import { POST } from './route';
import { SITE_AGENT_EMBEDS } from '@/lib/site-agents/registry';
const request = (host = 'www.ptbk.io', origin?: string) => new Request(`https://${host}/api/site-agents/comparison/cs`, { method: 'POST', headers: { host, ...(origin ? { origin } : {}) }, body: '{}' });
const params = (embedId = 'comparison', language = 'cs') => ({ params: Promise.resolve({ embedId, language }) });
beforeEach(() => { vi.resetAllMocks(); mocks.respond.mockResolvedValue(Response.json({ reply: 'Answer' })); });
describe('allowlisted public Book embed', () => {
    it('uses server-selected Book, catalogue and isolated language histories', async () => {
        for (const language of ['cs','en']) {
            expect((await POST(request(), params('comparison',language))).status).toBe(200);
            expect(mocks.respond.mock.calls.at(-1)?.[1]).toMatchObject({ agentId: SITE_AGENT_EMBEDS.comparison.agentId, source: { sourceKey: `site-comparison-${language}` } });
            expect(mocks.respond.mock.calls.at(-1)?.[1].instructions).toContain('competitor is a better fit');
        }
    });
    it('does not expose arbitrary private agents, foreign domains or cross-origin requests', async () => {
        expect((await POST(request(), params('__proto__'))).status).toBe(404);
        expect((await POST(request(), params(SITE_AGENT_EMBEDS.comparison.agentId))).status).toBe(404);
        expect((await POST(request(), params('comparison','de'))).status).toBe(404);
        expect((await POST(request('pavolhejny.cz'), params())).status).toBe(404);
        expect((await POST(request('ptbk.io','https://unrelated.example'), params())).status).toBe(403);
        expect(mocks.respond).not.toHaveBeenCalled();
    });
});
