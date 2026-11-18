import { createExpectedDiscount, type DiscountPriceRule } from '@/lib/discounts/discountPricing';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { avatarCheckoutSchema, createAvatarCheckout, type AvatarCheckoutInput } from './billing';

vi.mock('server-only', () => ({}));
const mock = vi.hoisted(() => ({ gateway: vi.fn(), database: vi.fn(), reserve: vi.fn(), settle: vi.fn() }));
vi.mock('@/lib/payments/stripeGateway', () => ({ getStripeGatewayOrNull: mock.gateway }));
vi.mock('./database', () => ({ getAvatarDatabase: mock.database }));
vi.mock('./webhookPreflight', () => ({ ensureAvatarStripeWebhook: vi.fn() }));
vi.mock('./config', () => ({ AVATAR_PRICE_CZK: 1000, AVATAR_TERMS_VERSION: '2026-11-17-v1', AVATAR_TERMS_PATH: '/avatar/legal/terms/2026-11-17-v1', getAvatarAvailability: () => ({ billingEnabled: true, isTest: true, limits: { full: 500 } }), getAvatarOrigin: () => 'https://pavolhejny.cz' }));
vi.mock('@/lib/legal/productLegalAvatar', () => ({ avatarLegalContractSnapshot: () => ({ terms: 'Accepted edition' }) }));
vi.mock('@/lib/promptbook-billing/billingIdentity', () => ({ resolvePromptbookCheckoutIdentity: async (value: AvatarCheckoutInput) => ({ name: value.billingName, address: value.billingAddress, companyId: null, vatId: null, taxTreatment: 'domestic' }) }));
vi.mock('@/lib/discounts/discountCodeDatabase', () => ({ reserveSubscriptionDiscountCode: mock.reserve, settleSubscriptionDiscountReservation: mock.settle }));

