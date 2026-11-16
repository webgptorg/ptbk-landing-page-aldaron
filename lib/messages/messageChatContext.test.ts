import { describe, expect, it } from 'vitest';
import { selectMessageChatContext } from './messageChatContext';
import { parseMessageChatTurns } from './messageTypes';
import { CHAT_CONTEXT_MAX_CHARACTERS } from './messageChatLimits';

describe('long answers and the bounded public model window', () => {
    it('keeps the beginning and end of a long answer without discarding or mutating visible history', () => {
        const answer = 'Beginning. ' + 'A long interview answer. '.repeat(1300) + ' Final recommendation.';
        const turns = [{ role: 'user' as const, content: 'Interview questions' }, { role: 'assistant' as const, content: answer }];
        const next = { role: 'user' as const, content: 'Explain the recommendation.' };
        const context = selectMessageChatContext(turns, next);
        expect(context).toHaveLength(2);
        expect(context[0].content).toMatch(/^Beginning\./);
        expect(context[0].content).toContain('middle omitted from model context');
        expect(context[0].content).toMatch(/Final recommendation\.$/);
        expect(context.reduce((sum, turn) => sum + turn.content.length, 0)).toBe(CHAT_CONTEXT_MAX_CHARACTERS);
        expect(parseMessageChatTurns(context)).toEqual(context);
        expect(turns[1].content).toBe(answer);
    });
    it('retains complete short conversations and still rejects oversized new questions', () => {
        const turns = [{ role: 'assistant' as const, content: 'Hello' }];
        const next = { role: 'user' as const, content: 'Question' };
        expect(selectMessageChatContext(turns, next)).toEqual([...turns, next]);
        expect(parseMessageChatTurns([{ role: 'user', content: 'x'.repeat(4001) }])).toBeNull();
        expect(parseMessageChatTurns([{ role: 'assistant', content: 'x'.repeat(12001) }, next])).not.toBeNull();
        expect(parseMessageChatTurns([{ role: 'assistant', content: 'x'.repeat(16000) }, next])).toBeNull();
    });
});
