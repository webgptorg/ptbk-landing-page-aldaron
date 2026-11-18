import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
import { LICENSE_ACCOUNT_BACKFILL_APPLY_SQL, LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL } from './accountBackfill';

it('previews without writes and backfills legacy accounts idempotently without changing payments or accepted terms', async () => {
    const db = new PGlite();
    try {
        await db.exec(`
            CREATE TABLE promptbook_license_accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                email text NOT NULL CHECK(email=lower(btrim(email))), is_test boolean NOT NULL,
                referral_code text, UNIQUE(email,is_test));
            CREATE TABLE promptbook_orders (id integer PRIMARY KEY, email text, is_test boolean,
                confirmed_at timestamptz, first_paid_at timestamptz, paid_through timestamptz, terms_version text);
            INSERT INTO promptbook_license_accounts(email,is_test,referral_code) VALUES ('existing@example.test',false,'keep');
            INSERT INTO promptbook_orders VALUES
                (1,'existing@example.test',false,now(),null,now(),'old-accepted-terms'),
                (2,'legacy@example.test',false,now(),null,now(),'v1'),
                (3,'legacy@example.test',false,now(),null,now(),'v2'),
                (4,'legacy@example.test',true,null,now(),now(),'sandbox'),
                (5,'unpaid@example.test',false,null,null,null,'pending'),
                (6,'future@example.test',false,now(),null,now()+interval '1 month','future');
        `);
        const ordersBefore = (await db.query('SELECT * FROM promptbook_orders ORDER BY id')).rows;
        expect((await db.query(LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL)).rows).toEqual([
            { is_test: false, missing_accounts: 2 }, { is_test: true, missing_accounts: 1 },
        ]);
        expect((await db.query('SELECT * FROM promptbook_license_accounts')).rows).toHaveLength(1);
        expect((await db.query(LICENSE_ACCOUNT_BACKFILL_APPLY_SQL)).rows).toEqual([
            { is_test: false, inserted_accounts: 2 }, { is_test: true, inserted_accounts: 1 },
        ]);
        expect((await db.query(LICENSE_ACCOUNT_BACKFILL_APPLY_SQL)).rows).toEqual([]);
        expect((await db.query(LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL)).rows).toEqual([]);
        expect((await db.query('SELECT * FROM promptbook_orders ORDER BY id')).rows).toEqual(ordersBefore);
        expect((await db.query("SELECT referral_code FROM promptbook_license_accounts WHERE email='existing@example.test'")).rows)
            .toEqual([{ referral_code: 'keep' }]);
        expect((await db.query("SELECT * FROM promptbook_license_accounts WHERE email='unpaid@example.test'")).rows).toEqual([]);
    } finally { await db.close(); }
}, 30_000);
