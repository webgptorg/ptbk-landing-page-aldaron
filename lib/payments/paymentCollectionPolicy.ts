/** Amounts are always integer minor units. A provider's minimum is not a product price restriction. */
export type PaymentGatewayPolicy = {
    readonly provider: string;
    readonly currency: string;
    readonly minimumChargeAmount: number;
    readonly version: number;
};

/** Replace/select the policy when another provider or settlement currency is introduced. */
export const STRIPE_CZK_PAYMENT_POLICY: PaymentGatewayPolicy = {
    provider: 'stripe',
    currency: 'czk',
    minimumChargeAmount: 1500,
    version: 1,
};

export type OneTimePaymentQuote = {
    readonly version: 1;
    readonly currency: string;
    readonly gateway: string;
    readonly gatewayPolicyVersion: number;
    readonly gatewayMinimumAmount: number;
    readonly amountBeforeWaiver: number;
    readonly waivedAmount: number;
    readonly amountDue: number;
    readonly collection: 'internal' | 'gateway';
    readonly reason: 'zero_total' | 'below_gateway_minimum' | null;
};

/** Only one-time purchases use this waiver. Recurring prices keep their own renewal rules. */
export function createOneTimePaymentQuote(amount: number, policy: PaymentGatewayPolicy): OneTimePaymentQuote {
    if (!Number.isSafeInteger(amount) || amount < 0 ||
        !Number.isSafeInteger(policy.minimumChargeAmount) || policy.minimumChargeAmount < 1 ||
        !Number.isSafeInteger(policy.version) || policy.version < 1 || !policy.provider || !policy.currency) {
        throw new Error('Invalid one-time payment amount or gateway policy');
    }
    const isInternal = amount < policy.minimumChargeAmount;
    return {
        version: 1,
        currency: policy.currency,
        gateway: policy.provider,
        gatewayPolicyVersion: policy.version,
        gatewayMinimumAmount: policy.minimumChargeAmount,
        amountBeforeWaiver: amount,
        waivedAmount: isInternal ? amount : 0,
        amountDue: isInternal ? 0 : amount,
        collection: isInternal ? 'internal' : 'gateway',
        reason: amount === 0 ? 'zero_total' : isInternal ? 'below_gateway_minimum' : null,
    };
}

export type InternalOneTimePayment = OneTimePaymentQuote & {
    readonly id: string;
    readonly status: 'paid';
    readonly provider: 'internal';
    readonly method: 'no_charge';
    readonly amountPaid: 0;
    readonly completedAt: string;
};

/** The server calls this only after recalculating the accepted price, never from a browser-supplied status. */
export function createInternalOneTimePayment(quote: OneTimePaymentQuote): InternalOneTimePayment | null {
    if (quote.collection !== 'internal') return null;
    return {
        ...quote,
        id: crypto.randomUUID(),
        status: 'paid',
        provider: 'internal',
        method: 'no_charge',
        amountPaid: 0,
        completedAt: new Date().toISOString(),
    };
}