const id = '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d0';
const principal = { id: 'eaa62e24-25f9-42bd-93af-63127dd50001', email: 'buyer@example.test' };
const input = (): AvatarCheckoutInput => ({ requestId: id, fullname: 'Buyer', country: 'CZ', customerType: 'individual', billingName: 'Buyer', billingAddress: { line1: 'Street 1', city: 'Praha', postal_code: '11000', country: 'CZ' }, termsAccepted: true, immediateStartAccepted: true, termsVersion: '2026-11-17-v1', discountCode: ' letní 30 ', expectedDiscount: { percent: 30, months: 3 } });
const request = new Request('https://pavolhejny.cz/api/pavol-avatar/checkout');
type Row = Record<string, unknown>;
function database() {
    const rows: Row[] = [];
    const from = (table: string) => {
        if (table !== 'avatar_orders') throw new Error('Unexpected table ' + table);
        const filters: ((row: Row) => boolean)[] = [];
        let action = 'select', payload: Row = {};
        const execute = () => {
            if (action === 'insert') rows.push({ revision: 0, stripe_customer_id: null, stripe_session_id: null, stripe_subscription_id: null, paid_through: null, created_at: new Date().toISOString(), ...payload });
            const selected = rows.filter(row => filters.every(filter => filter(row)));
            if (action === 'update') selected.forEach(row => Object.assign(row, payload));
            return { data: selected.map(row => ({ ...row })), error: null };
        };
        const q = {
            select: () => q, order: () => q, limit: () => q,
            eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return q; },
            in: (key: string, values: unknown[]) => { filters.push(row => values.includes(row[key])); return q; },
            gt: (key: string, value: string) => { filters.push(row => typeof row[key] === 'string' && row[key] > value); return q; },
            insert: (value: Row) => { action = 'insert'; payload = value; return q; },
            update: (value: Row) => { action = 'update'; payload = value; return q; },
            maybeSingle: async () => { const result = execute(); return { ...result, data: result.data[0] ?? null }; },
            then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(execute()).then(resolve, reject),
        };
        return q;
    };
    return { rows, client: { from } as unknown as SupabaseClient };
}
function fixture() {
    const d = database();
    const customer = vi.fn().mockResolvedValue({ id: 'cus_avatar' });
    const coupon = vi.fn().mockResolvedValue({ id: 'coupon_avatar' });
    const create = vi.fn().mockResolvedValue({ id: 'cs_avatar', url: 'https://checkout.stripe.com/avatar' });
    const retrieve = vi.fn().mockResolvedValue({ id: 'cs_avatar', status: 'open', url: 'https://checkout.stripe.com/avatar' });
    mock.database.mockReturnValue(d.client);
    mock.gateway.mockReturnValue({ stripe: { customers: { create: customer }, coupons: { create: coupon }, checkout: { sessions: { create, retrieve } } } });
    return { ...d, customer, coupon, create, retrieve };
}
function active(percent = 30, months: number | null = 3) {
    return { status: 'applied', activeDiscount: { code: 'LETNI_30', percent, remainingUseCount: 0, subscriptionDiscountDurationMonths: months }, errorMessage: null };
}
beforeEach(() => {
    vi.clearAllMocks();
    mock.reserve.mockResolvedValue(active());
    mock.settle.mockResolvedValue({ errorMessage: null });
});
describe('avatar shared discount checkout', () => {
    it('validates quote shape without breaking existing undiscounted requests', () => {
        expect(avatarCheckoutSchema.parse(input()).discountCode).toBe('LETNI_30');
        expect(avatarCheckoutSchema.safeParse({ ...input(), expectedDiscount: null }).success).toBe(false);
        expect(avatarCheckoutSchema.safeParse({ ...input(), expectedDiscount: { percent: 101, months: 3 } }).success).toBe(false);
        expect(avatarCheckoutSchema.safeParse({ ...input(), discountCode: undefined, expectedDiscount: undefined }).success).toBe(true);
    });
    it('uses the actual reserved percentage and duration in one Stripe coupon and freezes the accepted contract', async () => {
        const f = fixture();
        expect(await createAvatarCheckout(request, principal, input())).toBe('https://checkout.stripe.com/avatar');
        expect(mock.reserve).toHaveBeenCalledWith('LETNI_30', 'pavol-avatar-full', id);
        expect(f.rows[0]).toMatchObject({ base_amount: 100000, discount_code: 'LETNI_30', discount_percent: 30, discount_months: 3, terms_version: '2026-11-17-v1' });
        expect(f.coupon).toHaveBeenCalledWith(expect.objectContaining({ percent_off: 30, duration: 'repeating', duration_in_months: 3 }), { idempotencyKey: 'avatar-coupon-' + id });
        const parameters = f.create.mock.calls[0][0];
        expect(parameters).toMatchObject({ mode: 'subscription', discounts: [{ coupon: 'coupon_avatar' }], payment_method_collection: 'always', line_items: [{ quantity: 1, price_data: { unit_amount: 100000, currency: 'czk' } }] });
        expect(parameters).not.toHaveProperty('allow_promotion_codes');
        expect(mock.settle).not.toHaveBeenCalled();
    });
    it.each([
        ['changed percentage', active(20)], ['changed duration', active(30, 1)],
        ['expired or wrong product', { status: 'unusable', activeDiscount: null, errorMessage: null }],
        ['exhausted', { status: 'exhausted', activeDiscount: null, errorMessage: null }],
    ])('refuses a %s before Stripe and closes the unusable attempt', async (_name, result) => {
        const f = fixture(); mock.reserve.mockResolvedValue(result);
        await expect(createAvatarCheckout(request, principal, input())).rejects.toMatchObject({ status: 409, code: 'discount_changed' });
        expect(f.customer).not.toHaveBeenCalled(); expect(f.create).not.toHaveBeenCalled();
        expect(mock.settle).toHaveBeenCalledWith(id, false, 'pavol-avatar-full');
        expect(f.rows[0].status).toBe('incomplete_expired');
    });
    it('keeps an ambiguous network failure recoverable with the same order and provider idempotency keys', async () => {
        const f = fixture(); f.create.mockRejectedValueOnce(new Error('connection lost'));
        await expect(createAvatarCheckout(request, principal, input())).rejects.toThrow('connection lost');
        expect(mock.settle).not.toHaveBeenCalled();
        expect(await createAvatarCheckout(request, principal, input())).toBe('https://checkout.stripe.com/avatar');
        expect(f.rows).toHaveLength(1);
        expect(f.create.mock.calls.map(call => call[1])).toEqual([{ idempotencyKey: 'avatar-checkout-' + id }, { idempotencyKey: 'avatar-checkout-' + id }]);
        expect(f.coupon.mock.calls.map(call => call[1])).toEqual([{ idempotencyKey: 'avatar-coupon-' + id }, { idempotencyKey: 'avatar-coupon-' + id }]);
    });
    it('returns an existing open checkout without consuming another use or revalidating an exhausted code', async () => {
        const f = fixture(); await createAvatarCheckout(request, principal, input()); mock.reserve.mockClear();
        mock.reserve.mockResolvedValue({ status: 'exhausted', activeDiscount: null, errorMessage: null });
        await expect(createAvatarCheckout(request, principal, input())).resolves.toBe('https://checkout.stripe.com/avatar');
        expect(mock.reserve).not.toHaveBeenCalled(); expect(f.create).toHaveBeenCalledTimes(1);
    });
    it('releases an expired session and requires a fresh attempt', async () => {
        const f = fixture(); await createAvatarCheckout(request, principal, input());
        f.retrieve.mockResolvedValue({ status: 'expired' });
        await expect(createAvatarCheckout(request, principal, input())).rejects.toMatchObject({ status: 409, code: 'checkout_expired' });
        expect(mock.settle).toHaveBeenCalledExactlyOnceWith(id, false, 'pavol-avatar-full');
        expect(f.rows[0].status).toBe('incomplete_expired');
        // The expiry webhook may already have retired the same order before a retry arrives.
        await expect(createAvatarCheckout(request, principal, input())).rejects.toMatchObject({ status: 409, code: 'checkout_expired' });
        expect(f.create).toHaveBeenCalledTimes(1);
    });
    it('releases a definitive Stripe rejection but preserves reservations during database outages', async () => {
        const f = fixture();
        mock.reserve.mockResolvedValueOnce({ status: 'unusable', activeDiscount: null, errorMessage: 'database unavailable' });
        await expect(createAvatarCheckout(request, principal, input())).rejects.toMatchObject({ status: 503 });
        expect(mock.settle).not.toHaveBeenCalled(); expect(f.rows[0].status).toBe('pending');
        f.create.mockRejectedValueOnce(new Stripe.errors.StripeInvalidRequestError({ message: 'invalid', statusCode: 400 }));
        await expect(createAvatarCheckout(request, principal, input())).rejects.toMatchObject({ status: 422, code: 'checkout_rejected' });
        expect(mock.settle).toHaveBeenCalledWith(id, false, 'pavol-avatar-full'); expect(f.rows[0].status).toBe('incomplete_expired');
    });
    it.each([null, 3])('requires a card for limited 100%% offers, and skips it for a permanent offer (%s months)', async months => {
        const f = fixture(); mock.reserve.mockResolvedValue(active(100, months));
        await createAvatarCheckout(request, principal, { ...input(), expectedDiscount: { percent: 100, months } });
        expect(f.create.mock.calls[0][0].payment_method_collection).toBe(months === null ? 'if_required' : 'always');
        expect(f.coupon.mock.calls[0][0]).toMatchObject(months === null ? { duration: 'forever', percent_off: 100 } : { duration: 'repeating', duration_in_months: 3, percent_off: 100 });
    });
    it('does not consume a code or create an order for a nonzero amount below the CZK card minimum', async () => {
        const f = fixture();
        await expect(createAvatarCheckout(request, principal, { ...input(), expectedDiscount: { percent: 99, months: null } })).rejects.toMatchObject({ status: 422 });
        expect(f.rows).toHaveLength(0); expect(mock.reserve).not.toHaveBeenCalled(); expect(f.create).not.toHaveBeenCalled();
    });
    it.each([
        [{ kind: 'fixed', amount: 20, currency: 'CZK' }, 2000, 98000],
        [{ kind: 'amount', amount: 200, currency: 'CZK' }, 80000, 20000],
        [{ kind: 'formula', expression: 'price * 0.1 + 1', currency: 'CZK' }, 10100, 89900],
    ] as const)('freezes and charges a custom rule %j at the displayed amount', async (rule, finalAmount, amountOff) => {
        const f = fixture();
        const discount = { ...active().activeDiscount, priceRule: rule as DiscountPriceRule, definitionVersion: 7 };
        mock.reserve.mockResolvedValue({ status: 'applied', activeDiscount: discount, errorMessage: null });
        const expectedDiscount = createExpectedDiscount(discount, 100000);
        await createAvatarCheckout(request, principal, { ...input(), expectedDiscount });
        expect(f.rows[0].discount_snapshot).toMatchObject({ version: 1, definitionVersion: 7, priceRule: rule, baseAmount: 100000, finalAmount, months: 3, currency: 'CZK' });
        expect(f.coupon).toHaveBeenCalledWith(expect.objectContaining({ amount_off: amountOff, currency: 'czk', duration: 'repeating', duration_in_months: 3 }), expect.anything());
        expect(f.coupon.mock.calls[0][0]).not.toHaveProperty('percent_off');
    });
    it('rejects changed rules with the same legacy percentage and rejects a manipulated quote', async () => {
        const f = fixture();
        const discount = { ...active().activeDiscount, priceRule: { kind: 'fixed', amount: 20, currency: 'CZK' } as const, definitionVersion: 2 };
        mock.reserve.mockResolvedValue({ status: 'applied', activeDiscount: discount, errorMessage: null });
        const expectedDiscount = createExpectedDiscount({ ...discount, priceRule: { ...discount.priceRule, amount: 30 } }, 100000);
        await expect(createAvatarCheckout(request, principal, { ...input(), expectedDiscount })).rejects.toMatchObject({ code: 'discount_changed' });
        expect(f.create).not.toHaveBeenCalled();
    });
    it('keeps a 1 CZK rule definable but never raises or charges its below-minimum price', async () => {
        const f = fixture();
        const discount = { ...active().activeDiscount, priceRule: { kind: 'fixed', amount: 1, currency: 'CZK' } as const };
        await expect(createAvatarCheckout(request, principal, { ...input(), expectedDiscount: createExpectedDiscount(discount, 100000) })).rejects.toMatchObject({ status: 422 });
        expect(f.rows).toHaveLength(0); expect(mock.reserve).not.toHaveBeenCalled(); expect(f.create).not.toHaveBeenCalled();
    });
    it.each([null, 3])('uses a fixed zero price without a card only when it is permanent (%s)', async months => {
        const f = fixture();
        const discount = { ...active(30, months).activeDiscount, priceRule: { kind: 'fixed', amount: 0, currency: 'CZK' } as const };
        mock.reserve.mockResolvedValue({ status: 'applied', activeDiscount: discount, errorMessage: null });
        await createAvatarCheckout(request, principal, { ...input(), expectedDiscount: createExpectedDiscount(discount, 100000) });
        expect(f.create.mock.calls[0][0].payment_method_collection).toBe(months === null ? 'if_required' : 'always');
    });

});
