import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { DATABASE_URL_ENVIRONMENT_VARIABLE, resolveDatabaseUrl } from './databaseUrl';

const DATABASE_MIGRATIONS_TABLE = 'public."Migration"';
const INITIALIZE_MIGRATION_FILE_NAME = '_initialize.sql';
const DEFAULT_MIGRATIONS_DIRECTORY = path.resolve(process.cwd(), 'migrations');

// This lock makes migrations safe when several server instances start at once. It is transaction-scoped, which also
// works when DATABASE_URL points at Supabase's transaction pooler.
const DATABASE_MIGRATIONS_ADVISORY_LOCK_KEY = '734119762104';

const BEGIN_SQL = 'BEGIN;';
const COMMIT_SQL = 'COMMIT;';
const ROLLBACK_SQL = 'ROLLBACK;';
const IDLE_MIGRATION_TIMEOUT_SQL = "SET LOCAL idle_in_transaction_session_timeout = '45s';";

// Recover only abandoned connections using this runner's advisory lock. An interrupted serverless startup
// can leave its transaction open on the pooler after the JavaScript process stops running.
const END_ABANDONED_MIGRATIONS_SQL = `
WITH migration_connections AS MATERIALIZED (
    SELECT activity.pid, activity.state, activity.state_change, activity.query_start, activity.wait_event_type, locks.granted
    FROM pg_stat_activity AS activity
    JOIN pg_locks AS locks ON locks.pid = activity.pid
    WHERE activity.datname = current_database()
      AND activity.usename = current_user
      AND activity.pid <> pg_backend_pid()
      AND locks.locktype = 'advisory'
      AND locks.objsubid = 1
      AND ((locks.classid::bigint << 32) | locks.objid::bigint) = $1::bigint
), abandoned_holders AS (
    SELECT pid FROM migration_connections
    WHERE granted AND state IN ('idle in transaction', 'idle in transaction (aborted)')
      AND state_change < clock_timestamp() - interval '2 minutes'
), abandoned AS (
    SELECT pid, true AS granted FROM abandoned_holders
    UNION ALL
    SELECT pid, false FROM migration_connections
    WHERE NOT granted AND wait_event_type = 'Lock'
      AND query_start < clock_timestamp() - interval '2 minutes'
      AND EXISTS (SELECT 1 FROM abandoned_holders)
)
SELECT pg_terminate_backend(pid) AS terminated FROM abandoned ORDER BY granted ASC;`;

const READ_MIGRATION_TABLE_EXISTS_SQL = `
SELECT to_regclass('public."Migration"') IS NOT NULL AS migration_table_exists;`;

const READ_APPLIED_MIGRATIONS_SQL = `
SELECT name, checksum
FROM ${DATABASE_MIGRATIONS_TABLE}
ORDER BY name;`;

const RECORD_MIGRATION_SQL = `
INSERT INTO ${DATABASE_MIGRATIONS_TABLE} (name, checksum)
VALUES ($1, $2);`;

// Migration files may start and end with comments around their manually-runnable BEGIN/COMMIT wrapper.
const SQL_TRIVIA = String.raw`(?:(?:\s+)|(?:--[^\r\n]*(?:\r?\n|$))|(?:/\*[\s\S]*?\*/))*`;
const OUTER_TRANSACTION_START = new RegExp(
    String.raw`^(${SQL_TRIVIA})BEGIN(?:\s+(?:WORK|TRANSACTION))?\s*;`,
    'i',
);
const OUTER_TRANSACTION_END = new RegExp(
    String.raw`COMMIT(?:\s+(?:WORK|TRANSACTION))?\s*;(${SQL_TRIVIA})$`,
    'i',
);

export type MigrationLogger = {
    readonly info: (message: string) => void;
    readonly warn: (message: string) => void;
    readonly error: (message: string) => void;
};

export type MigrationFile = {
    readonly name: string;
    readonly sql: string;
    readonly checksum: string;
};

type MigrationQueryResult = {
    readonly rows: readonly Record<string, unknown>[];
};

export type MigrationDatabaseClient = {
    readonly query: (queryText: string, values?: readonly unknown[]) => Promise<MigrationQueryResult>;
    readonly end: () => Promise<void>;
};

