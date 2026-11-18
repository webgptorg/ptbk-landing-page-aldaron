import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
const migration = (name:string) => readFileSync(new URL(`../../migrations/${name}`, import.meta.url),'utf8');
const caps = {engineProjects:1,specialists:10,controllingUsers:5,harnessInstances:null,browserProfiles:5,remoteControl:true};

it('creates, edits, revokes, reactivates and soft deletes audited rights without a purchase; isolates modes and rejects stale edits',async () => {
    const db = new PGlite();
    try {
        await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
            CREATE TABLE promptbook_orders(id uuid PRIMARY KEY,email text,is_test boolean,created_at timestamptz DEFAULT now(),status text,plan text,
             confirmed_at timestamptz,paid_through timestamptz,revision integer DEFAULT 0,stripe_subscription_id text,stripe_customer_id text,stripe_session_id text,cancel_at_period_end boolean DEFAULT false,discount_code text,base_amount integer);
            CREATE TABLE promptbook_invoices(order_id uuid,paid_through timestamptz,amount_paid integer,refunded_amount integer);
            CREATE TABLE community_memberships(id uuid PRIMARY KEY,email text,is_test_payment boolean,created_at timestamptz,status text,plan_id text,community_id text,
             stripe_subscription_id text,stripe_customer_id text,stripe_checkout_session_id text,current_period_ends_at timestamptz,is_cancellation_scheduled boolean,discount_code text,monthly_price_czk integer);
            CREATE TABLE avatar_orders(id uuid PRIMARY KEY,email text,is_test boolean,created_at timestamptz,status text,stripe_subscription_id text,stripe_customer_id text,
             stripe_session_id text,paid_through timestamptz,cancel_at_period_end boolean,discount_code text,base_amount integer,currency text);
            CREATE TABLE "Contact"(email text,"appName" text,"placeName" text,"isContacted" boolean,"isWaitlisted" boolean,"userNote" text,"submissionEvidence" jsonb);
        `);
        await db.exec(migration('2026-11-1300-promptbook-license-accounts.sql'));
        await db.exec(migration('2026-11-1830-license-administration.sql'));
        const mutate = (action:string,id:string|null,revision:number|null,mode=false) => db.query<{id:string}>(
            'SELECT admin_mutate_promptbook_grant($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) AS id',
            [action,'customer@example.test',id,revision,'custom','Pilot Business',JSON.stringify(caps),10,'2026-11-01T00:00:00Z','2027-11-01T00:00:00Z','Partner pilot agreement','admin',mode]);
        const requestId='4408b4d6-6005-4b77-97eb-fdd67847ee91';
        const id=(await mutate('grant',requestId,null)).rows[0]!.id;
        expect((await mutate('grant',requestId,null)).rows[0]!.id).toBe(id);
        expect((await db.query('SELECT * FROM promptbook_license_grant_history')).rows).toHaveLength(1);
        expect((await db.query('SELECT * FROM promptbook_orders')).rows).toHaveLength(0);
        expect((await db.query('SELECT * FROM promptbook_invoices')).rows).toHaveLength(0);
        expect((await db.query('SELECT * FROM promptbook_admin_subscriptions')).rows).toHaveLength(0);
        expect((await db.query('SELECT state,source,order_id,label FROM promptbook_admin_licenses WHERE id=$1',[id])).rows[0]).toEqual({state:'active',source:'manual',order_id:null,label:'Pilot Business'});
        await mutate('update',id,1);
        await expect(mutate('revoke',id,1)).rejects.toThrow('Grant changed');
        await expect(mutate('revoke',id,2,true)).rejects.toThrow('Grant not found');
        await mutate('revoke',id,2);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[id])).rows[0]).toEqual({state:'revoked'});
        await mutate('restore',id,3);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[id])).rows[0]).toEqual({state:'active'});
        await mutate('delete',id,4);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[id])).rows[0]).toEqual({state:'deleted'});
        await expect(mutate('restore',id,5)).rejects.toThrow('Grant is read only');
        expect((await db.query<{action:string}>('SELECT action FROM promptbook_license_grant_history ORDER BY id')).rows.map((row) => row.action)).toEqual(['grant','update','revoke','restore','delete']);
        expect((await db.query('SELECT before_value IS NULL AS empty FROM promptbook_license_grant_history ORDER BY id LIMIT 1')).rows[0]).toEqual({empty:true});
        await db.exec('SET ROLE anon');
        await expect(db.query('SELECT * FROM promptbook_admin_licenses')).rejects.toThrow('permission denied');
        await expect(db.query('SELECT * FROM promptbook_admin_subscriptions')).rejects.toThrow('permission denied');
        await expect(mutate('grant',null,null)).rejects.toThrow('permission denied');
        await db.exec('RESET ROLE');
        // Paid licence projection preserves a zero invoice but revokes a fully refunded positive one.
        const order='4408b4d6-6005-4b77-97eb-fdd67847ee92';
        await db.query(`INSERT INTO promptbook_orders(id,email,is_test,status,plan,confirmed_at,paid_through,stripe_subscription_id) VALUES($1,'paid@example.test',false,'active','business','2026-11-01','2027-11-01','sub_test')`,[order]);
        await db.query(`INSERT INTO promptbook_invoices VALUES($1,'2027-11-01',199900,199900)`,[order]);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[order])).rows[0]).toEqual({state:'revoked'});
        await db.query('UPDATE promptbook_invoices SET amount_paid=0,refunded_amount=0 WHERE order_id=$1',[order]);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[order])).rows[0]).toEqual({state:'active'});
        await db.query('UPDATE promptbook_invoices SET paid_through=$1 WHERE order_id=$2',['2027-10-01',order]);
        expect((await db.query('SELECT state FROM promptbook_admin_licenses WHERE id=$1',[order])).rows[0]).toEqual({state:'unverified'});
    } finally { await db.close(); }
},30000);
