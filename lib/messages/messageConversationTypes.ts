export type MessageConversation = {
    readonly conversationId: string;
    readonly startedAt: string;
    readonly lastActivityAt: string;
    readonly turnCount: number;
    readonly failedCount: number;
    readonly preview: string;
};

export type RecordedMessageChatTurn = {
    readonly id: string;
    readonly question: string;
    readonly introduction: string;
    readonly reply: string | null;
    readonly status: 'pending' | 'completed' | 'failed';
    readonly errorMessage: string | null;
    readonly createdAt: string;
    readonly completedAt: string | null;
};

export type MessageConversationPage = { conversations: MessageConversation[]; hasMore: boolean };
export type MessageConversationTurnsPage = { turns: RecordedMessageChatTurn[]; hasMore: boolean };