export type MigrationDatabaseResult = {
    readonly appliedMigrations: readonly string[];
    readonly skipped: boolean;
};

export type MigrateDatabaseOptions = {
    readonly databaseUrl?: string | null;
    readonly migrationsDirectory?: string;
    readonly missingDatabaseUrl?: 'skip' | 'throw';
    readonly clientFactory?: (databaseUrl: string) => Promise<MigrationDatabaseClient>;
    readonly logger?: MigrationLogger;
};

const DEFAULT_LOGGER: MigrationLogger = {
    info: (message) => console.info(message),
    warn: (message) => console.warn(message),
    error: (message) => console.error(message),
};

/**
 * Turn a migration's source into the immutable value recorded in the database.
 * A migration may never be changed after it has run; add a new migration instead.
 */
export function createMigrationFile(name: string, sql: string): MigrationFile {
    return {
        name,
        sql,
        checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
    };
}

function compareMigrationNames(left: string, right: string): number {
    // `_initialize.sql` is the one intentional exception to ordinary filename order: it has to create the table that
    // records the remaining migrations before any of them is read from that table.
    if (left === INITIALIZE_MIGRATION_FILE_NAME) return right === INITIALIZE_MIGRATION_FILE_NAME ? 0 : -1;
    if (right === INITIALIZE_MIGRATION_FILE_NAME) return 1;

    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
}

function sortAndValidateMigrationFiles(migrations: readonly MigrationFile[]): readonly MigrationFile[] {
    const orderedMigrations = [...migrations].sort((left, right) => compareMigrationNames(left.name, right.name));
    const names = new Set<string>();

    for (const migration of orderedMigrations) {
        if (names.has(migration.name)) {
            throw new Error(`Duplicate database migration filename: ${migration.name}`);
        }

        names.add(migration.name);
    }

    if (!names.has(INITIALIZE_MIGRATION_FILE_NAME)) {
        throw new Error(`The required database migration "${INITIALIZE_MIGRATION_FILE_NAME}" is missing.`);
    }

    return orderedMigrations;
}

/**
 * Read every SQL migration from migrations/. Files are compared by their complete filename, so suffixes such as -0,
 * -1, and -2 remain part of their ordering.
 */
export async function readMigrationFiles(
    migrationsDirectory: string = DEFAULT_MIGRATIONS_DIRECTORY,
): Promise<readonly MigrationFile[]> {
    const entries = await readdir(migrationsDirectory, { withFileTypes: true });
    const migrationNames = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
        .map((entry) => entry.name)
        .sort(compareMigrationNames);

    return Promise.all(
        migrationNames.map(async (name) => {
            const contents = await readFile(path.join(migrationsDirectory, name));

            return {
                name,
                sql: contents.toString('utf8'),
                checksum: createHash('sha256').update(contents).digest('hex'),
            };
        }),
    );
}

function removeOuterTransactionWrapper(sql: string): string {
    const transactionStart = OUTER_TRANSACTION_START.exec(sql);
    const transactionEnd = OUTER_TRANSACTION_END.exec(sql);

    if (transactionStart === null && transactionEnd === null) {
        return sql;
    }

    if (transactionStart === null || transactionEnd === null || transactionEnd.index < transactionStart[0].length) {
        throw new Error(
            'A database migration must either have no transaction wrapper or wrap all of its SQL in one outer BEGIN/COMMIT pair.',
        );
    }

    const prefix = transactionStart[1];
    const migrationSqlStart = transactionStart[0].length;
    const migrationSqlEnd = transactionEnd.index;
    const suffix = transactionEnd[1];

    return `${prefix}${sql.slice(migrationSqlStart, migrationSqlEnd)}${suffix}`;
}

function readAppliedMigrations(rows: readonly Record<string, unknown>[]): Map<string, string> {
    const appliedMigrations = new Map<string, string>();

    for (const row of rows) {
        if (typeof row.name !== 'string' || typeof row.checksum !== 'string') {
            throw new Error(`The ${DATABASE_MIGRATIONS_TABLE} table contains an invalid migration record.`);
        }

        if (appliedMigrations.has(row.name)) {
            throw new Error(`The ${DATABASE_MIGRATIONS_TABLE} table contains migration "${row.name}" more than once.`);
        }

        appliedMigrations.set(row.name, row.checksum);
    }

    return appliedMigrations;
}

