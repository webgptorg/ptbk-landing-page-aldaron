import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createInMemorySupabaseClient } from '@/lib/e2e/inMemorySupabase';
import { capabilitiesForPlan, licenseSnapshotSchema } from '@/lib/promptbook-licensing/contract';
import { licenseLookupResponseSchema } from '@/lib/promptbook-licensing/lookupContract';

const fakes = vi.hoisted(() => ({ database: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/promptbook-billing/billingOrders', () => ({
    getBillingDatabase: fakes.database, PROMPTBOOK_ORDERS_TABLE: 'promptbook_orders',
}));
vi.mock('@/lib/messages/publicChatRateLimit', () => ({ allowPublicChatRequest: fakes.limit }));
import { GET, POST } from './route';

const URL = 'https://www.ptbk.io/api/promptbook-billing/app/licenses';
const SECRET = 'synthetic-server-credential-32-characters';
const NOW = '2026-11-18T20:00:00.000Z';
const SUBJECT = '4408b4d6-6005-4b77-97eb-fdd67847ee92';
const ID = '4408b4d6-6005-4b77-97eb-fdd67847ee93';
const SECOND = '4408b4d6-6005-4b77-97eb-fdd67847ee94';
const FROM = '2026-11-01T00:00:00.000Z';
const UNTIL = '2026-12-01T00:00:00.000Z';
const account = { id: SUBJECT, email: 'customer@example.test', is_test: false, referral_code: null };
const order = { id: ID, email: account.email, is_test: false, plan: 'business', confirmed_at: FROM,
    first_paid_at: FROM, paid_through: UNTIL, stripe_subscription_id: 'sub_synthetic', status: 'active' };
const invoice = { stripe_invoice_id: 'in_synthetic', order_id: ID, paid_at: FROM,
    paid_through: UNTIL, amount_paid: 199900, refunded_amount: 0 };
const manual = { id: ID, account_id: SUBJECT, kind: 'custom', valid_from: FROM, valid_until: UNTIL,
    capabilities: capabilitiesForPlan('business'), community_seats: 0, campaign: null };

