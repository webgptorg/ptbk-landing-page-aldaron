import Stripe from 'stripe';
import { Client } from 'pg';
import { createTwentyContactApi, getTwentyContactRecordId } from '../../lib/crm/twentyContactApi';
import { mapTwentyContactSource } from '../../lib/crm/twentyContactSource';
import { getTwentyContactSyncSettings } from '../../lib/crm/runTwentyContactSync';
import { acquireTwentyContactSyncLock, loadTwentyContactSyncRows } from '../../lib/crm/twentyContactSyncDatabase';
import { mapStripePaidContactSource, type StripePaidContactInput } from '../../lib/crm/stripePaidContactSource';

async function main() {
    const apply = process.argv.includes('--apply');
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    const settings = getTwentyContactSyncSettings();
    if (!settings || !key || !/^(sk|rk)_live_/.test(key) || !process.env.DATABASE_URL) {
        throw new Error('Live Stripe, database and Twenty production settings are required');
    }
    if (apply && process.env.VERCEL_ENV !== 'production') throw new Error('Apply requires the production environment');

    const stripe = new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
    const database = new Client({ connectionString: process.env.DATABASE_URL });
    const idOf = (value: string | { id: string } | null | undefined) => typeof value === 'string' ? value : value?.id;
    const iso = (seconds: number | null | undefined) => seconds ? new Date(seconds * 1000).toISOString() : null;
    const summary = { mode: apply ? 'apply' : 'dry-run', positivePaidInvoices: 0, recognizedSubscriptions: 0,
        sources: 0, delivered: 0, verified: 0, needsReview: 0, skippedUnrecognized: 0, skippedIdentity: 0,
        uniqueEmails: 0 };
    let stage = 'database-connect';

    function safeError(error: unknown) {
        const value = error as { name?: string; code?: string; statusCode?: number; message?: string };
        return { stage, name: value?.name,
            code: typeof value?.code === 'string' && /^[A-Za-z0-9_]{1,80}$/.test(value.code) ? value.code : undefined,
            status: value?.statusCode,
            reason: /^(Historical|CRM|Unexpected test|Live Stripe|Apply requires)/.test(value?.message ?? '') ? value.message : undefined };
    }

    await database.connect();
    try {
        await database.query('BEGIN');
        if (!(await acquireTwentyContactSyncLock(database))) throw new Error('CRM sync is busy; retry this operator command');
        stage = 'load-web-sources';
        const rows = await loadTwentyContactSyncRows(database, '1970-01-01T00:00:00Z', 10000,
            { includeDelivered: true, kinds: ['promptbook-order', 'membership'] });
        if (rows.length === 10000) throw new Error('Historical source limit reached');
        const sourceRows = new Map(rows.map((row) => [row.external_id, row]));
        const orders = await database.query(`SELECT o.id, o.stripe_subscription_id, o.stripe_customer_id,
            c.id AS contact_id FROM public.promptbook_orders o
            LEFT JOIN public."Contact" c ON c."promptbookBillingOrderId" = o.id WHERE NOT o.is_test`);
        const memberships = await database.query(`SELECT id, email, stripe_subscription_id
            FROM public.community_memberships WHERE NOT is_test_payment`);
        const grouped = new Map<string, Stripe.Invoice[]>();
        stage = 'load-stripe-invoices';
        for await (const invoice of stripe.invoices.list({ status: 'paid', limit: 100 })) {
            if (!invoice.livemode || invoice.amount_paid <= 0) continue;
            if (++summary.positivePaidInvoices > 10000) throw new Error('Historical invoice limit reached');
            const legacy = invoice as Stripe.Invoice & { subscription?: string };
            const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription) ?? legacy.subscription;
            if (!subscriptionId) { summary.skippedUnrecognized++; continue; }
            const invoices = grouped.get(subscriptionId) ?? [];
            invoices.push(invoice);
            grouped.set(subscriptionId, invoices);
        }
        const api = createTwentyContactApi(settings);
        await api.verifyConnectivity();
        const emails = new Set<string>();
        for (const [subscriptionId, invoices] of Array.from(grouped)) {
            stage = 'load-stripe-subscription';
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['customer', 'items.data.price.product'] });
            if (!subscription.livemode) throw new Error('Unexpected test subscription');
            const metadata = subscription.metadata;
            const order = orders.rows.find((row) => row.stripe_subscription_id === subscriptionId ||
                row.id === metadata.promptbookOrderId || row.stripe_customer_id === idOf(subscription.customer));
            const membership = memberships.rows.find((row) => row.stripe_subscription_id === subscriptionId);
            const product = subscription.items.data[0]?.price.product;
            const productMetadata = product && typeof product !== 'string' && !product.deleted ? product.metadata : {};
            const kind = order || metadata.promptbookOrderId || productMetadata.product === 'promptbook'
                ? 'promptbook' : membership || metadata.communityMembershipPlanId ? 'community' : null;
            if (!kind) { summary.skippedUnrecognized += invoices.length; continue; }
            summary.recognizedSubscriptions++;
            const customer = typeof subscription.customer === 'object' && !subscription.customer.deleted ? subscription.customer : null;
            const email = (metadata.communityMemberEmail || customer?.email || invoices[0].customer_email || '').trim().toLowerCase();
            const payments: StripePaidContactInput['payments'] = [];
            for (const invoice of invoices) {
                stage = 'load-stripe-refunds';
                let refundedAmountMinor = 0;
                const seenCharges = new Set<string>();
                for await (const payment of stripe.invoicePayments.list({ invoice: invoice.id, status: 'paid', limit: 100,
                    expand: ['data.payment.payment_intent.latest_charge', 'data.payment.charge'] })) {
                    const intent = payment.payment.payment_intent;
                    const charge = typeof intent === 'object' && intent ? intent.latest_charge : payment.payment.charge;
                    if (charge && typeof charge === 'object' && !seenCharges.has(charge.id)) {
                        refundedAmountMinor += charge.amount_refunded;
                        seenCharges.add(charge.id);
                    }
                }
                payments.push({ paidAt: iso(invoice.status_transitions.paid_at ?? invoice.created)!,
                    paidThrough: iso(Math.max(0, ...invoice.lines.data.map((line) => line.period.end))),
                    amountPaidMinor: invoice.amount_paid, refundedAmountMinor, currency: invoice.currency });
            }
            const externalId = order?.contact_id ? `web:contact:${order.contact_id}`
                : membership ? `web:membership:${membership.id}` : undefined;
            const existingRow = externalId ? sourceRows.get(externalId) : undefined;
            const existing = existingRow ? mapTwentyContactSource(existingRow) : undefined;
            if (existing === 'test_contact') { summary.skippedIdentity++; continue; }
            const source = mapStripePaidContactSource({ subscriptionId, email,
                fullname: metadata.communityMemberFullname || customer?.name || '', kind,
                plan: productMetadata.plan || metadata.communityMembershipPlanId || (existing?.details.planId as string | undefined) || null,
                status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end,
                paidThrough: iso(Math.max(0, ...subscription.items.data.map((item) => item.current_period_end))),
                payments,
            }, existing);
            if (!source) { summary.skippedIdentity++; continue; }
            summary.sources++;
            emails.add(email);
            if (!apply) continue;
            stage = 'deliver-crm-source';
            const result = await api.deliverSource(source);
            if (result === 'linked') summary.delivered++; else summary.needsReview++;
            // A replay must preserve source identity, Person relation and details, and create no duplicate source.
            if (await api.deliverSource(source) !== result) throw new Error('Historical replay changed identity matching');
            const params = new URLSearchParams({ filter: `externalId[eq]:${JSON.stringify(source.externalId)}`, limit: '100' });
            const response = await fetch(new URL(`/rest/contactSources?${params}`, settings.url), {
                headers: { Authorization: `Bearer ${settings.key}`,
                    ...(settings.ingressKey ? { 'X-PTBK-Twenty-Sync': settings.ingressKey } : {}) },
                signal: AbortSignal.timeout(10000), redirect: 'error', cache: 'no-store',
            });
            if (!response.ok) throw new Error(`CRM import verification failed (HTTP ${response.status})`);
            const saved = await response.json() as { data: { contactSources: { id: string; externalId: string; details: string; personId?: string }[] } };
            const matches = saved.data.contactSources.filter((row) => row.externalId === source.externalId);
            if (matches.length !== 1 || matches[0].id !== getTwentyContactRecordId('source', source.externalId)) {
                // Older imports may have a different source UUID; exact externalId uniqueness remains authoritative.
                if (matches.length !== 1) throw new Error('Historical source uniqueness verification failed');
            }
            const details = JSON.parse(matches[0].details) as Record<string, unknown>;
            if (!details.paidCustomer || JSON.stringify(details.paymentHistory) !== JSON.stringify(source.details.paymentHistory)) {
                throw new Error('Historical payment history verification failed');
            }
            summary.verified++;
        }
        summary.uniqueEmails = emails.size;
        await database.query('COMMIT');
        console.log('TWENTY_STRIPE_IMPORT_RESULT', JSON.stringify(summary));
    } catch (error) {
        await database.query('ROLLBACK').catch(() => undefined);
        // Do not include provider payloads, URLs, credentials or customer data in build logs.
        console.error('TWENTY_STRIPE_IMPORT_FAILED', JSON.stringify(safeError(error)), JSON.stringify(summary));
        process.exitCode = 1;
    } finally {
        await database.end();
    }
}

main().catch((error) => {
    console.error('TWENTY_STRIPE_IMPORT_FAILED', error instanceof Error ? error.name : 'UnknownError');
    process.exitCode = 1;
});