async function migrationTableExists(client: MigrationDatabaseClient): Promise<boolean> {
    const result = await client.query(READ_MIGRATION_TABLE_EXISTS_SQL);
    const migrationTableExists = result.rows[0]?.migration_table_exists;

    if (typeof migrationTableExists !== 'boolean') {
        throw new Error(`Could not determine whether the ${DATABASE_MIGRATIONS_TABLE} table exists.`);
    }

    return migrationTableExists;
}

async function applyMigration(
    client: MigrationDatabaseClient,
    migration: MigrationFile,
    appliedMigrations: string[],
    logger: MigrationLogger,
): Promise<void> {
    logger.info(`Applying database migration "${migration.name}"...`);

    const migrationSql = removeOuterTransactionWrapper(migration.sql);
    if (migrationSql.trim() !== '') {
        await client.query(migrationSql);
    }

    await client.query(RECORD_MIGRATION_SQL, [migration.name, migration.checksum]);
    appliedMigrations.push(migration.name);
    logger.info(`Applied database migration "${migration.name}".`);
}

/**
 * Apply migrations using an already-connected client.
 *
 * The PostgreSQL advisory lock, each migration, and its checksum record share one transaction. A failed migration
 * therefore rolls back together with its bookkeeping, and concurrent server starts cannot apply the same file twice.
 */
export async function applyDatabaseMigrations(
    client: MigrationDatabaseClient,
    migrations: readonly MigrationFile[],
    logger: MigrationLogger = DEFAULT_LOGGER,
): Promise<MigrationDatabaseResult> {
    const orderedMigrations = sortAndValidateMigrationFiles(migrations);
    const initializeMigration = orderedMigrations[0];
    const appliedMigrations: string[] = [];
    let transactionStarted = false;

    try {
        const recovery = await client.query(END_ABANDONED_MIGRATIONS_SQL, [DATABASE_MIGRATIONS_ADVISORY_LOCK_KEY]);
        const recovered = recovery.rows.filter(({ terminated }) => terminated === true).length;
        if (recovered > 0) logger.warn(`Closed ${recovered} abandoned database migration connections.`);

        await client.query(BEGIN_SQL);
        transactionStarted = true;

        await client.query(IDLE_MIGRATION_TIMEOUT_SQL);
        await client.query('SELECT pg_advisory_xact_lock($1::bigint);', [DATABASE_MIGRATIONS_ADVISORY_LOCK_KEY]);

        if (!(await migrationTableExists(client))) {
            await applyMigration(client, initializeMigration, appliedMigrations, logger);
        }

        const appliedRows = await client.query(READ_APPLIED_MIGRATIONS_SQL);
        const recordedMigrations = readAppliedMigrations(appliedRows.rows);
        const availableMigrationNames = new Set(orderedMigrations.map((migration) => migration.name));

        for (const recordedMigrationName of Array.from(recordedMigrations.keys())) {
            if (!availableMigrationNames.has(recordedMigrationName)) {
                throw new Error(
                    `The database records migration "${recordedMigrationName}", but that file is not present in migrations/.`,
                );
            }
        }

        // Validate the complete recorded history before executing anything new. The transaction would roll back a
        // partially applied batch, but refusing before the first pending SQL statement makes the invariant explicit.
        for (const migration of orderedMigrations) {
            const recordedChecksum = recordedMigrations.get(migration.name);

            if (recordedChecksum !== undefined && recordedChecksum !== migration.checksum) {
                throw new Error(
                    `Database migration "${migration.name}" was changed after it was applied. Add a new migration instead.`,
                );
            }
        }

        for (const migration of orderedMigrations) {
            const recordedChecksum = recordedMigrations.get(migration.name);

            if (recordedChecksum !== undefined) {
                continue;
            }

            await applyMigration(client, migration, appliedMigrations, logger);
        }

        await client.query(COMMIT_SQL);
        transactionStarted = false;

        return { appliedMigrations, skipped: false };
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query(ROLLBACK_SQL);
            } catch (rollbackError) {
                logger.error(
                    `Could not roll back the failed database migration transaction: ${
                        rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
                    }`,
                );
            }
        }

        throw error;
    }
}

