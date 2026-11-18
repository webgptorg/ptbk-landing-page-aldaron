import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({
    verify: vi.fn(), account: vi.fn(), memberCookie: vi.fn(), communityCookie: vi.fn(),
    avatarVerify: vi.fn(), avatarSession: vi.fn(), rate: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/promptbook-licensing/accounts', () => ({ ensureLicenseAccount: mocks.account }));
vi.mock('@/lib/promptbook-billing/memberAccess', () => ({
    getMemberEmailAuth: () => ({ verifyOtp: mocks.verify }), writeMemberEmailCookie: mocks.memberCookie,
}));
vi.mock('@/lib/community-membership/communityMembershipIdentity', () => ({
    createCommunityEmailVerificationClient: () => ({ auth: { verifyOtp: mocks.verify } }),
    isCommunityEmailVerificationEnabled: () => true, writeVerifiedCommunityEmailCookie: mocks.communityCookie,
}));
vi.mock('@/lib/pavol-avatar/auth', () => ({
    allowAvatarAuthAttempt: mocks.rate, createAvatarSession: mocks.avatarSession, verifyAvatarEmail: mocks.avatarVerify,
}));
import { GET, POST } from './route';

function request(flow = 'billing', extra: Record<string, unknown> = {}, origin = 'https://ptbk.io', headers = {}) {
    return new NextRequest(origin + '/api/auth/email', { method: 'POST',
        headers: { origin, 'content-type': 'application/json', ...headers },
        body: JSON.stringify({ flow, next: '/cs?code=SALE#trial', tokenHash: 'a'.repeat(64), ...extra }) });
}
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAVOL_AVATAR_ENABLED', 'true');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service');
    mocks.verify.mockResolvedValue({ data: { user: { email: ' Person@Example.com ', email_confirmed_at: '2026-11-18' } }, error: null });
    mocks.avatarVerify.mockResolvedValue('person@example.com');
    mocks.memberCookie.mockReturnValue(true);
    mocks.communityCookie.mockReturnValue(true);
});
afterEach(() => vi.unstubAllEnvs());

describe('clickable email sign-in', () => {
    it('does not consume a token or set a session on GET, including email-link prefetch', async () => {
        const response = GET();
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
        expect(response.headers.get('referrer-policy')).toBe('no-referrer');
        expect(response.headers.get('content-security-policy')).toContain("connect-src 'self'");
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(mocks.verify).not.toHaveBeenCalled();
        expect(mocks.avatarVerify).not.toHaveBeenCalled();
        const html = await response.text();
        expect(html).toContain("hash.get('token_hash')");
        expect(html).toContain('history.replaceState');
        expect(html).not.toContain('https://');
    });
    it('creates a member account and cookie only from the verified mailbox and returns the exact starting location', async () => {
        const response = await POST(request());
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isVerified: true, returnTo: '/cs?code=SALE#trial' });
        expect(mocks.verify).toHaveBeenCalledWith({ token_hash: 'a'.repeat(64), type: 'email' });
        expect(mocks.account).toHaveBeenCalledWith('person@example.com');
        expect(mocks.memberCookie).toHaveBeenCalledWith(expect.any(NextRequest), expect.anything(), 'person@example.com');
        expect(mocks.communityCookie).not.toHaveBeenCalled();
        expect(mocks.avatarSession).not.toHaveBeenCalled();
    });
    it('sets only the avatar session on its original personal domain', async () => {
        const response = await POST(request('avatar', { next: '/avatar?code=SALE' }, 'https://pavolhejny.com'));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isVerified: true, returnTo: '/avatar?code=SALE' });
        expect(mocks.avatarSession).toHaveBeenCalledWith(expect.any(NextRequest), expect.anything(), 'person@example.com');
        expect(mocks.memberCookie).not.toHaveBeenCalled();
        expect(mocks.account).not.toHaveBeenCalled();
    });
    it('supports community verification in a new browser without requiring the original room session', async () => {
        const response = await POST(request('community', { next: '/cs/komunity/vyvojari#archive' }));
        expect(response.status).toBe(200);
        expect(mocks.communityCookie).toHaveBeenCalledWith(expect.anything(), 'person@example.com');
        expect(mocks.memberCookie).not.toHaveBeenCalled();
    });
    it.each([
        { data: { user: null }, error: null },
        { data: { user: { email: 'person@example.com' } }, error: null },
        { data: { user: { email: 'person@example.com', email_confirmed_at: '2026-11-18' } }, error: { status: 403 } },
    ])('never grants access for an expired, reused or unconfirmed token', async (result) => {
        mocks.verify.mockResolvedValue(result);
        expect((await POST(request())).status).toBe(403);
        expect(mocks.memberCookie).not.toHaveBeenCalled();
        expect(mocks.account).not.toHaveBeenCalled();
    });
    it('does not leak provider diagnostics on transport failure', async () => {
        mocks.verify.mockRejectedValue(new Error('sensitive provider detail'));
        const response = await POST(request());
        expect(response.status).toBe(503);
        expect(await response.text()).not.toContain('sensitive provider detail');
        expect(mocks.memberCookie).not.toHaveBeenCalled();
    });
    it('rejects cross-site verification before consuming a token', async () => {
        const response = await POST(request('billing', {}, 'https://ptbk.io', { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }));
        expect(response.status).toBe(403);
        expect(mocks.verify).not.toHaveBeenCalled();
    });
    it('does not verify an avatar login on another product domain', async () => {
        expect((await POST(request('avatar'))).status).toBe(404);
        expect(mocks.avatarVerify).not.toHaveBeenCalled();
    });
    it('cannot redirect credentials or the authenticated browser off site', async () => {
        const response = await POST(request('billing', { next: '//evil.example/' }));
        expect(await response.json()).toEqual({ isVerified: true, returnTo: '/' });
    });
});
