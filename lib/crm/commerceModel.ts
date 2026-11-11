import { createHash } from 'node:crypto';

export type CommerceCompany = { key: string; name: string; registrationNumber: string | null; country: string | null };
export type CommercePurchase = {
    key: string; name: string; product: string; status: string; billingInterval: string | null;
    email: string | null; contactName: string; company: CommerceCompany | null; identityReview: string | null;
};
export type CommercePayment = {
    key: string; purchaseKey: string; name: string; paidAt: string; currency: string;
    amountPaidMinor: number; refundedAmountMinor: number; state: string; source: 'Stripe';
};
export type CommerceSnapshot = { purchases: CommercePurchase[]; payments: CommercePayment[] };
export type CommerceTotal = { currency: string; paidMinor: number; refundedMinor: number; paymentCount: number;
    firstPaidAt: string; lastPaidAt: string; lastPaymentMinor: number };

/** Opaque external keys keep provider identifiers out of CRM while preserving replay identity. */
export function commerceKey(kind: string, sourceId: string): string {
    return `stripe:${kind}:${createHash('sha256').update(`${kind}:${sourceId}`).digest('hex')}`;
}

/** Rebuild totals from canonical receipts; imports never increment previously stored totals. */
export function commerceTotals(payments: readonly CommercePayment[]): CommerceTotal[] {
    const unique = new Map<string, CommercePayment>();
    for (const payment of payments) {
        if (!Number.isSafeInteger(payment.amountPaidMinor) || payment.amountPaidMinor <= 0 ||
            !Number.isSafeInteger(payment.refundedAmountMinor) || payment.refundedAmountMinor < 0 ||
            payment.refundedAmountMinor > payment.amountPaidMinor || !/^[a-z]{3}$/i.test(payment.currency) ||
            !Number.isFinite(Date.parse(payment.paidAt))) throw new Error('commerce_invalid_receipt');
        const previous = unique.get(payment.key);
        if (previous && JSON.stringify(previous) !== JSON.stringify(payment)) throw new Error('commerce_conflicting_receipt');
        unique.set(payment.key, payment);
    }
    const totals = new Map<string, CommerceTotal>();
    for (const payment of Array.from(unique.values()).sort((a,b) => a.paidAt.localeCompare(b.paidAt) || a.key.localeCompare(b.key))) {
        const currency = payment.currency.toUpperCase();
        const total = totals.get(currency) ?? { currency, paidMinor: 0, refundedMinor: 0, paymentCount: 0,
            firstPaidAt: payment.paidAt, lastPaidAt: payment.paidAt, lastPaymentMinor: payment.amountPaidMinor };
        total.paidMinor += payment.amountPaidMinor;
        total.refundedMinor += payment.refundedAmountMinor;
        if (!Number.isSafeInteger(total.paidMinor) || !Number.isSafeInteger(total.refundedMinor)) throw new Error('commerce_amount_overflow');
        total.paymentCount++;
        total.lastPaidAt = payment.paidAt;
        total.lastPaymentMinor = payment.amountPaidMinor;
        totals.set(currency, total);
    }
    return Array.from(totals.values()).sort((a,b) => a.currency.localeCompare(b.currency));
}

// Stripe charges these currencies without decimal minor units (ISK charges still use two decimals).
const ZERO_DECIMAL = new Set(['bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','vnd','vuv','xaf','xof','xpf']);
const THREE_DECIMAL = new Set(['bhd','jod','kwd','omr','tnd']);
export function stripeAmountMicros(amountMinor: number, currency: string): string {
    if (!Number.isSafeInteger(amountMinor)) throw new Error('commerce_amount_overflow');
    const factor = ZERO_DECIMAL.has(currency.toLowerCase()) ? 1000000 : THREE_DECIMAL.has(currency.toLowerCase()) ? 1000 : 10000;
    return (BigInt(amountMinor) * BigInt(factor)).toString();
}
export function commerceTotalsText(totals: readonly CommerceTotal[]): string {
    const amount = (value: number, code: string) => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: code, currencyDisplay: 'code' }).format(
        Number(stripeAmountMicros(value, code)) / 1000000);
    return totals.map((total) => `${amount(total.paidMinor,total.currency)} · ${total.paymentCount} ${total.paymentCount === 1 ? 'platba' : total.paymentCount < 5 ? 'platby' : 'plateb'} · vráceno ${amount(total.refundedMinor,total.currency)}`).join('; ');
}
