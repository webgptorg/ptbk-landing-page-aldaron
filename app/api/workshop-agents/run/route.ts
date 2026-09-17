import { timingSafeEqual } from 'node:crypto';
import { runWorkshopAgentJobs } from '@/lib/workshops/agents/workshopAgentWorker';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Optional scheduler entry point for deployments which suspend idle processes. */
export async function POST(request: NextRequest) {
    const secret = process.env.WORKSHOP_AGENT_CRON_SECRET?.trim();
    const authorization = request.headers.get('authorization') ?? '';
    const expected = `Bearer ${secret ?? ''}`;
    if (!secret || Buffer.byteLength(authorization) !== Buffer.byteLength(expected) ||
        !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await runWorkshopAgentJobs();
    return NextResponse.json({ isProcessed: true });
}
