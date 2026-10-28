import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyDatabaseMigrations, createMigrationFile } from '@/lib/database/migrateDatabase';

const NAME = '2026-10-2800-admin-users.sql';
const MIGRATION = createMigrationFile(NAME, readFileSync(`migrations/${NAME}`, 'utf8'));
const INITIALIZE = createMigrationFile('_initialize.sql', readFileSync('migrations/_initialize.sql', 'utf8'));
const HASH = `scrypt-32768-8-3:${'a'.repeat(32)}:${'b'.repeat(128)}`;
const quietLogger = { info: () => undefined, warn: () => undefined, error: () => undefined };

describe('private administrator migration', () => {
    it('upgrades an initialized database, preserves immutable history and enforces private account constraints', async () => {
        const database = new PGlite();
        try {
            await database.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
            const client = { query: async (sql: string, values?: readonly unknown[]) => {
                if (values !== undefined) return database.query<Record<string, unknown>>(sql, [...values]);
                const results = await database.exec(sql);
                return { rows: (results.at(-1)?.rows ?? []) as Record<string, unknown>[] };
            }, end: async () => undefined };
            await applyDatabaseMigrations(client, [INITIALIZE], quietLogger);
            expect((await applyDatabaseMigrations(client, [INITIALIZE, MIGRATION], quietLogger)).appliedMigrations).toEqual([NAME]);
            await database.query('INSERT INTO admin_users(username,password_hash,permissions) VALUES ($1,$2,$3)', ['links', HASH, ['shortener']]);
            expect((await applyDatabaseMigrations(client, [INITIALIZE, MIGRATION], quietLogger)).appliedMigrations).toEqual([]);
            expect((await database.query('SELECT username FROM admin_users')).rows).toEqual([{ username: 'links' }]);
            await expect(applyDatabaseMigrations(client, [INITIALIZE, createMigrationFile(NAME, MIGRATION.sql + '\n-- changed')], quietLogger)).rejects.toThrow('changed after it was applied');
            await expect(applyDatabaseMigrations(client, [INITIALIZE], quietLogger)).rejects.toThrow('not present');
            for (const username of ['admin', 'ADMIN', 'MixedCase', 'has space', 'ab']) {
                await expect(database.query('INSERT INTO admin_users(username,password_hash) VALUES ($1,$2)', [username, HASH])).rejects.toThrow();
            }
            for (const permissions of [['superadmin'], ['users'], [null]]) {
                await expect(database.query('UPDATE admin_users SET permissions=$1', [permissions])).rejects.toThrow();
            }
            const { rows } = await database.query<{ rls: boolean; anon_access: boolean; authenticated_access: boolean; service_access: boolean }>(`
                SELECT relrowsecurity AS rls,
                    has_table_privilege('anon', 'public.admin_users', 'SELECT') AS anon_access,
                    has_table_privilege('authenticated', 'public.admin_users', 'SELECT') AS authenticated_access,
                    has_table_privilege('service_role', 'public.admin_users', 'SELECT') AS service_access
                FROM pg_class WHERE oid='public.admin_users'::regclass`);
            expect(rows[0]).toEqual({ rls: true, anon_access: false, authenticated_access: false, service_access: true });
            await database.exec('SET ROLE anon;');
            await expect(database.query('SELECT password_hash FROM public.admin_users')).rejects.toThrow();
            await database.exec('RESET ROLE;');
        } finally { await database.close(); }
    }, 30_000);
});
