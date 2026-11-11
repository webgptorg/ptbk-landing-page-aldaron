import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { mapTwentyContactSource, type TwentyContactSource } from './twentyContactSource';

export type StripePaidContactInput = {
    subscriptionId: string;
    email: string;
    fullname: string;
    kind: 'promptbook' | 'community';
    plan: string | null;
    status: string;
    cancelAtPeriodEnd: boolean;
    paidThrough: string | null;
    payments: { paidAt: string; paidThrough: string | null; amountPaidMinor: number;
        refundedAmountMinor: number; currency: string }[];
};

/** The existing source key wins, so historical overlap updates provenance without duplicating People. */
export function mapStripePaidContactSource(
    input: StripePaidContactInput,
    existing?: TwentyContactSource,
): TwentyContactSource | null {
    const payments = input.payments.filter((payment) => payment.amountPaidMinor > 0)
        .sort((a, b) => Date.parse(a.paidAt) - Date.parse(b.paidAt));
    if (!payments.length || !isEmailAddressValid(input.email.trim().toLowerCase())) return null;

    const source = existing ?? mapTwentyContactSource({
        external_id: `stripe:subscription:${input.subscriptionId}`, source_version: '1',
        occurred_at: new Date(payments[0].paidAt), kind: input.kind === 'promptbook' ? 'promptbook-order' : 'membership',
        email: input.email, fullname: input.fullname, phone: null, attempts: 0,
        source_name: input.kind === 'promptbook' ? 'Stripe · Promptbook' : 'Stripe · community membership',
        source_url: 'https://www.ptbk.io/cs', details: {},
    });
    if (source === 'test_contact') return null;
    return {
        ...source,
        name: existing?.name ?? (input.kind === 'promptbook'
            ? `Promptbook ${input.plan === 'business' ? 'Business' : input.plan === 'start' ? 'Start' : 'subscription'}`
            : 'Promptbook · community membership'),
        occurredAt: payments[0].paidAt,
        details: {
            ...source.details,
            paidCustomer: true,
            ...(input.plan ? { planId: input.plan } : {}),
            subscriptionStatus: input.status,
            cancelAtPeriodEnd: input.cancelAtPeriodEnd,
            paidThrough: input.paidThrough,
            firstPaidAt: payments[0].paidAt,
            paymentHistory: payments,
        },
    };
}
