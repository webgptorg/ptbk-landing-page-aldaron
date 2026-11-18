import { discountCodeValuesSchema } from './discountCodeSchema';
import { describe, expect, it } from 'vitest';

const VALID_DISCOUNT_CODE = {
    code: 'webinar-2026',
    percent: 25,
    startsAt: '2026-08-20T00:00:00.000Z',
    endsAt: '2026-08-21T00:00:00.000Z',
    isEnabled: true,
    placeIds: ['ai-supervize-mini-online'],
    maximumUseCount: 10,
    subscriptionDiscountDurationMonths: null,
};

const WILDCARD_DISCOUNT_CODE_CASES = [
    { enteredCode: '*', normalizedCode: '*' },
    { enteredCode: 'summer*', normalizedCode: 'SUMMER*' },
    { enteredCode: '*summer', normalizedCode: '*SUMMER' },
    { enteredCode: '*summer*', normalizedCode: '*SUMMER*' },
    { enteredCode: '*summer*2026', normalizedCode: '*SUMMER*2026' },
    { enteredCode: 'summer***2026', normalizedCode: 'SUMMER***2026' },
] as const;

describe('discount-code write schema', () => {
    it('normalizes codes and keeps a selected place and limit', () => {
        expect(discountCodeValuesSchema.parse(VALID_DISCOUNT_CODE)).toMatchObject({
            code: 'WEBINAR_2026',
            placeIds: ['ai-supervize-mini-online'],
            maximumUseCount: 10,
            subscriptionDiscountDurationMonths: null,
        });
    });

    it('accepts wildcard rules anywhere in a discount code', () => {
        for (const wildcardDiscountCodeCase of WILDCARD_DISCOUNT_CODE_CASES) {
            const parsedDiscountCode = discountCodeValuesSchema.parse({
                ...VALID_DISCOUNT_CODE,
                code: wildcardDiscountCodeCase.enteredCode,
            });

            expect(parsedDiscountCode.code).toBe(wildcardDiscountCodeCase.normalizedCode);
        }
    });

    it('uses an empty place list for the all-places choice', () => {
        expect(
            discountCodeValuesSchema.parse({ ...VALID_DISCOUNT_CODE, placeIds: [], maximumUseCount: null }),
        ).toMatchObject({
            placeIds: [],
            maximumUseCount: null,
        });
    });

    it('makes an older write without a subscription duration permanently discounted', () => {
        const { subscriptionDiscountDurationMonths: ignoredDuration, ...olderDiscountCode } = VALID_DISCOUNT_CODE;

        expect(discountCodeValuesSchema.parse(olderDiscountCode).subscriptionDiscountDurationMonths).toBeNull();
        expect(ignoredDuration).toBeNull();
    });

    it('only publishes exact codes explicitly available on a Promptbook plan', () => {
        const promotion = { ...VALID_DISCOUNT_CODE, isPromoted: true, placeIds: ['promptbook-start'] };
        expect(discountCodeValuesSchema.parse(promotion).isPromoted).toBe(true);
        expect(discountCodeValuesSchema.safeParse({ ...promotion, placeIds: [] }).success).toBe(false);
        expect(discountCodeValuesSchema.safeParse({ ...promotion, code: 'WELCOME*' }).success).toBe(false);
        expect(discountCodeValuesSchema.parse(VALID_DISCOUNT_CODE).isPromoted).toBe(false);
    });

    it('rejects unknown places and an invalid maximum use count', () => {
        expect(discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE, placeIds: ['not-a-place'] }).success).toBe(
            false,
        );
        expect(discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE, maximumUseCount: 0 }).success).toBe(false);
        expect(
            discountCodeValuesSchema.safeParse({ ...VALID_DISCOUNT_CODE, subscriptionDiscountDurationMonths: 0 })
                .success,
        ).toBe(false);
    });
});


describe('custom discount definitions', () => {
    it('accepts a 1 CZK definition independently of the card minimum and rejects executable formula syntax', () => {
        const input = { code: 'ONE', percent: 10, startsAt: '2026-11-18T00:00:00Z', endsAt: '2027-01-01T00:00:00Z', isEnabled: true, placeIds: [], appliesEverywhere: true, maximumUseCount: null,
            priceRule: { kind: 'fixed', amount: 1, currency: 'CZK' } };
        expect(discountCodeValuesSchema.safeParse(input).success).toBe(true);
        expect(discountCodeValuesSchema.safeParse({ ...input, priceRule: { kind: 'formula', expression: 'process.env.SECRET', currency: 'CZK' } }).success).toBe(false);
        expect(discountCodeValuesSchema.safeParse({ ...input, priceRule: { kind: 'fixed', amount: -1, currency: 'CZK' } }).success).toBe(false);
    });
});
