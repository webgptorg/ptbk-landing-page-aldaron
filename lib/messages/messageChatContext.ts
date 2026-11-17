import type { MessageChatTurn } from './messageTypes';
import { CHAT_CONTEXT_MAX_CHARACTERS } from './messageChatLimits';
import { CHAT_ATTACHMENT_CONTEXT_MAX_BYTES, CHAT_ATTACHMENT_CONTEXT_MAX_COUNT } from './messageAttachments';

/** Keep complete display/export history; only this explicitly marked model window is bounded. */
export function selectMessageChatContext(turns: readonly MessageChatTurn[], question: MessageChatTurn): MessageChatTurn[] {
    const previous: MessageChatTurn[] = [];
    let length = question.content.length;
    let fileCount = question.attachments?.length ?? 0;
    let fileBytes = question.attachments?.reduce((total, file) => total + file.byteLength, 0) ?? 0;
    for (const original of turns.slice(-14).reverse()) {
        const turn = original.voice && original.voice.status !== 'completed'
            ? { ...original, content: original.content + '\n[Voice playback was not completed. Confirmed played portion: ' + JSON.stringify(original.voice.spokenText) + '. The next phrase may have been partly audible.]' }
            : original;
        const files = turn.attachments ?? [];
        const bytes = files.reduce((total, file) => total + file.byteLength, 0);
        if (fileCount + files.length > CHAT_ATTACHMENT_CONTEXT_MAX_COUNT || fileBytes + bytes > CHAT_ATTACHMENT_CONTEXT_MAX_BYTES) break;
        const available = CHAT_CONTEXT_MAX_CHARACTERS - length;
        if (turn.content.length > available) {
            const marker = '\n\n[Excerpt of an earlier reply: middle omitted from model context; the full answer remains in the chat.]\n\n';
            if (turn.role === 'assistant' && available > marker.length + 256) {
                const take = available - marker.length;
                const head = Math.ceil(take * .65);
                previous.unshift({ role: turn.role, content: turn.content.slice(0, head) + marker + turn.content.slice(-(take - head)) });
            }
            break;
        }
        previous.unshift({ role: turn.role, content: turn.content, ...(files.length ? { attachments: files } : {}) });
        length += turn.content.length;
        fileCount += files.length;
        fileBytes += bytes;
    }
    return [...previous, question];
}
