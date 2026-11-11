import { describe, expect, it } from 'vitest';
import { mapStripePaidContactSource, type StripePaidContactInput } from './stripePaidContactSource';

const input: StripePaidContactInput = {
    subscriptionId: 'sub_historical', email: 'jana@acme.invalid', fullname: 'Jana Nováková', kind: 'promptbook',
    plan: 'start', status: 'active', cancelAtPeriodEnd: false, paidThrough: '2026-12-01T00:00:00Z',
    payments: [{ paidAt: '2026-11-01T00:00:00Z', paidThrough: '2026-12-01T00:00:00Z',
        amountPaidMinor: 39900, refundedAmountMinor: 0, currency: 'czk' }],
};

describe('Stripe historical paid sources', () => {
    it('records real payments with an explicit currency and a stable replay key', () => {
        const result = mapStripePaidContactSource(input)!;
        expect(result.externalId).toBe('stripe:subscription:sub_historical');
        expect(result.email).toBe('jana@acme.invalid');
        expect(result.details).toMatchObject({ paidCustomer: true, subscriptionStatus: 'active',
            paymentHistory: [{ amountPaidMinor: 39900, currency: 'czk' }] });
        expect(mapStripePaidContactSource(input)).toEqual(result);
        expect(result.details).not.toHaveProperty('marketingConsent');
    });

    it('retains the existing web source, submission evidence and message', () => {
        const existing = { ...mapStripePaidContactSource(input)!, externalId: 'web:contact:42',
            details: { submissionEvidence: { purpose: 'order', marketingConsent: false }, message: 'Please call' } };
        expect(mapStripePaidContactSource(input, existing)).toMatchObject({ externalId: 'web:contact:42',
            details: { message: 'Please call', submissionEvidence: { marketingConsent: false } } });
    });

    it('retains canceled and refunded historical customers without calling them active', () => {
        const canceled = { ...input, status: 'canceled', payments: [{ ...input.payments[0], refundedAmountMinor: 39900 }] };
        expect(mapStripePaidContactSource(canceled)?.details).toMatchObject({ subscriptionStatus: 'canceled',
            paymentHistory: [{ refundedAmountMinor: 39900 }] });
    });

    it('excludes zero-value invoices and known test identities', () => {
        expect(mapStripePaidContactSource({ ...input, payments: [{ ...input.payments[0], amountPaidMinor: 0 }] })).toBeNull();
        expect(mapStripePaidContactSource({ ...input, email: 'test@example.org' })).toBeNull();
        expect(mapStripePaidContactSource({ ...input, email: 'invalid' })).toBeNull();
    });

    it('keeps a shared mailbox for identity review rather than attaching a Person', () => {
        expect(mapStripePaidContactSource({ ...input, email: 'info@acme.invalid' })).toMatchObject({
            email: null, details: { identityReview: 'shared_email', submittedEmail: 'info@acme.invalid' },
        });
    });
});
