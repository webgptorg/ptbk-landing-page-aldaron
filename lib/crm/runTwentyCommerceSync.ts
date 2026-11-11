import { commerceTotals } from './commerceModel';
import Stripe from 'stripe';
import { runDatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { loadStripeCommerce } from './loadStripeCommerce';
import { syncTwentyCommerce } from './syncTwentyCommerce';
import { ensureTwentyCommerceSchema } from './twentyCommerceSchema';
import { getTwentyContactSyncSettings } from './runTwentyContactSync';

export async function runTwentyCommerceSync(options: { setup?: boolean; verify?: boolean; dryRun?: boolean } = {}) {
    const settings = getTwentyContactSyncSettings();
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (process.env.VERCEL_ENV !== 'production' || !settings || !key || !/^(sk|rk)_live_/.test(key)) {
        throw new Error('commerce_production_settings_required');
    }
    return runDatabaseTransaction('synchronize customer purchases with Twenty',async (database) => {
        const lock = await database.query<{acquired:boolean}>('SELECT pg_try_advisory_xact_lock($1::bigint) AS acquired',['7640674726340131228']);
        if (!lock.rows[0].acquired) return {busy:true};
        const stripe = new Stripe(key,{maxNetworkRetries:2,timeout:10000});
        const snapshot = await loadStripeCommerce(database,stripe);
        if (options.dryRun) return {mode:'dry-run',purchases:snapshot.purchases.length,payments:snapshot.payments.length,
            companyBuyers:new Set(snapshot.purchases.flatMap((purchase) => purchase.company ? [purchase.company.key] : [])).size,
            contacts:new Set(snapshot.purchases.flatMap((purchase) => purchase.email ? [purchase.email] : [])).size,
            totals:commerceTotals(snapshot.payments)};
        if (options.setup) await ensureTwentyCommerceSchema(settings,true);
        const first = await syncTwentyCommerce(settings,snapshot,options.verify);
        if (options.verify) {
            const replay = await syncTwentyCommerce(settings,snapshot,true);
            if (replay.writes !== 0) throw new Error('commerce_replay_changed_records');
            return {...first,replayWrites:replay.writes};
        }
        return first;
    });
}
