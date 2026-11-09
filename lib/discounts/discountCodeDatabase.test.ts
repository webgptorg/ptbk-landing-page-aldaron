import { RESOLVE_DISCOUNT_CODE_FUNCTION_NAME } from '@/lib/discounts/discountCodeConstants';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { loadActiveDiscount, loadPromotedDiscountsByPlace } from './discountCodeDatabase';

const WILDCARD_DISCOUNT_CODE_ROW = {
    id: '00000000-0000-0000-0000-000000000001',
    code: '*SUMMER*2026',
    percent: 20,
    starts_at: '2026-08-20T00:00:00.000Z',
    ends_at: '2026-08-21T00:00:00.000Z',
    is_enabled: true,
    place_ids: [],
    maximum_use_count: null,
    subscription_discount_duration_months: null,
    use_count: 0,
    created_at: '2026-08-19T00:00:00.000Z',
    updated_at: '2026-08-19T00:00:00.000Z',
};

describe('submitted discount-code loading', () => {
    beforeEach(() => {
        createSupabaseServiceRoleClientMock.mockReset();
    });

    it('uses the shared database resolver for a wildcard rule preview', async () => {
        const resolveDiscountCode = vi.fn().mockResolvedValue({
            data: [WILDCARD_DISCOUNT_CODE_ROW],
            error: null,
        });
        createSupabaseServiceRoleClientMock.mockReturnValue({ rpc: resolveDiscountCode });

        const result = await loadActiveDiscount(
            'summer-vip-2026',
            'ai-supervize-mini-onsite',
            new Date('2026-08-20T12:00:00.000Z'),
        );

        expect(resolveDiscountCode).toHaveBeenCalledWith(RESOLVE_DISCOUNT_CODE_FUNCTION_NAME, {
            submitted_discount_code: 'SUMMER_VIP_2026',
        });
        expect(result).toEqual({
            activeDiscount: {
                code: '*SUMMER*2026',
                percent: 20,
                remainingUseCount: null,
                subscriptionDiscountDurationMonths: null,
            },
            errorMessage: null,
        });
    });

    it('selects an available promoted code for each Promptbook plan without exposing the database row', async () => {
        const query = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            overlaps: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            then: (onFulfilled: (value: unknown) => unknown) => Promise.resolve(onFulfilled({
                data: [
                    {
                        ...WILDCARD_DISCOUNT_CODE_ROW,
                        code: 'EXHAUSTED',
                        is_promoted: true,
                        place_ids: ['promptbook-start'],
                        maximum_use_count: 1,
                        use_count: 1,
                    },
                    {
                        ...WILDCARD_DISCOUNT_CODE_ROW,
                        code: 'UVOD',
                        percent: 30,
                        is_promoted: true,
                        place_ids: ['promptbook-start'],
                        subscription_discount_duration_months: 3,
                    },
                ],
                error: null,
            })),
        };
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) });

        expect(await loadPromotedDiscountsByPlace(new Date('2026-08-20T12:00:00.000Z'))).toEqual({
            activeDiscountByPlaceId: {
                'promptbook-start': {
                    code: 'UVOD',
                    percent: 30,
                    remainingUseCount: null,
                    subscriptionDiscountDurationMonths: 3,
                },
                'promptbook-business': null,
            },
            errorMessage: null,
        });
        expect(query.eq).toHaveBeenCalledWith('is_promoted', true);
    });
});
