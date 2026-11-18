import { createDiscountSnapshot, type DiscountSnapshot } from '@/lib/discounts/discountPricing';
import { isSubscriptionDiscountPermanent, type ActiveDiscount } from '@/lib/discounts/discountCode';
import {
    COMMUNITY_MEMBERSHIP_NAME,
    COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE,
    COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT,
    getCommunityMembershipPlan,
    isLegacyPaidCommunityMembershipPlanId,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import { createCommunityMembershipPrice, type CommunityMembershipPrice } from './communityMembershipPrice';

export type CommunityMembershipRegistrationRequest = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly fullname: string;
    readonly email: string;
    readonly discountCode: string;
    readonly termsAccepted: boolean;
};

export type StoredCommunityMembershipRegistration = {
    readonly registrationType: typeof COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE;
    readonly membership: typeof COMMUNITY_MEMBERSHIP_NAME;
    readonly status: 'payment-requested' | 'trial-requested';
    readonly planId: PaidCommunityMembershipPlanId;
    readonly planName: string;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    /** Legacy Standard and Premium registrations keep their original seven-day trial. */
    readonly trialDayCount: typeof COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT | null;
    readonly discountCodeEntered: string | null;
    readonly discountCodeUsed: string | null;
    readonly discountPercentApplied: number;
    readonly discountSnapshot?: DiscountSnapshot | null;
    /** `null` means either no discount or a permanent subscription discount. */
    readonly subscriptionDiscountDurationMonths: number | null;
    readonly baseBillingPriceCzk: number;
    readonly discountAmountCzk: number;
    readonly agreedBillingPriceCzk: number;
    readonly agreedMonthlyEquivalentCzk: number;
    readonly isPriceHeldWhileMembershipContinues: boolean;
    readonly termsAccepted: true;
};

export type CommunityMembershipRegistrationResult = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly price: CommunityMembershipPrice;
    readonly activeDiscount: ActiveDiscount | null;
    readonly trialDayCount: typeof COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT | null;
};

function getCommunityMembershipTrialDayCount(
    planId: PaidCommunityMembershipPlanId,
): typeof COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT | null {
    return isLegacyPaidCommunityMembershipPlanId(planId) ? COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT : null;
}

/**
 * Captures the exact commercial offer accepted with the registration. Until a payment provider exists, this Contact
 * payload is the durable price-lock record used when the activation is confirmed by e-mail.
 */
export function createStoredCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
    activeDiscount: ActiveDiscount | null,
): StoredCommunityMembershipRegistration {
    const plan = getCommunityMembershipPlan(registrationRequest.planId);
    const trialDayCount = getCommunityMembershipTrialDayCount(registrationRequest.planId);
    const price = createCommunityMembershipPrice(
        registrationRequest.planId,
        registrationRequest.billingPeriod,
        activeDiscount,
    );
    const isPriceHeldWhileMembershipContinues =
        activeDiscount === null || isSubscriptionDiscountPermanent(activeDiscount);

    return {
        registrationType: COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE,
        membership: COMMUNITY_MEMBERSHIP_NAME,
        status: trialDayCount === null ? 'payment-requested' : 'trial-requested',
        planId: registrationRequest.planId,
        planName: plan.name,
        billingPeriod: registrationRequest.billingPeriod,
        trialDayCount,
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.priceRule ? 0 : activeDiscount?.percent ?? 0,
        discountSnapshot: createDiscountSnapshot(activeDiscount, Math.round(price.baseBillingPriceCzk * 100), true),
        subscriptionDiscountDurationMonths: activeDiscount?.subscriptionDiscountDurationMonths ?? null,
        baseBillingPriceCzk: price.baseBillingPriceCzk,
        discountAmountCzk: price.discountAmountCzk,
        agreedBillingPriceCzk: price.finalBillingPriceCzk,
        agreedMonthlyEquivalentCzk: price.finalMonthlyEquivalentCzk,
        isPriceHeldWhileMembershipContinues,
        termsAccepted: true,
    };
}

export function createCommunityMembershipRegistrationContactNote(
    storedRegistration: StoredCommunityMembershipRegistration,
): string {
    return JSON.stringify(storedRegistration, null, 2);
}

export function createCommunityMembershipRegistrationResult(
    registrationRequest: CommunityMembershipRegistrationRequest,
    activeDiscount: ActiveDiscount | null,
): CommunityMembershipRegistrationResult {
    return {
        planId: registrationRequest.planId,
        billingPeriod: registrationRequest.billingPeriod,
        price: createCommunityMembershipPrice(
            registrationRequest.planId,
            registrationRequest.billingPeriod,
            activeDiscount,
        ),
        activeDiscount,
        trialDayCount: getCommunityMembershipTrialDayCount(registrationRequest.planId),
    };
}
