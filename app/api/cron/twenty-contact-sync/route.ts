import { runTwentyCommerceSync } from '@/lib/crm/runTwentyCommerceSync';
import { timingSafeEqual } from 'node:crypto';
import { getTwentyContactSyncSettings, runTwentyContactSync } from '@/lib/crm/runTwentyContactSync';
import { createTwentyContactApi, TwentyContactDeliveryError } from '@/lib/crm/twentyContactApi';

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

        if (new URL(request.url).searchParams.get('verify') === '1') {
            await createTwentyContactApi(settings).verifyConnectivity();
            return Response.json({ enabled: true, connected: true });
        }

        const result = await runTwentyContactSync(settings);
        if (result.failed > 0) console.error('Twenty contact sync failed to deliver records', result);
        const commerce = process.env.TWENTY_COMMERCE_SYNC_ENABLED === 'true' ? await runTwentyCommerceSync() : {enabled:false};
        return Response.json({ enabled: true, ...result, commerce }, { status: result.failed > 0 ? 502 : 200 });
    } catch (error) {
        if (error instanceof TwentyContactDeliveryError) {
            return Response.json({ connected: false, error: error.code }, { status: 502 });
        }
        console.error('Twenty contact sync could not run');
        return Response.json({ error: 'Twenty contact sync could not run' }, { status: 502 });
    }
}
