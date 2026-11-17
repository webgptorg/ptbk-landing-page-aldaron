import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ database: vi.fn(), rpc: vi.fn(), ask: vi.fn(), access: vi.fn() }));
vi.mock('@/lib/pavol-avatar/database', () => ({ getAvatarDatabase: mocks.database }));
vi.mock('@/lib/pavol-avatar/service', () => ({ askAvatar: mocks.ask }));
vi.mock('@/lib/pavol-avatar/access', () => ({ getAvatarAccess: mocks.access }));
import { handleAvatarTelegramWebhook } from './telegram';
const secret = 's'.repeat(32);
function update(message: Record<string, unknown>, token: string | null = secret) {
    return new Request('https://pavolhejny.cz/api/pavol-avatar/telegram/webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'x-telegram-bot-api-secret-token': token } : {}) },
        body: JSON.stringify({ update_id: 123, message }),
    });
}
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('PAVOL_AVATAR_TELEGRAM_BOT_TOKEN', '123:' + 'x'.repeat(30));
    vi.stubEnv('PAVOL_AVATAR_TELEGRAM_BOT_USERNAME', 'PavolAvatarBot');
    vi.stubEnv('PAVOL_AVATAR_TELEGRAM_WEBHOOK_SECRET', secret);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    mocks.database.mockReturnValue({ rpc: mocks.rpc });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('Pavol Avatar Telegram webhook boundary', () => {
    it('rejects forged webhook calls before accessing private records or sending messages', async () => {
        const response = await handleAvatarTelegramWebhook(update({ from: { id: 123 }, chat: { id: 123, type: 'private' }, text: 'Question' }, 'wrong'));
        expect(response.status).toBe(401);
        expect(mocks.database).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('ignores groups, bot senders, and mismatched private chat IDs', async () => {
        for (const message of [
            { from: { id: 123 }, chat: { id: -10, type: 'group' }, text: 'Question' },
            { from: { id: 123, is_bot: true }, chat: { id: 123, type: 'private' }, text: 'Question' },
            { from: { id: 123 }, chat: { id: 456, type: 'private' }, text: 'Question' },
        ]) expect((await handleAvatarTelegramWebhook(update(message))).status).toBe(200);
        expect(mocks.database).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('acknowledges a durably claimed duplicate without spending allowance or sending a second reply', async () => {
        mocks.rpc.mockResolvedValue({ data: [{ claimed: false, response: null, sent_chunks: 0 }], error: null });
        const response = await handleAvatarTelegramWebhook(update({ from: { id: 123 }, chat: { id: 123, type: 'private' }, text: 'Question' }));
        expect(response.status).toBe(200);
        expect(mocks.rpc).toHaveBeenCalledWith('avatar_claim_telegram_update', expect.objectContaining({ p_update_id: 123, p_telegram_user_id: '123' }));
        expect(fetch).not.toHaveBeenCalled();
        expect(mocks.ask).not.toHaveBeenCalled();
    });
    it('keeps unfinished duplicate leases retryable so crashed workers can be reclaimed', async () => {
        mocks.rpc.mockResolvedValue({ data: [{ claimed: false, pending: true, response: null, sent_chunks: 0 }], error: null });
        const response = await handleAvatarTelegramWebhook(update({ from: { id: 123 }, chat: { id: 123, type: 'private' }, text: 'Question' }));
        expect(response.status).toBe(503);
        expect(fetch).not.toHaveBeenCalled();
    });
    it('resumes an already generated stored reply without running the model again', async () => {
        mocks.rpc.mockResolvedValue({ data: [{ claimed: true, response: 'Saved reply', sent_chunks: 0 }], error: null });
        const mutation = {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { update_id: 123 }, error: null }),
            then: (resolve: (value: { error: null }) => unknown) => Promise.resolve({ error: null }).then(resolve),
        };
        const from = vi.fn().mockReturnValue({ update: vi.fn().mockReturnValue(mutation) });
        mocks.database.mockReturnValue({ rpc: mocks.rpc, from });
        const response = await handleAvatarTelegramWebhook(update({ from: { id: 123 }, chat: { id: 123, type: 'private' }, text: 'Question' }));
        expect(response.status).toBe(200);
        expect(mocks.ask).not.toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledTimes(1);
        const [, init] = vi.mocked(fetch).mock.calls[0];
        expect(JSON.parse(String(init?.body))).toMatchObject({ chat_id: '123', text: 'Saved reply' });
    });
});
