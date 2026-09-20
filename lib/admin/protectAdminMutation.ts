import { AdminSaveQueue } from './AdminSaveQueue';
import { registerAdminSaveQueue } from './adminPendingSaves';

/** Protect explicit actions while their request runs, without ever repeating creation or deletion. */
export async function protectAdminMutation<Result>(mutation: () => Promise<Result>): Promise<Result> {
    if (typeof window === 'undefined') return mutation();
    const request = mutation();
    const queue = new AdminSaveQueue('settled');
    queue.update('pending', async () => {
        // The caller owns action errors; an autosaving editor additionally retains its dirty draft.
        await request.catch(() => undefined);
        return true;
    });
    const unregister = registerAdminSaveQueue(queue);
    const protection = queue.flush();
    try {
        return await request;
    } finally {
        await protection;
        unregister();
    }
}
