import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPromptbookOrderConfirmation, hasPromptbookOrderConfirmation } from './billingConfirmation';
import type { PromptbookOrder } from './billingOrders';

const order = {
    id: 'c2a1a142-348f-43e8-8718-6a3820053cb7',
    created_at: '2026-11-11T09:00:00Z',
    confirmed_at: '2026-11-11T09:01:00Z',
    plan: 'start',
    email: 'customer@example.test',
    country: 'CZ',
    company_id: null,
    company_name: 'Jana <Nová> & rodina',
    customer_type: 'consumer',
    tax_treatment: 'domestic',
    immediate_start: true,
    order_note: '<script>leave as text</script>',
    billing_address: { line1: 'Příklad 1', city: 'Praha', postal_code: '11000', country: 'CZ' },
    terms_version: '2026-11-11-online-v2',
    engine_version: '0.119.0-75',
    engine_licence_url: 'https://github.com/webgptorg/promptbook/blob/example/LICENSE',
    support_email: 'support@example.test',
    base_amount: 39900,
    discount_code: 'FIRST',
    discount_percent: 30,
    discount_months: 3,
    first_paid_at: null,
    paid_through: null,
    status: 'active',
} as PromptbookOrder;

describe('downloadable order confirmation', () => {
    it('embeds the frozen purchase and full consumer terms without executing submitted markup', () => {
        const html = createPromptbookOrderConfirmation(order)!;
        expect(html).toContain('Jana &lt;Nová&gt; &amp; rodina');
        expect(html).toContain('&lt;script&gt;leave as text&lt;/script&gt;');
        expect(html).not.toContain('<script>');
        expect(html).toContain('279,30');
        expect(html).toContain('399');
        expect(html).toContain('2026-11-11-online-v2');
        expect(html).toContain('Právo odstoupit do 14 dnů zůstává zachováno.');
        expect(html).toContain('Vzor odstoupení od smlouvy');
        expect(html).toContain('https://www.ptbk.io/cs/legal/ochrana-osobnich-udaju');
        expect(html).toContain('Údaje pro platbu a podporu');
        expect(html).not.toContain('IČO</dt>');
    });

    it('retains the old accepted edition and ignores subsequent invoice and onboarding changes', () => {
        const accepted = { ...order, terms_version: '2026-11-09-online-v1', customer_type: 'business' as const };
        const html = createPromptbookOrderConfirmation(accepted)!;
        expect(html).toContain('2026-11-09-online-v1');
        expect(html).toContain('Zákazník objednává v rámci svého podnikání');
        expect(html).not.toContain('Vzor odstoupení od smlouvy');
        expect(createPromptbookOrderConfirmation({
            ...accepted,
            status: 'canceled',
            amount_paid: 12345,
            onboarding_note: 'Changed later',
            paid_through: '2027-01-11T09:00:00Z',
        })).toBe(html);
    });

    it('does not fabricate acceptance or silently substitute another terms edition', () => {
        const pending = { ...order, status: 'pending', confirmed_at: null };
        expect(hasPromptbookOrderConfirmation(pending)).toBe(false);
        expect(createPromptbookOrderConfirmation(pending)).toBeNull();
        expect(createPromptbookOrderConfirmation({ ...order, terms_version: 'unavailable-edition' })).toBeNull();
    });

    it('backfills confirmation from an initial zero invoice without inventing a paid conversion', async () => {
        const database = new PGlite();
        try {
            await database.exec(`
                create table public.promptbook_orders (id uuid primary key, first_paid_at timestamptz);
                create table public.promptbook_invoices (order_id uuid, paid_at timestamptz, card_amount integer);
                insert into public.promptbook_orders values ('${order.id}', null);
                insert into public.promptbook_invoices values ('${order.id}', '2026-11-11T09:01:00Z', 0);
            `);
            await database.exec(readFileSync(path.resolve('migrations/2026-11-1101-promptbook-order-confirmation.sql'), 'utf8'));
            const result = await database.query<{ first_paid_at: string | null; confirmed_at: Date }>('select * from public.promptbook_orders');
            expect(result.rows[0]?.first_paid_at).toBeNull();
            expect(new Date(result.rows[0]!.confirmed_at).toISOString()).toBe('2026-11-11T09:01:00.000Z');
        } finally {
            await database.close();
        }
    }, 30_000);
});
