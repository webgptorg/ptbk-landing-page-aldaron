import 'server-only';
import { createHash } from 'node:crypto';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import type { MessageChatTurn } from './messageTypes';
import type { MessageConversationPage, MessageConversationTurnsPage, RecordedMessageChatTurn } from './messageConversationTypes';

type TurnRow = {
    id: string; question: string; introduction: string; reply: string | null;
    status: RecordedMessageChatTurn['status']; error_message: string | null;
    created_at: string; completed_at: string | null; request_hash: string;
};
const turnColumns = 'id,question,introduction,reply,status,error_message,created_at,completed_at,request_hash';
function mapTurn(row: TurnRow): RecordedMessageChatTurn {
    return { id: row.id, question: row.question, introduction: row.introduction, reply: row.reply,
        status: row.status, errorMessage: row.error_message, createdAt: row.created_at, completedAt: row.completed_at };
}

/** Save before calling the model, including questions whose generation fails or is interrupted. */
export async function beginMessageChatTurn(messageId: string, conversationId: string, requestId: string,
    introduction: string, turns: readonly MessageChatTurn[]): Promise<{ turn: RecordedMessageChatTurn; isNew: boolean }> {
    const client = getAgentDatabase();
    const requestHash = createHash('sha256').update(JSON.stringify(turns)).digest('hex');
    const { data, error } = await client.from('message_chat_turns').insert({
        message_id: messageId, conversation_id: conversationId, request_id: requestId,
        request_hash: requestHash, question: turns[turns.length - 1].content, introduction,
    }).select(turnColumns).single();
    if (!error && data) return { turn: mapTurn(data as TurnRow), isNew: true };
    if (error?.code === '23505') {
        const existing = await client.from('message_chat_turns').select(turnColumns)
            .eq('message_id', messageId).eq('conversation_id', conversationId).eq('request_id', requestId).maybeSingle();
        if (!existing.error && existing.data?.request_hash === requestHash) {
            return { turn: mapTurn(existing.data as TurnRow), isNew: false };
        }
    }
    throw new Error('Otázku se nepodařilo uložit. Zkus to prosím znovu.');
}

/** A response is sent to the reader only after its durable write succeeds. */
export async function finishMessageChatTurn(id: string, result: { reply: string } | { error: string }): Promise<void> {
    const completed = 'reply' in result;
    const { data, error } = await getAgentDatabase().from('message_chat_turns').update({
        status: completed ? 'completed' : 'failed', reply: completed ? result.reply : null,
        error_message: completed ? null : result.error, completed_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'pending').select('id').maybeSingle();
    if (error || !data) throw new Error('Výsledek konverzace se nepodařilo uložit.');
}

export async function listMessageConversations(messageId: string, offset: number): Promise<MessageConversationPage> {
    const limit = 50;
    const { data, error } = await getAgentDatabase().from('message_chat_conversation_summaries')
        .select('conversation_id,started_at,last_activity_at,turn_count,failed_count,preview')
        .eq('message_id', messageId).order('started_at', { ascending: false }).order('conversation_id')
        .range(offset, offset + limit);
    if (error || !data) throw new Error('Konverzace se nepodařilo načíst.');
    return { conversations: data.slice(0, limit).map((row) => ({ conversationId: row.conversation_id,
        startedAt: row.started_at, lastActivityAt: row.last_activity_at, turnCount: row.turn_count,
        failedCount: row.failed_count, preview: row.preview })), hasMore: data.length > limit };
}

export async function listMessageConversationTurns(messageId: string, conversationId: string, offset: number): Promise<MessageConversationTurnsPage> {
    const limit = 100;
    const { data, error } = await getAgentDatabase().from('message_chat_turns').select(turnColumns)
        .eq('message_id', messageId).eq('conversation_id', conversationId)
        .order('created_at').order('id').range(offset, offset + limit);
    if (error || !data) throw new Error('Rozhovor se nepodařilo načíst.');
    return { turns: (data as TurnRow[]).slice(0, limit).map(mapTurn), hasMore: data.length > limit };
}
