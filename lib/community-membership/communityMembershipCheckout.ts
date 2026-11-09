import {
    COMMUNITY_MEMBERSHIP_CANCELLED_RESULT,
    COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME,
    COMMUNITY_MEMBERSHIP_PAID_RESULT,
    COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME,
    DEFAULT_COMMUNITY_ID,
    type CommunityId,
} from '@/businesses/community/config';
import {
    COMMUNITY_MEMBERSHIP_NAME,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
} from '@/businesses/community/membership/communityMembershipConfig';
import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import {
    normalizeCommunityMemberEmail,
    type CommunityMembershipMember,
} from '@/lib/community-membership/communityMembershipTypes';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import { createStripeAmountFromCzk, STRIPE_CZK_CURRENCY } from '@/lib/payments/stripeAmount';
import type { StripeGateway } from '@/lib/payments/stripeGateway';
import type Stripe from 'stripe';

/**
 * Placeholder the payment gate replaces with the id of the session a member is returning from
 */
export const STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';

/**
 * How every checkout session of the gate is named, and how long an identifier of it may possibly be
 */
const STRIPE_CHECKOUT_SESSION_ID_PREFIX = 'cs_';
const MAXIMAL_STRIPE_CHECKOUT_SESSION_ID_LENGTH = 255;

/**
 * Whether a returning browser named something which can be a checkout session at all, before the gate is asked about it
 */
export function isStripeCheckoutSessionId(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        value.startsWith(STRIPE_CHECKOUT_SESSION_ID_PREFIX) &&
        value.length <= MAXIMAL_STRIPE_CHECKOUT_SESSION_ID_LENGTH
    );
}

/**
 * How a membership recognises itself in everything the payment gate stores about it.
 *
 * Note: A subscription is charged for years after the room session which bought it has expired, so it carries the
 *       address of its member rather than the room identity which happened to open the checkout.
 */
export const COMMUNITY_MEMBERSHIP_METADATA_KEYS = {
    communityId: 'communityId',
    memberEmail: 'communityMemberEmail',
    memberFullname: 'communityMemberFullname',
    participantId: 'communityParticipantId',
    planId: 'communityMembershipPlanId',
    discountCode: 'communityMembershipDiscountCode',
} as const;

export type CommunityMembershipCheckoutUrls = {
    /**
     * Where a paid member returns, which must carry {@link STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER} so the return can be
     * confirmed against the gate
     */
    readonly successUrl: string;
    readonly cancelUrl: string;
};

/**
 * The address of the room a member returns into, together with what the gate says happened to their payment.
 *
 * Note: The result is written as a search parameter of that address rather than after a question mark of its own,
 *       because a room such as a workshop occurrence is already addressed by which occurrence it is.
 */
function createCommunityMembershipReturnUrl(roomUrl: string, checkoutResult: string): string {
    const returnUrl = new URL(roomUrl);
    returnUrl.searchParams.set(COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME, checkoutResult);

    return returnUrl.toString();
}

/**
 * Where the gate sends a member back to, both when they paid and when they changed their mind.
 *
 * Note: The placeholder of the finished checkout is written into the address by hand, because the gate replaces it
 *       only where it stands unescaped, which is not what a search parameter makes of a brace.
 */
export function createCommunityMembershipCheckoutUrls(roomUrl: string): CommunityMembershipCheckoutUrls {
    return {
        successUrl:
            `${createCommunityMembershipReturnUrl(roomUrl, COMMUNITY_MEMBERSHIP_PAID_RESULT)}` +
            `&${COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME}=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
        cancelUrl: createCommunityMembershipReturnUrl(roomUrl, COMMUNITY_MEMBERSHIP_CANCELLED_RESULT),
    };
}

function createCommunityMembershipMetadata(
    member: CommunityMembershipMember,
    discountCode: string | null,
    communityId: CommunityId,
): Stripe.MetadataParam {
    return {
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.communityId]: communityId,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberEmail]: normalizeCommunityMemberEmail(member.email),
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberFullname]: member.fullname,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.participantId]: member.participantId,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.planId]: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.id,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.discountCode]: discountCode ?? '',
    };
}

/**
 * Creates the Stripe-native discount which controls the subscription after Checkout has finished.
 * Keeping the normal price in the line item means a temporary coupon can expire back to that price
 * without an application timer or a later subscription rewrite.
 */
function createCommunityMembershipSubscriptionCouponParameters(
    activeDiscount: ActiveDiscount,
): Stripe.CouponCreateParams {
    const sharedParameters = {
        percent_off: activeDiscount.percent,
        name: `Sleva ${activeDiscount.percent} %`,
        metadata: { discountCode: activeDiscount.code },
    };

    const subscriptionDiscountDurationMonths = activeDiscount.subscriptionDiscountDurationMonths;
    if (subscriptionDiscountDurationMonths === null) {
        return { ...sharedParameters, duration: 'forever' };
    }

    return {
        ...sharedParameters,
        duration: 'repeating',
        duration_in_months: subscriptionDiscountDurationMonths,
    };
}

async function createCommunityMembershipSubscriptionCoupon(
    gateway: StripeGateway,
    activeDiscount: ActiveDiscount | null,
): Promise<Stripe.Coupon | null> {
    return activeDiscount === null
        ? null
        : gateway.stripe.coupons.create(createCommunityMembershipSubscriptionCouponParameters(activeDiscount));
}

/**
 * Opens the checkout of the payment gate for one member of the community.
 *
 * Note: The recurring base price and the discount duration are described in the request itself instead of pointing at
 *       a price prepared in the gate. The monthly price and discount a member is entitled to therefore stay decided by
 *       this application alone, while Stripe's coupon makes the selected duration survive every later renewal.
 */
export async function createCommunityMembershipCheckoutSession(
    gateway: StripeGateway,
    member: CommunityMembershipMember,
    price: CommunityMembershipPrice,
    activeDiscount: ActiveDiscount | null,
    urls: CommunityMembershipCheckoutUrls,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): Promise<Stripe.Checkout.Session> {
    const metadata = createCommunityMembershipMetadata(member, activeDiscount?.code ?? null, communityId);
    const subscriptionCoupon = await createCommunityMembershipSubscriptionCoupon(gateway, activeDiscount);

    return gateway.stripe.checkout.sessions.create({
        mode: 'subscription',
        locale: 'cs',
        customer_email: normalizeCommunityMemberEmail(member.email),
        client_reference_id: member.participantId,
        success_url: urls.successUrl,
        cancel_url: urls.cancelUrl,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: STRIPE_CZK_CURRENCY,
                    unit_amount: createStripeAmountFromCzk(price.baseMonthlyEquivalentCzk),
                    recurring: { interval: 'month' },
                    product_data: {
                        name: `${COMMUNITY_MEMBERSHIP_NAME} – ${CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.name}`,
                        description: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.description,
                    },
                },
            },
        ],
        ...(subscriptionCoupon === null ? {} : { discounts: [{ coupon: subscriptionCoupon.id }] }),
        metadata,
        subscription_data: { metadata },
    });
}
