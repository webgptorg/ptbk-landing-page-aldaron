import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';

const originalMigration = readFileSync(new URL('../../migrations/2026-11-0961-promptbook-billing-orders.sql', import.meta.url), 'utf8');
const consumerMigration = readFileSync(new URL('../../migrations/2026-11-1100-promptbook-consumer-orders.sql', import.meta.url), 'utf8');
const czId = '7941d8da-381d-4af4-ad85-cc8e656d0180';
const skId = '7941d8da-381d-4af4-ad85-cc8e656d0181';

async function insertConsumer(database: PGlite, id: string, vatId: string | null = null, reverseCharge = false) {
    return database.query(`
        INSERT INTO public.promptbook_orders (
            id, plan, email, country, company_id, company_name, vat_id, billing_address,
            terms_version, engine_version, engine_licence_url, support_email, billing_origin,
            invoice_template_id, supplier_tax_id, base_amount, is_test,
            customer_type, tax_treatment, order_note, immediate_start
        ) VALUES (
            $1, 'start', 'consumer@example.test', 'SK', NULL, 'Eva Nová', $2,
            '{"line1":"Poštová 12","city":"Bratislava","postal_code":"81101","country":"SK"}',
            '2026-11-11-online-v2', '0.119.0-75', 'licence', 'support@example.test', 'https://www.ptbk.io',
            'invoice_cz', $3, 39900, true, 'consumer', $4, 'Poznámka zákazníka', true
        )`, [id, vatId, reverseCharge ? 'CZ21012288' : null, reverseCharge ? 'reverse_charge' : 'domestic']);
}

describe('Promptbook consumer order migration', () => {
    it('preserves existing business identities, permits consumer billing, and enforces tax identity constraints', async () => {
        const database = new PGlite();
        try {
            await database.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
            await database.exec(originalMigration);
            await database.query(`
                INSERT INTO public.promptbook_orders (
                    id, plan, email, country, company_id, company_name, vat_id, billing_address,
                    terms_version, engine_version, engine_licence_url, support_email, billing_origin,
                    invoice_template_id, supplier_tax_id, base_amount, is_test
                ) SELECT id::uuid, 'start', 'business@example.test', country, company_id, company_name, vat_id,
                    jsonb_build_object('line1', 'Registered 12', 'city', city, 'postal_code', '12345', 'country', country),
                    '2026-11-09-online-v1', '0.119.0-75', 'licence', 'support@example.test', 'https://www.ptbk.io',
                    template, supplier_tax_id, 39900, false
                FROM (VALUES
                    ($1::text, 'CZ', '21012288', 'Česká firma', NULL::text, 'Praha', 'invoice_cz', NULL::text),
                    ($2::text, 'SK', '12345678', 'Slovenská firma', 'SK1234567890', 'Bratislava', 'invoice_sk', 'CZ21012288')
                ) AS legacy(id, country, company_id, company_name, vat_id, city, template, supplier_tax_id)
            `, [czId, skId]);

            await database.exec(consumerMigration);
            const legacy = await database.query(`
                SELECT id, country, company_id, company_name, vat_id, billing_address, terms_version,
                       customer_type, tax_treatment, immediate_start
                FROM public.promptbook_orders ORDER BY id
            `);
            expect(legacy.rows).toEqual([
                {
                    id: czId, country: 'CZ', company_id: '21012288', company_name: 'Česká firma', vat_id: null,
                    billing_address: { line1: 'Registered 12', city: 'Praha', postal_code: '12345', country: 'CZ' },
                    terms_version: '2026-11-09-online-v1', customer_type: 'business', tax_treatment: 'domestic', immediate_start: false,
                },
                {
                    id: skId, country: 'SK', company_id: '12345678', company_name: 'Slovenská firma', vat_id: 'SK1234567890',
                    billing_address: { line1: 'Registered 12', city: 'Bratislava', postal_code: '12345', country: 'SK' },
                    terms_version: '2026-11-09-online-v1', customer_type: 'business', tax_treatment: 'reverse_charge', immediate_start: false,
                },
            ]);

            const consumerId = '7941d8da-381d-4af4-ad85-cc8e656d0182';
            await insertConsumer(database, consumerId);
            const consumer = await database.query(`
                SELECT company_id, company_name, vat_id, customer_type, tax_treatment, order_note, immediate_start
                FROM public.promptbook_orders WHERE id = $1
            `, [consumerId]);
            expect(consumer.rows).toEqual([{
                company_id: null, company_name: 'Eva Nová', vat_id: null, customer_type: 'consumer',
                tax_treatment: 'domestic', order_note: 'Poznámka zákazníka', immediate_start: true,
            }]);

            await expect(insertConsumer(database, '7941d8da-381d-4af4-ad85-cc8e656d0183', 'SK1234567890'))
                .rejects.toMatchObject({ code: '23514', constraint: 'promptbook_consumer_identity_check' });
            await expect(insertConsumer(database, '7941d8da-381d-4af4-ad85-cc8e656d0184', null, true))
                .rejects.toMatchObject({ code: '23514', constraint: 'promptbook_reverse_charge_identity_check' });
            expect((await database.query('SELECT count(*)::integer AS count FROM public.promptbook_orders')).rows)
                .toEqual([{ count: 3 }]);
        } finally {
            await database.close();
        }
    }, 30_000);
});
