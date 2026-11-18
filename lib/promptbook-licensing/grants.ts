import type { PromptbookOrder } from '@/lib/promptbook-billing/billingOrders';
import { capabilitiesForPlan, isGrantCurrent, licenseGrantSchema, type LicenseGrant } from './contract';

/** Private source metadata is stripped before a grant enters the numeric v1 snapshot. */
export type AccountGrant = LicenseGrant & {
    communitySeats: number;
    kind: 'trial' | 'partner' | 'custom' | 'subscription';
    campaign?: string | null;
    label: string;
    revoked?: boolean;
};
export type PaidLicenseInvoice = {
    order_id: string;
    paid_at: string;
    paid_through: string | null;
    amount_paid: number;
    refunded_amount: number;
};

export function grantDates(validFrom: string, validUntil: string | null) {
    const from = new Date(validFrom).toISOString();
    const until = validUntil === null ? null : new Date(validUntil).toISOString();
    if (until !== null && Date.parse(until) <= Date.parse(from)) throw new Error('Invalid grant period');
    return { validFrom: from, validUntil: until };
}

/** A community-only partner grant has zero engine-project capacity, even with community seats. */
export function isSoftwareGrant(grant: AccountGrant): boolean {
    return grant.capabilities.engineProjects === null || grant.capabilities.engineProjects > 0;
}
export function isAccountGrantCurrent(grant: AccountGrant, now: number): boolean {
    return !grant.revoked && isGrantCurrent(grant, now);
}
export function numericGrant({ id, validFrom, validUntil, capabilities }: AccountGrant): LicenseGrant {
    return licenseGrantSchema.parse({ id, validFrom, validUntil, capabilities });
}

/** Use verified local billing evidence; no Stripe request and no new webhook/payment lifecycle. */
export function subscriptionGrant(order: PromptbookOrder, invoices: PaidLicenseInvoice[]): AccountGrant | null {
    if (!order.confirmed_at || !order.stripe_subscription_id || !order.paid_through) {
        // A partially migrated confirmed order must not quietly become "no license".
        if (order.confirmed_at || order.first_paid_at || order.paid_through) throw new Error('Incomplete license evidence');
        return null;
    }
    if (order.plan !== 'start' && order.plan !== 'business') throw new Error('Unknown purchased plan');
    let validUntil = order.paid_through;
    let revoked = false;
    if (invoices.length) {
        for (const invoice of invoices) {
            if (!Number.isSafeInteger(invoice.amount_paid) || invoice.amount_paid < 0 ||
                !Number.isSafeInteger(invoice.refunded_amount) || invoice.refunded_amount < 0 ||
                !Number.isFinite(Date.parse(invoice.paid_at)) ||
                (invoice.paid_through !== null && !Number.isFinite(Date.parse(invoice.paid_through)))) {
                throw new Error('Invalid invoice evidence');
            }
        }
        if (!invoices.some((invoice) => invoice.paid_through !== null &&
            Date.parse(invoice.paid_through) === Date.parse(order.paid_through!))) {
            throw new Error('Incomplete invoice period');
        }
        // Zero paid invoices are legitimate confirmed free periods. Full positive refunds revoke that period.
        const retained = invoices.filter((invoice) => invoice.paid_through &&
            (invoice.amount_paid === 0 || invoice.refunded_amount < invoice.amount_paid));
        revoked = retained.length === 0;
        if (!revoked) {
            validUntil = new Date(Math.min(Date.parse(order.paid_through),
                Math.max(...retained.map((invoice) => Date.parse(invoice.paid_through!))))).toISOString();
        }
    }
    return {
        id: order.id,
        ...grantDates(order.confirmed_at, validUntil),
        capabilities: capabilitiesForPlan(order.plan),
        communitySeats: order.plan === 'business' ? 10 : 1,
        kind: 'subscription',
        label: order.plan === 'business' ? 'Business' : 'Start',
        revoked,
    };
}
