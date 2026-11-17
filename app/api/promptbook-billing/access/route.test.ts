import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const fakes = vi.hoisted(() => ({ send: vi.fn(), verify: vi.fn(), account: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/promptbook-licensing/accounts', () => ({ ensureLicenseAccount: fakes.account }));
vi.mock('@/lib/promptbook-billing/memberAccess', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/lib/promptbook-billing/memberAccess')>(),
    getMemberBillingContext: () => ({ database: {}, isTest: false }),
    getMemberEmailAuth: () => ({ signInWithOtp: fakes.send, verifyOtp: fakes.verify }),
}));

import { POST } from './route';

function request(body: unknown, headers: Record<string, string> = {}) {
    return new NextRequest('https://ptbk.io/api/promptbook-billing/access', {
        method: 'POST',
        headers: { host: 'ptbk.io', 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PROMPTBOOK_BILLING_ACCESS_SECRET', 'test-member-secret-'.repeat(3));
    fakes.send.mockResolvedValue({ error: null });
    fakes.verify.mockResolvedValue({
        data: { user: { email: 'member@example.com', email_confirmed_at: '2026-11-17T08:00:00Z' } },
        error: null,
    });
});
afterEach(() => vi.unstubAllEnvs());

describe('member email authentication', () => {
    it('acknowledges provider acceptance without granting access and supplies a production return URL', async () => {
        const response = await POST(request({ action: 'send', email: ' Member@Example.com ' }));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isCodeSent: true });
        expect(fakes.send).toHaveBeenCalledWith({
            email: 'member@example.com',
            options: { emailRedirectTo: 'https://ptbk.io/cs/pricing/predplatne' },
        });
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(fakes.account).not.toHaveBeenCalled();
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });

    it.each([429, 403, 500])('does not claim a code was sent when the provider refuses with %s', async (status) => {
        fakes.send.mockResolvedValue({ error: { status, message: 'private provider diagnostic' } });
        const response = await POST(request({ action: 'send', email: 'member@example.com' }));
        expect(response.status).toBe(status === 429 ? 429 : 503);
        const body = await response.json();
        expect(body).not.toHaveProperty('isCodeSent');
        expect(body).toHaveProperty('error', expect.stringContaining('nepodařilo odeslat'));
        expect(JSON.stringify(body)).not.toContain('private provider diagnostic');
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(fakes.account).not.toHaveBeenCalled();
    });

    it('reports a rejected send request without false success or an unhandled 500', async () => {
        fakes.send.mockRejectedValue(new Error('private network diagnostic'));
        const response = await POST(request({ action: 'send', email: 'member@example.com' }));
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Kód se nepodařilo odeslat. Zkuste to prosím později.' });
        expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('never copies a caller-controlled host into the return URL', async () => {
        await POST(request({ action: 'send', email: 'member@example.com' }, { host: 'attacker.example' }));
        expect(fakes.send).toHaveBeenCalledWith(expect.objectContaining({
            options: { emailRedirectTo: 'https://www.ptbk.io/cs/pricing/predplatne' },
        }));
    });

    it('creates the account and signed member cookie only after confirmed matching ownership', async () => {
        const response = await POST(request({ action: 'verify', email: 'MEMBER@example.com', code: '12345678' }));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isVerified: true });
        expect(fakes.verify).toHaveBeenCalledWith({ email: 'member@example.com', token: '12345678', type: 'email' });
        expect(fakes.account).toHaveBeenCalledWith('member@example.com');
        expect(response.cookies.get('promptbook_member_v2')).toMatchObject({
            value: expect.stringMatching(/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/),
            path: '/', httpOnly: true, secure: true, sameSite: 'lax',
        });
    });

    it.each([
        { email: 'another@example.com', email_confirmed_at: '2026-11-17T08:00:00Z' },
        { email: 'member@example.com', email_confirmed_at: null },
        null,
    ])('does not grant access for an unconfirmed or different identity: %o', async (user) => {
        fakes.verify.mockResolvedValue({ data: { user }, error: null });
        const response = await POST(request({ action: 'verify', email: 'member@example.com', code: '123456' }));
        expect(response.status).toBe(403);
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(fakes.account).not.toHaveBeenCalled();
    });

    it('keeps a verification transport failure recoverable without creating an account or session', async () => {
        fakes.verify.mockRejectedValue(new Error('private network diagnostic'));
        const response = await POST(request({ action: 'verify', email: 'member@example.com', code: '123456' }));
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Kód se teď nepodařilo ověřit. Zkuste to prosím znovu.' });
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(fakes.account).not.toHaveBeenCalled();
    });

    it('rejects cross-site sends before contacting Auth', async () => {
        const response = await POST(request({ action: 'send', email: 'member@example.com' }, {
            origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site',
        }));
        expect(response.status).toBe(403);
        expect(fakes.send).not.toHaveBeenCalled();
    });
});
