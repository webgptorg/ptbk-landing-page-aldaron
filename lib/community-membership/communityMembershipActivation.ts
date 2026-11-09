import {
    loadCommunityMembershipByCheckoutSession,
    markCommunityMembershipPaid,
    saveCommunityMembershipSubscriptionState,
    type CommunityMembershipRecord,
} from '@/lib/community-membership/communityMembershipDatabase';
import {
    readCommunityMembershipSubscriptionState,
    readSubscriptionOrNull,
} from '@/lib/community-membership/communityMembershipSubscription';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { consumeDiscountCode } from '@/lib/discounts/discountCodeDatabase';
import type { StripeGateway } from '@/lib/payments/stripeGateway';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export type CommunityMembershipActivationResult = {
    readonly membership: CommunityMembershipRecord | null;
    readonly errorMessage: string | null;
};

/**
 * Whether the gate finished this checkout and the membership behind it is now being paid for
 *
 * Note: A checkout which the gate answered as needing no payment, which is what a fully discounted membership looks
 *       like, is just as finished as one which was charged.
 */
function isCheckoutSessionPaid(checkoutSession: Stripe.Checkout.Session): boolean {
    return checkoutSession.status === 'complete' && checkoutSession.payment_status !== 'unpaid';
}

/**
 * Records a discount code as used, which only the payment it was applied to may do.
 *
 * Note: A refused code is deliberately not a refused activation. The member has already paid the discounted price, so
 *       the payment stands and only the accounting of that code is reported to the server console.
 */
async function consumeCommunityMembershipDiscountCode(discountCode: string): Promise<void> {
    const consumption = await consumeDiscountCode(discountCode, COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
    if (consumption.errorMessage !== null || consumption.status !== 'applied') {
        console.error(
            `Failed to record the use of the community membership discount code: ${
                consumption.errorMessage ?? consumption.status
            }`,
        );
    }
}

/**
 * Turns one finished checkout into the membership it bought.
 *
 * Note: The return from the gate and the webhook of the gate both end here, so a member whose browser never came back
 *       and a member who came back before the webhook did are activated by exactly the same rules.
 */
export async function activateCommunityMembershipFromCheckoutSession(
    gateway: StripeGateway,
    supabase: SupabaseClient,
    checkoutSession: Stripe.Checkout.Session,
): Promise<CommunityMembershipActivationResult> {
    const { membership, errorMessage } = await loadCommunityMembershipByCheckoutSession(supabase, checkoutSession.id);
    if (membership === null || !isCheckoutSessionPaid(checkoutSession)) {
        return { membership, errorMessage };
    }

    const subscription = await readSubscriptionOrNull(checkoutSession.subscription, gateway.stripe);
    const subscriptionState = subscription === null ? null : readCommunityMembershipSubscriptionState(subscription);
    const paidResult = await markCommunityMembershipPaid(supabase, membership.id, checkoutSession.id, {
        status: subscriptionState?.status ?? 'active',
        stripeCustomerId: typeof checkoutSession.customer === 'string' ? checkoutSession.customer : null,
        stripeSubscriptionId: subscription?.id ?? null,
        isCancellationScheduled: subscriptionState?.isCancellationScheduled ?? false,
        currentPeriodEndsAt: subscriptionState?.currentPeriodEndsAt ?? null,
    });
    if (paidResult.errorMessage !== null) {
        return { membership, errorMessage: paidResult.errorMessage };
    }

    if (paidResult.isNewlyPaid && membership.discountCode !== null) {
        await consumeCommunityMembershipDiscountCode(membership.discountCode);
    }

    return loadCommunityMembershipByCheckoutSession(supabase, checkoutSession.id);
}

/**
 * Follows a subscription the gate keeps deciding about, so a membership which was cancelled, paused, or whose card
 * stopped working stops being a paid membership in the community as well.
 */
export async function applyCommunityMembershipSubscriptionChange(
    supabase: SupabaseClient,
    subscription: Stripe.Subscription,
): Promise<{ readonly errorMessage: string | null }> {
    const subscriptionState = readCommunityMembershipSubscriptionState(subscription);
    const { isMembershipFound, errorMessage } = await saveCommunityMembershipSubscriptionState(
        supabase,
        subscription.id,
        {
            ...subscriptionState,
        },
    );

    if (!isMembershipFound && errorMessage === null) {
        // Nothing is repaired here: a subscription of another application, or one created directly in the gate, is not
        // a membership of this community and must not silently become one.
        console.warn(`No community membership belongs to the Stripe subscription ${subscription.id}.`);
    }

    return { errorMessage };
}
