import type { ArticleWordTimings } from '@/businesses/articles/articleTiming';

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

export type MessageChatTurn = { readonly role: 'user' | 'assistant'; readonly content: string };

/** The browser cannot supply system instructions, source documents or unlimited conversation history. */
export function parseMessageChatTurns(value: unknown): MessageChatTurn[] | null {
    if (!Array.isArray(value) || value.length === 0 || value.length > 16) return null;
    let length = 0;
    const turns: MessageChatTurn[] = [];
    for (const entry of value) {
        if (!entry || typeof entry !== 'object') return null;
        const turn = entry as Record<string, unknown>;
        if ((turn.role !== 'user' && turn.role !== 'assistant') ||
            typeof turn.content !== 'string' || !turn.content.trim() || turn.content.length > (turn.role === 'user' ? 4000 : 12000)) return null;
        length += turn.content.length;
        turns.push({ role: turn.role, content: turn.content.trim() });
    }
    return length <= 16000 && turns[turns.length - 1]?.role === 'user' ? turns : null;
}