async function createPostgresClient(databaseUrl: string): Promise<MigrationDatabaseClient> {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    return {
        query: async (queryText, values) => {
            const slowQueryTimer = setTimeout(() => {
                void logMigrationLockWaits(databaseUrl);
            }, 15_000);
            slowQueryTimer.unref();
            try {
                const result = values === undefined ? await client.query(queryText) : await client.query(queryText, [...values]);
                return { rows: result.rows as readonly Record<string, unknown>[] };
            } finally {
                clearTimeout(slowQueryTimer);
            }
        },
        end: () => client.end(),
    };
}

/** Diagnose a slow startup without logging SQL text, credentials or application records. */
async function logMigrationLockWaits(databaseUrl: string): Promise<void> {
    const diagnostics = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000, query_timeout: 5_000 });
    try {
        await diagnostics.connect();
        const result = await diagnostics.query(`
            SELECT activity.pid, activity.state, activity.wait_event_type, activity.wait_event,
                extract(epoch FROM now() - activity.xact_start)::int AS transaction_age_seconds,
                pg_blocking_pids(activity.pid) AS blocking_pids,
                locks.locktype, locks.mode, locks.granted, locks.relation::regclass::text AS relation
            FROM pg_stat_activity AS activity
            LEFT JOIN pg_locks AS locks ON locks.pid = activity.pid
            WHERE activity.datname = current_database()
                AND (cardinality(pg_blocking_pids(activity.pid)) > 0
                    OR activity.pid IN (SELECT unnest(pg_blocking_pids(pid)) FROM pg_stat_activity))
            ORDER BY activity.pid, locks.granted, locks.relation
            LIMIT 60;
        `);
        console.warn('Slow database migration lock diagnostics:', JSON.stringify(result.rows));
    } catch (error) {
        console.warn('Database migration lock diagnostics unavailable:', error instanceof Error ? error.name : 'Unknown error');
    } finally {
        await diagnostics.end().catch(() => undefined);
    }
}

/**
 * Apply all pending migrations from migrations/. The command-line entry point and the Next.js startup hook call this
 * same function so they cannot drift apart.
 */
export async function migrateDatabase(options: MigrateDatabaseOptions = {}): Promise<MigrationDatabaseResult> {
    const logger = options.logger ?? DEFAULT_LOGGER;
    const databaseUrl = resolveDatabaseUrl(options.databaseUrl);
    const missingDatabaseUrl = options.missingDatabaseUrl ?? 'throw';

    if (databaseUrl === undefined) {
        if (missingDatabaseUrl === 'skip') {
            logger.warn(`Database migrations skipped: ${DATABASE_URL_ENVIRONMENT_VARIABLE} is not configured.`);
            return { appliedMigrations: [], skipped: true };
        }

        throw new Error(`Cannot migrate the database: ${DATABASE_URL_ENVIRONMENT_VARIABLE} is not configured.`);
    }

    const migrations = await readMigrationFiles(options.migrationsDirectory);
    const client = await (options.clientFactory ?? createPostgresClient)(databaseUrl);

    try {
        return await applyDatabaseMigrations(client, migrations, logger);
    } finally {
        await client.end();
    }
}

let startupMigrationPromise: Promise<MigrationDatabaseResult> | undefined;

/**
 * Run migrations only once in the lifetime of one Node.js server process.
 */
export function migrateDatabaseOnStartup(): Promise<MigrationDatabaseResult> {
    if (startupMigrationPromise === undefined) {
        startupMigrationPromise = migrateDatabase({
            // Development remains usable for UI work without a database. A production process must never serve an
            // outdated schema merely because its deployment forgot DATABASE_URL.
            missingDatabaseUrl: process.env.NODE_ENV === 'production' ? 'throw' : 'skip',
        });
    }

    return startupMigrationPromise;
}
