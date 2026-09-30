import 'server-only';

import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopRecordingReadable } from '@/lib/workshops/workshopPaidMembersVideo';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { getHostedRecordingRevision, type HostedRecordingRevisionRow } from './hostedRecordingRequest';
import { getHostedRecordingObject } from './hostedRecordingStorage';
import type { HostedRecordingAssetRow, HostedRecordingPlayerMetadata } from './hostedRecordingValidation';
import { getHostedRecordingLiveSegmentIndex, getHostedRecordingLiveWindow,
    HOSTED_RECORDING_LIVE_SEGMENT_SECONDS, type HostedRecordingLiveWindow } from './hostedRecordingTimeline';
import { ALL_FORMATS, BlobSource, BufferTarget, Conversion, CustomSource, EncodedPacketSink, Input, Mp4OutputFormat, Output,
    WebMOutputFormat } from 'mediabunny';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SUPERSEDED_VIEWER_GRACE_MILLISECONDS = 24 * 60 * 60 * 1000;
const MAXIMUM_DELIVERY_RANGE_BYTES = 4 * 1024 * 1024;
const MAXIMUM_SEGMENT_BYTES = 16 * 1024 * 1024;
const MAXIMUM_SEGMENT_SOURCE_BYTES = 64 * 1024 * 1024;
const MAXIMUM_CACHED_SEGMENTS = 8;
const SEGMENT_CACHE = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

export type AuthorizedHostedRecording = {
    readonly revision: HostedRecordingRevisionRow;
    readonly supabase: SupabaseClient;
    readonly isLiveWindowLocked: boolean;
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
    return { revision, supabase, isLiveWindowLocked: phase === 'ongoing' && !isPaidMember };
}

export function isAuthorizedHostedRecording(value: AuthorizedHostedRecording | NextResponse):
    value is AuthorizedHostedRecording { return !(value instanceof NextResponse); }

export function getAuthorizedHostedRecordingManifest(authorized: AuthorizedHostedRecording) {
    return { ...authorized.revision.player_metadata, delivery: {
        mode: authorized.isLiveWindowLocked ? 'live-window' as const : 'full' as const,
        segmentSeconds: HOSTED_RECORDING_LIVE_SEGMENT_SECONDS, serverTime: new Date().toISOString(),
    } };
}

