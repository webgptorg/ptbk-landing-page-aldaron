import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import type { DiscountCodeConsumptionResult } from '@/lib/discounts/discountCodeDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const consumeDiscountCode = vi.fn<(discountCode: string, discountPlaceId: string) => Promise<DiscountCodeConsumptionResult>>();
const saveRedeemedCommunityMembership = vi.fn<() => Promise<{ readonly errorMessage: string | null }>>();
const loadCommunityMembershipByEmail =
    vi.fn<() => Promise<{ readonly membership: CommunityMembershipRecord | null; readonly errorMessage: string | null }>>();

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    consumeDiscountCode: (discountCode: string, discountPlaceId: string) =>
        consumeDiscountCode(discountCode, discountPlaceId),
}));

vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    saveRedeemedCommunityMembership: (...parameters: readonly unknown[]) =>
        saveRedeemedCommunityMembership(...(parameters as [])),
    loadCommunityMembershipByEmail: (...parameters: readonly unknown[]) =>
        loadCommunityMembershipByEmail(...(parameters as [])),
}));

import { redeemCommunityMembership } from './communityMembershipRedemption';

const MEMBER = {
    participantId: '00000000-0000-0000-0000-000000000001',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
};

const REDEEMED_MEMBERSHIP = { id: '00000000-0000-0000-0000-0000000000ff' } as CommunityMembershipRecord;
const SUPABASE = {} as SupabaseClient;

function createConsumption(overrides: Partial<DiscountCodeConsumptionResult> = {}): DiscountCodeConsumptionResult {
    return {
        status: 'applied',
        activeDiscount: {
            code: 'VOUCHER_FREE',
            percent: 100,
            remainingUseCount: 4,
            subscriptionDiscountDurationMonths: null,
        },
        errorMessage: null,
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    consumeDiscountCode.mockResolvedValue(createConsumption());
    saveRedeemedCommunityMembership.mockResolvedValue({ errorMessage: null });
    loadCommunityMembershipByEmail.mockResolvedValue({ membership: REDEEMED_MEMBERSHIP, errorMessage: null });
});

describe('redeeming a community membership voucher', () => {
    it('takes one use of the code and writes the membership it pays for in full', async () => {
        const { status, membership } = await redeemCommunityMembership(SUPABASE, MEMBER, null, 'voucher-free', false);

        expect(status).toBe('redeemed');
        expect(membership).toBe(REDEEMED_MEMBERSHIP);
        expect(consumeDiscountCode).toHaveBeenCalledWith('voucher-free', 'community-membership');
        expect(saveRedeemedCommunityMembership).toHaveBeenCalledWith(SUPABASE, null, {
            communityId: 'vyvojari',
            previousCheckoutSessionId: null,
            email: MEMBER.email,
            fullname: MEMBER.fullname,
            planId: 'membership',
            monthlyPriceCzk: 0,
            discountCode: 'VOUCHER_FREE',
            discountPercent: 100,
            isTestPayment: false,
            requestedByParticipantId: MEMBER.participantId,
        });
    });

    it('gives nothing away for a code whose uses are gone', async () => {
        consumeDiscountCode.mockResolvedValue({ status: 'exhausted', activeDiscount: null, errorMessage: null });

        const { status } = await redeemCommunityMembership(SUPABASE, MEMBER, null, 'voucher-free', false);

        expect(status).toBe('discount-code-refused');
        expect(saveRedeemedCommunityMembership).not.toHaveBeenCalled();
    });

    it('gives nothing away for a code which stopped covering the whole membership meanwhile', async () => {
        consumeDiscountCode.mockResolvedValue(
            createConsumption({
                activeDiscount: {
                    code: 'VOUCHER_FREE',
                    percent: 100,
                    remainingUseCount: 4,
                    subscriptionDiscountDurationMonths: 3,
                },
            }),
        );

        const { status } = await redeemCommunityMembership(SUPABASE, MEMBER, null, 'voucher-free', false);

        expect(status).toBe('discount-code-refused');
        expect(saveRedeemedCommunityMembership).not.toHaveBeenCalled();
    });

    it('says so rather than pretending a membership it could not write', async () => {
        saveRedeemedCommunityMembership.mockResolvedValue({ errorMessage: 'refused' });

        const { status, membership } = await redeemCommunityMembership(SUPABASE, MEMBER, null, 'voucher-free', false);

        expect(status).toBe('not-redeemed');
        expect(membership).toBeNull();
    });

    it('replaces the membership a member already had rather than writing a second one', async () => {
        await redeemCommunityMembership(SUPABASE, MEMBER, 'membership-of-jana', 'voucher-free', true);

        expect(saveRedeemedCommunityMembership).toHaveBeenCalledWith(
            SUPABASE,
            'membership-of-jana',
            expect.objectContaining({ isTestPayment: true }),
        );
    });
});
