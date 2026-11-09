import { timingSafeEqual } from 'node:crypto';
import { getTwentyContactSyncSettings, runTwentyContactSync } from '@/lib/crm/runTwentyContactSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET?.trim();
    const authorization = Buffer.from(request.headers.get('authorization') ?? '');
    const expected = Buffer.from(`Bearer ${secret ?? ''}`);
    if (!secret || authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = getTwentyContactSyncSettings();
        if (settings === null) return Response.json({ enabled: false });

        const result = await runTwentyContactSync(settings);
        if (result.failed > 0) console.error('Twenty contact sync failed to deliver records', result);
        return Response.json({ enabled: true, ...result }, { status: result.failed > 0 ? 502 : 200 });
    } catch {
        console.error('Twenty contact sync could not run');
        return Response.json({ error: 'Twenty contact sync could not run' }, { status: 502 });
    }
}
