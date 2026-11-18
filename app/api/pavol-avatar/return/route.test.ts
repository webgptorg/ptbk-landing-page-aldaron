import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
vi.mock('server-only', () => ({}));
const mock = vi.hoisted(() => ({ retrieve: vi.fn(), order: vi.fn(), refresh: vi.fn(), principal: vi.fn() }));
vi.mock('@/lib/pavol-avatar/auth', () => ({ getAvatarPrincipal: mock.principal }));
vi.mock('@/lib/pavol-avatar/config', () => ({ assertAvatarRequest: vi.fn(), getAvatarOrigin: () => 'https://pavolhejny.cz', getAvatarAvailability: () => ({ isTest: true }) }));
vi.mock('@/lib/pavol-avatar/database', () => ({ getAvatarDatabase: () => ({}) }));
vi.mock('@/lib/pavol-avatar/billing', () => ({ AVATAR_ORDER_METADATA: 'avatarOrderId', loadAvatarOrder: mock.order, refreshAvatarOrder: mock.refresh }));
vi.mock('@/lib/payments/stripeGateway', () => ({ getStripeGatewayOrNull: () => ({ stripe: { checkout: { sessions: { retrieve: mock.retrieve } } } }) }));
const sessionId = 'cs_test_avatar_return';
const request = () => new Request('https://pavolhejny.cz/api/pavol-avatar/return?session_id=' + sessionId);
beforeEach(() => {
    vi.clearAllMocks(); mock.principal.mockResolvedValue({ id: 'owner' });
    mock.order.mockResolvedValue({ id: 'order', principal_id: 'owner', stripe_session_id: sessionId });
    mock.refresh.mockResolvedValue(undefined);
});
describe('avatar checkout return', () => {
    it.each(['paid', 'no_payment_required'])('reconciles an owned completed checkout before confirming %s', async payment_status => {
        mock.retrieve.mockResolvedValue({ id: sessionId, livemode: false, metadata: { avatarOrderId: 'order' }, status: 'complete', payment_status });
        const result = await GET(request());
        expect(mock.refresh).toHaveBeenCalledTimes(1); expect(result.headers.get('location')).toBe('https://pavolhejny.cz/avatar?payment=confirmed');
    });
    it('does not confirm zero-total access if signed provider reconciliation fails', async () => {
        mock.retrieve.mockResolvedValue({ id: sessionId, livemode: false, metadata: { avatarOrderId: 'order' }, status: 'complete', payment_status: 'no_payment_required' });
        mock.refresh.mockRejectedValue(new Error('unverified invoice'));
        expect((await GET(request())).headers.get('location')).toBe('https://pavolhejny.cz/avatar?payment=unconfirmed');
    });
});
