import 'server-only';

import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopRecordingReadable } from '@/lib/workshops/workshopPaidMembersVideo';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { getHostedRecordingRevision, type HostedRecordingRevisionRow } from './hostedRecordingRequest';
import { getHostedRecordingObject } from './hostedRecordingStorage';
import type { HostedRecordingAssetRow } from './hostedRecordingValidation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPERSEDED_VIEWER_GRACE_MILLISECONDS = 24 * 60 * 60 * 1000;
const MAXIMUM_DELIVERY_RANGE_BYTES = 4 * 1024 * 1024;

export type AuthorizedHostedRecording = {
    readonly revision: HostedRecordingRevisionRow;
    readonly supabase: SupabaseClient;
};

/** Every manifest and every media range calls this, independently of the room JSON. */
export async function authorizeHostedRecording(request: NextRequest, workshopSlug: string, revisionId: string):
    Promise<AuthorizedHostedRecording | NextResponse> {
    const authenticated = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticated)) return authenticated;
    const { workshopRow, participant, supabase } = authenticated;
    if (workshopRow.room_kind !== 'workshop' || workshopRow.video_source !== 'hosted')
        return NextResponse.json({ error: 'Recording unavailable' }, { status: 404 });
    const revision = await getHostedRecordingRevision(supabase, workshopRow.id, revisionId);
    if (!revision) return NextResponse.json({ error: 'Recording unavailable' }, { status: 404 });
    const isCurrent = revision.id === workshopRow.hosted_recording_revision_id && revision.status === 'published';
    const isGrace = revision.status === 'superseded' && revision.superseded_at !== null &&
        Date.now() - Date.parse(revision.superseded_at) < SUPERSEDED_VIEWER_GRACE_MILLISECONDS &&
        workshopRow.hosted_recording_revision_id !== null;
    if (!isCurrent && !isGrace) return NextResponse.json({ error: 'Recording unavailable' }, { status: 404 });
    const capabilities = getWorkshopKindCapabilities(workshopRow.room_kind);
    let isPaidMember = false;
    if (capabilities.isMembershipOffered) {
        const result = await loadCommunityMembershipByEmail(supabase, participant.email);
        if (result.errorMessage) return NextResponse.json({ error: 'Membership could not be checked' }, { status: 503 });
        isPaidMember = result.membership !== null && isPaidCommunityMembershipStatus(result.membership.status);
    }
    const phase = getWorkshopPhase({ startsAt: workshopRow.starts_at, endsAt: workshopRow.ends_at });
    const isWorkshopPast = isWorkshopPhasePast(phase);
    if (!isWorkshopRecordingReadable({ isWorkshopPast, isWorkshopUpcoming: phase !== 'ongoing' && !isWorkshopPast,
        isPaidMember, isMembershipOffered: capabilities.isMembershipOffered }))
        return NextResponse.json({ error: 'Paid membership required' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    return { revision, supabase };
}

export function isAuthorizedHostedRecording(value: AuthorizedHostedRecording | NextResponse):
    value is AuthorizedHostedRecording { return !(value instanceof NextResponse); }

/** Private S3 bytes pass through the authenticated origin. No object storage URL reaches the browser. */
export async function createHostedRecordingRangeResponse(request: NextRequest, asset: HostedRecordingAssetRow,
    isHead = false): Promise<NextResponse> {
    const range = request.headers.get('range');
    const match = range?.match(/^bytes=(\d*)-(\d*)$/);
    const isSuffix = match?.[1] === '';
    const suffixLength = isSuffix ? Number(match?.[2]) : 0;
    const start = isSuffix ? Math.max(0, asset.byte_length - Math.min(suffixLength, MAXIMUM_DELIVERY_RANGE_BYTES)) :
        match ? Number(match[1]) : 0;
    const requestedEnd = isSuffix || !match?.[2] ? asset.byte_length - 1 : Number(match[2]);
    if (range && (!match || match[1] === '' && match[2] === '') ||
        !Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) ||
        isSuffix && (!Number.isSafeInteger(suffixLength) || suffixLength < 1) ||
        start >= asset.byte_length || requestedEnd < start) {
        return new NextResponse(null, { status: 416, headers: {
            'Content-Range': `bytes */${asset.byte_length}`, 'Cache-Control': 'private, no-store',
        } });
    }
    const end = range ? Math.min(requestedEnd, asset.byte_length - 1,
        isSuffix ? asset.byte_length - 1 : start + MAXIMUM_DELIVERY_RANGE_BYTES - 1) : asset.byte_length - 1;
    const headers = {
        'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${asset.byte_length}` } : {}),
        'Content-Length': String(end - start + 1), 'Content-Type': asset.content_type,
        'Cache-Control': 'private, no-store', Vary: 'Cookie',
        'X-Content-Type-Options': 'nosniff',
    };
    const status = range ? 206 : 200;
    if (isHead) return new NextResponse(null, { status, headers });
    try {
        const object = await getHostedRecordingObject(asset.object_key, range ? `bytes=${start}-${end}` : undefined);
        if (!object.Body || object.ContentLength !== end - start + 1) throw new Error('Object storage returned an incomplete range.');
        return new NextResponse(object.Body.transformToWebStream() as ReadableStream<Uint8Array>, { status, headers });
    } catch {
        return NextResponse.json({ error: 'Recording bytes unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
