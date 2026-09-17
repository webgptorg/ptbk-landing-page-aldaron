import { after } from 'next/server';
import { isWorkshopAgentConfigured } from './workshopAgentPolicy';

/** Request-scoped execution also works on hosts which freeze idle Node.js processes. */
export function scheduleWorkshopAgentWork(workshopId: string): void {
    if (!isWorkshopAgentConfigured()) return;
    after(async () => {
        const { runWorkshopAgentJobs } = await import('./workshopAgentWorker');
        await runWorkshopAgentJobs(workshopId);
    });
}
