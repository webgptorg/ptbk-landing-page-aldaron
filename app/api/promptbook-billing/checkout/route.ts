import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { normalizeDiscountCode } from '@/lib/discounts/discountCode';
import { reservePromptbookDiscountCode, settlePromptbookDiscountReservation } from '@/lib/discounts/discountCodeDatabase';
import { getPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { createStripeAmountFromCzk } from '@/lib/payments/stripeAmount';
import { BILLING_ORDER_ID_PATTERN, writeOrderAccessCookie } from '@/lib/promptbook-billing/billingAccess';
import { createPromptbookCheckout, PROMPTBOOK_CHECKOUT_MAX_AGE_MS } from '@/lib/promptbook-billing/billingCheckout';
import { BillingIdentityError, resolvePromptbookCheckoutIdentity } from '@/lib/promptbook-billing/billingIdentity';
import { getBillingDatabase, loadPromptbookOrder, PROMPTBOOK_ORDERS_TABLE } from '@/lib/promptbook-billing/billingOrders';
import { getBillingOrigin, getBillingSetting, getPromptbookBillingAvailability, PROMPTBOOK_MEMBER_PATH, PROMPTBOOK_ONLINE_TERMS_VERSION } from '@/lib/promptbook-billing/config';
import { COMMERCIAL_TERMS } from '@/businesses/new/commercialTerms';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'no-store' };
const MINIMUM_STRIPE_CHARGE_CZK_MINOR = 1500;
const quoteChanged = 'Sleva už není dostupná za zobrazených podmínek. Ověřte kód znovu.';

const checkoutSchema = z.object({
    requestId: z.string().regex(BILLING_ORDER_ID_PATTERN).transform((id) => id.toLowerCase()),
    plan: z.enum(['start', 'business']),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    country: z.enum(['CZ', 'SK']),
    isBusiness: z.boolean().optional(),
    companyId: z.string().trim().max(16).optional().transform((id) => id?.replace(/\s/g, '') || null)
        .refine((id) => id === null || /^\d{8}$/.test(id)),
    vatId: z.string().trim().max(24).optional().transform((vatId) => vatId?.replace(/\s/g, '').toUpperCase() || null),
    billingName: z.string().trim().min(1).max(200),
    billingAddress: z.object({
        line1: z.string().trim().min(1).max(200),
        city: z.string().trim().min(1).max(100),
        postal_code: z.string().trim().max(10).transform((code) => code.replace(/\s/g, ''))
            .refine((code) => /^\d{5}$/.test(code)),
        country: z.enum(['CZ', 'SK']),
    }),
    referralCode: z.string().trim().max(80).regex(/^[A-Za-z0-9_-]*$/).optional().default(''),
    note: z.string().trim().max(4000).optional().transform((note) => note || null),
    immediateStart: z.boolean().optional().default(false),
    promoCode: z.string().trim().max(100).optional().transform((code) => normalizeDiscountCode(code ?? '') || null),
    expectedDiscount: z.object({ percent: z.number().positive().max(100), months: z.number().int().positive().max(36).nullable() }).nullable(),
    acceptedTerms: z.literal(true),
    termsVersion: z.literal(PROMPTBOOK_ONLINE_TERMS_VERSION),
}).refine(({ promoCode, expectedDiscount }) => Boolean(promoCode) === Boolean(expectedDiscount))
    .refine(({ isBusiness, companyId, vatId }) => isBusiness === undefined ||
        (isBusiness ? companyId !== null : companyId === null && vatId === null))
    .refine(({ companyId, immediateStart }) => companyId !== null || immediateStart)
    .refine(({ country, billingAddress }) => country === billingAddress.country);

function fail(error: string, status: number) {
    return NextResponse.json({ error }, { status, headers: NO_STORE });
}

function opened(request: NextRequest, orderId: string, url: string) {
    const response = NextResponse.json({ url }, { headers: NO_STORE });
    writeOrderAccessCookie(response, orderId, request);
    return response;
}

