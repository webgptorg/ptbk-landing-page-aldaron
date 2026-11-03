import { z } from 'zod';
import { CHAT_ATTACHMENT_MAX_COUNT, messageAttachmentSchema } from './messageAttachments';

export const storedChatTurnSchema = z.object({
    role: z.enum(['user', 'assistant']), content: z.string(), createdAt: z.string().datetime().optional(),
    attachments: messageAttachmentSchema.array().max(CHAT_ATTACHMENT_MAX_COUNT).optional(),
});
const sessionSchema = z.object({
    version: z.literal(1), conversationId: z.string().uuid(), turns: z.array(storedChatTurnSchema),
    draft: z.string().max(4000), retry: z.object({ history: z.string(), id: z.string().uuid() }).nullable(),
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
