import { DEFAULT_COMMUNITY_ID, type CommunityId } from '@/businesses/community/config';
import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
} from '@/businesses/community/membership/communityMembershipConfig';
import { createCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import {
    loadCommunityMembershipByEmail,
    saveRedeemedCommunityMembership,
    type CommunityMembershipRecord,
} from '@/lib/community-membership/communityMembershipDatabase';
import type { CommunityMembershipMember } from '@/lib/community-membership/communityMembershipTypes';
import { isSubscriptionDiscountFullAndPermanent } from '@/lib/discounts/discountCode';
import { consumeDiscountCode } from '@/lib/discounts/discountCodeDatabase';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * How far a voucher got: the membership it gave away, a code which turned out not to give one, or a server which
 * could not write what the code granted.
 */
export type CommunityMembershipRedemptionStatus = 'redeemed' | 'discount-code-refused' | 'not-redeemed';

export type CommunityMembershipRedemptionResult = {
    readonly status: CommunityMembershipRedemptionStatus;
    readonly membership: CommunityMembershipRecord | null;
};

/**
 * Gives one member the membership their voucher covers, without opening the payment gate at all.
 *
 * Note: The use of the code is taken before the membership is written, because here the code is the payment itself: a
 *       code which may be used five times gives away five memberships and no sixth, however many browsers ask for one
 *       at the same moment, which is what the database takes atomically.
 * Note: What the code grants is decided again from the very use which was taken rather than from the preview the
 *       browser was shown, so a code which stopped covering the whole membership meanwhile gives nothing away.
 * Note: A use which was taken for a membership that is then refused or cannot be written is lost. That is deliberate:
 *       spending one use of a code is a far smaller thing than giving away a membership nobody may have.
 */
export async function redeemCommunityMembership(
    supabase: SupabaseClient,
    member: CommunityMembershipMember,
    existingMembershipId: string | null,
    discountCodeValue: string,
    isTestPayment: boolean,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
    previousCheckoutSessionId: string | null = null,
): Promise<CommunityMembershipRedemptionResult> {
    const consumption = await consumeDiscountCode(discountCodeValue, COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
    if (consumption.errorMessage !== null) {
        console.error(`Failed to take the use of a community membership voucher: ${consumption.errorMessage}`);
        return { status: 'not-redeemed', membership: null };
    }

    const activeDiscount = consumption.activeDiscount;
    if (
        consumption.status !== 'applied' ||
        activeDiscount === null ||
        !isSubscriptionDiscountFullAndPermanent(activeDiscount)
    ) {
        return { status: 'discount-code-refused', membership: null };
    }

    const price = createCommunityMembershipPrice(
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
        activeDiscount,
    );
    const { errorMessage } = await saveRedeemedCommunityMembership(supabase, existingMembershipId, {
        communityId,
        previousCheckoutSessionId,
        email: member.email,
        fullname: member.fullname,
        planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        monthlyPriceCzk: price.finalMonthlyEquivalentCzk,
        discountCode: activeDiscount.code,
        discountPercent: activeDiscount.percent,
        isTestPayment,
        requestedByParticipantId: member.participantId,
    });
    if (errorMessage !== null) {
        return { status: 'not-redeemed', membership: null };
    }

    // The membership is read back rather than assumed, so the room is answered with the very membership which was
    // written, exactly as every other answer about it is.
    const { membership } = await loadCommunityMembershipByEmail(supabase, member.email, communityId);

    return { status: 'redeemed', membership };
}
