import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAVOL_MESSAGE_AGENT_ID } from './messageModel';
const migration = readFileSync('migrations/2026-10-3100-expanded-messages.sql', 'utf8');
const audioLeaseMigration = readFileSync('migrations/2026-11-0100-message-audio-generation-lease.sql', 'utf8');
const make = (code: string) => `SELECT save_expanded_message(NULL,'Subject','Message','Large context','Specific opening','subject','pavolhejny.cz','${PAVOL_MESSAGE_AGENT_ID}','${code}') AS id`;

describe('messages and the shared shortcode registry', () => {
    it.each([
        [false, false], [true, false], [false, true], [true, true],
    ])('repairs audio lease columns without losing recordings or active leases (token=%s, expiry=%s)', async (hasToken, hasExpiry) => {
        const db = new PGlite();
        try {
            await db.exec(`CREATE TABLE messages (id uuid PRIMARY KEY, markdown text, audio jsonb);
                ${hasToken ? 'ALTER TABLE messages ADD COLUMN audio_generation_token uuid;' : ''}
                ${hasExpiry ? 'ALTER TABLE messages ADD COLUMN audio_generation_until timestamptz;' : ''}`);
            const id = 'ad4985af-0789-4927-ad14-5e21f5ec5660';
            const token = '3fec229c-724d-498d-b5c7-f53196f36051';
            const audio = { key: 'messages/existing.mp3' };
            await db.query('INSERT INTO messages (id,markdown,audio) VALUES ($1,$2,$3)', [id, 'Existing message', audio]);
            await db.exec(audioLeaseMigration);
            const claim = (claimToken: string) => db.query(`UPDATE messages SET audio_generation_token=$2,
                audio_generation_until=now() + interval '10 minutes' WHERE id=$1
                AND (audio_generation_until IS NULL OR audio_generation_until < now()) RETURNING id`, [id, claimToken]);
            expect((await claim(token)).rows).toEqual([{ id }]);
            // Replaying the repair on an up-to-date deployment must not unlock a running generation.
            await db.exec(audioLeaseMigration);
            expect((await claim('593e330f-9886-43ea-ab93-c26934d38938')).rows).toEqual([]);
            expect((await db.query('SELECT markdown,audio,audio_generation_token FROM messages WHERE id=$1', [id])).rows)
                .toEqual([{ markdown: 'Existing message', audio, audio_generation_token: token }]);
            await db.exec("UPDATE messages SET audio_generation_until=now() - interval '1 minute'");
            expect((await claim(token)).rows).toEqual([{ id }]);
        } finally { await db.close(); }
    }, 30000);

    it('reserves atomically, protects unlisted content, keeps suffixes and deletes the same registry entry', async () => {
        const db = new PGlite();
        try {
            await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
                CREATE TABLE "ShortcodeLink"(id serial PRIMARY KEY, shortcode text UNIQUE, url text[],note text,"landingPage" text,type text,"ownerEmail" text,"isAdHoc" boolean,"sourceApp" text,
                    domains text[], CONSTRAINT "ShortcodeLink_sourceApp_valid" CHECK ("sourceApp" IN ('admin-shortener','online-workshop','community')));
                GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
                GRANT SELECT ON "ShortcodeLink" TO anon,authenticated; GRANT ALL ON "ShortcodeLink" TO service_role; GRANT ALL ON SEQUENCE "ShortcodeLink_id_seq" TO service_role;
                CREATE TABLE workshop_agents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text,book_source text,is_enabled boolean);
                CREATE TABLE admin_users(id uuid,permissions text[] CONSTRAINT admin_users_permissions_check CHECK (permissions <@ ARRAY['shortener']::text[]));
                INSERT INTO "ShortcodeLink"(shortcode,"sourceApp",url) VALUES ('subject-AbCd1234','admin-shortener',ARRAY['https://example.com']);`);
            await db.exec(migration);
            await expect(db.query(make('AbCd1234'))).rejects.toThrow();
            expect((await db.query('SELECT count(*)::int AS n FROM messages')).rows).toEqual([{ n: 0 }]);
            const { rows } = await db.query<{ id: string }>(make('EfGh5678'));
            const id = rows[0].id;
            const saved = (await db.query<{ shortcode: string; domains: string[] }>('SELECT shortcode,domains FROM "ShortcodeLink" WHERE "sourceApp"=\'messages\'')).rows[0];
            expect(saved).toEqual({ shortcode: 'subject-EfGh5678', domains: ['pavolhejny.cz'] });
            await db.query(`SELECT save_expanded_message($1,'Edited','New text','New context','Opening','edited','pavolhejny.com',$2,'ZZZZZZZZ')`, [id, PAVOL_MESSAGE_AGENT_ID]);
            expect((await db.query('SELECT shortcode,domains FROM "ShortcodeLink" WHERE "sourceApp"=\'messages\'')).rows[0]).toEqual({ shortcode: 'edited-EfGh5678', domains: ['pavolhejny.com'] });
            await expect(db.query('DELETE FROM workshop_agents WHERE id=$1', [PAVOL_MESSAGE_AGENT_ID])).rejects.toThrow();
            await db.exec('SET ROLE anon;');
            expect((await db.query('SELECT shortcode FROM "ShortcodeLink"')).rows).toEqual([{ shortcode: 'subject-AbCd1234' }]);
            await expect(db.query('SELECT context FROM messages')).rejects.toThrow();
            await expect(db.query(make('QqWw1122'))).rejects.toThrow();
            await db.exec('RESET ROLE;');
            expect((await db.query('SELECT delete_expanded_message($1) AS removed', [id])).rows).toEqual([{ removed: true }]);
            expect((await db.query('SELECT count(*)::int AS n FROM messages')).rows).toEqual([{ n: 0 }]);
            expect((await db.query('SELECT count(*)::int AS n FROM "ShortcodeLink"')).rows).toEqual([{ n: 1 }]);
        } finally { await db.close(); }
    }, 30000);
});
