import {
    applyDatabaseMigrations,
    createMigrationFile,
    readMigrationFiles,
    type MigrationDatabaseClient,
    type MigrationLogger,
} from '@/lib/database/migrateDatabase';
import { describe, expect, it, vi } from 'vitest';

const silentLogger: MigrationLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

function createFakeClient(options: {
    migrationTableExists?: boolean;
    recordedMigrations?: Record<string, string>;
} = {}): {
    readonly client: MigrationDatabaseClient;
    readonly executedSql: string[];
    readonly recorded: Record<string, string>;
} {
    const executedSql: string[] = [];
    const recorded = { ...options.recordedMigrations };
    let migrationTableExists = options.migrationTableExists ?? false;

    const client: MigrationDatabaseClient = {
        query: vi.fn(async (queryText, values) => {
            executedSql.push(queryText);

            if (queryText.includes('SELECT to_regclass')) {
                return { rows: [{ migration_table_exists: migrationTableExists }] };
            }

            if (queryText.includes('CREATE TABLE IF NOT EXISTS public."Migration"')) {
                migrationTableExists = true;
            }

            if (queryText.includes('SELECT name, checksum')) {
                return {
                    rows: Object.entries(recorded).map(([name, checksum]) => ({ name, checksum })),
                };
            }

            if (queryText.includes('INSERT INTO public."Migration"')) {
                const [name, checksum] = values ?? [];
                recorded[String(name)] = String(checksum);
            }

            return { rows: [] };
        }),
        end: vi.fn(async () => undefined),
    };

    return { client, executedSql, recorded };
}

const initializeMigration = createMigrationFile(
    '_initialize.sql',
    '-- The migration runner owns this transaction.\nBEGIN;\nCREATE TABLE IF NOT EXISTS public."Migration" (name text);\nCOMMIT;\n',
);

describe('applyDatabaseMigrations', () => {
    it('bootstraps the migration table, applies pending files in order, and records their checksums', async () => {
        const firstMigration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;');
        const secondMigration = createMigrationFile('2026-08-0200-second.sql', 'SELECT 2;');
        const { client, executedSql, recorded } = createFakeClient();

        const result = await applyDatabaseMigrations(
            client,
            [secondMigration, firstMigration, initializeMigration],
            silentLogger,
        );

        expect(result).toEqual({
            appliedMigrations: ['_initialize.sql', '2026-08-0100-first.sql', '2026-08-0200-second.sql'],
            skipped: false,
        });
        expect(executedSql.indexOf('SELECT 1;')).toBeLessThan(executedSql.indexOf('SELECT 2;'));
        expect(Object.keys(recorded)).toEqual(['_initialize.sql', '2026-08-0100-first.sql', '2026-08-0200-second.sql']);

        const executedInitializationSql = executedSql.find((sql) => sql.includes('CREATE TABLE IF NOT EXISTS public."Migration"'));
        expect(executedInitializationSql).toBeDefined();
        expect(executedInitializationSql).not.toMatch(/^\s*BEGIN\s*;/i);
        expect(executedInitializationSql).not.toMatch(/COMMIT\s*;\s*$/i);
        expect(executedSql.filter((sql) => sql === 'BEGIN;')).toHaveLength(1);
        const lockIndex = executedSql.findIndex((sql) => sql.includes('pg_advisory_xact_lock'));
        expect(executedSql.findIndex((sql) => sql.includes('pg_terminate_backend'))).toBeLessThan(lockIndex);
        expect(executedSql[lockIndex - 1]).toContain('SET LOCAL idle_in_transaction_session_timeout');
    });

    it('does not run an already recorded migration again', async () => {
        const migration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;');
        const { client, executedSql } = createFakeClient({
            migrationTableExists: true,
            recordedMigrations: {
                [initializeMigration.name]: initializeMigration.checksum,
                [migration.name]: migration.checksum,
            },
        });

        const result = await applyDatabaseMigrations(client, [migration, initializeMigration], silentLogger);

        expect(result.appliedMigrations).toEqual([]);
        expect(executedSql).not.toContain(migration.sql);
    });

    it('rejects a migration whose source changed after it was applied', async () => {
        const pendingMigration = createMigrationFile('2026-08-0000-pending.sql', 'SELECT pending;');
        const oldMigration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;');
        const changedMigration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 99;');
        const { client, executedSql } = createFakeClient({
            migrationTableExists: true,
            recordedMigrations: {
                [initializeMigration.name]: initializeMigration.checksum,
                [oldMigration.name]: oldMigration.checksum,
            },
        });

        await expect(
            applyDatabaseMigrations(client, [initializeMigration, pendingMigration, changedMigration], silentLogger),
        ).rejects.toThrow('was changed after it was applied');
        expect(executedSql).toContain('ROLLBACK;');
        expect(executedSql).not.toContain(pendingMigration.sql);
    });

    it('rejects an applied migration whose file was deleted', async () => {
        const { client, executedSql } = createFakeClient({
            migrationTableExists: true,
            recordedMigrations: {
                [initializeMigration.name]: initializeMigration.checksum,
                '2026-08-0100-deleted.sql': 'checksum',
            },
        });

        await expect(applyDatabaseMigrations(client, [initializeMigration], silentLogger)).rejects.toThrow(
            'is not present in migrations/',
        );
        expect(executedSql).toContain('ROLLBACK;');
    });

    it('uses the checked-in migrations with their comment-prefixed transaction wrappers removed', async () => {
        const migrations = await readMigrationFiles();
        const { client, executedSql } = createFakeClient();

        const result = await applyDatabaseMigrations(client, migrations, silentLogger);

        expect(result.appliedMigrations).toEqual(migrations.map((migration) => migration.name));
        expect(result.appliedMigrations[0]).toBe('_initialize.sql');
        expect(executedSql.filter((sql) => /^\s*BEGIN\s*;/i.test(sql))).toEqual(['BEGIN;']);
        expect(executedSql.filter((sql) => /^\s*COMMIT\s*;/i.test(sql))).toEqual(['COMMIT;']);
    });
});
