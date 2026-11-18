import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
const migration = (name: string) => readFileSync(new URL('../../migrations/' + name, import.meta.url), 'utf8');
const id = '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d0';
const other = '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d1';

describe('additive discount rule migration in PostgreSQL', () => {
    let db: PGlite;
    beforeAll(async () => {
        db = new PGlite();
        await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
        for (const name of ['2026-08-1400-discount-codes-places-and-uses.sql', '2026-08-3700-subscription-discount-duration.sql', '2026-09-0100-discount-code-wildcards.sql', '2026-09-0110-discount-code-any-wildcards.sql', '2026-11-0960-promptbook-discount-codes.sql', '2026-11-1700-pavol-avatar-commerce.sql', '2026-11-1800-pavol-avatar-discount-codes.sql']) {
            await db.exec(migration(name).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''));
        }
        await db.exec(`CREATE TABLE public.promptbook_orders(id uuid PRIMARY KEY, status text);
            CREATE TABLE public.community_memberships(id uuid PRIMARY KEY, stripe_checkout_session_id text);
            INSERT INTO public.promptbook_orders VALUES('${id}','active');
            GRANT SELECT,INSERT,UPDATE ON public.promptbook_orders,public.community_memberships TO service_role;
            INSERT INTO public.discount_codes(code,percent,starts_at,ends_at) VALUES('LEGACY',30,now()-interval '1 day',now()+interval '1 day');`);
        await db.exec(migration('2026-11-1810-discount-price-rules.sql'));
    }, 15000);
    afterAll(async () => { await db?.close(); });
    beforeEach(async () => { await db.exec("TRUNCATE public.promptbook_discount_reservations,public.discount_purchase_snapshots; DELETE FROM discount_codes WHERE code <> 'LEGACY';"); });
    const add = (scope = true) => db.query(`INSERT INTO public.discount_codes(code,percent,starts_at,ends_at,maximum_use_count,applies_everywhere,price_rule,subscription_discount_duration_months)
        VALUES('RULE',30,now()-interval '1 day',now()+interval '1 day',1,$1,'{"kind":"fixed","amount":20,"currency":"CZK"}',3)`, [scope]);
    const reserve = (reservation = id, code = 'RULE', place = 'promptbook-start') => db.query(`SELECT * FROM public.reserve_subscription_discount_code_v2($1,$2,$3)`, [code,place,reservation]);

    it('keeps old definitions, old global scope, existing purchases and old RPC signatures intact', async () => {
        expect((await db.query("SELECT percent,price_rule,applies_everywhere,definition_version,use_count FROM discount_codes WHERE code='LEGACY'")).rows[0])
            .toEqual({ percent: 30, price_rule: null, applies_everywhere: false, definition_version: 1, use_count: 0 });
        expect((await reserve(id, 'LEGACY')).rows[0]).toMatchObject({ status: 'unusable' });
        expect((await db.query('SELECT discount_snapshot FROM public.promptbook_orders WHERE id=$1', [id])).rows[0]).toEqual({ discount_snapshot: null });
        await add();
        expect((await db.query("SELECT * FROM public.reserve_promptbook_discount_code('RULE','promptbook-start',$1)", [id])).rows[0]).toMatchObject({ status: 'applied', percent: 30 });
    });
    it('atomically freezes the claimed rule and retries that snapshot after edits, disablement or deletion', async () => {
        await add();
        expect((await reserve()).rows[0]).toMatchObject({ status: 'applied', definition_version: 1, price_rule: { kind: 'fixed', amount: 20, currency: 'CZK' } });
        expect((await reserve(other)).rows[0]).toMatchObject({ status: 'exhausted' });
        await db.exec("UPDATE discount_codes SET price_rule='{" + '"kind":"formula","expression":"price * 0.7 + 1","currency":"CZK"' + "}',subscription_discount_duration_months=1,is_enabled=false WHERE code='RULE'");
        expect((await reserve()).rows[0]).toMatchObject({ status: 'applied', definition_version: 1, subscription_discount_duration_months: 3, price_rule: { amount: 20 } });
        expect((await db.query("SELECT use_count,definition_version FROM discount_codes WHERE code='RULE'")).rows[0]).toEqual({ use_count: 1, definition_version: 2 });
        await db.exec("DELETE FROM discount_codes WHERE code='RULE'");
        expect((await reserve()).rows[0]).toMatchObject({ status: 'applied', definition_version: 1, price_rule: { amount: 20 } });
    });
    it('returns the exact consumed rule for other ecosystem purchases and leaves counters out of definition versioning', async () => {
        await add();
        expect((await db.query("SELECT * FROM consume_discount_code_v2('RULE','ai-supervize-mini-online')")).rows[0])
            .toMatchObject({ status: 'applied', definition_version: 1, price_rule: { amount: 20 }, remaining_use_count: 0 });
        expect((await db.query("SELECT definition_version FROM discount_codes WHERE code='RULE'")).rows[0]).toEqual({ definition_version: 1 });
    });
    it('records purchase snapshots privately and blocks changing an accepted order snapshot', async () => {
        const snapshot = { version: 1, finalAmount: 2000, priceRule: { kind: 'fixed', amount: 20, currency: 'CZK' } };
        await db.query('INSERT INTO promptbook_orders(id,status,discount_snapshot) VALUES($1,$2,$3)', [other,'pending',JSON.stringify(snapshot)]);
        expect((await db.query('SELECT snapshot FROM discount_purchase_snapshots WHERE product=$1 AND purchase_id=$2', ['promptbook_orders',other])).rows[0]).toEqual({ snapshot });
        await expect(db.query("UPDATE promptbook_orders SET discount_snapshot='{}' WHERE id=$1", [other])).rejects.toThrow('immutable');
        await db.query("UPDATE promptbook_orders SET status='active' WHERE id=$1", [other]);
        for (const role of ['anon','authenticated']) {
            const permissions = await db.query<{ allowed: boolean }>(`SELECT has_table_privilege($1,'public.discount_purchase_snapshots','SELECT') OR has_function_privilege($1,'public.reserve_subscription_discount_code_v2(text,text,uuid)','EXECUTE') AS allowed`, [role]);
            expect(permissions.rows[0].allowed).toBe(false);
        }
    });
    it('supports service-role claims and idempotent scoped release of a formula reservation', async () => {
        await add(); await db.exec('SET ROLE service_role');
        try {
            expect((await reserve()).rows[0]).toMatchObject({ status: 'applied', price_rule: { amount: 20 } });
            await db.query("SELECT settle_subscription_discount_reservation($1,false,'pavol-avatar-full')", [id]);
            expect((await reserve(other)).rows[0]).toMatchObject({ status: 'exhausted' });
            await db.query("SELECT settle_subscription_discount_reservation($1,false,'promptbook-start')", [id]);
            await db.query("SELECT settle_subscription_discount_reservation($1,false,'promptbook-start')", [id]);
            expect((await reserve(other)).rows[0]).toMatchObject({ status: 'applied', price_rule: { amount: 20 } });
        } finally { await db.exec('RESET ROLE'); }
    });
    it('keeps different accepted voucher conditions when the same membership row is reused', async () => {
        await db.query('INSERT INTO community_memberships(id,discount_snapshot) VALUES($1,$2)', [id, JSON.stringify({ version: 1, code: 'FIRST', finalAmount: 0 })]);
        await db.query('UPDATE community_memberships SET discount_snapshot=$2 WHERE id=$1', [id, JSON.stringify({ version: 1, code: 'SECOND', finalAmount: 0 })]);
        const history = await db.query(`SELECT snapshot FROM discount_purchase_snapshots WHERE product=$1 ORDER BY snapshot->>'code'`, ['community_memberships']);
        expect(history.rows).toEqual([{ snapshot: { version: 1, code: 'FIRST', finalAmount: 0 } }, { snapshot: { version: 1, code: 'SECOND', finalAmount: 0 } }]);
    });

});
