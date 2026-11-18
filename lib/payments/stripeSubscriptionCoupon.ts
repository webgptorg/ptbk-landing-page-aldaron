import { calculateDiscountedAmount, describeDiscount } from '@/lib/discounts/discountPricing';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import type Stripe from 'stripe';

/** A coupon snapshots the accepted percentage and duration on the Stripe subscription. */
export function createStripeSubscriptionCouponParameters(discount: ActiveDiscount, baseAmount?: number): Stripe.CouponCreateParams | null {
    if (discount.priceRule && baseAmount === undefined) throw new Error('A custom discount requires its frozen base amount');
    const amountOff = discount.priceRule ? baseAmount! - calculateDiscountedAmount(baseAmount!, discount) : null;
    if (amountOff === 0) return null;
    const shared = {
        ...(amountOff === null ? { percent_off: discount.percent } : { amount_off: amountOff, currency: 'czk' }),
        name: describeDiscount(discount),
        metadata: { discountCode: discount.code },
    };
    const months = discount.subscriptionDiscountDurationMonths;
    return months === null ? { ...shared, duration: 'forever' } : {
        ...shared,
        duration: 'repeating',
        duration_in_months: months,
    };
}
