import { describe, expect, it } from 'vitest';
import { createInternalOneTimePayment, createOneTimePaymentQuote, STRIPE_CZK_PAYMENT_POLICY } from './paymentCollectionPolicy';

describe('one-time purchase collection policy', () => {
    it.each([0, 1, 100, 1000, 1499])('completes %i haléřů internally with no money collected', (amount) => {
        const quote = createOneTimePaymentQuote(amount, STRIPE_CZK_PAYMENT_POLICY);
        expect(quote).toMatchObject({ amountBeforeWaiver: amount, amountDue: 0, waivedAmount: amount, collection: 'internal',
            reason: amount === 0 ? 'zero_total' : 'below_gateway_minimum' });
        expect(createInternalOneTimePayment(quote)).toMatchObject({ status: 'paid', provider: 'internal', method: 'no_charge', amountPaid: 0 });
    });
    it.each([1500, 1501, 2000, 500000])('keeps %i haléřů payable through the normal flow', (amount) => {
        const quote = createOneTimePaymentQuote(amount, STRIPE_CZK_PAYMENT_POLICY);
        expect(quote).toMatchObject({ amountBeforeWaiver: amount, amountDue: amount, waivedAmount: 0, collection: 'gateway', reason: null });
        expect(createInternalOneTimePayment(quote)).toBeNull();
    });
    it('takes the threshold and currency from the selected provider, not a fixed product minimum', () => {
        const otherProvider = { provider: 'another-gateway', currency: 'eur', minimumChargeAmount: 50, version: 2 };
        expect(createOneTimePaymentQuote(49, otherProvider)).toMatchObject({ amountDue: 0, gateway: 'another-gateway', gatewayMinimumAmount: 50, currency: 'eur' });
        expect(createOneTimePaymentQuote(50, otherProvider).amountDue).toBe(50);
    });
    it.each([-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid amount %s instead of granting free access', (amount) => {
        expect(() => createOneTimePaymentQuote(amount, STRIPE_CZK_PAYMENT_POLICY)).toThrow();
    });
});
