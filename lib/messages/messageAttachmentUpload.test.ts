import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ store: vi.fn() }));
vi.mock('@/lib/messages/messageAttachmentDatabase', () => ({ storeChatAttachment: mocks.store }));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
import { uploadPublicChatAttachment } from './messageAttachmentUpload';
const conversation = '6c21d70d-0991-4a1d-a2f9-39d599148b5b';
const upload = (file: File, origin = 'https://pavolhejny.cz') => {
    const form = new FormData(); form.set('file', file); form.set('conversationId', conversation);
    return new Request('https://pavolhejny.cz/api/messages/meeting/attachments', { method: 'POST', headers: { origin }, body: form });
};
beforeEach(() => { mocks.store.mockResolvedValue({ id: conversation, name: 'notes.md', contentType: 'text/plain', byteLength: 7 }); });
afterEach(() => vi.clearAllMocks());
describe('public bounded file uploads', () => {
    it('passes the file bytes and source/conversation to the shared CDN storage and returns only durable metadata', async () => {
        const response = await uploadPublicChatAttachment(upload(new File(['# Notes'], 'notes.md')), 'source-message-id');
        expect(response.status).toBe(200);
        expect(mocks.store).toHaveBeenCalledWith('source-message-id', conversation, 'notes.md', new TextEncoder().encode('# Notes'));
        expect(await response.json()).toEqual({ attachment: { id: conversation, name: 'notes.md', contentType: 'text/plain', byteLength: 7 } });
        expect(response.headers.get('cache-control')).toContain('no-store');
    });
    it('rejects cross-site and oversized uploads before storing anything', async () => {
        expect((await uploadPublicChatAttachment(upload(new File(['text'], 'notes.txt'), 'https://other.example'), 'message')).status).toBe(403);
        const oversized = new Request('https://pavolhejny.cz/api/messages/meeting/attachments', { method: 'POST', body: new Uint8Array(4 * 1024 * 1024 + 70000) });
        expect((await uploadPublicChatAttachment(oversized, 'message')).status).toBe(413);
        expect(mocks.store).not.toHaveBeenCalled();
    });
});
