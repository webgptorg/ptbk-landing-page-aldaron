import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAVOL_MESSAGE_AGENT_ID } from './messageModel';
const migration = readFileSync('migrations/2026-10-3100-expanded-messages.sql', 'utf8');
const make = (code: string) => `SELECT save_expanded_message(NULL,'Subject','Message','Large context','Specific opening','subject','pavolhejny.cz','${PAVOL_MESSAGE_AGENT_ID}','${code}') AS id`;

describe('messages and the shared shortcode registry', () => {
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
