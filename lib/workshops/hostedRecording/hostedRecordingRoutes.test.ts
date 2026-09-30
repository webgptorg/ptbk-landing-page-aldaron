import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const ROUTE_MOCKS = vi.hoisted(() => ({
    authorize: vi.fn(), getAssets: vi.fn(), createRange: vi.fn(), createLiveSegment: vi.fn(), authorizeSegment: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('./hostedRecordingDelivery', () => ({
    authorizeHostedRecording: ROUTE_MOCKS.authorize,
    authorizeHostedRecordingSegment: ROUTE_MOCKS.authorizeSegment,
    getAuthorizedHostedRecordingManifest: (authorized: { revision: { player_metadata: object } }) =>
        ({ ...authorized.revision.player_metadata, delivery: { mode: 'full' } }),
    isAuthorizedHostedRecording: (value: unknown) => !(value instanceof NextResponse),
    createHostedRecordingRangeResponse: ROUTE_MOCKS.createRange,
    createHostedRecordingLiveSegmentResponse: ROUTE_MOCKS.createLiveSegment,
}));
vi.mock('./hostedRecordingRequest', () => ({ getHostedRecordingAssets: ROUTE_MOCKS.getAssets }));

import { GET as getManifest } from '@/app/api/workshops/[workshopSlug]/hosted-recording/[revisionId]/route';
import { GET as getTrack, HEAD as headTrack } from
    '@/app/api/workshops/[workshopSlug]/hosted-recording/[revisionId]/[role]/route';

const MANIFEST_CONTEXT = { params: Promise.resolve({ workshopSlug: 'test-workshop', revisionId: 'revision-one' }) };
const TRACK_CONTEXT = { params: Promise.resolve({ workshopSlug: 'test-workshop',
    revisionId: 'revision-one', role: 'editor' }) };
const REQUEST = new NextRequest('https://ptbk.io/api/workshops/test-workshop/hosted-recording/revision-one/editor',
    { headers: { Range: 'bytes=0-1023' } });

describe('hosted recording participant routes', () => {
    beforeEach(() => {
        ROUTE_MOCKS.authorize.mockReset();
        ROUTE_MOCKS.getAssets.mockReset();
        ROUTE_MOCKS.createRange.mockReset();
        ROUTE_MOCKS.createLiveSegment.mockReset();
        ROUTE_MOCKS.authorizeSegment.mockReset().mockReturnValue(null);
    });

    it('blocks manifest, GET bytes, and HEAD bytes before looking up any asset', async () => {
        ROUTE_MOCKS.authorize.mockResolvedValue(new NextResponse(null, { status: 403 }));
        expect((await getManifest(REQUEST, MANIFEST_CONTEXT)).status).toBe(403);
        expect((await getTrack(REQUEST, TRACK_CONTEXT)).status).toBe(403);
        expect((await headTrack(REQUEST, TRACK_CONTEXT)).status).toBe(403);
        expect(ROUTE_MOCKS.getAssets).not.toHaveBeenCalled();
        expect(ROUTE_MOCKS.createRange).not.toHaveBeenCalled();
    });

    it('delivers only the authorized immutable revision and a completed video role', async () => {
        ROUTE_MOCKS.authorize.mockResolvedValue({ supabase: {}, isLiveWindowLocked: false, revision: {
            player_metadata: { schemaVersion: 1, durationSeconds: 10 },
        } });
        ROUTE_MOCKS.getAssets.mockResolvedValue([{ role: 'editor', status: 'complete', id: 'asset-one' }]);
        ROUTE_MOCKS.createRange.mockResolvedValue(new NextResponse(null, { status: 206 }));
        const manifest = await getManifest(REQUEST, MANIFEST_CONTEXT);
        expect(manifest.status).toBe(200);
        expect(manifest.headers.get('cache-control')).toBe('private, no-store');
        expect((await getTrack(REQUEST, TRACK_CONTEXT)).status).toBe(206);
        expect(ROUTE_MOCKS.createRange).toHaveBeenCalledWith(REQUEST,
            { role: 'editor', status: 'complete', id: 'asset-one' }, false);
    });

    it('refuses full media ranges for free live viewers and checks each requested segment', async () => {
        ROUTE_MOCKS.authorize.mockResolvedValue({ supabase: {}, isLiveWindowLocked: true, revision: {
            player_metadata: { schemaVersion: 1, durationSeconds: 10 },
        } });
        ROUTE_MOCKS.getAssets.mockResolvedValue([{ role: 'editor', status: 'complete', id: 'asset-one' }]);
        ROUTE_MOCKS.createLiveSegment.mockResolvedValue(new NextResponse(null, { status: 206 }));
        expect((await getTrack(REQUEST, TRACK_CONTEXT)).status).toBe(403);
        expect(ROUTE_MOCKS.getAssets).not.toHaveBeenCalled();
        const segmentRequest = new NextRequest(`${REQUEST.url}?segment=2`, { headers: { Range: 'bytes=0-1023' } });
        ROUTE_MOCKS.authorizeSegment.mockReturnValueOnce(new NextResponse(null, { status: 403 }));
        expect((await getTrack(segmentRequest, TRACK_CONTEXT)).status).toBe(403);
        expect(ROUTE_MOCKS.createLiveSegment).not.toHaveBeenCalled();
        expect((await getTrack(segmentRequest, TRACK_CONTEXT)).status).toBe(206);
        expect(ROUTE_MOCKS.authorizeSegment).toHaveBeenCalledWith(expect.anything(), 2);
        expect(ROUTE_MOCKS.createLiveSegment).toHaveBeenCalledWith(segmentRequest,
            { role: 'editor', status: 'complete', id: 'asset-one' }, 2,
            { startSeconds: 4, endSeconds: 6 }, false);
    });
});
