import { z } from 'zod';
import { CHAT_ATTACHMENT_MAX_COUNT, messageAttachmentSchema } from './messageAttachments';
import { CHAT_QUESTION_MAX_CHARACTERS } from './messageChatLimits';

export const storedChatTurnSchema = z.object({
    role: z.enum(['user', 'assistant']), content: z.string(), createdAt: z.string().datetime().optional(),
    attachments: messageAttachmentSchema.array().max(CHAT_ATTACHMENT_MAX_COUNT).optional(),
    voice: z.object({ status: z.enum(['streaming', 'completed', 'interrupted', 'failed']), spokenText: z.string().max(6000) }).optional(),
    turnId: z.string().uuid().optional(),
});
const sessionSchema = z.object({
    version: z.literal(1), conversationId: z.string().uuid(), turns: z.array(storedChatTurnSchema),
    draft: z.string().max(CHAT_QUESTION_MAX_CHARACTERS), retry: z.object({ history: z.string(), id: z.string().uuid() }).nullable(),
    attachments: messageAttachmentSchema.array().max(CHAT_ATTACHMENT_MAX_COUNT).default([]),
});
export type MessageChatSession = z.infer<typeof sessionSchema>;
export const messageChatStorageKey = (source: string) => `pavol-chat:v1:${source}`;

/** Local history is deliberately independent of the model's small context window. */
export function readMessageChatSession(storage: Pick<Storage, 'getItem'>, source: string): MessageChatSession | null {
    const value = storage.getItem(messageChatStorageKey(source));
    if (!value) return null;
    try {
        const parsed = sessionSchema.safeParse(JSON.parse(value));
        return parsed.success ? parsed.data : null;
    } catch { return null; }
}
