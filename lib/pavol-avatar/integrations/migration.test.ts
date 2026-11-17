import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql = readFileSync('migrations/2026-11-1703-pavol-avatar-integrations.sql', 'utf8');
const userId = '11111111-1111-4111-8111-111111111111';
async function database() {
    const db = new PGlite();
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE TABLE public.avatar_principals(id uuid PRIMARY KEY, email text);`);
    await db.exec(sql);
    await db.exec(`INSERT INTO avatar_principals VALUES ('${userId}', 'member@example.com');`);
    return db;
}
describe('Private avatar integration migration', () => {
    it('atomically consumes a link code once, with expiry and no anonymous grants', async () => {
        const db = await database();
        try {
            await db.query('INSERT INTO pavol_avatar_telegram_codes(code_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'10 minutes\')', ['a'.repeat(64), userId]);
            const first = await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['a'.repeat(64), '1234']);
            expect(first.rows).toEqual([{ user_id: userId }]);
            expect((await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['a'.repeat(64), '5678'])).rows).toHaveLength(0);
            expect((await db.query('SELECT telegram_user_id,user_id FROM pavol_avatar_telegram_links')).rows).toEqual([{ telegram_user_id: '1234', user_id: userId }]);
            await db.query('INSERT INTO pavol_avatar_telegram_codes(code_hash,user_id,expires_at) VALUES ($1,$2,now()-interval \'1 minute\')', ['b'.repeat(64), userId]);
            expect((await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['b'.repeat(64), '5678'])).rows).toHaveLength(0);
            const grants = await db.query(`SELECT has_table_privilege('anon','pavol_avatar_tokens','SELECT') AS anon,
                has_table_privilege('authenticated','pavol_avatar_tokens','SELECT') AS authenticated,
                has_function_privilege('anon','avatar_consume_telegram_code(text,text)','EXECUTE') AS rpc,
                has_table_privilege('service_role','pavol_avatar_tokens','SELECT') AS service`);
            expect(grants.rows).toEqual([{ anon: false, authenticated: false, rpc: false, service: true }]);
        } finally { await db.close(); }
    });
    it('atomically rotates pairing codes and disconnect revokes pending codes with their links', async () => {
        const db = await database();
        try {
            const put = (hash: string) => db.query("INSERT INTO pavol_avatar_telegram_codes(code_hash,user_id,expires_at) VALUES ($1,$2,now()+interval '10 minutes') ON CONFLICT(user_id) DO UPDATE SET code_hash=excluded.code_hash, expires_at=excluded.expires_at", [hash, userId]);
            await put('a'.repeat(64)); await put('b'.repeat(64));
            expect((await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['a'.repeat(64), '1234'])).rows).toHaveLength(0);
            expect((await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['b'.repeat(64), '1234'])).rows).toEqual([{ user_id: userId }]);
            await put('c'.repeat(64));
            await db.query('SELECT avatar_disconnect_telegram_user($1)', ['1234']);
            expect((await db.query('SELECT * FROM pavol_avatar_telegram_links')).rows).toHaveLength(0);
            expect((await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['c'.repeat(64), '1234'])).rows).toHaveLength(0);
            await put('d'.repeat(64));
            await db.query('SELECT * FROM avatar_consume_telegram_code($1,$2)', ['d'.repeat(64), '5678']);
            await put('e'.repeat(64));
            await db.query('SELECT avatar_disconnect_telegram_account($1)', [userId]);
            expect((await db.query('SELECT * FROM pavol_avatar_telegram_codes')).rows).toHaveLength(0);
            expect((await db.query('SELECT * FROM pavol_avatar_telegram_links')).rows).toHaveLength(0);
        } finally { await db.close(); }
    });
    it('persists duplicate update suppression and resumes failed delivery without losing the reply', async () => {
        const db = await database();
        try {
            const claim1 = '22222222-2222-4222-8222-222222222222';
            const claim2 = '33333333-3333-4333-8333-333333333333';
            const claim = (owner: string, id: string) => db.query('SELECT * FROM avatar_claim_telegram_update($1,$2,$3)', [100, owner, id]);
            expect((await claim('1234', claim1)).rows).toEqual([{ claimed: true, response: null, sent_chunks: 0, pending: false }]);
            expect((await claim('1234', claim2)).rows[0]).toMatchObject({ claimed: false, pending: true });
            expect((await claim('5678', claim2)).rows[0]).toMatchObject({ claimed: false });
            await db.exec(`UPDATE pavol_avatar_telegram_updates SET response='A saved reply',sent_chunks=1,status='failed' WHERE update_id=100;`);
            expect((await claim('1234', claim2)).rows).toEqual([{ claimed: true, response: 'A saved reply', sent_chunks: 1, pending: false }]);
            await db.exec(`UPDATE pavol_avatar_telegram_updates SET status='completed' WHERE update_id=100;`);
            expect((await claim('1234', claim1)).rows[0]).toMatchObject({ claimed: false });
        } finally { await db.close(); }
    });
});
