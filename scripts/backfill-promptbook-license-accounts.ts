import 'dotenv/config';
import { Client } from 'pg';
import { requireDatabaseUrl } from '../lib/database/databaseUrl';
import { LICENSE_ACCOUNT_BACKFILL_APPLY_SQL, LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL } from '../lib/promptbook-licensing/accountBackfill';

async function main() {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--apply')) throw new Error('Usage: backfill-promptbook-license-accounts.ts [--apply]');
    const client = new Client({ connectionString: requireDatabaseUrl(undefined, 'inspect license account backfill') });
    await client.connect();
    try {
        await client.query(args.includes('--apply') ? 'BEGIN' : 'BEGIN READ ONLY');
        await client.query("SET LOCAL statement_timeout = '30s'");
        console.info('Missing license accounts (production/test counts only):',
            (await client.query(LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL)).rows);
        if (args.includes('--apply')) {
            console.info('Inserted license accounts:', (await client.query(LICENSE_ACCOUNT_BACKFILL_APPLY_SQL)).rows);
        }
        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK').catch(() => undefined);
        // Provider errors may include connection strings or customer rows. Do not print them.
        throw new Error('License account backfill failed; no changes committed. Inspect the database privately.');
    } finally {
        await client.end();
    }
}

void main().catch(() => {
    console.error('License account backfill unavailable. Check DATABASE_URL, permissions and schema privately.');
    process.exitCode = 1;
});
