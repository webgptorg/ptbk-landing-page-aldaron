import 'server-only';
import { z } from 'zod';
import { licenseDatabase } from './accounts';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import type { AdminLicense, AdminLicenseDetail, AdminSubscription, AdminSubscriptionDetail, AdminPayment } from './adminContract';

const offsetSchema = z.coerce.number().int().min(0).max(1_000_000);
export function readAdminPageQuery(params: URLSearchParams) {
    return { offset: offsetSchema.parse(params.get('offset') ?? 0),
        isTest: z.enum(['live', 'test']).parse(params.get('mode') ?? 'live') === 'test',
        query: z.string().trim().max(254).parse(params.get('q') ?? params.get('email') ?? ''), limit: 50 };
}
/** Treat SQL LIKE metacharacters as literal search text. */
export function adminEmailPattern(value: string) { return `%${value.replace(/[\\%_]/g, '\\$&')}%`; }

export async function loadLicenseDetail(id: string, source: string, isTest: boolean): Promise<AdminLicenseDetail | null> {
    const db = licenseDatabase();
    const found = await db.from('promptbook_admin_licenses').select('*').eq('id', id).eq('source', source).eq('is_test', isTest).maybeSingle<AdminLicense>();
    if (found.error) throw new Error('License unavailable');
    if (!found.data) return null;
    const license = found.data;
    const [history, subscriptions, account, referral] = await Promise.all([
        db.from('promptbook_license_grant_history').select('id,action,actor,reason,created_at').eq('grant_id', id).order('id', { ascending: false }).limit(101),
        db.from('promptbook_admin_subscriptions').select('*').eq('email', license.email).eq('is_test', isTest).order('created_at', { ascending: false }).limit(101),
        db.from('promptbook_license_accounts').select('id,referral_code').eq('id', license.account_id ?? '00000000-0000-0000-0000-000000000000').maybeSingle(),
        db.from('promptbook_referral_history').select('id,code,reason,created_at').eq('account_id', license.account_id ?? '00000000-0000-0000-0000-000000000000').order('id', { ascending: false }).limit(100),
    ]);
    if (history.error || subscriptions.error || account.error || referral.error) throw new Error('License relations unavailable');
    return { license, history: history.data.slice(0,100), historyHasMore: history.data.length > 100,
        subscriptions: subscriptions.data.slice(0,100), subscriptionsHasMore: subscriptions.data.length > 100,
        account: account.data, referralHistory: referral.data };
}

export async function loadSubscriptionDetail(id: string, product: string, isTest: boolean, paymentOffset: number): Promise<AdminSubscriptionDetail | null> {
    const db = licenseDatabase();
    const found = await db.from('promptbook_admin_subscriptions').select('*').eq('id', id).eq('product', product).eq('is_test', isTest).maybeSingle<AdminSubscription>();
    if (found.error) throw new Error('Subscription unavailable');
    if (!found.data) return null;
    const subscription = found.data;
    const result: AdminSubscriptionDetail = { subscription, licenses: [], payments: [], paymentsHasMore: false, paymentsMessage: null, paymentOffset };
    if (product === 'community') {
        // Community has no durable invoice ledger. Read its provider only on an explicit admin detail request.
        if (!subscription.stripe_subscription_id) { result.paymentsMessage = 'K tomuto záznamu není připojené předplatné Stripe. Platbu nelze odvozovat z ceníku.'; return result; }
        const gateway = getStripeGatewayOrNull();
        if (!gateway || gateway.configuration.isTestMode !== isTest) {
            result.paymentsMessage = 'Historii plateb otevřete přes odkaz na předplatné ve Stripe; pro toto prostředí není dostupný serverový přístup.';
            return result;
        }
        try {
            const invoices = await gateway.stripe.invoices.list({ subscription: subscription.stripe_subscription_id, limit: 100 }, { timeout: 10000 });
            result.payments = invoices.data.map((invoice) => ({ id: invoice.id, paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at*1000).toISOString() : null,
                paidThrough: null, amountPaid: invoice.amount_paid, refundedAmount: null, currency: invoice.currency,
                invoiceUrl: invoice.hosted_invoice_url ?? null, status: invoice.status ?? 'unknown' }));
            result.paymentsHasMore = invoices.has_more;
            if (invoices.has_more) result.paymentsMessage = 'Zobrazeno posledních 100 faktur; celou historii otevřete ve Stripe.';
        } catch { result.paymentsMessage = 'Historii plateb se nepodařilo ověřit. Otevřete předplatné ve Stripe.'; }
        return result;
    }
    const [invoices, licenses] = await Promise.all([
        db.from(product === 'promptbook' ? 'promptbook_invoices' : 'avatar_invoices').select('*').eq('order_id', id)
            .order('paid_at', { ascending: false }).order('stripe_invoice_id').range(paymentOffset, paymentOffset+50),
        db.from('promptbook_admin_licenses').select('*').eq('order_id', id).eq('is_test', isTest),
    ]);
    if (invoices.error || licenses.error) throw new Error('Payments unavailable');
    result.licenses = licenses.data as AdminLicense[];
    result.payments = invoices.data.slice(0,50).map((invoice): AdminPayment => ({ id: invoice.stripe_invoice_id, paidAt: invoice.paid_at,
        paidThrough: invoice.paid_through, amountPaid: invoice.amount_paid, refundedAmount: invoice.refunded_amount,
        currency: invoice.currency, invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_url ?? null, status: 'paid' }));
    result.paymentsHasMore = invoices.data.length > 50;
    return result;
}
