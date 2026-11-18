import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const migration = (filename: string) => readFileSync(new URL('../../migrations/' + filename, import.meta.url), 'utf8');
const legacyOrder = 'eaa62e24-25f9-42bd-93af-63127dd50002';
const reservation = '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d0';
const another = '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d1';
type Claim = { status: string; percent: number | null; subscription_discount_duration_months: number | null };
describe('avatar discounts on the shared PostgreSQL ledger', () => {
    let db: PGlite;
    beforeAll(async () => {
        db = new PGlite();
        await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
        // PGlite has built-in gen_random_uuid; the optional pgcrypto extension is not packaged.
        await db.exec(migration('2026-08-1400-discount-codes-places-and-uses.sql').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''));
        for (const name of ['2026-08-3700-subscription-discount-duration.sql', '2026-09-0100-discount-code-wildcards.sql', '2026-09-0110-discount-code-any-wildcards.sql', '2026-11-0960-promptbook-discount-codes.sql', '2026-11-1700-pavol-avatar-commerce.sql']) await db.exec(migration(name));
        await db.exec(`INSERT INTO avatar_principals(id,email) VALUES('eaa62e24-25f9-42bd-93af-63127dd50001','buyer@example.test');
            INSERT INTO avatar_orders(id,principal_id,email,fullname,customer_type,billing_name,billing_address,country,base_amount,terms_version,seller,is_test)
            VALUES('${legacyOrder}','eaa62e24-25f9-42bd-93af-63127dd50001','buyer@example.test','Buyer','individual','Buyer','{}','CZ',100000,'old-accepted-edition','{}',true);`);
        await db.exec(migration('2026-11-1800-pavol-avatar-discount-codes.sql'));
    }, 15000);
    afterAll(async () => { await db?.close(); });
    beforeEach(async () => { await db.exec('TRUNCATE promptbook_discount_reservations, discount_codes;'); });
    const addCode = async (code: string, places: string[] = [], max = 1) => db.query(`INSERT INTO discount_codes(code,percent,starts_at,ends_at,place_ids,maximum_use_count,subscription_discount_duration_months)
        VALUES($1,30,now()-interval '1 day',now()+interval '1 day',$2,$3,3)`, [code, places, max]);
    const reserve = async (code = 'SHARED', id = reservation, place = 'pavol-avatar-full', rpc = 'reserve_subscription_discount_code') =>
        (await db.query<Claim>(`SELECT * FROM ${rpc}($1,$2,$3)`, [code, place, id])).rows[0];
    const count = async () => (await db.query<{ use_count: number }>('SELECT use_count FROM discount_codes ORDER BY code')).rows.map(row => row.use_count);
    const settle = (id: string, redeemed: boolean) => db.query("SELECT settle_subscription_discount_reservation($1,$2,'pavol-avatar-full')", [id, redeemed]);

    it('preserves legacy contracts and makes the new discount snapshot immutable', async () => {
        expect((await db.query('SELECT base_amount,terms_version,discount_code,discount_percent,discount_months FROM avatar_orders WHERE id=$1', [legacyOrder])).rows[0])
            .toEqual({ base_amount: 100000, terms_version: 'old-accepted-edition', discount_code: null, discount_percent: null, discount_months: null });
        await expect(db.query("UPDATE avatar_orders SET discount_code='SHARED',discount_percent=30,discount_months=3 WHERE id=$1", [legacyOrder])).rejects.toThrow('immutable');
        await expect(db.query('UPDATE avatar_orders SET base_amount=70000 WHERE id=$1', [legacyOrder])).rejects.toThrow('immutable');
        await db.query("UPDATE avatar_orders SET status='active',revision=1 WHERE id=$1", [legacyOrder]);
        expect((await db.query<{ status: string }>('SELECT status FROM avatar_orders WHERE id=$1', [legacyOrder])).rows[0].status).toBe('active');
    });
    it('uses one global counter across avatar reservations and other product purchases', async () => {
        await addCode('SHARED');
        expect(await reserve()).toMatchObject({ status: 'applied', percent: 30, subscription_discount_duration_months: 3 });
        expect(await reserve()).toMatchObject({ status: 'applied' });
        expect(await count()).toEqual([1]);
        expect((await db.query<{ status: string }>("SELECT * FROM consume_discount_code('SHARED','community-developers')")).rows[0].status).toBe('exhausted');
        expect(await reserve('SHARED', another)).toMatchObject({ status: 'exhausted' });
        await settle(reservation, false); await settle(reservation, false);
        expect(await count()).toEqual([0]);
        expect(await reserve()).toMatchObject({ status: 'unusable' }); // A released attempt cannot be reused.
        expect(await reserve('SHARED', another)).toMatchObject({ status: 'applied' });
        await settle(another, true); await settle(another, false);
        expect(await count()).toEqual([1]);
    });
    it('freezes reserved terms across retries after an administrator changes or disables the code', async () => {
        await addCode('SHARED'); await reserve();
        await db.exec("UPDATE discount_codes SET percent=10,subscription_discount_duration_months=1,is_enabled=false");
        expect(await reserve()).toMatchObject({ status: 'applied', percent: 30, subscription_discount_duration_months: 3 });
        expect(await reserve('SHARED', another)).toMatchObject({ status: 'unusable' });
        expect(await count()).toEqual([1]);
    });
    it('honours explicit product scope and leaves the Promptbook opt-in and legacy RPC boundary intact', async () => {
        await addCode('GLOBAL'); await addCode('PROMPTBOOK', ['promptbook-start'], 2); await addCode('AVATAR', ['pavol-avatar-full']);
        expect(await reserve('PROMPTBOOK')).toMatchObject({ status: 'unusable' });
        expect(await reserve('GLOBAL', reservation, 'promptbook-start')).toMatchObject({ status: 'unusable' });
        expect(await reserve('AVATAR', reservation, 'pavol-avatar-full', 'reserve_promptbook_discount_code')).toMatchObject({ status: 'unusable' });
        expect(await reserve('PROMPTBOOK', reservation, 'promptbook-start', 'reserve_promptbook_discount_code')).toMatchObject({ status: 'applied' });
        expect(await reserve('AVATAR', another)).toMatchObject({ status: 'applied' });
        expect(await reserve('GLOBAL', another, 'community-developers')).toMatchObject({ status: 'unusable' });
    });
    it('uses the same exact/wildcard precedence and validity windows as previews', async () => {
        await addCode('PARTNER_*'); await addCode('PARTNER_ALICE');
        await db.exec("UPDATE discount_codes SET percent=40 WHERE code='PARTNER_ALICE'");
        expect(await reserve('PARTNER_ALICE')).toMatchObject({ status: 'applied', percent: 40 });
        expect(await reserve('PARTNER_BOB', another)).toMatchObject({ status: 'applied', percent: 30 });
        await db.exec("UPDATE discount_codes SET ends_at=now()-interval '1 hour' WHERE code='PARTNER_*'");
        await settle(another, false);
        expect(await reserve('PARTNER_CAROL', '91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d2')).toMatchObject({ status: 'unusable' });
    });
    it('cannot release or redeem a different product reservation by reusing its order ID', async () => {
        await addCode('PROMPTBOOK', ['promptbook-start']);
        expect(await reserve('PROMPTBOOK', reservation, 'promptbook-start')).toMatchObject({ status: 'applied' });
        expect(await reserve('PROMPTBOOK', reservation)).toMatchObject({ status: 'unusable' });
        await settle(reservation, false); await settle(reservation, true);
        expect(await count()).toEqual([1]);
        expect((await db.query<{ state: string }>('SELECT state FROM promptbook_discount_reservations')).rows[0].state).toBe('reserved');
        await db.query('SELECT settle_promptbook_discount_reservation($1,false)', [reservation]);
        expect(await count()).toEqual([0]);
    });
    it('keeps reservation RPCs and both private tables inaccessible to public visitors', async () => {
        for (const role of ['anon', 'authenticated']) {
            const result = await db.query<{ allowed: boolean }>(`SELECT has_function_privilege($1,'public.reserve_subscription_discount_code(text,text,uuid)','EXECUTE')
                OR has_function_privilege($1,'public.settle_subscription_discount_reservation(uuid,boolean,text)','EXECUTE')
                OR has_table_privilege($1,'public.promptbook_discount_reservations','SELECT') OR has_table_privilege($1,'public.avatar_orders','SELECT') AS allowed`, [role]);
            expect(result.rows[0].allowed).toBe(false);
        }
        await addCode('SHARED');
        await db.exec('SET ROLE service_role');
        try { expect(await reserve()).toMatchObject({ status: 'applied' }); }
        finally { await db.exec('RESET ROLE'); }
    });
});
