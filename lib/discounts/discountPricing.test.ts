import { describe, expect, it } from 'vitest';
import { compileDiscountFormula, calculateDiscountedAmount, createDiscountSnapshot, createExpectedDiscount, discountMatchesExpected, discountSnapshotsEqual, describeDiscount, type DiscountPriceRule } from './discountPricing';
import { isSubscriptionDiscountFullAndPermanent } from './discountCode';
import { createStripeSubscriptionCouponParameters } from '@/lib/payments/stripeSubscriptionCoupon';

const active = (priceRule?: DiscountPriceRule, months: number | null = 3) => ({ code: 'RULE', percent: 30, remainingUseCount: null, subscriptionDiscountDurationMonths: months, priceRule, definitionVersion: 2 });
describe('discount price rules', () => {
    it.each([
        ['price * 0.01 + 1', 5000, 51], ['cena * 0.7 + 1', 1000, 701],
        ['max(20, min(price, 100))', 5000, 100], ['round(price / 3, 2)', 100, 33.33],
        ['2 ^ 3 ^ 2', 1, 512], ['-2^2 + abs(-5)', 1, 1],
        ['ceil(2.1) + floor(3.9) + (10 % 3)', 100, 7], ['1e-2 * price', 5000, 50],
    ])('evaluates %s as arithmetic without executing code', (source, price, expected) => {
        expect(compileDiscountFormula(source)(price)).toBe(expected);
    });
    it.each(['globalThis', 'process.env.SECRET', 'price.constructor', 'fetch("https://example.test")', 'price=1', '(()=>1)()', 'min()', 'round(1,2,3)', '1;2', 'Infinity', 'price ? 1 : 2', '('.repeat(40) + '1' + ')'.repeat(40)])('refuses executable or unsupported syntax: %s', source => {
        expect(() => compileDiscountFormula(source)).toThrow();
    });
    it('rejects nonfinite and excessive arithmetic instead of making an accidental free purchase', () => {
        for (const expression of ['1 / 0', '0 / 0', '10 ^ 1000']) {
            expect(() => calculateDiscountedAmount(500000, active({ kind: 'formula', expression, currency: 'CZK' }))).toThrow();
        }
    });
    it('supports fixed prices, amount deductions, fractional crowns and bounded combined results', () => {
        expect(calculateDiscountedAmount(500000, active({ kind: 'fixed', amount: 1, currency: 'CZK' }))).toBe(100);
        expect(calculateDiscountedAmount(500000, active({ kind: 'amount', amount: 200, currency: 'CZK' }))).toBe(480000);
        expect(calculateDiscountedAmount(500000, active({ kind: 'formula', expression: 'price * 0.01 + 1.25', currency: 'CZK' }))).toBe(5125);
        expect(calculateDiscountedAmount(10000, active({ kind: 'fixed', amount: 200, currency: 'CZK' }))).toBe(10000);
        expect(calculateDiscountedAmount(10000, active({ kind: 'formula', expression: 'price - 200', currency: 'CZK' }))).toBe(0);
    });
    it('preserves both historical percentage rounding conventions', () => {
        expect(calculateDiscountedAmount(19900, { percent: 25 })).toBe(14925);
        expect(calculateDiscountedAmount(19900, { percent: 25 }, true)).toBe(14900);
        expect(calculateDiscountedAmount(39900, { percent: 30 })).toBe(27930);
    });
    it('freezes rules, amount, duration, currency and version and detects changed quotes', () => {
        const original = active({ kind: 'fixed', amount: 20, currency: 'CZK' });
        const snapshot = createDiscountSnapshot(original, 500000)!;
        const expected = createExpectedDiscount(original, 500000)!;
        expect(snapshot).toMatchObject({ finalAmount: 2000, baseAmount: 500000, currency: 'CZK', months: 3, definitionVersion: 2 });
        expect(discountMatchesExpected({ ...original, priceRule: { currency: 'CZK', amount: 20, kind: 'fixed' } }, expected, 500000)).toBe(true);
        expect(discountMatchesExpected(active({ kind: 'fixed', amount: 10, currency: 'CZK' }), expected, 500000)).toBe(false);
        expect(discountMatchesExpected({ ...original, definitionVersion: 3 }, expected, 500000)).toBe(false);
        expect(discountMatchesExpected(original, { ...expected, finalAmount: 1 }, 500000)).toBe(false);
        expect(discountMatchesExpected(original, { percent: 30, months: 3 }, 500000)).toBe(false);
        expect(discountSnapshotsEqual(snapshot, { ...snapshot, priceRule: { currency: 'CZK', amount: 20, kind: 'fixed' } })).toBe(true);
        expect(snapshot.finalAmount).toBe(2000);
    });
    it('distinguishes a permanent zero price from a temporary free period', () => {
        const rule = { kind: 'fixed', amount: 0, currency: 'CZK' } as const;
        expect(isSubscriptionDiscountFullAndPermanent(active(rule, null), 100000)).toBe(true);
        expect(isSubscriptionDiscountFullAndPermanent(active(rule, 3), 100000)).toBe(false);
    });
    it('sends resolved minor-unit amounts and duration to Stripe without exposing formulas in labels', () => {
        const discount = active({ kind: 'formula', expression: 'price * 0.01 + 1', currency: 'CZK' });
        expect(createStripeSubscriptionCouponParameters(discount, 500000)).toEqual({ amount_off: 494900, currency: 'czk', name: 'Zvýhodněná cena', metadata: { discountCode: 'RULE' }, duration: 'repeating', duration_in_months: 3 });
        expect(createStripeSubscriptionCouponParameters(active({ kind: 'fixed', amount: 5000, currency: 'CZK' }), 100000)).toBeNull();
        expect(describeDiscount(discount, 'cs', 5100)).toContain('51 Kč');
        expect(describeDiscount(discount)).not.toContain('price');
    });
});
