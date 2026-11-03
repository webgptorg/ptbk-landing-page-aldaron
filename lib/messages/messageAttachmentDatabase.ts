import 'server-only';
import { randomUUID } from 'node:crypto';
import { getAgentDatabase } from '@/lib/agents/agentDatabase';
import { getObjectStorage, putStoredObject, removeStoredObject, signStoredObject } from '@/lib/storage/objectStorage';
import type { AgentAttachmentInput } from '@/lib/agents/agentRuntime';
import { CHAT_ATTACHMENT_CONTEXT_MAX_BYTES, CHAT_ATTACHMENT_CONTEXT_MAX_COUNT, inspectChatAttachment, type MessageChatAttachment } from './messageAttachments';
import type { ChatConversationSource } from './messageConversationDatabase';
import type { MessageChatTurn } from './messageTypes';

export type ChatAttachmentRow = {
    id: string; message_id: string | null; source_key: string | null; conversation_id: string;
    object_key: string; file_name: string; content_type: MessageChatAttachment['contentType']; byte_length: number;
};
const columns = 'id,message_id,source_key,conversation_id,object_key,file_name,content_type,byte_length';
const sourceFields = (source: ChatConversationSource) => typeof source === 'string' ? { message_id: source } : { source_key: source.sourceKey };
function mapAttachment(row: ChatAttachmentRow): MessageChatAttachment {
    return { id: row.id, name: row.file_name, contentType: row.content_type, byteLength: row.byte_length };
}

export async function storeChatAttachment(source: ChatConversationSource, conversationId: string, name: string, bytes: Uint8Array): Promise<MessageChatAttachment> {
    const contentType = inspectChatAttachment(name, bytes);
    const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf', 'text/plain': 'txt' }[contentType];
    const id = randomUUID(), objectKey = `message-chat-attachments/${id}.${extension}`;
    const safeName = name.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 200) || 'priloha';
    await putStoredObject(objectKey, bytes, contentType);
    const { data, error } = await getAgentDatabase().from('message_chat_attachments').insert({
        id, ...sourceFields(source), conversation_id: conversationId, object_key: objectKey,
        file_name: safeName, content_type: contentType, byte_length: bytes.length,
    }).select(columns).single();
    if (error || !data) {
        try { await removeStoredObject(objectKey); } catch { console.warn('Unrecorded chat attachment cleanup failed.'); }
        throw new Error('Přílohu se nepodařilo uložit. Zkus to prosím znovu.');
    }
    return mapAttachment(data as ChatAttachmentRow);
}

export async function loadChatAttachment(id: string): Promise<ChatAttachmentRow | null> {
    const { data, error } = await getAgentDatabase().from('message_chat_attachments').select(columns).eq('id', id).maybeSingle();
    if (error) throw new Error('Přílohu se nepodařilo načíst.');
    return data as ChatAttachmentRow | null;
}

/** IDs are the only client authority: names, types, storage locations and scope come from our database. */
export async function resolveChatAttachments(source: ChatConversationSource, conversationId: string, turns: readonly MessageChatTurn[]) {
    const ids = Array.from(new Set(turns.flatMap((turn) => (turn.attachments ?? []).map((file) => file.id))));
    if (!ids.length) return { turns: [...turns], files: [] as ChatAttachmentRow[] };
    const { data, error } = await getAgentDatabase().from('message_chat_attachments').select(columns)
        .match(sourceFields(source)).eq('conversation_id', conversationId).in('id', ids);
    if (error || !data || data.length !== ids.length) throw new Error('Některá příloha nepatří k tomuto chatu nebo už není dostupná.');
    const files = data as ChatAttachmentRow[], byId = new Map(files.map((file) => [file.id, mapAttachment(file)]));
    if (files.length > CHAT_ATTACHMENT_CONTEXT_MAX_COUNT || files.reduce((sum, file) => sum + file.byte_length, 0) > CHAT_ATTACHMENT_CONTEXT_MAX_BYTES) throw new Error('Přílohy jsou pro jednu otázku příliš velké.');
    return { files, turns: turns.map((turn) => turn.attachments?.length ? { ...turn, attachments: turn.attachments.map((file) => byId.get(file.id)!) } : turn) };
}

export async function createChatAttachmentInputs(files: readonly ChatAttachmentRow[]): Promise<AgentAttachmentInput[]> {
    return Promise.all(files.map(async (file): Promise<AgentAttachmentInput> => {
        const label = `Quoted attachment ${file.id}: ${file.file_name}`;
        if (file.content_type === 'text/plain') {
            const { data, error } = await getObjectStorage().download(file.object_key);
            if (error || !data || data.size !== file.byte_length) throw new Error('Textovou přílohu se nepodařilo načíst.');
            return { kind: 'text', label, text: await data.text() };
        }
        return { kind: file.content_type === 'application/pdf' ? 'pdf' : 'image', label, url: await signStoredObject(file.object_key) };
    }));
}
