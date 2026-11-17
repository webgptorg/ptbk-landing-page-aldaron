import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';
const sql = readFileSync(new URL('../../migrations/2026-11-1700-pavol-avatar-commerce.sql', import.meta.url), 'utf8');
describe('isolated avatar commerce schema', () => {
    it('replays without touching other products and protects private tables from public roles', async () => {
        const db = new PGlite();
        try {
            await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE TABLE public.promptbook_orders(id text PRIMARY KEY); INSERT INTO public.promptbook_orders VALUES('existing');");
            await db.exec(sql); await db.exec(sql);
            expect((await db.query("SELECT * FROM public.promptbook_orders")).rows).toEqual([{ id: 'existing' }]);
            const tables = await db.query<{relname:string;relrowsecurity:boolean}>(`SELECT relname,relrowsecurity FROM pg_class WHERE relname IN ('avatar_principals','avatar_orders','avatar_sessions','avatar_invoices','avatar_usage','avatar_auth_attempts','avatar_settings')`);
            expect(tables.rows).toHaveLength(7);
            expect(tables.rows.every(row => row.relrowsecurity)).toBe(true);
            for (const role of ['anon','authenticated']) {
                const privileges = await db.query<{allowed:boolean}>(`SELECT has_table_privilege($1,'public.avatar_orders','SELECT') OR has_table_privilege($1,'public.avatar_sessions','SELECT') AS allowed`, [role]);
                expect(privileges.rows[0].allowed).toBe(false);
                const functions = await db.query<{allowed:boolean}>(`SELECT has_function_privilege($1,'public.avatar_allow_auth_attempt(text,integer,integer)','EXECUTE') AS allowed`, [role]);
                expect(functions.rows[0].allowed).toBe(false);
            }
        } finally { await db.close(); }
    });
    it('atomically bounds authentication attempts and permits only one open order per person and mode', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;'); await db.exec(sql);
            const query = () => db.query<{allowed:boolean}>("SELECT avatar_allow_auth_attempt('avatar:hashed-mail',2,300) AS allowed");
            expect((await query()).rows[0].allowed).toBe(true);
            expect((await query()).rows[0].allowed).toBe(true);
            expect((await query()).rows[0].allowed).toBe(false);
            const id = 'eaa62e24-25f9-42bd-93af-63127dd50001';
            await db.query("INSERT INTO avatar_principals(id,email) VALUES($1,'person@example.test')", [id]);
            const insert = (order:string,isTest:boolean) => db.query(`INSERT INTO avatar_orders(id,principal_id,email,fullname,customer_type,billing_name,billing_address,country,base_amount,terms_version,seller,is_test)
                VALUES($1,$2,'person@example.test','Person','individual','Person','{}','CZ',100000,'v1','{}',$3)`,[order,id,isTest]);
            await insert('eaa62e24-25f9-42bd-93af-63127dd50002',false);
            await expect(insert('eaa62e24-25f9-42bd-93af-63127dd50003',false)).rejects.toThrow();
            await insert('eaa62e24-25f9-42bd-93af-63127dd50004',true);
            await expect(db.query("UPDATE avatar_orders SET terms_version='changed' WHERE id='eaa62e24-25f9-42bd-93af-63127dd50002'")).rejects.toThrow('immutable');
            await db.query("UPDATE avatar_orders SET status='active',revision=1 WHERE id='eaa62e24-25f9-42bd-93af-63127dd50002'");
            await db.query("INSERT INTO avatar_invoices(stripe_invoice_id,order_id,paid_at,paid_through,amount_paid,refunded_amount,currency) VALUES('in_avatar','eaa62e24-25f9-42bd-93af-63127dd50002',now(),now()+interval '1 month',100000,50000,'czk')");
            await db.query("INSERT INTO avatar_invoices(stripe_invoice_id,order_id,paid_at,paid_through,amount_paid,refunded_amount,currency) VALUES('in_avatar','eaa62e24-25f9-42bd-93af-63127dd50002',now(),now()+interval '1 month',100000,0,'czk') ON CONFLICT(stripe_invoice_id) DO UPDATE SET refunded_amount=EXCLUDED.refunded_amount");
            expect((await db.query<{refunded_amount:number}>("SELECT refunded_amount FROM avatar_invoices WHERE stripe_invoice_id='in_avatar'")).rows[0].refunded_amount).toBe(50000);
        } finally { await db.close(); }
    });
});
