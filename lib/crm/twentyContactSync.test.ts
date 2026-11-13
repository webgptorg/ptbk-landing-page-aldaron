import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTwentyContactApi, getTwentyContactRecordId } from './twentyContactApi';
import { mapTwentyContactSource, type TwentyContactSource } from './twentyContactSource';
import { loadTwentyContactSyncRows, recordTwentyContactSyncResult, type TwentyContactSyncRow } from './twentyContactSyncDatabase';

const FROM = '2026-11-09T12:00:00Z';
const EVENT_DATE = '2026-11-09T13:00:00Z';
const SOURCE: TwentyContactSource = {
    externalId: 'web:contact:1', email: 'jana_novakova@acme.invalid', fullname: 'Jana Nováková', phone: '+420 777 123 456',
    name: 'Site contact', sourceType: 'website', sourceName: 'Site contact', sourceUrl: 'https://www.ptbk.io/cs',
    occurredAt: EVENT_DATE, details: { message: 'Contact enquiry' },
};
const PERSON_ID = 'c7e25adb-ff15-427c-b777-e5f63ed2ace5';
const BILLING_ORDER_ID = 'b8214bb6-35aa-4393-9171-4ed6d09303e6';

function list(plural: string, rows: object[]) {
    return Response.json({ data: { [plural]: rows }, pageInfo: { hasNextPage: false, endCursor: null } });
}

afterEach(() => vi.unstubAllGlobals());

