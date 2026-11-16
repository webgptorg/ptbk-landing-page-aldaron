import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/messages/messageDatabase', () => ({ MESSAGE_RESPONSE_HEADERS: { 'Cache-Control': 'private, no-store' } }));
const mocks = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock('@/lib/messages/messageAttachmentUpload', () => ({ uploadPublicChatAttachment: mocks.upload }));
import { POST } from './route';
const params = (embedId = 'pavol-avatar', language = 'cs') => ({ params: Promise.resolve({ embedId, language }) });
const request = (host: string) => new Request(`https://${host}/api/site-agents/pavol-avatar/cs/attachments`, { method: 'POST', headers: { host } });
beforeEach(() => { vi.resetAllMocks(); mocks.upload.mockResolvedValue(Response.json({ attachment: { id: 'file' } })); });

describe('full-avatar file uploads', () => {
    it('uses the existing bounded upload handler with the full-avatar conversation scope', async () => {
        for (const [language, host] of [['cs', 'pavolhejny.cz'], ['en', 'www.pavolhejny.com']]) {
            const req = request(host);
            expect((await POST(req, params('pavol-avatar', language))).status).toBe(200);
            expect(mocks.upload).toHaveBeenLastCalledWith(req, { sourceKey: `site-pavol-avatar-${language}` });
        }
    });
    it('does not accept uploads through a foreign domain, language or private agent identifier', async () => {
        expect((await POST(request('pavolhejny.com'), params())).status).toBe(404);
        expect((await POST(request('ptbk.io'), params())).status).toBe(404);
        expect((await POST(request('pavolhejny.cz'), params('unknown'))).status).toBe(404);
        expect((await POST(request('ptbk.io'), params('comparison'))).status).toBe(404);
        expect(mocks.upload).not.toHaveBeenCalled();
    });
});
