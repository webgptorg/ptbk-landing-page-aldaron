import { createHostedRecordingRangeResponse } from '@/lib/workshops/hostedRecording/hostedRecordingDelivery';
import { getAdminHostedRecordingContext, getHostedRecordingAsset, getHostedRecordingRevision,
    isAdminHostedRecordingContext } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
type RouteContext = { readonly params: Promise<{ readonly workshopId: string; readonly revisionId: string;
    readonly assetId: string }> };

async function deliver(request: NextRequest, context: RouteContext, isHead = false) {
    const { workshopId, revisionId, assetId } = await context.params;
    const authorized = await getAdminHostedRecordingContext(request, workshopId);
    if (!isAdminHostedRecordingContext(authorized)) return authorized;
    const revision = await getHostedRecordingRevision(authorized.supabase, workshopId, revisionId);
    const asset = revision ? await getHostedRecordingAsset(authorized.supabase, revisionId, assetId) : null;
    if (!asset || asset.status !== 'complete' || !revision || revision.status === 'cancelled')
        return NextResponse.json({ error: 'Asset unavailable' }, { status: 404 });
    return createHostedRecordingRangeResponse(request, asset, isHead);
}

export async function GET(request: NextRequest, context: RouteContext) { return deliver(request, context); }
export async function HEAD(request: NextRequest, context: RouteContext) { return deliver(request, context, true); }
