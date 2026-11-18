import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ send: vi.fn(), verify: vi.fn(), cookie: vi.fn() }));
vi.mock('@/lib/community-membership/communityMembershipIdentity', () => ({
    createCommunityEmailVerificationClient: () => ({ auth: { signInWithOtp: mocks.send, verifyOtp: mocks.verify } }),
    isCommunityEmailVerificationEnabled: () => true,
    writeVerifiedCommunityEmailCookie: mocks.cookie,
}));
vi.mock('@/lib/community-membership/communityMembershipRoomRequest', () => ({
    getAuthenticatedMembershipRoomRequest: async () => ({ participant: { email: ' Member@Example.com ' } }),
    isAuthenticatedMembershipRoomRequest: () => true,
}));
import { POST } from './route';
const context = { params: Promise.resolve({ workshopSlug: 'workshop' }) };
function request(body: unknown) {
    return new NextRequest('https://ptbk.io/api/workshops/workshop/membership/verification', {
        method: 'POST', headers: { origin: 'https://ptbk.io', 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
}
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service');
    mocks.send.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
describe('community sign-in delivery', () => {
    it('keeps the initiating room and fragment, without granting access just for requesting an email', async () => {
        const response = await POST(request({ action: 'send', returnTo: '/cs/online-workshop?term=workshop#materials' }), context);
        expect(response.status).toBe(200);
        const options = mocks.send.mock.calls[0][0];
        expect(options.email).toBe('member@example.com');
        const link = new URL(options.options.emailRedirectTo);
        expect(link.origin).toBe('https://ptbk.io');
        expect(link.searchParams.get('flow')).toBe('community');
        expect(link.searchParams.get('next')).toBe('/cs/online-workshop?term=workshop#materials');
        expect(mocks.cookie).not.toHaveBeenCalled();
    });
    it.each([429, 500])('reports provider refusal %s without claiming delivery', async (status) => {
        mocks.send.mockResolvedValue({ error: { status } });
        const response = await POST(request({ action: 'send' }), context);
        expect(response.status).toBe(status === 429 ? 429 : 503);
        expect(await response.json()).not.toHaveProperty('isCodeSent');
        expect(mocks.cookie).not.toHaveBeenCalled();
    });
    it('keeps a network failure recoverable without exposing provider data', async () => {
        mocks.send.mockRejectedValue(new Error('private mail diagnostic'));
        const response = await POST(request({ action: 'send' }), context);
        expect(response.status).toBe(503);
        expect(await response.text()).not.toContain('private mail diagnostic');
    });
});
