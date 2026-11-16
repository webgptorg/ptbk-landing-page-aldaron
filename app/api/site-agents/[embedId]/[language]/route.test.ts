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
    it('selects the full avatar only on its matching personal domain and keeps its context separate', async () => {
        for (const [language, host] of [['cs', 'www.pavolhejny.cz'], ['en', 'pavolhejny.com']]) {
            expect((await POST(request(host), params('pavol-avatar', language))).status).toBe(200);
            const subject = mocks.respond.mock.calls.at(-1)?.[1];
            expect(subject.agentId).toBe(SITE_AGENT_EMBEDS['pavol-avatar'].agentId);
            expect(subject.source).toEqual({ sourceKey: `site-pavol-avatar-${language}` });
            expect(subject.includeSourceBook).toBe(true);
            expect(subject.context).toContain('No access to private accounts');
            expect(subject.instructions).toContain('no browser, accounts or action tools');
        }
        mocks.respond.mockClear();
        for (const [language, host] of [['cs', 'pavolhejny.com'], ['en', 'pavolhejny.cz'], ['cs', 'ptbk.io'], ['cs', 'ai-ta-krajta.cz']]) {
            expect((await POST(request(host), params('pavol-avatar', language))).status).toBe(404);
        }
        expect(mocks.respond).not.toHaveBeenCalled();
    });
});
