import 'dotenv/config';
import { migrateDatabase } from '../lib/database/migrateDatabase';

async function main(): Promise<void> {
    if (process.argv.includes('--vercel-production-only') &&
        (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production')) {
        return;
    }

    try {
        const result = await migrateDatabase({ missingDatabaseUrl: 'throw' });

        if (result.appliedMigrations.length === 0) {
            console.info('Database migrations are up to date.');
        } else {
            console.info(`Applied ${result.appliedMigrations.length} database migration(s).`);
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