/** A completed upload can be scheduled as live viewing only through this bounded segment path. */
export function authorizeHostedRecordingSegment(authorized: AuthorizedHostedRecording, requestedIndex: number):
    NextResponse | null {
    if (!authorized.isLiveWindowLocked) return null;
    const metadata = authorized.revision.player_metadata as HostedRecordingPlayerMetadata | null;
    if (!metadata || !Number.isSafeInteger(requestedIndex) || requestedIndex < 0)
        return NextResponse.json({ error: 'Segment unavailable' }, { status: 404 });
    const currentIndex = getHostedRecordingLiveSegmentIndex(metadata, Date.now());
    if (currentIndex === -2) return NextResponse.json({ error: 'Live recording has finished' },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
    if (currentIndex < 0) return NextResponse.json({ error: 'Live segment not yet available' },
        { status: 425, headers: { 'Cache-Control': 'private, no-store', 'Retry-After': '1' } });
    if (requestedIndex !== currentIndex) return NextResponse.json({ error: 'Outside live window' },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
    if (!getHostedRecordingLiveWindow(metadata, requestedIndex))
        return NextResponse.json({ error: 'Segment not uploaded' },
            { status: 425, headers: { 'Cache-Control': 'private, no-store', 'Retry-After': '1' } });
    return null;
}

async function prepareHostedRecordingSegment(asset: HostedRecordingAssetRow, window: HostedRecordingLiveWindow):
    Promise<Uint8Array<ArrayBuffer>> {
    let sourceBytesRead = 0;
    const source = new CustomSource({
        getSize: () => asset.byte_length,
        maxCacheSize: MAXIMUM_DELIVERY_RANGE_BYTES,
        read: async (start, end) => {
            sourceBytesRead += end - start;
            if (sourceBytesRead > MAXIMUM_SEGMENT_SOURCE_BYTES)
                throw new Error('Segment exceeded the bounded source-read limit.');
            const response = await getHostedRecordingObject(asset.object_key, `bytes=${start}-${end - 1}`);
            if (!response.Body || response.ContentLength !== end - start)
                throw new Error('Segment source range is incomplete.');
            return response.Body.transformToWebStream() as ReadableStream<Uint8Array>;
        },
    });
    const input = new Input({ formats: ALL_FORMATS, source });
    const target = new BufferTarget();
    const output = new Output({ format: asset.content_type.startsWith('video/mp4') ?
        new Mp4OutputFormat() : new WebMOutputFormat(), target });
    let conversion: Conversion | null = null;
    try {
        const start = window.startSeconds;
        const segmentDurationSeconds = window.endSeconds - start;
        conversion = await Conversion.init({ input, output,
            trim: { start, end: start + segmentDurationSeconds },
            // Shrinking at key frames is mandatory: expanding would disclose adjacent media.
            copy: { mode: 'forced', boundaryPolicy: 'shrink' }, showWarnings: false });
        if (!conversion.isValid || conversion.discardedTracks.length > 0)
            throw new Error('No independently decodable segment is available at this boundary.');
        await conversion.execute();
        if (!target.buffer || target.buffer.byteLength < 100 || target.buffer.byteLength > MAXIMUM_SEGMENT_BYTES)
            throw new Error('Live segment has no bounded media.');
        const prepared = new Input({ formats: ALL_FORMATS, source: new BlobSource(new Blob([target.buffer])) });
        try {
            const measuredDurationSeconds = await prepared.getDurationFromMetadata();
            const videoTrack = (await prepared.getVideoTracks())[0];
            const audioTrack = (await prepared.getAudioTracks())[0];
            const videoPackets = videoTrack ? new EncodedPacketSink(videoTrack) : null;
            const audioPackets = audioTrack ? new EncodedPacketSink(audioTrack) : null;
            const firstPacket = videoPackets ? await videoPackets.getFirstPacket() : null;
            const lastPacket = videoPackets ? await videoPackets.getPacket(Infinity) : null;
            const firstAudioPacket = audioPackets ? await audioPackets.getFirstPacket() : null;
            const lastAudioPacket = audioPackets ? await audioPackets.getPacket(Infinity) : null;
            if (measuredDurationSeconds === null || measuredDurationSeconds < segmentDurationSeconds - 0.1 ||
                measuredDurationSeconds > segmentDurationSeconds + 0.01 ||
                !firstPacket || firstPacket.type !== 'key' || firstPacket.timestamp > 0.1 ||
                !lastPacket || lastPacket.timestamp + lastPacket.duration < segmentDurationSeconds - 0.1 ||
                audioPackets && (!firstAudioPacket || firstAudioPacket.timestamp > 0.1 ||
                    !lastAudioPacket || lastAudioPacket.timestamp + lastAudioPacket.duration <
                    segmentDurationSeconds - 0.1))
                throw new Error('The source has no frame-accurate live segment at this boundary.');
        } finally { prepared.dispose(); }
        return new Uint8Array(target.buffer);
    } finally {
        await conversion?.cancel().catch(() => undefined);
        input.dispose();
    }
}

function getPreparedSegment(asset: HostedRecordingAssetRow, segmentIndex: number,
    window: HostedRecordingLiveWindow): Promise<Uint8Array<ArrayBuffer>> {
    const key = `${asset.object_key}:${segmentIndex}`;
    const cached = SEGMENT_CACHE.get(key);
    if (cached) return cached;
    const prepared = prepareHostedRecordingSegment(asset, window).catch((error: unknown) => {
        SEGMENT_CACHE.delete(key);
        throw error;
    });
    SEGMENT_CACHE.set(key, prepared);
    if (SEGMENT_CACHE.size > MAXIMUM_CACHED_SEGMENTS) SEGMENT_CACHE.delete(SEGMENT_CACHE.keys().next().value!);
    return prepared;
}

export async function createHostedRecordingLiveSegmentResponse(request: NextRequest,
    asset: HostedRecordingAssetRow, segmentIndex: number, window: HostedRecordingLiveWindow,
    isHead = false): Promise<NextResponse> {
    try {
        const bytes = await getPreparedSegment(asset, segmentIndex, window);
        const range = request.headers.get('range');
        const match = range?.match(/^bytes=(\d+)-(\d*)$/);
        const start = match ? Number(match[1]) : 0;
        const end = match?.[2] ? Number(match[2]) : bytes.byteLength - 1;
        if (range && !match || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
            start < 0 || start >= bytes.byteLength || end < start || end >= bytes.byteLength)
            return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}`,
                'Cache-Control': 'private, no-store' } });
        const headers = { 'Content-Type': asset.content_type, 'Content-Length': String(end - start + 1),
            'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}` } : {}),
            'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
        return new NextResponse(isHead ? null : bytes.slice(start, end + 1), { status: range ? 206 : 200, headers });
    } catch {
        return NextResponse.json({ error: 'Live segment is buffering or unavailable' },
            { status: 503, headers: { 'Cache-Control': 'private, no-store', 'Retry-After': '1' } });
    }
}

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
