import Stripe from 'stripe';
import type { DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { commerceKey, commerceTotals, type CommercePurchase, type CommerceSnapshot } from './commerceModel';
import { mapTwentyContactSource } from './twentyContactSource';

const LIMIT = 10000;
const idOf = (value: string | { id: string } | null | undefined) => typeof value === 'string' ? value : value?.id;
const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
type BillingOrder = { id: string; stripe_subscription_id: string; stripe_customer_id: string; email: string;
    customer_type: string; company_name: string; company_id: string | null; country: string; contact_name: string | null };

/** Full live Stripe snapshot: invoice charge IDs and standalone receipts share one canonical identity. */
export async function loadStripeCommerce(database: DatabaseTransaction, stripe: Stripe): Promise<CommerceSnapshot> {
    const orders = await database.query<BillingOrder>(`SELECT o.id, o.stripe_subscription_id, o.stripe_customer_id,
        o.email, o.customer_type, o.company_name, o.company_id, o.country, c.fullname AS contact_name
        FROM public.promptbook_orders o LEFT JOIN public."Contact" c ON c."promptbookBillingOrderId" = o.id WHERE NOT o.is_test`);
    const invoices: Stripe.Invoice[] = [];
    for await (const invoice of stripe.invoices.list({ status: 'paid', limit: 100 })) {
        if (!invoice.livemode || invoice.amount_paid <= 0) continue;
        invoices.push(invoice);
        if (invoices.length > LIMIT) throw new Error('commerce_invoice_limit');
    }
    const charges = new Map<string, Stripe.Charge>();
    for await (const charge of stripe.charges.list({ limit: 100 })) {
        if (!charge.livemode || !charge.paid || !charge.captured || charge.status !== 'succeeded' || charge.amount_captured <= 0) continue;
        charges.set(charge.id, charge);
        if (charges.size > LIMIT) throw new Error('commerce_receipt_limit');
    }
    const snapshot: CommerceSnapshot = { purchases: [], payments: [] };
    const purchases = new Map<string, CommercePurchase>();
    const assigned = new Map<string, string>();
    const subscriptions = new Map<string, Stripe.Subscription>();
    async function getSubscription(id: string) {
        if (!subscriptions.has(id)) subscriptions.set(id, await stripe.subscriptions.retrieve(id, { expand: ['customer', 'items.data.price.product'] }));
        return subscriptions.get(id)!;
    }
    async function purchaseFor(invoice: Stripe.Invoice | null, charge: Stripe.Charge): Promise<CommercePurchase> {
        const subscriptionId = invoice && (idOf(invoice.parent?.subscription_details?.subscription) ||
            (invoice as Stripe.Invoice & { subscription?: string }).subscription);
        const subscription = subscriptionId ? await getSubscription(subscriptionId) : null;
        const product = subscription?.items.data[0]?.price.product;
        const productName = product && typeof product === 'object' && !product.deleted ? product.name : null;
        const customer = subscription?.customer;
        const customerRecord = customer && typeof customer === 'object' && !customer.deleted ? customer : null;
        const customerId = idOf(charge.customer);
        const order = orders.rows.find((row) => row.stripe_subscription_id === subscriptionId ||
            row.id === subscription?.metadata.promptbookOrderId);
        const key = commerceKey(subscriptionId ? 'subscription' : 'purchase', subscriptionId || idOf(charge.payment_intent) || charge.id);
        const email = (order?.email || subscription?.metadata.communityMemberEmail || invoice?.customer_email ||
            customerRecord?.email || charge.billing_details.email || charge.receipt_email || '').trim().toLowerCase();
        let contactName = order?.contact_name || subscription?.metadata.communityMemberFullname || charge.billing_details.name || '';
        // Billing company and contact identity are independent. Never infer a legal entity from an email domain.
        const taxId = invoice?.customer_tax_ids?.find((tax) => tax.value)?.value;
        const companyName = order?.customer_type === 'business' ? order.company_name :
            customerRecord?.business_name || null;
        const registrationNumber = order?.company_id || null;
        const country = order?.country || invoice?.customer_address?.country || charge.billing_details.address?.country || null;
        const company = order?.customer_type === 'business' || (taxId && invoice?.customer_name) || companyName
            ? { key: registrationNumber ? `registration:${country}:${registrationNumber.replace(/\s/g,'')}` :
                taxId ? `tax:${country}:${taxId.replace(/\s/g,'').toUpperCase()}` : commerceKey('company', customerId || key),
                name: companyName || invoice?.customer_name || '', registrationNumber, country } : null;
        if (company && !order?.contact_name && !subscription?.metadata.communityMemberFullname && contactName.trim().toLowerCase() === company.name.trim().toLowerCase()) contactName = '';
        const mapped = mapTwentyContactSource({ external_id: key, source_version: '1', occurred_at: new Date(charge.created),
            kind: 'contact', email, fullname: contactName, phone: null, source_name: 'Stripe', source_url: null, details: {}, attempts: 0 });
        const name = productName || invoice?.lines.data.map((line) => line.description).filter(Boolean).join(' + ') || charge.description || 'Nákup přes Stripe';
        return { key, name, product: productName || name, status: subscription?.status || 'paid',
            billingInterval: subscription?.items.data[0]?.price.recurring?.interval || null,
            email: mapped === 'test_contact' ? null : mapped.email, contactName,
            company, identityReview: mapped === 'test_contact' ? 'test_identity' : (mapped.details.identityReview as string | undefined) || null };
    }
    function add(charge: Stripe.Charge, purchase: CommercePurchase, description?: string) {
        const previous = assigned.get(charge.id);
        if (previous && previous !== purchase.key) throw new Error('commerce_ambiguous_receipt_allocation');
        if (previous) return;
        assigned.set(charge.id, purchase.key);
        purchases.set(purchase.key, purchase);
        snapshot.payments.push({ key: commerceKey('receipt', charge.id), purchaseKey: purchase.key,
            name: `${description || purchase.product} · ${iso(charge.created).slice(0,10)}`, paidAt: iso(charge.created), currency: charge.currency,
            amountPaidMinor: charge.amount_captured, refundedAmountMinor: charge.amount_refunded,
            state: charge.disputed ? 'disputed' : charge.refunded ? 'refunded' : charge.amount_refunded > 0 ? 'partially_refunded' : 'paid', source: 'Stripe' });
    }
    for (const invoice of invoices) {
        let matched = false;
        for await (const payment of stripe.invoicePayments.list({ invoice: invoice.id, status: 'paid', limit: 100,
            expand: ['data.payment.payment_intent.latest_charge','data.payment.charge'] })) {
            const intent = payment.payment.payment_intent;
            const candidate = (intent && typeof intent === 'object' ? intent.latest_charge : null) || payment.payment.charge;
            const chargeId = idOf(candidate);
            if (!chargeId || !charges.has(chargeId)) continue;
            const charge = charges.get(chargeId)!;
            add(charge, await purchaseFor(invoice, charge),invoice.lines.data.map((line) => line.description).filter(Boolean).join(' + '));
            matched = true;
        }
        // Never silently turn a paid invoice into an invented card receipt.
        if (!matched) throw new Error('commerce_paid_invoice_without_receipt');
    }
    for (const charge of Array.from(charges.values())) {
        if (!assigned.has(charge.id)) add(charge, await purchaseFor(null, charge));
    }
    snapshot.purchases = Array.from(purchases.values());
    commerceTotals(snapshot.payments); // validate provider values before the first CRM write
    return snapshot;
}
