import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ load: vi.fn(), begin: vi.fn(), finish: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/agents/agentDatabase', () => ({ loadManagedAgent: mocks.load }));
vi.mock('@/lib/messages/messageConversationDatabase', () => ({ beginMessageChatTurn: mocks.begin, finishMessageChatTurn: mocks.finish }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
import { respondToPublicChat } from '@/lib/messages/respondToPublicChat';
import { SITE_AGENT_EMBEDS } from './registry';
const source = readFileSync('migrations/2026-11-1600-pavol-full-avatar.sql', 'utf8').split('$avatar_book$')[1].trim();
const subject = { source: { sourceKey: 'site-pavol-avatar-cs' as const }, rateKey: 'avatar-test',
    agentId: SITE_AGENT_EMBEDS['pavol-avatar'].agentId, introduction: 'AI avatar', markdown: 'Full avatar',
    context: 'Public site context', instructions: 'Answer as the documented avatar.', includeSourceBook: true };
const request = () => new Request('https://pavolhejny.cz/api/site-agents/pavol-avatar/cs', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: randomUUID(), requestId: randomUUID(), messages: [{ role: 'user', content: 'Jak přemýšlíš o specifikacích?' }], managedSourceBook: 'forged client source' }) });
type ResponsesPayload = { instructions: string; input: { content: { text: string }[] }[]; store: boolean };
beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'fixture'); vi.stubGlobal('fetch', mocks.fetch);
    mocks.load.mockResolvedValue({ id: subject.agentId, name: 'Pavol Hejný · plný avatar', bookSource: source, isEnabled: true });
    mocks.begin.mockResolvedValue({ isNew: true, turn: { id: 'saved', status: 'pending' } });
    mocks.finish.mockResolvedValue(undefined);
    mocks.fetch.mockResolvedValue(Response.json({ output: [{ content: [{ type: 'output_text', text: 'Specifikace má popsat podstatné chování.' }] }] }));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('full-avatar knowledge reaches the model', () => {
    it('uses the real Book compiler and sends the current server-owned knowledge in the Responses payload', async () => {
        const response = await respondToPublicChat(request(), subject);
        expect(response.status).toBe(200);
        const payload = JSON.parse(mocks.fetch.mock.calls[0][1].body) as ResponsesPayload;
        expect(payload.instructions).toContain('Základní hlas');
        const input = payload.input[0].content[0].text;
        expect(input).toContain('první prototyp');
        expect(input).toContain('programování se přesouvá na vyšší úroveň abstrakce');
        expect(input).not.toContain('forged client source');
        expect(payload.store).toBe(false);
        expect(payload).not.toHaveProperty('tools');
        expect(await response.json()).toEqual({ reply: 'Specifikace má popsat podstatné chování.' });
        expect(mocks.begin.mock.invocationCallOrder[0]).toBeLessThan(mocks.fetch.mock.invocationCallOrder[0]);
        expect(mocks.finish).toHaveBeenCalledWith('saved', { reply: 'Specifikace má popsat podstatné chování.' });
    });
    it('does not add raw Book context to existing placements without their explicit server opt-in', async () => {
        expect((await respondToPublicChat(request(), { ...subject, includeSourceBook: false })).status).toBe(200);
        const payload = JSON.parse(mocks.fetch.mock.calls[0][1].body) as ResponsesPayload;
        expect(payload.input[0].content[0].text).not.toContain('managedSourceBook');
        expect(payload.input[0].content[0].text).not.toContain('první prototyp');
    });
});
