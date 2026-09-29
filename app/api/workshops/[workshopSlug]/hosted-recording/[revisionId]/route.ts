import { authorizeHostedRecording, isAuthorizedHostedRecording } from
    '@/lib/workshops/hostedRecording/hostedRecordingDelivery';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
type RouteContext = { readonly params: Promise<{ readonly workshopSlug: string; readonly revisionId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    const { workshopSlug, revisionId } = await context.params;
    const authorized = await authorizeHostedRecording(request, workshopSlug, revisionId);
    if (!isAuthorizedHostedRecording(authorized)) return authorized;
    if (!authorized.revision.player_metadata) return NextResponse.json({ error: 'Recording unavailable' }, { status: 404 });
    return NextResponse.json(authorized.revision.player_metadata, { headers: {
        'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff',
    } });
}
