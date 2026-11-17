import 'server-only';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { loadManagedAgent } from '@/lib/agents/agentDatabase';
import { runManagedAgent } from '@/lib/agents/agentRuntime';
import { createChatAttachmentInputs, resolveChatAttachments } from '@/lib/messages/messageAttachmentDatabase';
import { selectMessageChatContext } from '@/lib/messages/messageChatContext';
import { messageAttachmentSchema, type MessageChatAttachment } from '@/lib/messages/messageAttachments';
import type { MessageChatTurn } from '@/lib/messages/messageTypes';
import { SITE_AGENT_EMBEDS } from '@/lib/site-agents/registry';
import { createPavolAvatarContext, pavolAvatarInstructions } from '@/lib/site-agents/pavolAvatarContext';
import { getAvatarAccess } from './access';
import type { AvatarPrincipal } from './auth';
import { getAvatarDatabase } from './database';

export class AvatarServiceError extends Error {
    constructor(message: string, public readonly status = 503) { super(message); this.name = 'AvatarServiceError'; }
}
const inputSchema = z.object({
    prompt: z.string().trim().min(1).max(4000),
    conversationId: z.string().uuid().optional(),
    requestId: z.string().uuid().optional(),
    channel: z.enum(['web', 'mcp', 'telegram']),
    language: z.enum(['cs', 'en']).default('cs'),
    attachments: messageAttachmentSchema.array().max(4).default([]),
});
export type AvatarQuestion = {
    prompt: string; conversationId?: string; requestId?: string; channel: 'web'|'mcp'|'telegram';
    language?: 'cs'|'en'; attachments?: readonly MessageChatAttachment[]; signal?: AbortSignal;
};
export type AvatarTurnRow = {
    id: string; conversation_id: string; request_id: string; question: string; reply: string|null;
    status: 'pending'|'completed'|'failed'; error_message: string|null; attachments: MessageChatAttachment[]; created_at: string;
};
export const avatarAttachmentSource = (language: 'cs'|'en') => ({sourceKey: language==='cs'?'avatar-account-cs' as const:'avatar-account-en' as const});

