import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { settlePromptbookDiscountReservation } from '@/lib/discounts/discountCodeDatabase';
import { BILLING_ORDER_ID_PATTERN } from './billingAccess';
import { PROMPTBOOK_ORDER_METADATA } from './billingCheckout';
import { syncPromptbookBillingContact } from './billingContacts';
import { loadPromptbookOrder, PROMPTBOOK_ORDERS_TABLE } from './billingOrders';

type BillingEvent = {
    orderId: string;
    subscriptionId?: string;
    session?: Stripe.Checkout.Session;
    invoiceId?: string;
};

function objectId(object: string | { id: string } | null | undefined) {
    return typeof object === 'string' ? object : object?.id;
}

function orderIdFrom(metadata: Stripe.Metadata | null | undefined) {
    const id = metadata?.[PROMPTBOOK_ORDER_METADATA];
    return id && BILLING_ORDER_ID_PATTERN.test(id) ? id : null;
}

function invoiceEvent(invoice: Stripe.Invoice): BillingEvent | null {
    const details = invoice.parent?.subscription_details;
    const orderId = orderIdFrom(details?.metadata);
    return orderId ? { orderId, subscriptionId: objectId(details?.subscription), invoiceId: invoice.id } : null;
}

/** Community events carry a different metadata key and remain on the existing processing path. */
export async function getPromptbookBillingEvent(stripe: Stripe, event: Stripe.Event): Promise<BillingEvent | null> {
    switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired': {
            const session = event.data.object;
            const orderId = orderIdFrom(session.metadata);
            return orderId ? { orderId, subscriptionId: objectId(session.subscription), session } : null;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const orderId = orderIdFrom(subscription.metadata);
            return orderId ? { orderId, subscriptionId: subscription.id } : null;
        }
        case 'invoice.paid':
        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const legacyInvoice = invoice as Stripe.Invoice & { subscription?: string };
            // The webhook can still use the version originally set for community memberships.
            return invoiceEvent(invoice) ??
                (legacyInvoice.subscription ? invoiceEvent(await stripe.invoices.retrieve(invoice.id)) : null);
        }
        case 'charge.refunded': {
            const charge = event.data.object;
            const paymentIntentId = objectId(charge.payment_intent);
            const customerId = objectId(charge.customer);
            if (!paymentIntentId || !customerId) return null;
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted || !orderIdFrom(customer.metadata)) return null;
            const payments = await stripe.invoicePayments.list({
                payment: { type: 'payment_intent', payment_intent: paymentIntentId },
                expand: ['data.invoice'],
            });
            const payment = payments.data.find((entry) => entry.status === 'paid');
            const invoice = payment?.invoice;
            return invoice && typeof invoice === 'object' && !invoice.deleted ? invoiceEvent(invoice) : null;
        }
        default:
            return null;
    }
}

function toDate(seconds: number) {
    return new Date(seconds * 1000).toISOString();
}

/** A late initial invoice may correct an earlier-observed renewal, but renewals never move acceptance later. */
export function getPromptbookOrderConfirmedAt(previous: string | null, invoicePaidAt: string | null): string | null {
    const dates = [previous, invoicePaidAt].flatMap((value) => value ? [Date.parse(value)] : []);
    return dates.length ? new Date(Math.min(...dates)).toISOString() : null;
}

async function storePaidInvoice(database: SupabaseClient, stripe: Stripe, orderId: string, invoice: Stripe.Invoice) {
    if (invoice.status !== 'paid' || invoice.currency !== 'czk' || invoice.status_transitions.paid_at === null) return;

    let cardAmount = 0;
    let refundedAmount = 0;
    if (invoice.amount_paid > 0) {
        for await (const payment of stripe.invoicePayments.list({
            invoice: invoice.id,
            status: 'paid',
            expand: ['data.payment.payment_intent.latest_charge', 'data.payment.charge'],
        })) {
            const intent = payment.payment.payment_intent;
            const charge = typeof intent === 'object' ? intent.latest_charge : payment.payment.charge;
            if (charge && typeof charge === 'object' && charge.paid && charge.captured &&
                charge.payment_method_details?.type === 'card') {
                cardAmount += payment.amount_paid ?? 0;
                refundedAmount += charge.amount_refunded;
            }
        }
    }

    const periodEnd = Math.max(0, ...invoice.lines.data.map((line) => line.period.end));
    const { error } = await database.from('promptbook_invoices').upsert({
        stripe_invoice_id: invoice.id,
        order_id: orderId,
        billing_reason: invoice.billing_reason,
        paid_at: toDate(invoice.status_transitions.paid_at),
        paid_through: periodEnd ? toDate(periodEnd) : null,
        amount_paid: invoice.amount_paid,
        card_amount: cardAmount,
        refunded_amount: refundedAmount,
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        currency: invoice.currency,
    }, { onConflict: 'stripe_invoice_id', ignoreDuplicates: true });
    if (error) throw new Error('Promptbook invoice persistence failed', { cause: error });
    if (refundedAmount > 0) {
        // An older snapshot can arrive after a refund. Keep the greater confirmed total for this invoice.
        const refund = await database.from('promptbook_invoices').update({ refunded_amount: refundedAmount })
            .eq('stripe_invoice_id', invoice.id).lt('refunded_amount', refundedAmount);
        if (refund.error) throw new Error('Promptbook refund persistence failed', { cause: refund.error });
    }
}

