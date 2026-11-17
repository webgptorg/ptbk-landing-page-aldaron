import { z } from 'zod';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({
    access: vi.fn(), ask: vi.fn(), principal: vi.fn(), assert: vi.fn(),
}));
vi.mock('@/lib/pavol-avatar/access', () => ({ getAvatarAccess: mocks.access }));
vi.mock('@/lib/pavol-avatar/service', () => ({ askAvatar: mocks.ask }));
vi.mock('@/lib/pavol-avatar/config', () => ({
    assertAvatarRequest: mocks.assert, getAvatarOrigin: () => 'https://pavolhejny.cz',
}));
vi.mock('./credentials', async (original) => {
    const actual = await original<typeof import('./credentials')>();
    return { ...actual, readConnectorPrincipal: mocks.principal };
});
vi.mock('@/lib/pavol-avatar/database', () => ({ getAvatarDatabase: vi.fn() }));
import { handleAvatarMcpRequest } from './mcp';
const principal = { id: '11111111-1111-4111-8111-111111111111', email: 'member@example.com' };
function request(method: string, params: Record<string, unknown> = {}, version = '2025-11-25') {
    return new Request('https://pavolhejny.cz/api/pavol-avatar/mcp', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
            'MCP-Protocol-Version': version, 'Mcp-Method': method, Authorization: 'Bearer test' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
}
const rpcEnvelopeSchema = z.object({
    jsonrpc: z.literal('2.0'), id: z.union([z.number(), z.string(), z.null()]),
    error: z.unknown().optional(),
    result: z.object({
        protocolVersion: z.string().optional(),
        tools: z.array(z.object({ name: z.string() })).default([]),
        isError: z.boolean().optional(),
        content: z.array(z.object({ type: z.string(), text: z.string().optional() })).default([]),
    }).optional(),
});
async function rpc(response: Response) {
    const text = await response.text();
    if (text.startsWith('event:') || text.startsWith('data:')) {
        return rpcEnvelopeSchema.parse(JSON.parse(text.split('\n').find(line => line.startsWith('data:'))!.slice(5)));
    }
    return rpcEnvelopeSchema.parse(JSON.parse(text));
}
beforeEach(() => {
    vi.resetAllMocks();
    mocks.principal.mockResolvedValue(principal);
    mocks.access.mockResolvedValue({ plan: 'full' });
    mocks.ask.mockResolvedValue({ reply: 'Použitelná rada.', conversationId: '22222222-2222-4222-8222-222222222222' });
});
describe('Pavol Avatar MCP protocol and authorization', () => {
    it('requires a revocable connector credential and refuses non-Full access', async () => {
        mocks.principal.mockResolvedValueOnce(null);
        const missing = await handleAvatarMcpRequest(request('tools/list'));
        expect(missing.status).toBe(401);
        expect(missing.headers.get('www-authenticate')).toContain('Bearer');
        mocks.access.mockResolvedValueOnce({ plan: 'light' });
        expect((await handleAvatarMcpRequest(request('tools/list'))).status).toBe(403);
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('rejects an unrelated browser Origin before resolving credentials', async () => {
        const req = request('tools/list');
        req.headers.set('origin', 'https://unrelated.example');
        expect((await handleAvatarMcpRequest(req)).status).toBe(403);
        expect(mocks.principal).not.toHaveBeenCalled();
    });
    it('initializes legacy clients and lists the actual expert tool', async () => {
        const initialized = await rpc(await handleAvatarMcpRequest(request('initialize', {
            protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '1' },
        })));
        expect(initialized.result?.protocolVersion).toBe('2025-11-25');
        const listed = await rpc(await handleAvatarMcpRequest(request('tools/list')));
        expect(listed.result?.tools[0]?.name).toBe('consult_pavol');
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('serves a consultation through the shared owner-scoped service', async () => {
        const requestId = '33333333-3333-4333-8333-333333333333';
        const result = await rpc(await handleAvatarMcpRequest(request('tools/call', {
            name: 'consult_pavol', arguments: { question: 'Navrhni tým agentů.', requestId, language: 'cs' },
        })));
        expect(result.result?.isError).toBe(false);
        expect(result.result?.content[0]?.text).toBe('Použitelná rada.');
        expect(mocks.ask).toHaveBeenCalledWith(principal, expect.objectContaining({
            prompt: 'Navrhni tým agentů.', requestId, channel: 'mcp', language: 'cs',
        }));
    });
    it('validates input before spending allowance and rechecks entitlement on invocation', async () => {
        const invalid = await rpc(await handleAvatarMcpRequest(request('tools/call', {
            name: 'consult_pavol', arguments: { question: 'x'.repeat(4001) },
        })));
        expect(invalid.error || invalid.result?.isError).toBeTruthy();
        expect(mocks.ask).not.toHaveBeenCalled();
        mocks.access.mockResolvedValueOnce({ plan: 'full' }).mockResolvedValueOnce({ plan: 'free' });
        const expired = await rpc(await handleAvatarMcpRequest(request('tools/call', {
            name: 'consult_pavol', arguments: { question: 'Poradíš?' },
        })));
        expect(expired.result?.isError).toBe(true);
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('accepts the 2026 per-request envelope and discovers without initialize', async () => {
        const result = await rpc(await handleAvatarMcpRequest(request('server/discover', {
            _meta: {
                'io.modelcontextprotocol/protocolVersion': '2026-07-28',
                'io.modelcontextprotocol/clientInfo': { name: 'test', version: '1' },
                'io.modelcontextprotocol/clientCapabilities': {},
            },
        }, '2026-07-28')));
        expect(result.error).toBeUndefined();
        expect(result.result).toBeDefined();
        expect(mocks.ask).not.toHaveBeenCalled();
    });
});