export async function ensureAvatarConversation(principal: AvatarPrincipal, id: string, language: 'cs'|'en' = 'cs') {
    const db = getAvatarDatabase();
    const found = await db.from('avatar_chat_conversations').select('principal_id').eq('id', id).maybeSingle();
    if (found.error) throw new AvatarServiceError('Chat teď není dostupný.');
    if (found.data) {
        if (found.data.principal_id !== principal.id) throw new AvatarServiceError('Chat jsme nenašli.', 404);
        return;
    }
    const inserted = await db.from('avatar_chat_conversations').insert({id,principal_id:principal.id,language,channel:'web'});
    if (inserted.error) {
        const raced = await db.from('avatar_chat_conversations').select('principal_id').eq('id',id).maybeSingle();
        if (raced.error || raced.data?.principal_id !== principal.id) throw new AvatarServiceError('Chat se nepodařilo vytvořit.', 409);
    }
}
export async function canReadAvatarConversation(principal: AvatarPrincipal, id: string): Promise<boolean> {
    const result = await getAvatarDatabase().from('avatar_chat_conversations').select('id').eq('id',id).eq('principal_id',principal.id).maybeSingle();
    if (result.error) throw new AvatarServiceError('Chat teď není dostupný.');
    return !!result.data;
}
export async function loadAvatarConversation(principal: AvatarPrincipal, id: string) {
    if (!await canReadAvatarConversation(principal,id)) throw new AvatarServiceError('Chat jsme nenašli.',404);
    const result = await getAvatarDatabase().from('avatar_chat_turns').select('id,conversation_id,request_id,question,reply,status,error_message,attachments,created_at')
        .eq('conversation_id',id).eq('principal_id',principal.id).order('created_at',{ascending:false}).limit(500);
    if (result.error) throw new AvatarServiceError('Historii se nepodařilo načíst.');
    return [...(result.data??[])].reverse() as AvatarTurnRow[];
}
/** One account/allowance across web and connections; provider calls never run inside a database transaction. */
export async function askAvatar(principal: AvatarPrincipal, question: AvatarQuestion): Promise<{reply:string;conversationId:string}> {
    const parsed = inputSchema.safeParse(question);
    if (!parsed.success) throw new AvatarServiceError('Zkontroluj otázku a přílohy. Otázka může mít nejvýše 4 000 znaků.',400);
    const input = parsed.data, db = getAvatarDatabase();
    const access = await getAvatarAccess(principal);
    if (input.channel !== 'web' && access.plan !== 'full') throw new AvatarServiceError('Pro připojení je potřeba aktivní Full předplatné.',403);
    const conversationId = input.conversationId ?? randomUUID(), requestId = input.requestId ?? randomUUID();
    let files: Awaited<ReturnType<typeof resolveChatAttachments>>['files'] = [];
    let attachments = input.attachments;
    if (attachments.length) {
        if (!await canReadAvatarConversation(principal,conversationId)) throw new AvatarServiceError('Přílohy nepatří k tomuto chatu.',403);
        try {
            const resolved = await resolveChatAttachments(avatarAttachmentSource(input.language),conversationId,[{role:'user',content:input.prompt,attachments}]);
            files=resolved.files; attachments=[...(resolved.turns[0]?.attachments??[])];
        } catch { throw new AvatarServiceError('Některá příloha nepatří k tomuto chatu nebo už není dostupná.',400); }
    }
    const reserved = await db.rpc('avatar_begin_chat_turn',{
        p_principal_id:principal.id,p_conversation_id:conversationId,p_request_id:requestId,p_question:input.prompt,
        p_channel:input.channel,p_language:input.language,p_period_start:access.periodStart,p_limit:access.limit,p_attachments:attachments,
    });
    if (reserved.error) {
        const message = reserved.error.message ?? '';
        if (message.includes('avatar_quota_exceeded')) throw new AvatarServiceError('Zahrnutou spotřebu pro toto období máš vyčerpanou. Další poplatky automaticky neúčtujeme.',429);
        if (message.includes('avatar_conversation_forbidden')) throw new AvatarServiceError('Chat jsme nenašli.',404);
        if (message.includes('avatar_request_conflict')) throw new AvatarServiceError('Tento požadavek už patří k jiné otázce.',409);
        throw new AvatarServiceError('Otázku se nepodařilo bezpečně uložit.');
    }
    const saved = reserved.data as {isNew:boolean;turn:AvatarTurnRow};
    if (!saved?.turn?.id) throw new AvatarServiceError('Otázku se nepodařilo bezpečně uložit.');
    if (!saved.isNew) {
        if (saved.turn.status==='completed' && saved.turn.reply) return {reply:saved.turn.reply,conversationId};
        if (saved.turn.status==='pending' && Date.now()-Date.parse(saved.turn.created_at)>180000) {
            await db.rpc('avatar_finish_chat_turn',{p_id:saved.turn.id,p_reply:null,p_error:'Předchozí běh byl přerušen. Odešli otázku znovu.',p_model:null,p_input_tokens:0,p_output_tokens:0});
            throw new AvatarServiceError('Předchozí běh byl přerušen. Odešli otázku znovu.',502);
        }
        throw new AvatarServiceError(saved.turn.status==='pending'?'Odpověď se ještě připravuje. Obnov historii za chvíli.':saved.turn.error_message??'Otázku odešli znovu jako nový požadavek.',saved.turn.status==='pending'?409:502);
    }
    let metrics={model:'',inputTokens:0,outputTokens:0};
    const finish = (reply:string|null,error:string|null) => db.rpc('avatar_finish_chat_turn',{
        p_id:saved.turn.id,p_reply:reply,p_error:error,p_model:metrics.model||null,p_input_tokens:metrics.inputTokens,p_output_tokens:metrics.outputTokens,
    });
    try {
        const agent = await loadManagedAgent(SITE_AGENT_EMBEDS['pavol-avatar'].agentId);
        if (!agent?.isEnabled) throw new AvatarServiceError('Avatar teď není dostupný. Zkus to prosím později.',503);
        const previous = await db.from('avatar_chat_turns').select('question,reply').eq('principal_id',principal.id)
            .eq('conversation_id',conversationId).eq('status','completed').order('created_at',{ascending:false}).limit(8);
        if(previous.error) throw new AvatarServiceError('Kontext chatu se nepodařilo načíst.');
        const history:MessageChatTurn[] = [...(previous.data??[])].reverse().flatMap(row=>[{role:'user' as const,content:row.question},{role:'assistant' as const,content:row.reply??''}]);
        const conversation = selectMessageChatContext(history,{role:'user',content:input.prompt,attachments});
        const reply = await runManagedAgent(agent,pavolAvatarInstructions(input.language),JSON.stringify({
            fullContext:createPavolAvatarContext(input.language),managedSourceBook:agent.bookSource,conversation,
        }),question.signal,files.length?await createChatAttachmentInputs(files):[],undefined,undefined,usage=>{metrics=usage;});
        if(!reply.trim() || reply.length>48000) throw new AvatarServiceError('Odpověď se nepodařilo připravit.',502);
        const complete = await finish(reply.trim(),null);
        if(complete.error || complete.data!==true) throw new AvatarServiceError('Výsledek se nepodařilo uložit. Obnov prosím historii před dalším odesláním.',503);
        return {reply:reply.trim(),conversationId};
    } catch (failure) {
        const safe = failure instanceof AvatarServiceError?failure:new AvatarServiceError('Odpověď se nepodařilo připravit. Zkus to prosím později.',502);
        await finish(null,safe.message);
        throw safe;
    }
}
