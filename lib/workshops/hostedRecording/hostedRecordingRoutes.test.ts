import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const ROUTE_MOCKS = vi.hoisted(() => ({
    authorize: vi.fn(), getAssets: vi.fn(), createRange: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('./hostedRecordingDelivery', () => ({
    authorizeHostedRecording: ROUTE_MOCKS.authorize,
    isAuthorizedHostedRecording: (value: unknown) => !(value instanceof NextResponse),
    createHostedRecordingRangeResponse: ROUTE_MOCKS.createRange,
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
        ROUTE_MOCKS.authorize.mockResolvedValue({ supabase: {}, revision: {
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
});