type Rows = Record<string, unknown>;
/** Reuse the repository's isolated query store, and fail any attempted mutation during a read. */
function storage(options: { accounts?: Rows[]; orders?: Rows[]; grants?: Rows[]; invoices?: Rows[] } = {}) {
    const database = createInMemorySupabaseClient({
        promptbook_license_accounts: options.accounts ?? [account],
        promptbook_orders: options.orders ?? [],
        promptbook_license_grants: options.grants ?? [],
        promptbook_invoices: options.invoices ?? [],
    });
    const rejectWrite = () => { throw new Error('Read API attempted a mutation'); };
    const from = vi.fn((table: string) => {
        const target = database.from(table);
        const query: typeof target = new Proxy(target, {
            get(value, key) {
                if (['insert', 'upsert', 'update', 'delete'].includes(String(key))) return rejectWrite;
                const property = Reflect.get(value, key);
                return typeof property === 'function' ? (...args: unknown[]) => {
                    const result = property.apply(value, args);
                    return result === target ? query : result;
                } : property;
            },
        });
        return query;
    });
    fakes.database.mockReturnValue({ ...database, from, rpc: rejectWrite } as unknown as SupabaseClient);
    return from;
}
function request(body: unknown = { email: account.email }, headers: Record<string, string> = {}) {
    return new NextRequest(URL, { method: 'POST', headers: {
        authorization: `Bearer ${SECRET}`, 'content-type': 'application/json', ...headers,
    }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
async function lookup(body?: unknown) {
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    return licenseLookupResponseSchema.parse(await response.json());
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(NOW));
    vi.stubEnv('PROMPTBOOK_APP_LICENSE_SECRET', SECRET);
    fakes.limit.mockReturnValue(true);
    storage();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('read-only production email lookup through the real resolver', () => {
    it('normalizes trim/case, preserves purchased capacities, unlimited values and one clock', async () => {
        storage({ orders: [order], invoices: [invoice] });
        const result = await lookup({ email: '  CUSTOMER@EXAMPLE.TEST  ' });
        expect(result.status).toBe('active');
        expect(result.display.label).toBe('Business');
        expect(result.snapshot?.subject).toBe(SUBJECT);
        expect(result.snapshot?.grants[0]?.capabilities).toEqual(capabilitiesForPlan('business'));
        expect(result.snapshot?.generatedAt).toBe(result.generatedAt);
        expect(result.generatedAt).toBe(NOW);
        expect(result.snapshot?.refreshAfterSeconds).toBe(result.refreshAfterSeconds);
    });
    it('never merges plus aliases or dots into a different identity', async () => {
        storage({ orders: [order] });
        expect((await lookup({ email: 'customer+other@example.test' })).snapshot).toBeNull();
        expect((await lookup({ email: 'cus.tomer@example.test' })).status).toBe('none');
    });
    it('recognizes a manual software grant without any Stripe subscription or order', async () => {
        storage({ grants: [manual] });
        expect((await lookup()).status).toBe('active');
        expect((await lookup()).display.label).toBe('Licence na míru');
    });
    it.each(['pending', 'active', 'canceled'])('does not grant access from status %s or an unconfirmed checkout', async (status) => {
        storage({ orders: [{ ...order, status, confirmed_at: null, first_paid_at: null, paid_through: null }] });
        expect((await lookup()).status).toBe('none');
    });
    it.each([
        [FROM, UNTIL, 'trial'],
        ['2026-12-01T00:00:00Z', '2026-12-15T00:00:00Z', 'scheduled'],
        ['2026-10-01T00:00:00Z', '2026-10-15T00:00:00Z', 'expired'],
    ])('distinguishes trial periods %s / %s as %s without activating or restarting one', async (from, until, status) => {
        storage({ grants: [{ ...manual, kind: 'trial', campaign: 'business-launch-2026', valid_from: from, valid_until: until }] });
        const result = await lookup();
        expect(result.status).toBe(status);
        expect(result.snapshot?.grants).toHaveLength(status === 'trial' ? 1 : 0);
        if (status === 'trial') expect(result.snapshot?.grants[0]?.validUntil).toBe(UNTIL);
    });
    it('keeps an unstarted trial as none without creating anything', async () => {
        const from = storage();
        expect((await lookup()).status).toBe('none');
        expect(from).toHaveBeenCalledWith('promptbook_license_grants');
    });
    it('keeps canceled renewal paid through the exact exclusive end', async () => {
        storage({ orders: [{ ...order, status: 'canceled', cancel_at_period_end: true }], invoices: [invoice] });
        vi.setSystemTime(new Date(Date.parse(UNTIL) - 1));
        expect((await lookup()).status).toBe('active');
        vi.setSystemTime(new Date(UNTIL));
        const result = await lookup();
        expect(result.status).toBe('expired');
        expect(result.snapshot?.grants).toEqual([]);
    });
    it('keeps different grants separate and gives a current nontrial grant precedence', async () => {
        storage({ orders: [{ ...order, plan: 'start' }], grants: [{ ...manual, id: SECOND, kind: 'trial' }] });
        const result = await lookup();
        expect(result.status).toBe('active');
        expect(result.display.label).toBe('2 aktivní licence');
        expect(result.snapshot?.grants.map((grant) => grant.capabilities.specialists)).toEqual([10, 3]);
        expect(result.snapshot?.grants.map((grant) => grant.capabilities.harnessInstances)).toEqual([null, 1]);
    });
    it('does not infer Business from a custom grant with the same numeric capacities', async () => {
        storage({ grants: [manual] });
        expect((await lookup()).display.label).toBe('Licence na míru');
    });
    it('does not treat a partner community seat as a software license', async () => {
        storage({ grants: [{ ...manual, kind: 'partner', community_seats: 10,
            capabilities: { ...manual.capabilities, engineProjects: 0 } }] });
        const result = await lookup();
        expect(result.status).toBe('none');
        expect(result.snapshot?.grants).toEqual([]);
    });
    it('prioritizes future grants over historical expiry without claiming current activity', async () => {
        storage({ grants: [{ ...manual, valid_until: NOW }, { ...manual, id: SECOND, valid_from: UNTIL, valid_until: null }] });
        expect((await lookup()).status).toBe('scheduled');
    });
    it('returns none and null snapshot for a genuinely unknown account', async () => {
        storage({ accounts: [] });
        const result = await lookup();
        expect(result.status).toBe('none');
        expect(result.snapshot).toBeNull();
    });
    it('reports a missing legacy account as a reconciliation outage, never as absence', async () => {
        storage({ accounts: [], orders: [order] });
        const response = await POST(request());
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Temporarily unavailable', code: 'license_account_backfill_required' });
        // The offline backfill adds the real account only, leaving the old verified order unchanged.
        storage({ accounts: [account], orders: [order] });
        expect((await lookup()).status).toBe('active');
    });
    it('does not silently lose an incomplete historical entitlement', async () => {
        storage({ orders: [{ ...order, stripe_subscription_id: null }] });
        expect((await POST(request())).status).toBe(503);
    });
    it('isolates production accounts, orders and custom grants from test mode', async () => {
        storage({ accounts: [account, { ...account, id: SECOND, is_test: true }],
            orders: [{ ...order, is_test: true }], grants: [{ ...manual, account_id: SECOND }] });
        expect((await lookup()).status).toBe('none');
        storage({ accounts: [{ ...account, is_test: true }], orders: [{ ...order, is_test: true }] });
        expect((await lookup()).snapshot).toBeNull();
    });
    it.each([[0, 'active'], [100, 'active'], [199900, 'expired']])(
        'respects a verified refund of %s minor units as %s', async (refunded, status) => {
            storage({ orders: [order], invoices: [{ ...invoice, refunded_amount: refunded }] });
            expect((await lookup()).status).toBe(status);
        },
    );
    it('recognizes a confirmed zero-price subscription invoice', async () => {
        storage({ orders: [order], invoices: [{ ...invoice, amount_paid: 0 }] });
        expect((await lookup()).status).toBe('active');
    });
    it('a refunded renewal cannot extend the previous retained paid period', async () => {
        const nextEnd = '2027-01-01T00:00:00Z';
        storage({ orders: [{ ...order, paid_through: nextEnd }], invoices: [invoice,
            { ...invoice, stripe_invoice_id: 'in_refunded', paid_through: nextEnd, refunded_amount: invoice.amount_paid }] });
        expect((await lookup()).snapshot?.grants[0]?.validUntil).toBe(UNTIL);
        vi.setSystemTime(new Date(UNTIL));
        expect((await lookup()).status).toBe('expired');
    });
    it('fails visibly on inconsistent invoice evidence and malformed stored grants', async () => {
        storage({ orders: [order], invoices: [{ ...invoice, paid_through: NOW }] });
        expect((await POST(request())).status).toBe(503);
        storage({ grants: [{ ...manual, valid_until: 'invalid' }] });
        expect((await POST(request())).status).toBe(503);
    });
    it('reads beyond a PostgREST page without losing later current grants', async () => {
        const past = Array.from({ length: 500 }, (_, index) => ({ ...manual,
            id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, valid_until: NOW }));
        storage({ grants: [...past, manual] });
        expect((await lookup()).status).toBe('active');
        expect((await lookup()).snapshot?.grants).toHaveLength(1);
    });
    it('turns a database failure into 503 without disclosing details', async () => {
        fakes.database.mockImplementation(() => { throw new Error('private database connection details'); });
        const response = await POST(request());
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ error: 'Temporarily unavailable' });
    });
    it.each(['promptbook_license_accounts', 'promptbook_license_grants', 'promptbook_orders', 'promptbook_invoices'])(
        'does not disguise a returned %s query error as none', async (table) => {
            const from = storage({ orders: [order], invoices: [invoice] });
            fakes.database.mockReturnValue({ from: (requested: string) => requested === table
                ? { select: () => { throw new Error('private query failure'); } } : from(requested) });
            expect((await POST(request())).status).toBe(503);
        },
    );
});

describe('authentication, input and old GET compatibility', () => {
    it('rejects an entirely missing bearer header', async () => {
        expect((await POST(new NextRequest(URL, { method: 'POST', body: '{}' }))).status).toBe(401);
        expect(fakes.database).not.toHaveBeenCalled();
    });
    it.each(['', 'Bearer wrong', `Bearer ${'x'.repeat(32)}`, 'Basic synthetic'])('rejects %s before body parsing or lookup', async (authorization) => {
        const input = request('bad JSON', { authorization });
        expect((await POST(input)).status).toBe(401);
        expect(input.bodyUsed).toBe(false);
        expect(fakes.database).not.toHaveBeenCalled();
        expect(fakes.limit).not.toHaveBeenCalled();
    });
    it.each(['', 'short'])('fails closed for missing/short server configuration: %s', async (configured) => {
        vi.stubEnv('PROMPTBOOK_APP_LICENSE_SECRET', configured);
        expect((await POST(request())).status).toBe(401);
        expect(fakes.database).not.toHaveBeenCalled();
    });
    it.each(['not JSON', 'null', '[]', '{}', { email: 'invalid' }, { email: account.email, is_test: true },
        { email: `${'a'.repeat(250)}@example.test` }])('rejects an invalid authenticated payload %j', async (body) => {
        expect((await POST(request(body))).status).toBe(400);
        expect(fakes.database).not.toHaveBeenCalled();
    });
    it('bounds actual body bytes even when Content-Length lies or whitespace follows valid JSON', async () => {
        const input = `${JSON.stringify({ email: account.email })}${' '.repeat(2048)}`;
        expect((await POST(request(input, { 'content-length': '1' }))).status).toBe(400);
        expect(fakes.database).not.toHaveBeenCalled();
    });
    it('requires JSON and preserves private errors and rate-limit retry guidance', async () => {
        expect((await POST(request(undefined, { 'content-type': 'text/plain' }))).status).toBe(400);
        fakes.limit.mockReturnValue(false);
        const response = await POST(request());
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('300');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(fakes.database).not.toHaveBeenCalled();
    });
    const get = (subject: string, auth = `Bearer ${SECRET}`) => GET(new NextRequest(
        `${URL}?subject=${subject}`, { headers: { authorization: auth } },
    ));
    it('preserves a strict numeric GET response and status codes', async () => {
        storage({ orders: [order], invoices: [invoice] });
        const response = await get(SUBJECT);
        expect(response.status).toBe(200);
        const value = await response.json();
        expect(licenseSnapshotSchema.parse(value).grants).toHaveLength(1);
        expect(value).not.toHaveProperty('display');
        expect(value).not.toHaveProperty('schemaVersion');
        expect((await get('invalid')).status).toBe(400);
        expect((await get(SECOND)).status).toBe(404);
        expect((await get(SUBJECT, 'Bearer incorrect')).status).toBe(401);
        storage({ accounts: [{ ...account, is_test: true }] });
        expect((await get(SUBJECT)).status).toBe(404);
        fakes.database.mockReturnValue(null);
        expect((await get(SUBJECT)).status).toBe(503);
    });
});
