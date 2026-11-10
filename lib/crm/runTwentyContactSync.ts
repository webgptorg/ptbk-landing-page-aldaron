import { runDatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { createTwentyContactApi, TwentyContactDeliveryError, type TwentyContactApiSettings } from './twentyContactApi';
import { mapTwentyContactSource } from './twentyContactSource';
import { acquireTwentyContactSyncLock, loadTwentyContactSyncRows, recordTwentyContactSyncResult } from './twentyContactSyncDatabase';

const MAXIMUM_BATCH_SIZE = 25;
const MAXIMUM_WORKER_MILLISECONDS = 25000;
const FIRST_RETRY_SECONDS = 300;
const MAXIMUM_RETRY_SECONDS = 3600;

export type TwentyContactSyncSettings = TwentyContactApiSettings & { from: string };

export function getTwentyContactSyncSettings(): TwentyContactSyncSettings | null {
    if (process.env.VERCEL_ENV === 'preview') return null;
    const key = process.env.TWENTY_CONTACT_SYNC_API_KEY?.trim();
    const ingressKey = process.env.TWENTY_CONTACT_SYNC_INGRESS_KEY?.trim();
    const from = process.env.TWENTY_CONTACT_SYNC_FROM?.trim();
    if (!key || !from) return null;
    if (!/T.+(?:Z|[+-]\d{2}:\d{2})$/.test(from) || !Number.isFinite(Date.parse(from))) {
        throw new Error('Invalid Twenty contact sync start time');
    }

    const url = new URL(process.env.TWENTY_CONTACT_SYNC_URL?.trim() || 'https://crm.ptbk.io');
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
        throw new Error('Invalid Twenty contact sync origin');
    }
    return { url, key, ingressKey, from };
}

export async function runTwentyContactSync(settings: TwentyContactSyncSettings) {
    return runDatabaseTransaction('synchronize contacts with Twenty', async (transaction) => {
        const result = { delivered: 0, needsReview: 0, failed: 0, skippedTests: 0, busy: false };
        if (!(await acquireTwentyContactSyncLock(transaction))) return { ...result, busy: true };
        const rows = await loadTwentyContactSyncRows(transaction, settings.from, MAXIMUM_BATCH_SIZE);
        const workerTimeout = AbortSignal.timeout(MAXIMUM_WORKER_MILLISECONDS);
        const signal = settings.signal ? AbortSignal.any([settings.signal, workerTimeout]) : workerTimeout;
        const api = createTwentyContactApi({ ...settings, signal });

        for (const row of rows) {
            if (signal.aborted) break;

            let errorCode: string | null = null;
            let retrySeconds: number | null = null;
            let shouldPauseBatch = false;

            try {
                const source = mapTwentyContactSource(row);
                if (source === 'test_contact') {
                    result.skippedTests++;
                } else if (await api.deliverSource(source) === 'unlinked') {
                    result.needsReview++;
                    errorCode = 'review_unlinked_identity';
                } else {
                    result.delivered++;
                }
            } catch (error) {
                const deliveryError = error instanceof TwentyContactDeliveryError ? error : null;
                errorCode = deliveryError?.code ?? 'unexpected_error';
                if (errorCode.startsWith('review_')) {
                    result.needsReview++;
                } else {
                    result.failed++;
                    console.warn('Twenty contact delivery failed', { code: errorCode, status: deliveryError?.status });
                    retrySeconds = Math.min(MAXIMUM_RETRY_SECONDS, FIRST_RETRY_SECONDS * 2 ** row.attempts);
                }
                const status = deliveryError?.status;
                shouldPauseBatch = errorCode === 'twenty_unreachable' || status === 401 || status === 403
                    || status === 404 || status === 429 || (status !== undefined && status >= 500);
            }

            await recordTwentyContactSyncResult(transaction, row, errorCode, retrySeconds);
            if (shouldPauseBatch) break;
        }

        return result;
    });
}
