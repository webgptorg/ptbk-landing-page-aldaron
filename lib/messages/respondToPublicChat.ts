import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { loadManagedAgent } from '@/lib/agents/agentDatabase';
import { runManagedAgent } from '@/lib/agents/agentRuntime';
import { parseMessageChatTurns } from '@/lib/messages/messageTypes';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { beginMessageChatTurn, finishMessageChatTurn } from '@/lib/messages/messageConversationDatabase';

import type { ChatConversationSource } from '@/lib/messages/messageConversationDatabase';
import { allowPublicChatRequest } from './publicChatRateLimit';
import type { ChatAttachmentRow } from './messageAttachmentDatabase';

async function boundedJson(request: Request): Promise<unknown> {
    const reader = request.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.length;
            if (length > 70000) { await reader.cancel(); return null; }
            chunks.push(value);
        }
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return null; }
}

export async function respondToPublicChat(request: Request, subject: {
    source: ChatConversationSource; rateKey: string; agentId: string; introduction: string;
    markdown: string; context: string; instructions: string; unavailableMessage?: string;
}) {
    const instructions = subject.instructions;
    const json = (value: unknown, status = 200) => Response.json(value, { status, headers: MESSAGE_RESPONSE_HEADERS });
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Neplatný požadavek.' }, 403);
    const body = await boundedJson(request) as { messages?: unknown; conversationId?: unknown; requestId?: unknown } | null;
    let turns = parseMessageChatTurns(body?.messages);
    if (!turns) return json({ error: 'Otázka je příliš dlouhá nebo nemá správný formát.' }, 400);
    const ids = z.object({ conversationId: z.string().uuid().optional(), requestId: z.string().uuid().optional() })
        .safeParse({ conversationId: body?.conversationId, requestId: body?.requestId });
    if (!ids.success) return json({ error: 'Neplatný požadavek.' }, 400);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!allowPublicChatRequest(`${subject.rateKey}:${ip}`)) return json({ error: 'Chvilku prosím počkej a zkus otázku znovu.' }, 429);
    const conversationId = ids.data.conversationId ?? randomUUID();
    let files: ChatAttachmentRow[] = [];
    if (turns.some((turn) => turn.attachments?.length)) {
        try {
            const { resolveChatAttachments } = await import('./messageAttachmentDatabase');
            const resolved = await resolveChatAttachments(subject.source, conversationId, turns);
            turns = resolved.turns; files = resolved.files;
        } catch { return json({ error: 'Některá příloha nepatří k tomuto chatu nebo už není dostupná.' }, 400); }
    }
    let saved: Awaited<ReturnType<typeof beginMessageChatTurn>>;
    try {
        saved = await beginMessageChatTurn(subject.source, conversationId,
            ids.data.requestId ?? randomUUID(), subject.introduction, turns);
    } catch { return json({ error: 'Otázku se nepodařilo uložit. Zkus to prosím znovu.' }, 503); }
    if (!saved.isNew) {
        if (saved.turn.status === 'completed' && saved.turn.reply) return json({ reply: saved.turn.reply });
        if (saved.turn.status === 'pending' && Date.now() - Date.parse(saved.turn.createdAt) > 180000) {
            return json({ error: 'Předchozí odpověď byla přerušena. Zkus otázku prosím znovu.', retryAsNew: true }, 502);
        }
        return json({ error: saved.turn.status === 'pending' ? 'Odpověď se ještě připravuje. Chvilku prosím počkej.'
            : saved.turn.errorMessage ?? 'Odpověď se nepodařilo připravit.', retryAsNew: saved.turn.status !== 'pending' }, saved.turn.status === 'pending' ? 409 : 502);
    }
    const fail = async (error: string, status: number) => {
        try { await finishMessageChatTurn(saved.turn.id, { error }); }
        catch { console.warn('Message chat failure could not be recorded.'); }
        return json({ error, retryAsNew: true }, status);
    };
    if (!process.env.OPENAI_API_KEY?.trim()) return fail(subject.unavailableMessage ?? 'Chat teď není dostupný. Celý kontext si můžeš stáhnout nahoře.', 503);
    let reply: string;
    try {
        const agent = await loadManagedAgent(subject.agentId);
        if (!agent || !agent.isEnabled) return fail(subject.unavailableMessage ?? 'Chat teď není dostupný. Celý kontext si můžeš stáhnout nahoře.', 503);
        const inputs = files.length ? await (await import('./messageAttachmentDatabase')).createChatAttachmentInputs(files) : [];
        reply = await runManagedAgent(agent, instructions, JSON.stringify({
            message: subject.markdown, fullContext: subject.context, conversation: turns,
        }), request.signal, inputs);
    } catch { return fail('Odpověď se nepodařilo načíst. Zkus to prosím znovu.', 502); }
    if (!reply.trim() || reply.length > 12000) return fail('Odpověď se nepodařilo připravit.', 502);
    try { await finishMessageChatTurn(saved.turn.id, { reply: reply.trim() }); }
    catch { return json({ error: 'Výsledek konverzace se nepodařilo uložit. Zkus to prosím znovu.' }, 503); }
    return json({ reply: reply.trim() });
}
