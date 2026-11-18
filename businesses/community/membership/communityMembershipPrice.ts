import { calculateDiscountedAmount } from '@/lib/discounts/discountPricing';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import {
    COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT,
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type CommunityMembershipPlan,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';

export type CommunityMembershipPrice = {
    readonly baseBillingPriceCzk: number;
    readonly discountAmountCzk: number;
    readonly finalBillingPriceCzk: number;
    readonly baseMonthlyEquivalentCzk: number;
    readonly finalMonthlyEquivalentCzk: number;
};

function getCommunityMembershipBaseBillingPriceCzk(
    planId: PaidCommunityMembershipPlanId,
    plan: CommunityMembershipPlan,
    billingPeriod: CommunityMembershipBillingPeriod,
): number {
    if (billingPeriod === 'monthly') {
        return plan.monthlyPriceCzk;
    }

    if (plan.yearlyPriceCzk === null) {
        throw new Error(`Yearly billing is not available for the ${planId} community membership plan.`);
    }

    return plan.yearlyPriceCzk;
}

export function createCommunityMembershipPrice(
    planId: PaidCommunityMembershipPlanId,
    billingPeriod: CommunityMembershipBillingPeriod,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipPrice {
    const plan = getCommunityMembershipPlan(planId);
    const billedMonthCount = billingPeriod === 'yearly' ? COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT : 1;
    const baseBillingPriceCzk = getCommunityMembershipBaseBillingPriceCzk(planId, plan, billingPeriod);
    const finalBillingPriceCzk = calculateDiscountedAmount(Math.round(baseBillingPriceCzk * 100), activeDiscount, true) / 100;
    const discountAmountCzk = baseBillingPriceCzk - finalBillingPriceCzk;

    return {
        baseBillingPriceCzk,
        discountAmountCzk,
        finalBillingPriceCzk,
        baseMonthlyEquivalentCzk: baseBillingPriceCzk / billedMonthCount,
        finalMonthlyEquivalentCzk: finalBillingPriceCzk / billedMonthCount,
    };
}

export function formatCommunityMembershipPrice(amountCzk: number): string {
    return `${amountCzk.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} Kč`;
}
