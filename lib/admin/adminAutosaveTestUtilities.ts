import { flushAdminSaves, getPendingAdminSaves } from './adminPendingSaves';

/** Release intentionally failed or unfinished mock saves between isolated component tests. */
export async function settleAdminSavesForTest(): Promise<void> {
    for (const queue of getPendingAdminSaves()) queue.update('test-finished', async () => true);
    await flushAdminSaves();
    await flushAdminSaves();
}
