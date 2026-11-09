import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import { STRIPE_CZK_CURRENCY } from '@/lib/payments/stripeAmount';
import { createStripeSubscriptionCouponParameters } from '@/lib/payments/stripeSubscriptionCoupon';
import { ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';
import type Stripe from 'stripe';
import { type PromptbookOrder } from './billingOrders';
import { PROMPTBOOK_ONLINE_TERMS_PATH } from './config';

export const PROMPTBOOK_CHECKOUT_MAX_AGE_MS = 20 * 60 * 1000;
const STRIPE_SESSION_LIFETIME_MS = 60 * 60 * 1000;

export const PROMPTBOOK_ORDER_METADATA = 'promptbookOrderId';

export function getPromptbookPlanName(plan: PromptbookOrder['plan']): string {
    return plan === 'start' ? 'Promptbook Start' : 'Promptbook Business';
}

export async function createPromptbookCheckout(
    stripe: Stripe,
    order: PromptbookOrder,
    discount: ActiveDiscount | null,
) {
    const metadata = { [PROMPTBOOK_ORDER_METADATA]: order.id };
    const reverseCharge = order.country === 'SK';
    const invoiceFooter = [
        reverseCharge ? `DIČ dodavatele: ${order.supplier_tax_id}. Daň odvede zákazník (reverse charge).` : 'Dodavatel není plátcem DPH.',
        `Podmínky objednávky: https://www.ptbk.io${PROMPTBOOK_ONLINE_TERMS_PATH}`,
    ].join('\n');
    const customer = await stripe.customers.create({
        metadata,
        business_name: order.company_name,
        name: order.company_name,
        email: order.email,
        preferred_locales: ['cs'],
        address: order.billing_address,
        tax_exempt: reverseCharge ? 'reverse' : 'none',
        ...(order.vat_id ? { tax_id_data: [{ type: 'eu_vat', value: order.vat_id }] } : {}),
        invoice_settings: {
            rendering_options: { template: order.invoice_template_id },
            footer: invoiceFooter,
            custom_fields: [
                { name: 'IČO odběratele', value: order.company_id },
                { name: 'IČO dodavatele', value: String(ORGANIZATION_REGISTRATION_NUMBER) },
                { name: 'Verze podmínek', value: order.terms_version },
                { name: 'Verze enginu', value: order.engine_version.slice(0, 140) },
            ],
        },
    }, { idempotencyKey: `promptbook-customer-${order.id}` });
    const coupon = discount && await stripe.coupons.create(createStripeSubscriptionCouponParameters(discount), {
        idempotencyKey: `promptbook-coupon-${order.id}`,
    });

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        locale: 'cs',
        customer: customer.id,
        payment_method_types: ['card'],
        payment_method_collection: 'always',
        adaptive_pricing: { enabled: false },
        client_reference_id: order.id,
        expires_at: Math.floor((Date.parse(order.created_at) + STRIPE_SESSION_LIFETIME_MS) / 1000),
        success_url: `${order.billing_origin}/api/promptbook-billing/return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${order.billing_origin}/cs/pricing/objednat/${order.plan}?stav=zruseno`,
        line_items: [{
            quantity: 1,
            price_data: {
                currency: STRIPE_CZK_CURRENCY,
                tax_behavior: 'exclusive',
                unit_amount: order.base_amount,
                recurring: { interval: 'month' },
                product_data: {
                    name: getPromptbookPlanName(order.plan),
                    description: 'Měsíční předplatné za jeden projekt',
                    metadata: { product: 'promptbook', plan: order.plan },
                },
            },
        }],
        ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
        metadata,
        subscription_data: { metadata, description: getPromptbookPlanName(order.plan) },
    }, { idempotencyKey: `promptbook-checkout-${order.id}` });
    return { session, customerId: customer.id };
}
