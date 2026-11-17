import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/legal/productLegalAvatar', () => ({ avatarLegalContractSnapshot: () => ({ terms: 'Frozen avatar terms' }) }));
const mocks = vi.hoisted(() => ({ database: vi.fn(), availability: vi.fn() }));
vi.mock('./database', () => ({ getAvatarDatabase: mocks.database }));
vi.mock('./config', () => ({ AVATAR_PRICE_CZK: 1000, AVATAR_TERMS_VERSION: '2026-11-17-v1', AVATAR_TERMS_PATH: '/avatar/legal/terms/2026-11-17-v1', getAvatarAvailability: mocks.availability, getAvatarOrigin: () => 'https://pavolhejny.cz' }));
import { applyAvatarStripeEvent, avatarCheckoutSchema, avatarOrderHasAccess, refreshAvatarOrder, type AvatarOrder } from './billing';
const id = '7c97aabc-a109-4d83-b0fa-a14f13208fe1';
const end = Math.floor(Date.now() / 1000) + 86400;
const order = (): AvatarOrder => ({
    id, principal_id: 'e633f2df-8aa5-4d37-afd8-ff3f823e66e8', email: 'owner@example.com', fullname: 'Owner', customer_type: 'individual', billing_name: 'Owner', company_id: null, vat_id: null,
    billing_address: { line1: 'Street 1', city: 'Prague', postal_code: '10000', country: 'CZ' }, country: 'CZ', base_amount: 100000, currency: 'czk', terms_version: '2026-11-17-v1', seller: { name: 'AI Web s.r.o.' },
    status: 'active', is_test: true, stripe_customer_id: 'cus_avatar', stripe_session_id: 'cs_test_avatar', stripe_subscription_id: 'sub_avatar', paid_through: new Date(end * 1000).toISOString(),
    cancel_at_period_end: false, invoice_url: null, revision: 0, request_fingerprint: 'hash', created_at: new Date().toISOString(),
});
type Row = Record<string, unknown>;
function database(initialOrder = order()) {
    const tables: Record<string, Row[]> = { avatar_orders: [initialOrder as unknown as Row], avatar_invoices: [], avatar_stripe_events: [] };
    const writes: string[] = [];
    function from(table: string) {
        const filters: ((row: Row) => boolean)[] = [];
        let operation = 'select';
        let payload: Row = {};
        let conflict = 'id';
        let sorting: string | undefined;
        const execute = () => {
            const rows = tables[table] ?? [];
            if (operation === 'upsert') {
                const previous = rows.find(r => r[conflict] === payload[conflict]);
                if (previous)
                    Object.assign(previous, payload);
                else
                    rows.push({ ...payload });
                tables[table] = rows;
                writes.push(table);
                return { data: [payload], error: null };
            }
            let selected = rows.filter(row => filters.every(f => f(row)));
            if (operation === 'update') {
                selected.forEach(row => Object.assign(row, payload));
                writes.push(table);
            }
            if (sorting)
                selected = selected.sort((a, b) => String(b[sorting!]).localeCompare(String(a[sorting!])));
            return { data: selected, error: null };
        };
        const q = {
            select: () => q, eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return q; },
            order: (key: string) => { sorting = key; return q; }, limit: () => q,
            update: (value: Row) => { operation = 'update'; payload = value; return q; },
            upsert: (value: Row, options?: {
                onConflict?: string;
            }) => { operation = 'upsert'; payload = value; conflict = options?.onConflict ?? 'id'; return q; },
            maybeSingle: () => Promise.resolve((() => { const r = execute(); return { ...r, data: r.data[0] ?? null }; })()),
            then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(execute()).then(resolve, reject),
        };
        return q;
    }
    return { db: { from } as unknown as SupabaseClient, tables, writes };
}
function stripe(refunded = 0) {
    const invoice = { id: 'in_avatar', status: 'paid', currency: 'czk', livemode: false, created: 1, status_transitions: { paid_at: 1 }, period_end: end,
        amount_paid: 100000, hosted_invoice_url: 'https://invoice.stripe.com/avatar', parent: { subscription_details: { metadata: { avatarOrderId: id }, subscription: 'sub_avatar' } }, lines: { data: [{ period: { start: end - 2592000, end } }] } };
    const subscription = { id: 'sub_avatar', livemode: false, metadata: { avatarOrderId: id }, customer: 'cus_avatar', status: 'active', cancel_at_period_end: true, latest_invoice: invoice };
    const payments = { data: [], async *[Symbol.asyncIterator]() { yield { amount_paid: 100000, payment: { payment_intent: { latest_charge: { amount_refunded: refunded } } } }; } };
    const client = { subscriptions: { retrieve: vi.fn(async () => subscription) }, invoicePayments: { list: vi.fn(() => payments) }, invoices: { retrieve: vi.fn(async () => invoice) }, customers: { retrieve: vi.fn() }, charges: { retrieve: vi.fn() }, paymentIntents: { retrieve: vi.fn() } };
    return { client: client as unknown as Stripe, subscription, invoice, mocks: client };
}
const event = (type: string, object: unknown, eventId = 'evt_avatar') => ({ id: eventId, type, livemode: false, data: { object } } as unknown as Stripe.Event);
beforeEach(() => vi.clearAllMocks());
describe('avatar billing boundaries', () => {
    it('requires the avatar terms and explicit immediate-start choice', () => {
        const input = { requestId: id, fullname: 'Owner', country: 'CZ', customerType: 'individual', billingName: 'Owner', billingAddress: { line1: 'Street 1', city: 'Prague', postal_code: '10000', country: 'CZ' }, termsVersion: '2026-11-17-v1', termsAccepted: true, immediateStartAccepted: true };
        expect(avatarCheckoutSchema.safeParse(input).success).toBe(true);
        expect(avatarCheckoutSchema.safeParse({ ...input, termsVersion: '2026-11-13-online-v3' }).success).toBe(false);
        expect(avatarCheckoutSchema.safeParse({ ...input, immediateStartAccepted: false }).success).toBe(false);
    });
    it('honours a prepaid period after cancellation while refusing unpaid or expired grants', () => {
        const paid = order();
        expect(avatarOrderHasAccess({ ...paid, status: 'canceled' })).toBe(true);
        expect(avatarOrderHasAccess({ ...paid, status: 'unpaid' })).toBe(false);
        expect(avatarOrderHasAccess({ ...paid, status: 'pending' })).toBe(false);
        expect(avatarOrderHasAccess({ ...paid, paid_through: new Date(0).toISOString() })).toBe(false);
    });
    it('ignores community checkout and invoice events without reading avatar storage', async () => {
        const s = stripe();
        expect(await applyAvatarStripeEvent(s.client, event('checkout.session.completed', { metadata: { communityMemberEmail: 'owner@example.com' } }))).toBe(false);
        expect(await applyAvatarStripeEvent(s.client, event('invoice.paid', { id: 'in_community', parent: { subscription_details: { metadata: { communityId: 'vyvojari' } } } }))).toBe(false);
        expect(mocks.database).not.toHaveBeenCalled();
        expect(s.mocks.invoices.retrieve).not.toHaveBeenCalled();
    });
    it('does not create a grant from an unrelated active Stripe subscription', async () => {
        const d = database();
        const s = stripe();
        s.subscription.metadata.avatarOrderId = 'f6113368-4d7a-4833-b123-c7b9dc7f1400';
        await expect(refreshAvatarOrder(d.db, s.client, order())).rejects.toThrow('vazba');
        expect(d.writes).toEqual([]);
    });
    it('binds the checkout reference to its exact recorded order', async () => {
        const d = database();
        const s = stripe();
        await expect(refreshAvatarOrder(d.db, s.client, order(), { session: { id: 'cs_test_avatar', subscription: 'sub_avatar', client_reference_id: 'someone-else' } as Stripe.Checkout.Session })).rejects.toThrow('relace');
        expect(d.writes).toEqual([]);
    });
    it('records successful payment in isolated tables and keeps cancellation through paid period', async () => {
        const d = database();
        const s = stripe();
        mocks.database.mockReturnValue(d.db);
        expect(await applyAvatarStripeEvent(s.client, event('customer.subscription.updated', s.subscription))).toBe(true);
        expect(d.tables.avatar_orders[0].paid_through).toBe(new Date(end * 1000).toISOString());
        expect(d.tables.avatar_orders[0].cancel_at_period_end).toBe(true);
        expect(d.tables.avatar_invoices).toHaveLength(1);
        expect(d.tables.avatar_stripe_events).toHaveLength(1);
        expect(new Set(d.writes)).toEqual(new Set(['avatar_invoices', 'avatar_orders', 'avatar_stripe_events']));
    });
    it('revokes a fully refunded paid period from the current Stripe payment state', async () => {
        const d = database();
        const s = stripe(100000);
        mocks.database.mockReturnValue(d.db);
        await applyAvatarStripeEvent(s.client, event('customer.subscription.updated', s.subscription));
        expect(d.tables.avatar_orders[0].paid_through).toBeNull();
        expect(d.tables.avatar_invoices[0].refunded_amount).toBe(100000);
    });
    it('replays an already persisted event without generating another provider request', async () => {
        const d = database();
        const s = stripe();
        mocks.database.mockReturnValue(d.db);
        d.tables.avatar_stripe_events.push({ id: 'evt_avatar' });
        await applyAvatarStripeEvent(s.client, event('customer.subscription.updated', s.subscription));
        expect(s.mocks.subscriptions.retrieve).not.toHaveBeenCalled();
        expect(d.writes).toEqual([]);
    });
    it('does not let a late checkout expiry overwrite an active subscription', async () => {
        const d = database();
        const s = stripe();
        mocks.database.mockReturnValue(d.db);
        await applyAvatarStripeEvent(s.client, event('checkout.session.expired', { id: 'cs_test_avatar', metadata: { avatarOrderId: id } }));
        expect(d.tables.avatar_orders[0].status).toBe('active');
        expect(d.tables.avatar_orders[0].paid_through).toBe(new Date(end * 1000).toISOString());
    });
});
