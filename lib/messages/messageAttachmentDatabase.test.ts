import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ db: vi.fn(), put: vi.fn(), remove: vi.fn(), sign: vi.fn(), download: vi.fn() }));
vi.mock('@/lib/agents/agentDatabase', () => ({ getAgentDatabase: mocks.db }));
vi.mock('@/lib/storage/objectStorage', () => ({ putStoredObject: mocks.put, removeStoredObject: mocks.remove, signStoredObject: mocks.sign, getObjectStorage: () => ({ download: mocks.download }) }));
import { resolveChatAttachments, storeChatAttachment } from './messageAttachmentDatabase';
const id = '6c21d70d-0991-4a1d-a2f9-39d599148b5b';
const attachment = { id, name: 'forged.txt', contentType: 'text/plain' as const, byteLength: 1 };
afterEach(() => vi.resetAllMocks());
describe('durable CDN file ownership', () => {
    it('resolves IDs only within their original source and conversation, replacing browser metadata', async () => {
        const row = { id, message_id: 'message', source_key: null, conversation_id: 'conversation', object_key: `message-chat-attachments/${id}`, file_name: 'actual.png', content_type: 'image/png', byte_length: 200 };
        const query: Record<string, ReturnType<typeof vi.fn>> = {};
        for (const key of ['select', 'match', 'eq']) query[key] = vi.fn(() => query);
        query.in = vi.fn().mockResolvedValue({ data: [row], error: null });
        mocks.db.mockReturnValue({ from: () => query });
        const result = await resolveChatAttachments('message', 'conversation', [{ role: 'user', content: '?', attachments: [attachment] }]);
        expect(query.match).toHaveBeenCalledWith({ message_id: 'message' });
        expect(query.eq).toHaveBeenCalledWith('conversation_id', 'conversation');
        expect(result.turns[0].attachments).toEqual([{ id, name: 'actual.png', contentType: 'image/png', byteLength: 200 }]);
        query.in.mockResolvedValueOnce({ data: [], error: null });
        await expect(resolveChatAttachments('other-message', 'other-conversation', result.turns)).rejects.toThrow('nepatří');
    });
    it('removes uploaded bytes when the durable record cannot be written', async () => {
        const query = { insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: { message: 'private diagnostics' } }) };
        mocks.db.mockReturnValue({ from: () => query });
        await expect(storeChatAttachment('message', id, 'notes.txt', new TextEncoder().encode('Notes'))).rejects.toThrow('Přílohu se nepodařilo uložit');
        expect(mocks.put).toHaveBeenCalledOnce();
        expect(mocks.remove).toHaveBeenCalledWith(mocks.put.mock.calls[0][0]);
    });
});