describe('Twenty contact sources', () => {
    it('spaces paginated maintenance requests without slowing the ordinary worker', async () => {
        vi.useFakeTimers();
        const starts: number[] = [];
        vi.stubGlobal('fetch', async () => { starts.push(Date.now()); return list('people', []); });
        try {
            const maintenance = createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test', minRequestIntervalMs: 1100 });
            const completed = Promise.all([maintenance.request('people', 'GET'), maintenance.request('people', 'GET'), maintenance.request('people', 'GET')]);
            await vi.runAllTimersAsync();
            await completed;
            expect(starts.map((at) => at - starts[0])).toEqual([0, 1100, 2200]);
            starts.length = 0;
            const regular = createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test' });
            await Promise.all([regular.request('people', 'GET'), regular.request('people', 'GET')]);
            expect(starts[1]).toBe(starts[0]);
        } finally { vi.useRealTimers(); }
    });
    it('verifies both CRM objects using read-only requests', async () => {
        const request = vi.fn(async (url: URL, options: RequestInit) => {
            expect(options.method).toBe('GET');
            expect(options.redirect).toBe('error');
            expect(url.searchParams.get('limit')).toBe('1');
            expect(url.searchParams.get('fields')).toBe('id');
            return list(url.pathname.split('/').at(-1)!, []);
        });
        vi.stubGlobal('fetch', request);

        const url = new URL('https://crm.invalid');
        const api = createTwentyContactApi({ url, key: 'twenty-token', ingressKey: 'proxy-token' });
        await expect(api.verifyConnectivity()).resolves.toBeUndefined();
        expect(request.mock.calls.map(([url]) => url.pathname)).toEqual(['/rest/people', '/rest/contactSources']);
        for (const [, options] of request.mock.calls) {
            const headers = new Headers(options.headers);
            expect(headers.get('authorization')).toBe('Bearer twenty-token');
            expect(headers.get('x-ptbk-twenty-sync')).toBe('proxy-token');
        }

        request.mockClear();
        await createTwentyContactApi({ url, key: 'twenty-token' }).verifyConnectivity();
        for (const [, options] of request.mock.calls) {
            const headers = new Headers(options.headers);
            expect(headers.get('authorization')).toBe('Bearer twenty-token');
            expect(headers.has('x-ptbk-twenty-sync')).toBe(false);
        }
    });

    it('links a matching secondary address without changing the existing Person', async () => {
        const requests: { path: string; method: string; body?: unknown }[] = [];
        const request = vi.fn(async (url: URL, options: RequestInit) => {
            const path = url.pathname;
            const method = options.method!;
            const body = options.body ? JSON.parse(options.body as string) : undefined;
            requests.push({ path, method, body });
            if (path === '/rest/people') {
                expect(url.searchParams.get('filter')).toContain('jana\\_novakova');
                return list('people', [{ id: PERSON_ID, emails: { additionalEmails: ['Jana_Novakova@acme.invalid'] } }]);
            }
            if (method === 'GET') return list('contactSources', []);
            return Response.json({ data: { createContactSource: body } }, { status: 201 });
        });
        vi.stubGlobal('fetch', request);

        const api = createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test' });
        await expect(api.deliverSource(SOURCE)).resolves.toBe('linked');
        expect(requests.map(({ path, method }) => [method, path])).toEqual([
            ['GET', '/rest/contactSources'], ['GET', '/rest/people'], ['POST', '/rest/contactSources'],
        ]);
        expect(requests.at(-1)?.body).toMatchObject({ externalId: SOURCE.externalId, personId: PERSON_ID });
    });

    it('verifies a lost create acknowledgement by its stable ID and makes no changes on replay', async () => {
        let created: Record<string, unknown> | undefined;
        let sourcePosts = 0;
        const sourceId = getTwentyContactRecordId('source', SOURCE.externalId);
        vi.stubGlobal('fetch', async (url: URL, { method, body }: RequestInit) => {
            if (url.pathname === '/rest/people') {
                return list('people', [{ id: PERSON_ID, emails: { primaryEmail: SOURCE.email } }]);
            }
            if (url.pathname === `/rest/contactSources/${sourceId}` && method === 'GET') {
                return Response.json({ data: { contactSource: created } });
            }
            if (url.pathname === '/rest/contactSources' && method === 'GET') {
                return list('contactSources', created ? [created] : []);
            }
            if (url.pathname === '/rest/contactSources' && method === 'POST') {
                sourcePosts++;
                created = JSON.parse(body as string) as Record<string, unknown>;
                expect(created?.id).toBe(sourceId);
                throw new Error('Connection closed after commit');
            }
            throw new Error(`Unexpected request ${method} ${url.pathname}`);
        });

        const api = createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test' });
        await expect(api.deliverSource(SOURCE)).resolves.toBe('linked');
        await expect(api.deliverSource(SOURCE)).resolves.toBe('linked');
        expect(sourcePosts).toBe(1);
    });

    it('preserves a shared mailbox submission for review and strips private URL parameters and billing data', () => {
        const row: TwentyContactSyncRow = {
            external_id: SOURCE.externalId, source_version: '1', occurred_at: new Date(EVENT_DATE), kind: 'contact',
            email: 'Info@Acme.invalid', fullname: 'Jana Nováková', phone: null, attempts: 0,
            source_name: 'AiSupervizeMiniWorkshopRegistration',
            source_url: 'https://www.ptbk.io/ai-supervize-mini?email=private&utm_source=fb&utm_campaign=Workshop+listopad&utm_content=mail@acme.invalid#access-token',
            details: {
                referrer: 'https://test.invalid/lead?key=secret',
                userNote: JSON.stringify({
                    selectedDateId: 'nov-9', participantCount: 2, company: 'ACME', userNote: 'Please call',
                    billingDetails: 'private', discountCodeUsed: 'secret',
                }),
                submissionEvidence: { marketingConsent: false, purpose: 'registration' },
            },
        };
        expect(mapTwentyContactSource(row)).toMatchObject({
            email: null, sourceType: 'workshop-registration', sourceUrl: 'https://www.ptbk.io/ai-supervize-mini',
            details: {
                identityReview: 'shared_email', submittedEmail: 'Info@Acme.invalid', referrer: 'https://test.invalid/lead',
                registration: { termId: 'nov-9', participantCount: 2 },
                campaign: { utm_source: 'fb', utm_campaign: 'Workshop listopad' },
                message: 'Please call', submissionEvidence: { marketingConsent: false, purpose: 'registration' },
            },
        });
        expect(JSON.stringify(mapTwentyContactSource(row))).not.toMatch(/billingDetails|discountCodeUsed|secret|access-token|utm_content/);
        expect(mapTwentyContactSource({ ...row, email: 'e2e-record@example.com' })).toBe('test_contact');
    });

    it('reconciles delayed source writes and changed membership or purchase details', async () => {
        const database = new PGlite();
        try {
            await database.exec(`
                CREATE ROLE anon;
                CREATE ROLE authenticated;
                CREATE ROLE service_role;
                CREATE TABLE public."Contact" (
                    id integer, "createdAt" timestamptz, email text, fullname text, phone text,
                    "placeName" text, url text, "appName" text, referrer text, "userNote" text,
                    "isWaitlisted" boolean, "submissionEvidence" jsonb
                );
                CREATE TABLE workshops (id text, title text, slug text, room_kind text);
                CREATE TABLE workshop_participants (id text, workshop_id text, connected_at timestamptz, email text, fullname text);
                CREATE TABLE workshop_feedback (
                    id text, workshop_id text, participant_id text, created_at timestamptz, updated_at timestamptz,
                    rating smallint, what_was_good text, what_was_bad text, note text
                );
                CREATE TABLE community_memberships (
                    id text, created_at timestamptz, updated_at timestamptz, email text, fullname text,
                    community_id text, plan_id text, status text, activated_at timestamptz, canceled_at timestamptz,
                    current_period_ends_at timestamptz, is_test_payment boolean
                );
                INSERT INTO public."Contact" (id, "createdAt") VALUES (2, '2026-11-09T12:20:00Z');
                INSERT INTO workshops VALUES ('room', 'Workshop', 'workshop', 'workshop');
                INSERT INTO workshop_participants VALUES ('join', 'room', '2026-11-09T12:20:00Z', 'test@acme.invalid', 'Test');
                INSERT INTO workshop_feedback VALUES
                    ('feedback', 'room', 'join', '2026-11-09T12:30:00Z', '2026-11-09T12:30:00Z', 4, NULL, NULL, NULL);
                INSERT INTO community_memberships (id, created_at, updated_at, status, is_test_payment) VALUES
                    ('active', '2026-11-01', '2026-11-09T12:30:00Z', 'active', false),
                    ('test', '2026-11-09T12:00:00Z', '2026-11-09T12:30:00Z', 'active', true);
            `);
            await database.exec(readFileSync(new URL('../../migrations/2026-11-0961-promptbook-billing-orders.sql', import.meta.url), 'utf8'));
            await database.exec(readFileSync(new URL('../../migrations/2026-11-0962-promptbook-billing-contacts.sql', import.meta.url), 'utf8'));
            await database.exec(readFileSync(new URL('../../migrations/2026-11-0963-twenty-contact-sync.sql', import.meta.url), 'utf8'));
            await database.exec(readFileSync(new URL('../../migrations/2026-11-1100-promptbook-consumer-orders.sql', import.meta.url), 'utf8'));
            await database.exec(`
                INSERT INTO promptbook_orders (
                    id, created_at, plan, email, country, company_id, company_name, vat_id, billing_address,
                    terms_version, engine_version, engine_licence_url, support_email, billing_origin,
                    invoice_template_id, base_amount, discount_code, is_test, first_paid_at, stripe_customer_id
                )
                SELECT id::uuid, '2026-11-09T12:21:00Z', 'business', 'billing@acme.invalid', 'CZ', '12345678', 'ACME',
                    'private-vat-id', '{"line1":"private-address"}', 'terms', 'engine', 'licence', 'support',
                    'https://www.ptbk.io', 'template', 199900, 'private-discount', is_test, paid_at::timestamptz,
                    'private-stripe-id-' || id
                FROM (VALUES
                    ('${BILLING_ORDER_ID}', false, '2026-11-09T12:25:00Z'),
                    ('b8214bb6-35aa-4393-9171-4ed6d09303e7', true, '2026-11-09T12:25:00Z'),
                    ('b8214bb6-35aa-4393-9171-4ed6d09303e8', false, NULL)
                ) AS orders(id, is_test, paid_at);
                INSERT INTO public."Contact" (id, "createdAt", email, "placeName", "promptbookBillingOrderId", "submissionEvidence")
                SELECT row_number() OVER (ORDER BY id) + 2, '2026-11-09T12:29:00Z', email, 'PromptbookSubscriptionOrder', id,
                       '{"purpose":"order","marketingConsent":false}'::jsonb
                FROM promptbook_orders;
                INSERT INTO twenty_contact_sync (external_id, source_version, attempts) VALUES ('web:contact:3', '1', 0);
            `);
            const transaction = { query: <Row extends Record<string, unknown>>(sql: string, values?: readonly unknown[]) =>
                database.query<Row>(sql, values ? [...values] : undefined) };
            const rows = await loadTwentyContactSyncRows(transaction, FROM, 10);
            expect(rows.map(({ external_id }) => external_id)).toEqual([
                'web:membership:active', 'web:attendance:join', 'web:contact:2', 'web:contact:3', 'web:feedback:feedback',
            ]);
            const billingSource = mapTwentyContactSource(rows[3]);
            expect(billingSource).toMatchObject({
                externalId: 'web:contact:3', email: null, name: 'Promptbook Business', sourceType: 'promptbook-subscription',
                occurredAt: '2026-11-09T12:25:00.000Z',
                details: {
                    planId: 'business', billingCompany: 'ACME', billingCompanyId: '12345678', billingCountry: 'CZ',
                    identityReview: 'shared_email', submissionEvidence: { purpose: 'order', marketingConsent: false },
                },
            });
            expect(JSON.stringify(billingSource)).not.toContain('private-');
            for (const row of rows) {
                const isFailed = row.external_id === 'web:contact:2';
                await recordTwentyContactSyncResult(transaction, row, isFailed ? 'twenty_unreachable' : null, isFailed ? 300 : null);
            }
            expect(await loadTwentyContactSyncRows(transaction, FROM, 10)).toEqual([]);

            await database.exec(`
                INSERT INTO public."Contact" (id, "createdAt") VALUES (1, '2026-11-09T12:00:00Z');
                UPDATE community_memberships SET updated_at = '2026-11-09T12:45:00Z', status = 'canceled' WHERE id = 'active';
                UPDATE workshop_feedback SET updated_at = '2026-11-09T12:50:00Z', rating = 5 WHERE id = 'feedback';
                UPDATE promptbook_orders SET phone = '+420 777 123 456', onboarding_note = 'Onboarding detail'
                    WHERE id = '${BILLING_ORDER_ID}';
                UPDATE twenty_contact_sync SET next_attempt_at = now() WHERE external_id = 'web:contact:2';
            `);
            const replay = await loadTwentyContactSyncRows(transaction, FROM, 10);
            expect(replay.map(({ external_id, attempts }) => [external_id, attempts])).toEqual([
                ['web:membership:active', 0], ['web:contact:1', 0], ['web:contact:2', 1], ['web:contact:3', 0], ['web:feedback:feedback', 0],
            ]);
            expect(replay[0].details.status).toBe('canceled');
            expect(replay[3].source_version).not.toBe(rows[3].source_version);
            expect(mapTwentyContactSource(replay[3])).toMatchObject({
                externalId: 'web:contact:3', details: { submittedPhone: '+420 777 123 456', message: 'Onboarding detail' },
            });
            expect(replay[4].details.rating).toBe(5);

            await database.exec(`UPDATE promptbook_orders SET status = 'past_due', cancel_at_period_end = true
                WHERE id = '${BILLING_ORDER_ID}';
                INSERT INTO promptbook_invoices (stripe_invoice_id, order_id, paid_at, amount_paid, card_amount,
                    refunded_amount, currency) VALUES ('private-invoice', '${BILLING_ORDER_ID}',
                    '2026-11-09T12:25:00Z', 199900, 199900, 50000, 'czk');`);
            const payments = await loadTwentyContactSyncRows(transaction, FROM, 10);
            const paid = payments.find((row) => row.kind === 'promptbook-order')!;
            expect(paid.source_version).not.toBe(replay[3].source_version);
            expect(paid.details).toMatchObject({
                paidCustomer: true, subscriptionStatus: 'past_due', cancelAtPeriodEnd: true,
                paymentHistory: [{ amountPaidMinor: 199900, refundedAmountMinor: 50000, currency: 'czk' }],
            });
            expect(JSON.stringify(paid.details)).not.toContain('private-invoice');
            await recordTwentyContactSyncResult(transaction, paid, null);
            expect(await loadTwentyContactSyncRows(transaction, FROM, 10, {
                includeDelivered: true, kinds: ['promptbook-order'],
            })).toHaveLength(1);

            for (const row of replay.filter((row) => row.kind !== 'promptbook-order')) {
                await recordTwentyContactSyncResult(transaction, row, null);
            }
            expect(await loadTwentyContactSyncRows(transaction, FROM, 10)).toEqual([]);
            await database.exec(`UPDATE promptbook_orders SET phone = NULL, onboarding_note = NULL WHERE id = '${BILLING_ORDER_ID}';`);
            const afterClear = await loadTwentyContactSyncRows(transaction, FROM, 10);
            expect(afterClear).toHaveLength(1);
            expect(afterClear[0].external_id).toBe('web:contact:3');
            expect(afterClear[0].details).not.toHaveProperty('message');

            await recordTwentyContactSyncResult(transaction, afterClear[0], null);
            await database.exec(`UPDATE promptbook_orders SET
                company_id = NULL, customer_type = 'consumer', company_name = 'Jana Nováková', vat_id = NULL,
                order_note = 'Poznámka k nákupu', onboarding_note = 'Doplněné požadavky'
                WHERE id = '${BILLING_ORDER_ID}';`);
            const consumerRows = await loadTwentyContactSyncRows(transaction, FROM, 10);
            expect(consumerRows).toHaveLength(1);
            expect(consumerRows[0].details).not.toHaveProperty('billingCompany');
            expect(consumerRows[0].details).not.toHaveProperty('billingCompanyId');
            expect(mapTwentyContactSource(consumerRows[0])).toMatchObject({
                fullname: 'Jana Nováková',
                details: {
                    billingName: 'Jana Nováková', customerType: 'consumer',
                    message: 'Poznámka k nákupu\n\nDoplněné požadavky',
                },
            });
            await recordTwentyContactSyncResult(transaction, consumerRows[0], null);
            await database.exec(`UPDATE promptbook_orders SET onboarding_note = NULL WHERE id = '${BILLING_ORDER_ID}';`);
            const clearedConsumerRows = await loadTwentyContactSyncRows(transaction, FROM, 10);
            expect(clearedConsumerRows).toHaveLength(1);
            expect(clearedConsumerRows[0].details.message).toBe('Poznámka k nákupu');
        } finally {
            await database.close();
        }
    });
});
