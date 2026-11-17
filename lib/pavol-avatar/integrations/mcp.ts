import 'server-only';
import { createMcpHandler, fromJsonSchema, McpServer } from '@modelcontextprotocol/server';
import type { AvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarAccess } from '@/lib/pavol-avatar/access';
import { assertAvatarRequest, getAvatarOrigin } from '@/lib/pavol-avatar/config';
import { askAvatar } from '@/lib/pavol-avatar/service';
import { AvatarIntegrationError, integrationError, privateHeaders, readConnectorPrincipal } from './credentials';

type AvatarMcpInput = { question: string; conversationId?: string; requestId?: string; language?: 'cs' | 'en' };

export function createPavolMcpHandler(principal: AvatarPrincipal, signal?: AbortSignal) {
    return createMcpHandler(() => {
        const server = new McpServer({ name: 'pavol-avatar', version: '1.0.0' }, {
            capabilities: { tools: {} },
            instructions: 'Consult Pavol Hejny’s AI avatar for AI tools, agent design, specifications and review. Advice comes from a continuously maintained AI avatar, not a personal human review. Consultations use the same Full subscription allowance as web and Telegram. Include relevant context only; never send secrets. Preserve conversationId for follow-ups and requestId when retrying a request.',
        });
        server.registerTool('consult_pavol', {
            title: 'Consult Pavol’s AI avatar',
            description: 'Ask for practical AI advice, Czech business context, agent design, specifications or review. Uses your shared Full allowance. It gives advice and does not execute external actions.',
            inputSchema: fromJsonSchema<AvatarMcpInput>({
                type: 'object', additionalProperties: false,
                properties: {
                    question: { type: 'string', minLength: 1, maxLength: 4000 },
                    conversationId: { type: 'string', format: 'uuid' },
                    requestId: { type: 'string', format: 'uuid' },
                    language: { type: 'string', enum: ['cs', 'en'] },
                },
                required: ['question'],
            }),
            annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
        }, async ({ question, conversationId, requestId, language }) => {
            try {
                // Check the live entitlement again at invocation, not only during initial connection.
                if ((await getAvatarAccess(principal)).plan !== 'full') {
                    return { content: [{ type: 'text' as const, text: 'MCP přístup vyžaduje aktivní předplatné Full.' }], isError: true };
                }
                const result = await askAvatar(principal, { prompt: question, channel: 'mcp', conversationId, requestId, language, signal });
                return {
                    content: [{ type: 'text' as const, text: result.reply }],
                    structuredContent: { reply: result.reply, conversationId: result.conversationId },
                    isError: false,
                };
            } catch (error) {
                const safe = error instanceof Error && 'status' in error && typeof error.status === 'number' &&
                    error.status >= 400 && error.status < 500 ? error.message : 'Konzultace teď není dostupná. Zkuste to znovu.';
                return { content: [{ type: 'text' as const, text: safe }], isError: true };
            }
        });
        return server;
    }, { maxRequestBodySize: 70_000 });
}
export async function handleAvatarMcpRequest(request: Request): Promise<Response> {
    try {
        assertAvatarRequest(request, false);
        const origin = request.headers.get('origin');
        if (origin && origin !== getAvatarOrigin(request) && origin !== new URL(request.url).origin) {
            throw new AvatarIntegrationError('Origin is not allowed.', 403);
        }
        const principal = await readConnectorPrincipal(request);
        if (!principal) return Response.json({ error: 'A valid Pavol Avatar connector token is required.' }, {
            status: 401, headers: { ...privateHeaders, 'WWW-Authenticate': 'Bearer realm="pavol-avatar"' },
        });
        if ((await getAvatarAccess(principal)).plan !== 'full') throw new AvatarIntegrationError('MCP přístup vyžaduje aktivní předplatné Full.', 403);
        const response = await createPavolMcpHandler(principal, request.signal).fetch(request);
        const headers = new Headers(response.headers);
        for (const [name, value] of Object.entries(privateHeaders)) headers.set(name, value);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    } catch (error) { return integrationError(error); }
}
