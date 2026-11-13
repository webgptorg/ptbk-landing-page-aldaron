import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
const migration = readFileSync(
    new URL('../../migrations/2026-11-1300-promptbook-license-accounts.sql', import.meta.url),
    'utf8',
);
it('activates once, atomically records the contact, isolates sandbox and allocates seats without overbooking', async () => {
    const db = new PGlite();
    try {
        await db.exec(
            `CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE TABLE promptbook_orders(id uuid primary key);CREATE TABLE "Contact"(email text,"appName" text,"placeName" text,"isContacted" boolean,"isWaitlisted" boolean,"userNote" text,"submissionEvidence" jsonb);`,
        );
        await db.exec(migration);
        const id = '4408b4d6-6005-4b77-97eb-fdd67847ee92';
        await db.query(
            `INSERT INTO promptbook_license_accounts(id,email,is_test) VALUES($1,'member@example.test',false)`,
            [id],
        );
        await db.query(`SELECT set_promptbook_customer_referral($1,'agency','link')`, [id]);
        await db.query(`SELECT set_promptbook_customer_referral($1,'agency','link')`, [id]);
        expect((await db.query('SELECT * FROM promptbook_referral_history')).rows).toHaveLength(1);
        await expect(db.query(`SELECT set_promptbook_customer_referral($1,'forged','admin')`, [id])).rejects.toThrow(
            'Invalid provenance',
        );
        expect(
            (await db.query('SELECT referral_code FROM promptbook_license_accounts WHERE id=$1', [id])).rows[0],
        ).toEqual({ referral_code: 'agency' });
        const activate = () =>
            db.query(
                `SELECT activate_promptbook_trial($1,'business-launch-2026','{}','{"marketingConsent":false}','{"engineReady":true}') AS id`,
                [id],
            );
        const first = await activate();
        expect((await activate()).rows).toEqual(first.rows);
        expect((await db.query('SELECT * FROM "Contact"')).rows).toHaveLength(1);
        expect(
            (await db.query('SELECT valid_until-valid_from AS duration FROM promptbook_license_grants')).rows[0],
        ).toEqual({ duration: '14 days' });
        expect(
            (await db.query('SELECT assign_promptbook_community_seat($1,$2,1) AS ok', [id, 'first@example.test']))
                .rows[0],
        ).toEqual({ ok: true });
        expect(
            (await db.query('SELECT assign_promptbook_community_seat($1,$2,1) AS ok', [id, 'second@example.test']))
                .rows[0],
        ).toEqual({ ok: false });
        await db.query(`INSERT INTO promptbook_license_accounts(email,is_test) VALUES('member@example.test',true)`);
        expect((await db.query('SELECT * FROM promptbook_license_accounts')).rows).toHaveLength(2);
        // Claim is one conditional write: wrong browser, expiration and replay cannot consume identity.
        await db.query(
            `INSERT INTO promptbook_app_tickets(token_hash,account_id,challenge,expires_at) VALUES($1,$2,$3,now()+interval '60 seconds')`,
            ['a'.repeat(64), id, 'b'.repeat(43)],
        );
        const claim = (challenge: string) =>
            db.query(
                `UPDATE promptbook_app_tickets SET consumed_at=now() WHERE token_hash=$1 AND challenge=$2 AND consumed_at IS NULL AND expires_at>now() RETURNING account_id`,
                ['a'.repeat(64), challenge],
            );
        expect((await claim('c'.repeat(43))).rows).toHaveLength(0);
        expect((await claim('b'.repeat(43))).rows).toHaveLength(1);
        expect((await claim('b'.repeat(43))).rows).toHaveLength(0);
        await db.query(`UPDATE promptbook_app_tickets SET consumed_at=NULL,expires_at=now()-interval '1 second'`);
        expect((await claim('b'.repeat(43))).rows).toHaveLength(0);
        await db.exec('SET ROLE anon');
        await expect(db.query('SELECT * FROM promptbook_license_accounts')).rejects.toThrow();
        await expect(
            db.query(`SELECT set_promptbook_customer_referral($1,'forged','customer')`, [id]),
        ).rejects.toThrow();
        await db.exec('RESET ROLE');
    } finally {
        await db.close();
    }
}, 30000);