export async function applyPromptbookBillingEvent(
    database: SupabaseClient,
    stripe: Stripe,
    billing: BillingEvent,
    event: Stripe.Event,
) {
    const order = await loadPromptbookOrder(database, billing.orderId);
    if (!order) throw new Error('Unknown Promptbook order');
    if (order.is_test === event.livemode || (billing.session && billing.session.client_reference_id !== order.id) ||
        (billing.session && order.stripe_session_id && order.stripe_session_id !== billing.session.id) ||
        (billing.subscriptionId && order.stripe_subscription_id && order.stripe_subscription_id !== billing.subscriptionId)) {
        throw new Error('Unexpected Stripe references for Promptbook order');
    }

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const { data, error } = await database.from(PROMPTBOOK_ORDERS_TABLE)
            .update({ status: 'incomplete_expired', revision: order.revision + 1 })
            .eq('id', order.id).eq('revision', order.revision).eq('status', 'pending').select('id');
        if (error) throw new Error('Promptbook expiry persistence failed', { cause: error });
        if (data.length === 0 && order.status === 'pending') throw new Error('Promptbook order updated concurrently');
        if (order.status === 'pending' || order.status === 'incomplete_expired') {
            const { errorMessage } = await settlePromptbookDiscountReservation(order.id, false);
            if (errorMessage) throw new Error('Promptbook discount release failed');
        }
        return;
    }
    if (!billing.subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(billing.subscriptionId, { expand: ['latest_invoice'] });
    const customerId = objectId(subscription.customer);
    if (!customerId || orderIdFrom(subscription.metadata) !== order.id ||
        (order.stripe_customer_id && order.stripe_customer_id !== customerId)) {
        throw new Error('Unexpected Stripe customer for Promptbook order');
    }

    const latestInvoice = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null;
    const eventInvoice = billing.invoiceId && billing.invoiceId !== latestInvoice?.id ?
        await stripe.invoices.retrieve(billing.invoiceId) : null;
    for (const invoice of [latestInvoice, eventInvoice]) {
        if (invoice && invoiceEvent(invoice)?.orderId === order.id) await storePaidInvoice(database, stripe, order.id, invoice);
    }

    const firstPaid = await database.from('promptbook_invoices').select('paid_at')
        .eq('order_id', order.id).gt('card_amount', 0).order('paid_at', { ascending: true }).limit(1).maybeSingle();
    const firstConfirmed = await database.from('promptbook_invoices').select('paid_at')
        .eq('order_id', order.id).order('paid_at', { ascending: true }).limit(1).maybeSingle();
    const mostRecent = await database.from('promptbook_invoices').select('paid_through, hosted_invoice_url, amount_paid')
        .eq('order_id', order.id).order('paid_through', { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    if (firstPaid.error || firstConfirmed.error || mostRecent.error) throw new Error('Promptbook invoice history lookup failed');

    const { data, error } = await database.from(PROMPTBOOK_ORDERS_TABLE).update({
        revision: order.revision + 1,
        stripe_customer_id: customerId,
        stripe_session_id: billing.session?.id ?? order.stripe_session_id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        paid_through: mostRecent.data?.paid_through ?? null,
        invoice_url: mostRecent.data?.hosted_invoice_url ?? null,
        amount_paid: mostRecent.data?.amount_paid ?? null,
        first_paid_at: firstPaid.data?.paid_at ?? null,
        confirmed_at: getPromptbookOrderConfirmedAt(order.confirmed_at, firstConfirmed.data?.paid_at ?? null),
    }).eq('id', order.id).eq('revision', order.revision).select('id');
    if (error || data.length !== 1) throw new Error('Promptbook order updated concurrently or could not be saved', { cause: error });

    if (order.discount_code && mostRecent.data) {
        const { errorMessage } = await settlePromptbookDiscountReservation(order.id, true);
        if (errorMessage) throw new Error('Promptbook discount redemption failed');
    }
    if (firstPaid.data) await syncPromptbookBillingContact({ ...order, first_paid_at: firstPaid.data.paid_at });
}
