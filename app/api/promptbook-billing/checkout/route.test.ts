import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { orders, upsert, createCheckout, retrieveSession } = vi.hoisted(() => ({
    orders: new Map<string, Record<string, unknown>>(),
    upsert: vi.fn(),
    createCheckout: vi.fn(),
    retrieveSession: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/promptbook-billing/billingOrders', () => ({
    PROMPTBOOK_ORDERS_TABLE: 'promptbook_orders',
    loadPromptbookOrder: (_database: unknown, id: string) => Promise.resolve(orders.get(id) ?? null),
    getBillingDatabase: () => ({ from: () => ({
        upsert,
        update: (changes: Record<string, unknown>) => ({ eq: (_key: string, id: string) => {
            Object.assign(orders.get(id)!, changes);
            return Promise.resolve({ error: null });
        } }),
    }) }),
}));
vi.mock('@/lib/promptbook-billing/billingCheckout', () => ({
    createPromptbookCheckout: createCheckout,
    PROMPTBOOK_CHECKOUT_MAX_AGE_MS: 20 * 60 * 1000,
}));
vi.mock('@/lib/promptbook-billing/billingAccess', () => ({
    BILLING_ORDER_ID_PATTERN: /^[0-9a-f-]{36}$/i,
    writeOrderAccessCookie: vi.fn(),
}));
vi.mock('@/lib/promptbook-billing/config', () => ({
    getPromptbookBillingAvailability: () => ({ enabled: true, slovakiaEnabled: true, supportedVersion: '0.119.0-75' }),
    getBillingOrigin: () => 'https://www.ptbk.io',
    getBillingSetting: (name: string) => name.endsWith('_SK_INVOICE_TEMPLATE_ID') ? 'invoice_sk' : 'invoice_cz',
    PROMPTBOOK_MEMBER_PATH: '/cs/pricing/predplatne',
    PROMPTBOOK_ONLINE_TERMS_VERSION: '2026-11-11-online-v2',
}));
vi.mock('@/lib/payments/stripeGateway', () => ({
    getStripeGatewayOrNull: () => ({
        configuration: { isTestMode: false },
        stripe: { checkout: { sessions: { retrieve: retrieveSession } } },
    }),
}));
vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    reservePromptbookDiscountCode: vi.fn(),
    settlePromptbookDiscountReservation: vi.fn(),
}));

const id = '5a43fcb0-a8a6-4d6f-89d3-41d32667f503';
const input = {
    requestId: id,
    plan: 'start',
    email: 'eva@example.com',
    country: 'CZ',
    companyId: '',
    billingName: 'Eva Nová',
    billingAddress: { line1: 'Moje 12', city: 'Praha', postal_code: '110 00', country: 'CZ' },
    note: 'Prosím o kontakt e-mailem.',
    immediateStart: true,
    expectedDiscount: null,
    acceptedTerms: true,
    termsVersion: '2026-11-11-online-v2',
};

function request(body: object) {
    return new NextRequest('https://www.ptbk.io/api/promptbook-billing/checkout', {
        method: 'POST', body: JSON.stringify(body),
        headers: { origin: 'https://www.ptbk.io', 'sec-fetch-site': 'same-origin' },
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    orders.clear();
    upsert.mockImplementation(async (order: Record<string, unknown>) => {
        if (!orders.has(order.id as string)) orders.set(order.id as string, {
            status: 'pending', created_at: new Date().toISOString(), stripe_session_id: null, ...order,
        });
        return { error: null };
    });
    createCheckout.mockResolvedValue({
        session: { id: 'cs_consumer', url: 'https://checkout.stripe.com/consumer' }, customerId: 'cus_consumer',
    });
    retrieveSession.mockResolvedValue({ status: 'open', url: 'https://checkout.stripe.com/consumer' });
});

describe('Promptbook order checkout input', () => {
    it('accepts a consumer without an IČO and retains normalized manual billing details and note', async () => {
        const response = await POST(request(input));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ url: 'https://checkout.stripe.com/consumer' });
        expect(orders.get(id)).toMatchObject({
            customer_type: 'consumer', company_id: null, vat_id: null, company_name: 'Eva Nová',
            billing_address: { ...input.billingAddress, postal_code: '11000' },
            tax_treatment: 'domestic', order_note: input.note, immediate_start: true,
            invoice_template_id: 'invoice_cz', supplier_tax_id: null,
        });
    });

    it('does not apply the Slovak business invoice or reverse charge to a Slovak consumer', async () => {
        const response = await POST(request({ ...input, country: 'SK', billingAddress: { ...input.billingAddress, country: 'SK' } }));
        expect(response.status).toBe(200);
        expect(orders.get(id)).toMatchObject({ country: 'SK', tax_treatment: 'domestic', invoice_template_id: 'invoice_cz', supplier_tax_id: null });
    });

    it('requires the consumer’s separate immediate-start request and matching address country', async () => {
        expect((await POST(request({ ...input, immediateStart: false }))).status).toBe(400);
        expect((await POST(request({ ...input, billingAddress: { ...input.billingAddress, country: 'SK' } }))).status).toBe(400);
        expect(createCheckout).not.toHaveBeenCalled();
    });

    it('allows manual Czech business corrections without making IČO lookup a checkout prerequisite', async () => {
        const response = await POST(request({ ...input, companyId: '21012288', immediateStart: false, billingName: 'Moje fakturační pobočka' }));
        expect(response.status).toBe(200);
        expect(orders.get(id)).toMatchObject({
            customer_type: 'business', company_id: '21012288', company_name: 'Moje fakturační pobočka',
            billing_address: { ...input.billingAddress, postal_code: '11000' },
        });
    });

    it.each([
        { note: 'Změněná poznámka' },
        { billingName: 'Jiný odběratel' },
        { billingAddress: { ...input.billingAddress, line1: 'Jiná 99' } },
    ])('rejects reuse of a checkout attempt after billing details change (%o)', async (changes) => {
        expect((await POST(request(input))).status).toBe(200);
        expect((await POST(request({ ...input, ...changes }))).status).toBe(409);
        expect(createCheckout).toHaveBeenCalledTimes(1);
        expect(retrieveSession).not.toHaveBeenCalled();
    });

    it('reuses the same Stripe session for a retry with unchanged input', async () => {
        expect((await POST(request(input))).status).toBe(200);
        expect((await POST(request(input))).status).toBe(200);
        expect(createCheckout).toHaveBeenCalledTimes(1);
        expect(retrieveSession).toHaveBeenCalledWith('cs_consumer');
    });
});
