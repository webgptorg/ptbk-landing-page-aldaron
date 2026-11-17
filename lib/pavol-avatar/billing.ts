import 'server-only';
import { ensureAvatarStripeWebhook } from './webhookPreflight';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { resolvePromptbookCheckoutIdentity } from '@/lib/promptbook-billing/billingIdentity';
import { getOperatorIdentification } from '@/lib/legal/legalOperator';
import { avatarLegalContractSnapshot } from '@/lib/legal/productLegalAvatar';
import { getAvatarDatabase } from './database';
import { AVATAR_PRICE_CZK, AVATAR_TERMS_PATH, AVATAR_TERMS_VERSION, getAvatarAvailability, getAvatarOrigin } from './config';
import type { AvatarPrincipal } from './auth';
export const AVATAR_ORDER_METADATA = 'avatarOrderId';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const openStatuses = ['pending', 'active', 'trialing', 'past_due', 'unpaid', 'paused'];
const address = z.object({ line1: z.string().trim().min(1).max(200), city: z.string().trim().min(1).max(120), postal_code: z.string().trim().min(3).max(20), country: z.enum(['CZ', 'SK']) });
export const avatarCheckoutSchema = z.object({
    requestId: z.string().uuid().regex(uuid), fullname: z.string().trim().min(1).max(160), country: z.enum(['CZ', 'SK']), customerType: z.enum(['individual', 'business']),
    companyId: z.string().trim().max(16).optional(), vatId: z.string().trim().max(24).optional(), billingName: z.string().trim().min(1).max(200), billingAddress: address,
    termsAccepted: z.literal(true), immediateStartAccepted: z.literal(true), termsVersion: z.literal(AVATAR_TERMS_VERSION),
});
export type AvatarCheckoutInput = z.infer<typeof avatarCheckoutSchema>;
export type AvatarOrder = {
    id: string;
    principal_id: string;
    email: string;
    fullname: string;
    customer_type: 'individual' | 'business';
    billing_name: string;
    company_id: string | null;
    vat_id: string | null;
    billing_address: z.infer<typeof address>;
    country: 'CZ' | 'SK';
    base_amount: number;
    currency: string;
    terms_version: string;
    seller: Record<string, unknown>;
    status: string;
    is_test: boolean;
    stripe_customer_id: string | null;
    stripe_session_id: string | null;
    stripe_subscription_id: string | null;
    paid_through: string | null;
    cancel_at_period_end: boolean;
    invoice_url: string | null;
    revision: number;
    request_fingerprint: string;
    created_at: string;
};
export class AvatarBillingError extends Error {
    constructor(message: string, readonly status = 503) { super(message); this.name = 'AvatarBillingError'; }
}
const oid = (v: string | {
    id: string;
} | null | undefined) => typeof v === 'string' ? v : v?.id;
const orderId = (metadata?: Stripe.Metadata | null) => { const id = metadata?.[AVATAR_ORDER_METADATA]; return id && uuid.test(id) ? id : null; };
const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
export async function loadAvatarOrder(db: SupabaseClient, id: string): Promise<AvatarOrder | null> {
    const r = await db.from('avatar_orders').select('*').eq('id', id).maybeSingle();
    if (r.error)
        throw new AvatarBillingError('Objednávku se nepodařilo načíst.');
    return r.data as AvatarOrder | null;
}
export function avatarOrderHasAccess(order: Pick<AvatarOrder, 'status' | 'paid_through'>, now = Date.now()): boolean {
    return !!order.paid_through && Date.parse(order.paid_through) > now && ['active', 'past_due', 'canceled'].includes(order.status);
}
async function saveInvoice(db: SupabaseClient, stripe: Stripe, order: AvatarOrder, invoice: Stripe.Invoice) {
    if (invoice.status !== 'paid' || invoice.currency !== 'czk' || invoice.livemode === order.is_test || orderId(invoice.parent?.subscription_details?.metadata) !== order.id)
        return;
    let refunded = 0;
    for await (const payment of stripe.invoicePayments.list({ invoice: invoice.id, status: 'paid', expand: ['data.payment.payment_intent.latest_charge', 'data.payment.charge'] })) {
        const intent = payment.payment.payment_intent;
        const direct = payment.payment.charge;
        let charge: Stripe.Charge | undefined;
        if (intent && typeof intent === 'object' && intent.latest_charge && typeof intent.latest_charge === 'object')
            charge = intent.latest_charge;
        else if (direct && typeof direct === 'object')
            charge = direct;
        else if (typeof direct === 'string')
            charge = await stripe.charges.retrieve(direct);
        else if (typeof intent === 'string') {
            const loaded = await stripe.paymentIntents.retrieve(intent, { expand: ['latest_charge'] });
            if (loaded.latest_charge && typeof loaded.latest_charge === 'object')
                charge = loaded.latest_charge;
        }
        if (charge)
            refunded += Math.min(payment.amount_paid ?? invoice.amount_paid, charge.amount_refunded);
    }
    const old = await db.from('avatar_invoices').select('refunded_amount').eq('stripe_invoice_id', invoice.id).maybeSingle();
    if (old.error)
        throw new AvatarBillingError('Platbu se nepodařilo ověřit.');
    const end = Math.max(0, ...invoice.lines.data.map(line => line.period.end));
    const r = await db.from('avatar_invoices').upsert({ stripe_invoice_id: invoice.id, order_id: order.id, paid_at: iso(invoice.status_transitions.paid_at ?? invoice.created), paid_through: iso(end || invoice.period_end),
        amount_paid: invoice.amount_paid, refunded_amount: Math.max(old.data?.refunded_amount ?? 0, refunded), currency: invoice.currency, invoice_url: invoice.hosted_invoice_url }, { onConflict: 'stripe_invoice_id' });
    if (r.error)
        throw new AvatarBillingError('Platbu se nepodařilo uložit.');
}
/** Current Stripe state, never event delivery order, determines access. */
export async function refreshAvatarOrder(db: SupabaseClient, stripe: Stripe, order: AvatarOrder, options: {
    session?: Stripe.Checkout.Session;
    subscriptionId?: string;
    invoiceId?: string;
} = {}): Promise<void> {
    const sid = options.subscriptionId ?? oid(options.session?.subscription) ?? order.stripe_subscription_id;
    if (!sid)
        return;
    const sub = await stripe.subscriptions.retrieve(sid, { expand: ['latest_invoice'] });
    const customer = oid(sub.customer);
    if (sub.livemode === order.is_test || orderId(sub.metadata) !== order.id || !customer || (order.stripe_customer_id && order.stripe_customer_id !== customer) || (order.stripe_subscription_id && order.stripe_subscription_id !== sub.id))
        throw new AvatarBillingError('Nesouhlasí vazba platby na objednávku.', 400);
    if (options.session && (options.session.client_reference_id !== order.id || (order.stripe_session_id && order.stripe_session_id !== options.session.id)))
        throw new AvatarBillingError('Nesouhlasí platební relace.', 400);
    const latest = sub.latest_invoice && typeof sub.latest_invoice === 'object' ? sub.latest_invoice : null;
    if (latest)
        await saveInvoice(db, stripe, order, latest);
    if (options.invoiceId && options.invoiceId !== latest?.id)
        await saveInvoice(db, stripe, order, await stripe.invoices.retrieve(options.invoiceId));
    const invoices = await db.from('avatar_invoices').select('paid_through,amount_paid,refunded_amount,invoice_url').eq('order_id', order.id).order('paid_through', { ascending: false, nullsFirst: false });
    if (invoices.error)
        throw new AvatarBillingError('Historii plateb se nepodařilo načíst.');
    const valid = (invoices.data ?? []).find(i => i.amount_paid > i.refunded_amount && i.paid_through);
    const saved = await db.from('avatar_orders').update({ stripe_customer_id: customer, stripe_subscription_id: sub.id, stripe_session_id: options.session?.id ?? order.stripe_session_id, status: sub.status,
        paid_through: valid?.paid_through ?? null, cancel_at_period_end: sub.cancel_at_period_end, invoice_url: valid?.invoice_url ?? latest?.hosted_invoice_url ?? null, revision: order.revision + 1, updated_at: new Date().toISOString() })
        .eq('id', order.id).eq('revision', order.revision).select('id');
    if (saved.error || saved.data?.length !== 1)
        throw new AvatarBillingError('Objednávka se mění souběžně. Zkuste to znovu.');
}
/** Return true only for an event owned by the avatar product. */
export async function applyAvatarStripeEvent(stripe: Stripe, event: Stripe.Event): Promise<boolean> {
    let id: string | null = null;
    let session: Stripe.Checkout.Session | undefined;
    let subscriptionId: string | undefined;
    let invoiceId: string | undefined;
    switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
            session = event.data.object;
            id = orderId(session.metadata);
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            id = orderId(event.data.object.metadata);
            subscriptionId = event.data.object.id;
            break;
        case 'invoice.paid':
        case 'invoice.payment_failed': {
            const raw = event.data.object;
            const direct = orderId(raw.parent?.subscription_details?.metadata);
            const legacy = raw as Stripe.Invoice & {
                subscription?: string;
            };
            if (!direct && !legacy.subscription)
                return false;
            const invoice = direct ? raw : await stripe.invoices.retrieve(raw.id);
            id = orderId(invoice.parent?.subscription_details?.metadata);
            subscriptionId = oid(invoice.parent?.subscription_details?.subscription);
            invoiceId = invoice.id;
            break;
        }
        case 'charge.refunded': {
            const charge = event.data.object;
            const cid = oid(charge.customer);
            if (!cid)
                return false;
            const customer = await stripe.customers.retrieve(cid);
            if (customer.deleted || !orderId(customer.metadata))
                return false;
            id = orderId(customer.metadata);
            const intent = oid(charge.payment_intent);
            if (intent) {
                const payments = await stripe.invoicePayments.list({ payment: { type: 'payment_intent', payment_intent: intent }, expand: ['data.invoice'] });
                invoiceId = oid(payments.data.find(p => p.status === 'paid')?.invoice);
            }
            break;
        }
        default: return false;
    }
    if (!id)
        return false;
    const db = getAvatarDatabase();
    const order = await loadAvatarOrder(db, id);
    if (!order || order.is_test === event.livemode)
        throw new AvatarBillingError('Neznámá objednávka avatara.', 400);
    if (session && ((order.stripe_session_id && order.stripe_session_id !== session.id) || (session.client_reference_id && session.client_reference_id !== order.id)))
        throw new AvatarBillingError('Nesouhlasí platební relace.', 400);
    const previous = await db.from('avatar_stripe_events').select('id').eq('id', event.id).maybeSingle();
    if (previous.error)
        throw new AvatarBillingError('Událost se nepodařilo načíst.');
    if (previous.data)
        return true;
    if (session && ['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
        const saved = await db.from('avatar_orders').update({ status: 'incomplete_expired', updated_at: new Date().toISOString(), revision: order.revision + 1 }).eq('id', id).eq('status', 'pending').eq('revision', order.revision);
        if (saved.error)
            throw new AvatarBillingError('Ukončení objednávky se nepodařilo uložit.');
    }
    else
        await refreshAvatarOrder(db, stripe, order, { session, subscriptionId, invoiceId });
    const saved = await db.from('avatar_stripe_events').upsert({ id: event.id }, { onConflict: 'id', ignoreDuplicates: true });
    if (saved.error)
        throw new AvatarBillingError('Událost se nepodařilo uložit.');
    return true;
}
export async function createAvatarCheckout(request: Request, principal: AvatarPrincipal, input: AvatarCheckoutInput): Promise<string> {
    const availability = getAvatarAvailability();
    const gateway = getStripeGatewayOrNull();
    if (!availability.billingEnabled || !gateway)
        throw new AvatarBillingError('Placená verze zatím není dostupná.');
    if (input.country === 'SK' && process.env.PAVOL_AVATAR_SK_ENABLED !== 'true')
        throw new AvatarBillingError('Prodej na Slovensko zatím není otevřený.', 422);
    const identity = await resolvePromptbookCheckoutIdentity({ country: input.country, companyId: input.customerType === 'business' ? input.companyId ?? null : null, vatId: input.customerType === 'business' ? input.vatId ?? null : null, billingName: input.billingName, billingAddress: input.billingAddress });
    if (input.customerType === 'business' && !identity.companyId)
        throw new AvatarBillingError('Vyplňte IČO firmy.', 422);
    await ensureAvatarStripeWebhook(gateway.stripe, availability.isTest);
    const db = getAvatarDatabase();
    const fingerprint = createHash('sha256').update(JSON.stringify({ ...input, requestId: undefined })).digest('hex');
    const prepaid = await db.from('avatar_orders').select('id').eq('principal_id', principal.id).eq('is_test', availability.isTest)
        .in('status', ['active', 'past_due', 'canceled']).gt('paid_through', new Date().toISOString()).limit(1).maybeSingle();
    if (prepaid.error) throw new AvatarBillingError('Předplatné se nepodařilo ověřit.');
    if (prepaid.data) throw new AvatarBillingError('Placenou verzi už máte aktivní. Další předplatné není potřeba.', 409);
    const existing = await loadAvatarOrder(db, input.requestId);
    if (existing && (existing.principal_id !== principal.id || existing.request_fingerprint !== fingerprint))
        throw new AvatarBillingError('Objednávka se změnila. Odešlete nový formulář.', 409);
    const current = await db.from('avatar_orders').select('*').eq('principal_id', principal.id).eq('is_test', availability.isTest).in('status', openStatuses).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (current.error)
        throw new AvatarBillingError('Předplatné se nepodařilo ověřit.');
    const open = (existing ?? current.data) as AvatarOrder | null;
    if (open?.stripe_session_id) {
        const session = await gateway.stripe.checkout.sessions.retrieve(open.stripe_session_id);
        if (session.status === 'open' && session.url) {
            if (open.request_fingerprint !== fingerprint)
                throw new AvatarBillingError('Dokončete nebo zrušte již otevřenou objednávku.', 409);
            return session.url;
        }
        if (session.status === 'complete') {
            await refreshAvatarOrder(db, gateway.stripe, open, { session });
            throw new AvatarBillingError('Předplatné už bylo objednáno. Obnovte přehled.', 409);
        }
        if (open.status === 'pending') {
            const expired = await db.from('avatar_orders').update({ status: 'incomplete_expired' }).eq('id', open.id).eq('status', 'pending');
            if (expired.error)
                throw new AvatarBillingError('Předchozí objednávku se nepodařilo uzavřít.');
            if (existing)
                throw new AvatarBillingError('Platební relace vypršela. Odešlete nový formulář.', 409);
        }
    }
    else if (open && open.id !== input.requestId)
        throw new AvatarBillingError('Předchozí objednávka se připravuje. Zkuste to za chvíli.', 409);
    if (open && avatarOrderHasAccess(open))
        throw new AvatarBillingError('Placenou verzi už máte aktivní.', 409);
    if (!existing) {
        const inserted = await db.from('avatar_orders').insert({ id: input.requestId, principal_id: principal.id, email: principal.email, fullname: input.fullname, customer_type: input.customerType, billing_name: identity.name,
            company_id: identity.companyId, vat_id: identity.vatId, billing_address: identity.address, country: input.country, base_amount: AVATAR_PRICE_CZK * 100, currency: 'czk', terms_version: AVATAR_TERMS_VERSION, immediate_start_accepted: true, request_fingerprint: fingerprint, legal_snapshot: avatarLegalContractSnapshot('cs'), usage_limits: availability.limits,
            seller: { name: 'AI Web s.r.o.', companyId: '21012288', identification: getOperatorIdentification('cs'), legalEmail: 'legal@ptbk.io', privacyEmail: 'privacy@ptbk.io' }, status: 'pending', is_test: availability.isTest });
        if (inserted.error)
            throw new AvatarBillingError('Objednávka se již připravuje. Obnovte přehled a zkuste to znovu.', 409);
    }
    const order = await loadAvatarOrder(db, input.requestId);
    if (!order || order.status !== 'pending')
        throw new AvatarBillingError('Objednávku se nepodařilo připravit.', 409);
    const origin = getAvatarOrigin(request);
    const metadata = { [AVATAR_ORDER_METADATA]: order.id, product: 'pavol-avatar' };
    const reverse = identity.taxTreatment === 'reverse_charge';
    const supplierVat = process.env.PAVOL_AVATAR_SUPPLIER_VAT_ID?.trim();
    if (reverse && !supplierVat)
        throw new AvatarBillingError('Fakturace na Slovensko není nakonfigurovaná.');
    const template = process.env[input.country === 'SK' ? 'PAVOL_AVATAR_SK_INVOICE_TEMPLATE_ID' : 'PAVOL_AVATAR_CZ_INVOICE_TEMPLATE_ID']?.trim();
    const customer = await gateway.stripe.customers.create({ name: order.billing_name, email: principal.email, address: order.billing_address, preferred_locales: ['cs'], metadata, tax_exempt: reverse ? 'reverse' : 'none',
        ...(identity.companyId && identity.vatId ? { tax_id_data: [{ type: 'eu_vat' as const, value: identity.vatId }] } : {}),
        invoice_settings: { ...(template ? { rendering_options: { template } } : {}), custom_fields: [{ name: 'IČO dodavatele', value: '21012288' }, ...(identity.companyId ? [{ name: 'IČO odběratele', value: identity.companyId }] : []), { name: 'Podmínky avatara', value: AVATAR_TERMS_VERSION }],
            footer: (reverse ? 'DIČ dodavatele: ' + supplierVat + '. Daň odvede zákazník (reverse charge).' : 'Dodavatel není plátcem DPH.') + '\nPavolův AI avatar. Podmínky: ' + origin + AVATAR_TERMS_PATH } }, { idempotencyKey: 'avatar-customer-' + order.id });
    const session = await gateway.stripe.checkout.sessions.create({ mode: 'subscription', customer: customer.id, locale: 'cs', client_reference_id: order.id, payment_method_types: ['card'], payment_method_collection: 'always', adaptive_pricing: { enabled: false },
        success_url: origin + '/api/pavol-avatar/return?session_id={CHECKOUT_SESSION_ID}', cancel_url: origin + '/avatar?payment=cancelled', expires_at: Math.floor((Date.parse(order.created_at) + 3600000) / 1000),
        line_items: [{ quantity: 1, price_data: { currency: 'czk', unit_amount: order.base_amount, tax_behavior: 'exclusive', recurring: { interval: 'month' }, product_data: { name: 'Pavolův AI avatar · Full', description: 'Měsíční předplatné pro jednoho člověka', metadata: { product: 'pavol-avatar' } } } }],
        metadata, subscription_data: { metadata, description: 'Pavolův AI avatar · Full' } }, { idempotencyKey: 'avatar-checkout-' + order.id });
    const saved = await db.from('avatar_orders').update({ stripe_customer_id: customer.id, stripe_session_id: session.id, updated_at: new Date().toISOString() }).eq('id', order.id).eq('status', 'pending');
    if (saved.error || !session.url)
        throw new AvatarBillingError('Platební relaci se nepodařilo uložit. Zkuste stejnou objednávku znovu.');
    return session.url;
}

