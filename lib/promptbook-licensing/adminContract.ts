import { z } from 'zod';
import { licenseCapabilitiesSchema, type LicenseCapabilities } from './contract';

const reason = z.string().trim().min(5).max(1000);
const values = {
    kind: z.enum(['partner', 'custom']),
    label: z.string().trim().min(1).max(120).regex(/^[^<>\u0000-\u001f\u007f]+$/).default('Individuální licence'),
    communitySeats: z.number().int().min(0).max(1000), capabilities: licenseCapabilitiesSchema,
    validFrom: z.string().datetime().optional(), validUntil: z.string().datetime().nullable(), reason,
    isTest: z.boolean().default(false),
};
const identity = { grantId: z.string().uuid(), revision: z.number().int().positive(), reason, isTest: z.boolean().default(false) };
export const licenseAdminMutationSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('grant'), requestId:z.string().uuid().optional(), email: z.string().trim().toLowerCase().email().max(254), ...values }).strict(),
    z.object({ action: z.literal('update'), ...identity, ...values, validFrom: z.string().datetime() }).strict(),
    z.object({ action: z.literal('revoke'), ...identity }).strict(),
    z.object({ action: z.literal('restore'), ...identity }).strict(),
    z.object({ action: z.literal('delete'), ...identity }).strict(),
    z.object({ action: z.literal('referral'), accountId: z.string().uuid(), code: z.string().trim().max(80).regex(/^[A-Za-z0-9_-]*$/), reason }).strict(),
]).refine((value) => !('validUntil' in value) || !value.validUntil || !value.validFrom || Date.parse(value.validUntil) > Date.parse(value.validFrom), {
    message: 'Konec platnosti musí následovat po začátku.',
});

export type AdminLicense = {
    id: string; account_id: string | null; email: string; is_test: boolean; source: 'manual' | 'subscription';
    kind: 'trial' | 'partner' | 'custom' | 'subscription'; label: string; valid_from: string; valid_until: string | null;
    capabilities: LicenseCapabilities; community_seats: number; revoked_at: string | null; deleted_at: string | null;
    revision: number; reason: string; created_at: string; order_id: string | null;
    state: 'active' | 'scheduled' | 'expired' | 'revoked' | 'deleted' | 'unverified';
};
export type AdminSubscription = {
    product: 'promptbook' | 'community' | 'avatar'; id: string; email: string; is_test: boolean;
    created_at: string; status: string; label: string; community_id: string | null;
    stripe_subscription_id: string | null; stripe_customer_id: string | null; stripe_session_id: string | null;
    paid_through: string | null; cancel_at_period_end: boolean; discount_code: string | null; base_amount: number; currency: string;
};
export type AdminPayment = {
    id: string; paidAt: string | null; paidThrough: string | null; amountPaid: number; refundedAmount: number | null;
    currency: string; invoiceUrl: string | null; status: string;
};
export type AdminPage<T> = { items: T[]; total: number; offset: number; limit: number };
export type AdminGrantHistory = { id: number; action: string; actor: string; reason: string; created_at: string };
export type AdminLicenseDetail = {
    license: AdminLicense; history: AdminGrantHistory[]; historyHasMore: boolean;
    subscriptions: AdminSubscription[]; subscriptionsHasMore: boolean;
    account: { id: string; referral_code: string | null } | null;
    referralHistory: { id: number; code: string | null; reason: string; created_at: string }[];
};
export type AdminSubscriptionDetail = {
    subscription: AdminSubscription; licenses: AdminLicense[]; payments: AdminPayment[];
    paymentsHasMore: boolean; paymentsMessage: string | null; paymentOffset: number;
};
export const LICENSE_STATE_LABELS = { active: 'Aktivní', scheduled: 'Naplánovaná', expired: 'Vypršela', revoked: 'Deaktivovaná', deleted: 'Odstraněná', unverified: 'Neověřený nárok' };
export const SUBSCRIPTION_PRODUCT_LABELS = { promptbook: 'Licence Promptbook', community: 'Členství v komunitě', avatar: 'Pavol Hejný AI' };
export function licenseAdminHref(license: Pick<AdminLicense, 'id' | 'source' | 'is_test'>): string {
    return `/admin/promptbook-licensing?${new URLSearchParams({ grant: license.id, source: license.source, mode: license.is_test ? 'test' : 'live' })}`;
}
export function subscriptionAdminHref(subscription: Pick<AdminSubscription, 'id' | 'product' | 'is_test'>): string {
    return `/admin/promptbook-subscriptions?${new URLSearchParams({ record: subscription.id, product: subscription.product, mode: subscription.is_test ? 'test' : 'live' })}`;
}
export function stripeObjectUrl(isTest: boolean, kind: 'subscriptions' | 'customers' | 'invoices', id: string | null): string | null {
    return id && /^[a-z]+_[A-Za-z0-9_]+$/.test(id) ? `https://dashboard.stripe.com/${isTest ? 'test/' : ''}${kind}/${encodeURIComponent(id)}` : null;
}
export function safeInvoiceUrl(value: string | null): string | null {
    if (!value) return null;
    try { const url = new URL(value); return url.protocol === 'https:' && ['invoice.stripe.com', 'pay.stripe.com'].includes(url.hostname) ? url.href : null; }
    catch { return null; }
}