export async function POST(request: NextRequest) {
    const crossSite = getCrossSiteResponseOrNull(request);
    if (crossSite) return crossSite;
    const availability = getPromptbookBillingAvailability();
    const gateway = getStripeGatewayOrNull();
    const database = getBillingDatabase();
    if (!availability.enabled || !gateway || !database) {
        return fail('Platbu teď nelze otevřít. Zkuste to prosím později.', 503);
    }

    const result = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!result.success) return fail('Zkontrolujte fakturační údaje a potvrďte aktuální podmínky.', 400);
    const input = result.data;
    if (input.country === 'SK' && !availability.slovakiaEnabled) {
        return fail('Online platba pro slovenské zákazníky teď není dostupná.', 422);
    }

    try {
        let order = await loadPromptbookOrder(database, input.requestId);
        if (!order) {
            const identity = await resolvePromptbookCheckoutIdentity(input);
            const { error } = await database.from(PROMPTBOOK_ORDERS_TABLE).upsert({
                id: input.requestId,
                plan: input.plan,
                email: input.email,
                country: identity.country,
                company_id: identity.companyId,
                company_name: identity.name,
                customer_type: identity.customerType,
                tax_treatment: identity.taxTreatment,
                order_note: input.note,
                referral_code: input.referralCode || null,
                immediate_start: input.immediateStart,
                vat_id: identity.vatId ?? null,
                billing_address: identity.address,
                terms_version: input.termsVersion,
                engine_version: availability.supportedVersion,
                engine_licence_url: availability.engineLicenceUrl,
                support_email: availability.supportEmail,
                billing_origin: getBillingOrigin(request),
                invoice_template_id: getBillingSetting(`PROMPTBOOK_BILLING_${identity.taxTreatment === 'reverse_charge' ? 'SK' : 'CZ'}_INVOICE_TEMPLATE_ID`),
                supplier_tax_id: identity.taxTreatment === 'reverse_charge' ? getBillingSetting('PROMPTBOOK_BILLING_SUPPLIER_TAX_ID') : null,
                base_amount: createStripeAmountFromCzk(input.plan === 'start' ? COMMERCIAL_TERMS.startCzk : COMMERCIAL_TERMS.businessCzk),
                discount_code: input.promoCode,
                discount_percent: input.expectedDiscount?.percent ?? null,
                discount_months: input.expectedDiscount?.months ?? null,
                is_test: gateway.configuration.isTestMode,
            }, { onConflict: 'id', ignoreDuplicates: true });
            if (error) throw new Error('Promptbook order creation failed', { cause: error });
            order = await loadPromptbookOrder(database, input.requestId);
        }

        if (!order || order.email !== input.email || order.plan !== input.plan || order.country !== input.country ||
            order.company_id !== input.companyId || order.vat_id !== input.vatId ||
            order.company_name !== input.billingName || order.billing_address.line1 !== input.billingAddress.line1 ||
            order.billing_address.city !== input.billingAddress.city ||
            order.billing_address.postal_code !== input.billingAddress.postal_code ||
            order.billing_address.country !== input.billingAddress.country ||
            order.customer_type !== (input.companyId ? 'business' : 'consumer') ||
            (order.referral_code ?? '') !== input.referralCode || order.order_note !== input.note || order.immediate_start !== input.immediateStart ||
            order.discount_code !== input.promoCode || order.discount_percent !== (input.expectedDiscount?.percent ?? null) ||
            order.discount_months !== (input.expectedDiscount?.months ?? null) || order.terms_version !== input.termsVersion ||
            order.billing_origin !== getBillingOrigin(request) || order.is_test !== gateway.configuration.isTestMode) {
            return fail('Objednávka se změnila. Začněte prosím novou objednávku.', 409);
        }

        if (order.stripe_session_id) {
            const session = await gateway.stripe.checkout.sessions.retrieve(order.stripe_session_id);
            if (session.status === 'complete') return opened(request, order.id, `${PROMPTBOOK_MEMBER_PATH}?stav=potvrzuji`);
            if (session.status === 'open' && session.url) return opened(request, order.id, session.url);
        }
        if (order.status !== 'pending' || order.stripe_session_id ||
            Date.now() - Date.parse(order.created_at) > PROMPTBOOK_CHECKOUT_MAX_AGE_MS) {
            return fail('Platnost pokusu vypršela. Začněte prosím novou objednávku.', 409);
        }

        const priceAfterDiscount = order.base_amount - Math.round(order.base_amount * (order.discount_percent ?? 0) / 100);
        if (priceAfterDiscount > 0 && priceAfterDiscount < MINIMUM_STRIPE_CHARGE_CZK_MINOR) {
            return fail('Cena po této slevě je pod minimální částkou pro platbu kartou.', 422);
        }

        const place = getPromptbookDiscountPlaceId(order.plan);
        const reservation = order.discount_code && await reservePromptbookDiscountCode(order.discount_code, place, order.id);
        if (reservation && reservation.errorMessage) throw new Error('Promptbook coupon reservation failed');
        const discount = reservation ? reservation.activeDiscount : null;
        if (order.discount_code && (!discount || discount.percent !== order.discount_percent ||
            discount.subscriptionDiscountDurationMonths !== order.discount_months)) {
            if (discount) {
                const { errorMessage } = await settlePromptbookDiscountReservation(order.id, false);
                if (errorMessage) throw new Error('Promptbook coupon reservation release failed');
            }
            return fail(quoteChanged, 409);
        }

        const { session, customerId } = await createPromptbookCheckout(gateway.stripe, order, discount).catch(async (error: unknown) => {
            // A validation rejection cannot have created a session. Leave the reservation in place on an ambiguous
            // network failure so that retrying the same Stripe idempotency key cannot sell an extra discounted order.
            if (discount && error instanceof Stripe.errors.StripeInvalidRequestError &&
                error.statusCode === 400 && error.code !== 'idempotency_key_in_use') {
                const { errorMessage } = await settlePromptbookDiscountReservation(order.id, false);
                if (errorMessage) throw new Error('Promptbook coupon reservation release failed');
            }
            throw error;
        });
        if (!session.url) throw new Error('Stripe did not return a checkout URL');
        const { error } = await database.from(PROMPTBOOK_ORDERS_TABLE)
            .update({ stripe_session_id: session.id, stripe_customer_id: customerId }).eq('id', order.id);
        if (error) throw new Error('Promptbook session persistence failed', { cause: error });

        return opened(request, order.id, session.url);
    } catch (error) {
        if (error instanceof BillingIdentityError) return fail(error.message, error.status);
        console.error('Promptbook Checkout failed:', error instanceof Error ? error.name : 'Unknown error');
        return fail('Platbu se nepodařilo otevřít. Zkuste to prosím znovu.', 502);
    }
}
