import { describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import { createPromptbookCheckout } from './billingCheckout';
import type { PromptbookOrder } from './billingOrders';

const order = {
    id: 'c2a1a142-348f-43e8-8718-6a3820053cb7',
    created_at: '2026-11-09T20:00:00.000Z',
    plan: 'start',
    email: 'billing@example.test',
    country: 'SK',
    company_id: '12345678',
    company_name: 'Example SK',
    vat_id: 'SK1234567890',
    billing_address: { line1: 'Príklad 1', city: 'Bratislava', postal_code: '81101', country: 'SK' },
    terms_version: '2026-11-09-online-v1',
    engine_version: '0.119.0-75',
    billing_origin: 'https://www.ptbk.io',
    invoice_template_id: 'inrtem_example',
    supplier_tax_id: 'CZ21012288',
    base_amount: 39900,
} satisfies Partial<PromptbookOrder>;

function mockStripe() {
    const customer = vi.fn().mockResolvedValue({ id: 'cus_promptbook' });
    const coupon = vi.fn().mockResolvedValue({ id: 'coupon_promptbook' });
    const session = vi.fn().mockResolvedValue({ id: 'cs_promptbook', url: 'https://checkout.stripe.com/example' });
    const stripe = { customers: { create: customer }, coupons: { create: coupon }, checkout: { sessions: { create: session } } } as unknown as Stripe;
    return { stripe, customer, coupon, session };
}

describe('Promptbook Stripe checkout', () => {
    it('keeps the regular monthly price and applies a snapshotted coupon for three months', async () => {
        const { stripe, coupon, session, customer } = mockStripe();
        await createPromptbookCheckout(stripe, order as PromptbookOrder, {
            code: 'FIRST', percent: 30, remainingUseCount: 9, subscriptionDiscountDurationMonths: 3,
        });

        expect(coupon).toHaveBeenCalledWith(expect.objectContaining({
            percent_off: 30, duration: 'repeating', duration_in_months: 3,
        }), { idempotencyKey: `promptbook-coupon-${order.id}` });
        expect(session).toHaveBeenCalledWith(expect.objectContaining({
            mode: 'subscription',
            customer: 'cus_promptbook',
            payment_method_types: ['card'],
            payment_method_collection: 'always',
            line_items: [expect.objectContaining({
                quantity: 1,
                price_data: expect.objectContaining({ currency: 'czk', unit_amount: 39900, tax_behavior: 'exclusive', recurring: { interval: 'month' } }),
            })],
            discounts: [{ coupon: 'coupon_promptbook' }],
        }), { idempotencyKey: `promptbook-checkout-${order.id}` });
        expect(customer).toHaveBeenCalledWith(expect.objectContaining({
            address: order.billing_address,
            tax_exempt: 'reverse',
            tax_id_data: [{ type: 'eu_vat', value: order.vat_id }],
            invoice_settings: expect.objectContaining({
                rendering_options: { template: 'inrtem_example' },
                footer: expect.stringContaining('Daň odvede zákazník'),
            }),
        }), { idempotencyKey: `promptbook-customer-${order.id}` });
    });

    it('does not offer a second discount or collect unverified tax identifiers in Stripe', async () => {
        const { stripe, coupon, session, customer } = mockStripe();
        await createPromptbookCheckout(stripe, { ...order, country: 'CZ', vat_id: null } as PromptbookOrder, null);
        expect(coupon).not.toHaveBeenCalled();
        expect(session.mock.calls[0]?.[0]).not.toHaveProperty('allow_promotion_codes');
        expect(session.mock.calls[0]?.[0]).not.toHaveProperty('tax_id_collection');
        expect(customer.mock.calls[0]?.[0]).not.toHaveProperty('tax_id_data');
    });
});
