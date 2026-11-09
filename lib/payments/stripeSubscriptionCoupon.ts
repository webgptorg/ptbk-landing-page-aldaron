import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import type Stripe from 'stripe';

/** A coupon snapshots the accepted percentage and duration on the Stripe subscription. */
export function createStripeSubscriptionCouponParameters(discount: ActiveDiscount): Stripe.CouponCreateParams {
    const shared = {
        percent_off: discount.percent,
        name: `Sleva ${discount.percent} %`,
        metadata: { discountCode: discount.code },
    };
    const months = discount.subscriptionDiscountDurationMonths;
    return months === null ? { ...shared, duration: 'forever' } : {
        ...shared,
        duration: 'repeating',
        duration_in_months: months,
    };
}
