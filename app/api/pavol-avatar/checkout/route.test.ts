import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const state = vi.hoisted(() => ({ principal: vi.fn(), guard: vi.fn(), read: vi.fn(), checkout: vi.fn() }));
vi.mock('@/lib/pavol-avatar/auth', () => ({ getAvatarPrincipal: state.principal }));
vi.mock('@/lib/pavol-avatar/config', () => ({ assertAvatarRequest: state.guard, readAvatarJson: state.read }));
vi.mock('@/lib/pavol-avatar/billing', () => ({
    avatarCheckoutSchema: { safeParse: (value: unknown) => value ? { success: true, data: value } : { success: false } },
    createAvatarCheckout: state.checkout, AvatarBillingError: class AvatarBillingError extends Error {
    },
}));
import { POST } from './route';
beforeEach(() => { vi.clearAllMocks(); state.guard.mockReturnValue(undefined); state.principal.mockResolvedValue(null); });
describe('avatar checkout authentication', () => {
    it('rejects an unverified mailbox without calling checkout or parsing payment details', async () => {
        const response = await POST(new Request('https://pavolhejny.cz/api/pavol-avatar/checkout', { method: 'POST' }));
        expect(response.status).toBe(401);
        expect(state.checkout).not.toHaveBeenCalled();
        expect(state.read).not.toHaveBeenCalled();
    });
    it('rejects a cross-origin mutation before looking up any identity', async () => {
        state.guard.mockImplementation(() => { throw Object.assign(new Error('Origin refused'), { status: 403 }); });
        const response = await POST(new Request('https://pavolhejny.cz/api/pavol-avatar/checkout', { method: 'POST' }));
        expect(response.status).toBe(403);
        expect(state.principal).not.toHaveBeenCalled();
        expect(state.checkout).not.toHaveBeenCalled();
    });
    it('passes only the verified identity to the billing operation', async () => {
        const principal = { id: 'verified-id', email: 'owner@example.com' };
        state.principal.mockResolvedValue(principal);
        state.read.mockResolvedValue({ email: 'attacker@example.com' });
        state.checkout.mockResolvedValue('https://checkout.stripe.com/example');
        const response = await POST(new Request('https://pavolhejny.cz/api/pavol-avatar/checkout', { method: 'POST' }));
        expect(response.status).toBe(200);
        expect(state.checkout.mock.calls[0][1]).toBe(principal);
        expect(response.headers.get('cache-control')).toContain('no-store');
    });
    it('does not claim checkout succeeded when provider storage fails', async () => {
        state.principal.mockResolvedValue({ id: 'verified-id', email: 'owner@example.com' });
        state.read.mockResolvedValue({ valid: true });
        state.checkout.mockRejectedValue(new Error('Provider detail'));
        const response = await POST(new Request('https://pavolhejny.cz/api/pavol-avatar/checkout', { method: 'POST' }));
        expect(response.status).toBe(503);
        expect(await response.text()).not.toContain('Provider detail');
    });
});
