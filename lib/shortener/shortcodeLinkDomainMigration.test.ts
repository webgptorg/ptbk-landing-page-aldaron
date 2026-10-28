import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { applyDatabaseMigrations, createMigrationFile } from '@/lib/database/migrateDatabase';

it('migrates existing links to all domains, preserves data and enforces valid explicit scopes', async () => {
    const database = new PGlite();
    try {
        await database.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
            CREATE TABLE "ShortcodeLink" (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, shortcode text UNIQUE, url text[]);
            INSERT INTO "ShortcodeLink" (shortcode,url) VALUES ('old',ARRAY['https://example.com']);
            GRANT SELECT ON "ShortcodeLink" TO anon;
        `);
        const client = { query: async (sql: string, values?: readonly unknown[]) => {
            if (values) return database.query<Record<string, unknown>>(sql, [...values]);
            const results = await database.exec(sql);
            return { rows: (results.at(-1)?.rows ?? []) as Record<string, unknown>[] };
        }, end: async () => undefined };
        const migrations = ['_initialize.sql', '2026-10-2802-shortener-domain-scopes.sql'].map((name) => createMigrationFile(name, readFileSync(`migrations/${name}`, 'utf8')));
        const logger = { info: () => undefined, warn: () => undefined, error: () => undefined };
        await applyDatabaseMigrations(client, migrations, logger);
        expect((await database.query('SELECT shortcode,url,domains FROM "ShortcodeLink"')).rows).toEqual([{ shortcode: 'old', url: ['https://example.com'], domains: null }]);
        expect((await applyDatabaseMigrations(client, migrations, logger)).appliedMigrations).toEqual([]);
        await database.query('INSERT INTO "ShortcodeLink" (shortcode,url) VALUES ($1,$2)', ['new', ['https://example.org']]);
        expect((await database.query('SELECT domains FROM "ShortcodeLink" WHERE shortcode=$1', ['new'])).rows).toEqual([{ domains: null }]);
        await database.query('UPDATE "ShortcodeLink" SET domains=$1 WHERE shortcode=$2', [['pavolhejny.cz', 'pavolhejny.com'], 'old']);
        for (const domains of [[], ['unknown.example'], [null]]) {
            await expect(database.query('UPDATE "ShortcodeLink" SET domains=$1', [domains])).rejects.toThrow();
        }
        await database.exec('SET ROLE anon;');
        expect((await database.query('SELECT domains FROM "ShortcodeLink" WHERE shortcode=$1', ['old'])).rows).toEqual([{ domains: ['pavolhejny.cz', 'pavolhejny.com'] }]);
        await expect(database.query('UPDATE "ShortcodeLink" SET domains=NULL')).rejects.toThrow();
    } finally { await database.close(); }
}, 30_000);
