import { findWorkshopById, getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { ensureWorkshopCommentShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadWorkshopAgentContext } from './workshopAgentContext';
import { generateWorkshopAgentReply } from './workshopAgentRuntime';
import { isWorkshopAgentConfigured, isWorkshopAgentLiveAudioAllowed, isWorkshopAgentRoomEnabled } from './workshopAgentPolicy';
import type { WorkshopAgentJob } from './workshopAgentTypes';

const MAXIMAL_JOBS_PER_PASS = 2;
const WORKER_INTERVAL_MILLISECONDS = 5_000;
let isWorkerRunning = false;
let workerInterval: ReturnType<typeof setInterval> | undefined;

async function finishJob(supabase: SupabaseClient, job: WorkshopAgentJob, body: string | null, errorCode: string | null = null): Promise<string | null> {
    const { data, error } = await supabase.rpc('finish_workshop_agent_job', {
        target_job_id: job.id, target_lease_token: job.lease_token, target_body: body, target_error_code: errorCode,
    });
    if (error) throw new Error('completion_unavailable');
    return typeof data === 'string' ? data : null;
}

export async function processWorkshopAgentJob(supabase: SupabaseClient, job: WorkshopAgentJob): Promise<void> {
    const room = await findWorkshopById(supabase, job.workshop_id);
    if (room === null || !isWorkshopAgentRoomEnabled(room) || job.source_body === null ||
        (job.transcript_id !== null && !isWorkshopAgentLiveAudioAllowed(room))) {
        await finishJob(supabase, job, null);
        return;
    }
    let body: string | null;
    try {
        const context = await loadWorkshopAgentContext(supabase, room, job);
        body = context === null ? null : await generateWorkshopAgentReply(job, context);
    } catch {
        // Never persist provider errors: they may contain Books, prompts or credentials.
        await finishJob(supabase, job, null, 'generation_failed');
        return;
    }
    const commentId = await finishJob(supabase, job, body);
    if (commentId === null || body === null) return;
    // Use the ordinary synthetic-comment link and refresh paths. Their failure must
    // never retry an already committed reply; state loading repairs short links.
    await ensureWorkshopCommentShortLinks(supabase, {
        workshopSlug: room.slug, workshopKind: room.room_kind, commentId, bodyMarkdown: body,
    });
    await broadcastWorkshopEvent(supabase, room, { kind: 'state-changed' });
}

/** Database leases and unique reply keys, rather than this local guard, provide correctness across servers. */
export async function runWorkshopAgentJobs(workshopId?: string): Promise<void> {
    if (isWorkerRunning || !isWorkshopAgentConfigured()) return;
    isWorkerRunning = true;
    try {
        const supabase = getWorkshopDatabaseOrNull();
        if (supabase === null) return;
        for (let jobIndex = 0; jobIndex < MAXIMAL_JOBS_PER_PASS; jobIndex += 1) {
            const { data, error } = await supabase.rpc('claim_workshop_agent_job', { target_workshop_id: workshopId ?? null });
            if (error) throw new Error('queue_unavailable');
            if (data === null) break;
            await processWorkshopAgentJob(supabase, data as WorkshopAgentJob);
        }
    } catch {
        console.warn('Workshop agent processing unavailable; the durable queue will retry.');
    } finally {
        isWorkerRunning = false;
    }
}

/** Long-running Next.js servers keep working even when the admin closes the dashboard. */
export function startWorkshopAgentWorker(): void {
    if (workerInterval !== undefined || !isWorkshopAgentConfigured() || process.env.NODE_ENV === 'test' ||
        process.env.NEXT_PHASE === 'phase-production-build' || process.env.WORKSHOP_AGENT_BACKGROUND_WORKER === 'false') return;
    workerInterval = setInterval(() => { void runWorkshopAgentJobs(); }, WORKER_INTERVAL_MILLISECONDS);
    workerInterval.unref();
}