/** Create only this product's portal; never update the account-wide or another product's configuration. */
export async function getAvatarPortalConfiguration(
    db: SupabaseClient,
    stripe: Stripe,
    isTest: boolean,
): Promise<string> {
    const override = process.env.PAVOL_AVATAR_PORTAL_CONFIGURATION_ID?.trim();
    if (override) {
        if (!/^bpc_[a-zA-Z0-9]+$/.test(override)) throw new AvatarBillingError('Konfigurace správy předplatného není platná.');
        return override;
    }
    const key = 'stripe_portal_' + (isTest ? 'test' : 'live');
    const existing = await db.from('avatar_settings').select('value').eq('key', key).maybeSingle();
    if (existing.error) throw new AvatarBillingError('Konfiguraci správy předplatného se nepodařilo načíst.');
    if (typeof existing.data?.value === 'string' && /^bpc_[a-zA-Z0-9]+$/.test(existing.data.value)) return existing.data.value;
    const configuration = await stripe.billingPortal.configurations.create({
        business_profile: {
            headline: 'Pavolův AI avatar',
            privacy_policy_url: 'https://pavolhejny.cz/avatar/legal/privacy/2026-11-17-v1',
            terms_of_service_url: 'https://pavolhejny.cz' + AVATAR_TERMS_PATH,
        },
        features: {
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            subscription_cancel: { enabled: true, mode: 'at_period_end' },
            subscription_update: { enabled: false },
            customer_update: { enabled: false },
        },
        metadata: { product: 'pavol-avatar', version: '2026-11-17-v1' },
    }, { idempotencyKey: 'pavol-avatar-portal-v1-' + (isTest ? 'test' : 'live') });
    if (!/^bpc_[a-zA-Z0-9]+$/.test(configuration.id) || configuration.livemode !== !isTest) {
        throw new AvatarBillingError('Stripe vrátil neočekávanou konfiguraci správy předplatného.');
    }
    const saved = await db.from('avatar_settings').upsert({ key, value: configuration.id }, { onConflict: 'key', ignoreDuplicates: true });
    if (saved.error) throw new AvatarBillingError('Konfiguraci správy předplatného se nepodařilo uložit.');
    const selected = await db.from('avatar_settings').select('value').eq('key', key).single();
    if (selected.error || typeof selected.data?.value !== 'string' || !/^bpc_[a-zA-Z0-9]+$/.test(selected.data.value)) {
        throw new AvatarBillingError('Konfiguraci správy předplatného se nepodařilo ověřit.');
    }
    return selected.data.value;
}
