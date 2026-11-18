import { STRIPE_CZK_PAYMENT_POLICY } from './paymentCollectionPolicy';

/**
 * The one currency this application charges in
 */
export const STRIPE_CZK_CURRENCY = 'czk';
/** Minimum non-zero card payment, in CZK minor units. Zero-total subscriptions are separate. */
export const STRIPE_CZK_MINIMUM_CHARGE_AMOUNT = STRIPE_CZK_PAYMENT_POLICY.minimumChargeAmount;

const MINOR_UNITS_IN_CZK = 100;

/**
 * Turns a price written in whole crowns into the smallest unit Stripe charges in.
 *
 * Note: A discounted price can end up with fractional crowns, which a card is never charged in. Rounding it here means
 *       the amount shown to a member and the amount asked of their card are decided in exactly one place.
 */
export function createStripeAmountFromCzk(amountCzk: number): number {
    return Math.round(amountCzk * MINOR_UNITS_IN_CZK);
}

/**
 * Turns an amount the gate reported back into whole crowns
 */
export function createCzkFromStripeAmount(stripeAmount: number): number {
    return Math.round(stripeAmount / MINOR_UNITS_IN_CZK);
}
