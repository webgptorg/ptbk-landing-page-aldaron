import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';
import { CHAT_ATTACHMENT_CONTEXT_MAX_BYTES, CHAT_ATTACHMENT_CONTEXT_MAX_COUNT, CHAT_ATTACHMENT_MAX_COUNT, messageAttachmentSchema, type MessageChatAttachment } from './messageAttachments';
import { CHAT_CONTEXT_MAX_CHARACTERS, CHAT_QUESTION_MAX_CHARACTERS, CHAT_REPLY_MAX_CHARACTERS } from './messageChatLimits';

export type SharedMessage = {
    readonly version: 1;
    readonly title: string;
    readonly createdAt: string;
    readonly markdown: string;
    readonly context: string;
    readonly audio?: {
        readonly duration: number;
        readonly byteLength: number;
        readonly voiceName: string;
    };
    readonly timings?: ArticleWordTimings;
};

export type MessageChatTurn = { readonly role: 'user' | 'assistant'; readonly content: string; readonly attachments?: readonly MessageChatAttachment[];
    readonly voice?: import('@/lib/voice-chat/types').VoicePlayback };

/** The browser cannot supply system instructions, source documents or unlimited conversation history. */
export function parseMessageChatTurns(value: unknown): MessageChatTurn[] | null {
    if (!Array.isArray(value) || value.length === 0 || value.length > 16) return null;
    let length = 0, fileCount = 0, fileBytes = 0;
    const turns: MessageChatTurn[] = [];
    for (const entry of value) {
        if (!entry || typeof entry !== 'object') return null;
        const turn = entry as Record<string, unknown>;
        if ((turn.role !== 'user' && turn.role !== 'assistant') ||
            typeof turn.content !== 'string' || !turn.content.trim() || turn.content.length > (turn.role === 'user' ? CHAT_QUESTION_MAX_CHARACTERS : CHAT_REPLY_MAX_CHARACTERS)) return null;
        const files = messageAttachmentSchema.array().max(CHAT_ATTACHMENT_MAX_COUNT).safeParse(turn.attachments ?? []);
        if (!files.success || (turn.role === 'assistant' && files.data.length > 0)) return null;
        fileCount += files.data.length; fileBytes += files.data.reduce((total, file) => total + file.byteLength, 0);
        length += turn.content.length;
        turns.push({ role: turn.role, content: turn.content.trim(), ...(files.data.length ? { attachments: files.data } : {}) });
    }
    return length <= CHAT_CONTEXT_MAX_CHARACTERS && fileCount <= CHAT_ATTACHMENT_CONTEXT_MAX_COUNT && fileBytes <= CHAT_ATTACHMENT_CONTEXT_MAX_BYTES && turns[turns.length - 1]?.role === 'user' ? turns : null;
}
