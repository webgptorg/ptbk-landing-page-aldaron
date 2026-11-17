import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/pavol-avatar/database', () => ({ getAvatarDatabase: vi.fn() }));
vi.mock('@/lib/pavol-avatar/service', () => ({ askAvatar: vi.fn() }));
vi.mock('@/lib/pavol-avatar/access', () => ({ getAvatarAccess: vi.fn() }));
import { createConnectorToken, hashCredential, readConnectorPrincipal } from './credentials';
import { createAvatarSetup, createAvatarSkill } from './setup';
import { isTelegramWebhookSecretValid, splitTelegramReply, telegramRequestUuid } from './telegram';
import { getAvatarTelegramConfiguration } from './telegramConfig';
afterEach(() => vi.unstubAllEnvs());
describe('Pavol Avatar connection helpers', () => {
    it('creates high-entropy credentials while storing only deterministic hashes', async () => {
        const first = createConnectorToken(); const second = createConnectorToken();
        expect(first).toMatch(/^pavol_[A-Za-z0-9_-]{43}$/);
        expect(second).not.toBe(first);
        expect(hashCredential(first)).toMatch(/^[a-f0-9]{64}$/);
        expect(hashCredential(first)).not.toContain(first);
        expect(await readConnectorPrincipal(new Request('https://pavolhejny.cz', { headers: { Authorization: 'Bearer invalid' } }))).toBeNull();
    });
    it('ships live-service guidance without a credential or copied private expertise', () => {
        const skill = createAvatarSkill('https://pavolhejny.cz');
        expect(skill).toContain('name: pavol-avatar');
        expect(skill).toContain('/api/pavol-avatar/mcp');
        expect(skill).toContain('consult_pavol');
        const setup = createAvatarSetup('https://pavolhejny.cz');
        expect(setup.codex).toContain('--bearer-token-env-var PAVOL_AVATAR_TOKEN');
        expect(JSON.parse(setup.claude)).toMatchObject({ mcpServers: { 'pavol-avatar': { headers: { Authorization: 'Bearer ${PAVOL_AVATAR_TOKEN}' } } } });
        expect(JSON.parse(setup.opencode)).toMatchObject({ mcp: { servers: { 'pavol-avatar': { oauth: false, headers: { Authorization: 'Bearer {env:PAVOL_AVATAR_TOKEN}' } } } } });
        expect(skill).not.toMatch(/pavol_[A-Za-z0-9_-]{43}/);
    });
    it('validates the webhook secret and hides unconfigured Telegram', () => {
        expect(isTelegramWebhookSecretValid('x'.repeat(32), 'x'.repeat(32))).toBe(true);
        expect(isTelegramWebhookSecretValid('x'.repeat(31), 'x'.repeat(32))).toBe(false);
        expect(isTelegramWebhookSecretValid('y'.repeat(32), 'x'.repeat(32))).toBe(false);
        expect(isTelegramWebhookSecretValid(null, 'x'.repeat(32))).toBe(false);
        vi.stubEnv('PAVOL_AVATAR_TELEGRAM_BOT_TOKEN', '123:' + 'x'.repeat(30));
        vi.stubEnv('PAVOL_AVATAR_TELEGRAM_BOT_USERNAME', 'PavolAvatarBot');
        vi.stubEnv('PAVOL_AVATAR_TELEGRAM_WEBHOOK_SECRET', '');
        expect(getAvatarTelegramConfiguration().available).toBe(false);
        vi.stubEnv('PAVOL_AVATAR_TELEGRAM_WEBHOOK_SECRET', 'x'.repeat(32));
        expect(getAvatarTelegramConfiguration().available).toBe(true);
    });
    it('preserves text and Unicode through Telegram message chunking', () => {
        const text = ('A'.repeat(3899) + '🧠\n').repeat(5);
        const chunks = splitTelegramReply(text);
        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks.every(chunk => chunk.length <= 3900)).toBe(true);
        expect(chunks.join('')).toBe(text);
        expect(chunks.every(chunk => !/[\uD800-\uDBFF]$/.test(chunk))).toBe(true);
    });
    it('derives stable separate request and conversation UUIDs', () => {
        expect(telegramRequestUuid('update:123')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(telegramRequestUuid('update:123')).toBe(telegramRequestUuid('update:123'));
        expect(telegramRequestUuid('conversation:123')).not.toBe(telegramRequestUuid('update:123'));
    });
});
