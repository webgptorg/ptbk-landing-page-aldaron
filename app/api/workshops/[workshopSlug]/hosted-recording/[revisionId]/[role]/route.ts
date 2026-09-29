import { authorizeHostedRecording, createHostedRecordingRangeResponse,
    isAuthorizedHostedRecording } from '@/lib/workshops/hostedRecording/hostedRecordingDelivery';
import { getHostedRecordingAssets } from '@/lib/workshops/hostedRecording/hostedRecordingRequest';
import { HOSTED_RECORDING_VIDEO_ROLES } from '@/lib/workshops/hostedRecording/hostedRecordingValidation';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
type RouteContext = { readonly params: Promise<{ readonly workshopSlug: string; readonly revisionId: string;
    readonly role: string }> };

async function deliver(request: NextRequest, context: RouteContext, isHead = false) {
    const { workshopSlug, revisionId, role } = await context.params;
    if (!HOSTED_RECORDING_VIDEO_ROLES.includes(role as typeof HOSTED_RECORDING_VIDEO_ROLES[number]))
        return NextResponse.json({ error: 'Track unavailable' }, { status: 404 });
    const authorized = await authorizeHostedRecording(request, workshopSlug, revisionId);
    if (!isAuthorizedHostedRecording(authorized)) return authorized;
    const assets = await getHostedRecordingAssets(authorized.supabase, revisionId);
    const asset = assets.find((candidate) => candidate.role === role && candidate.status === 'complete');
    if (!asset) return NextResponse.json({ error: 'Track unavailable' }, { status: 404 });
    return createHostedRecordingRangeResponse(request, asset, isHead);
}

export async function GET(request: NextRequest, context: RouteContext) { return deliver(request, context); }
export async function HEAD(request: NextRequest, context: RouteContext) { return deliver(request, context, true); }
