import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const STORAGE = vi.hoisted(() => ({ getObject: vi.fn() }));
const ACCESS = vi.hoisted(() => ({ authenticate: vi.fn(), isAuthenticated: vi.fn(), revision: vi.fn(),
    membership: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('./hostedRecordingStorage', () => ({ getHostedRecordingObject: STORAGE.getObject }));
vi.mock('./hostedRecordingRequest', () => ({ getHostedRecordingRevision: ACCESS.revision }));
vi.mock('@/lib/workshops/workshopRequest', () => ({ getAuthenticatedWorkshopRequest: ACCESS.authenticate,
    isAuthenticatedWorkshopRequest: ACCESS.isAuthenticated }));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () =>
    ({ loadCommunityMembershipByEmail: ACCESS.membership }));

import { authorizeHostedRecording, authorizeHostedRecordingSegment, createHostedRecordingLiveSegmentResponse,
    isAuthorizedHostedRecording,
    type AuthorizedHostedRecording } from './hostedRecordingDelivery';
import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';

const FIXTURE = readFileSync(resolve('tests/e2e/fixtures/recording-studio/camera.webm'));
const ASSET = { id: 'camera', revision_id: 'revision', role: 'camera' as const, source_id: 'camera',
    filename: 'camera.webm', content_type: 'video/webm', byte_length: FIXTURE.byteLength,
    object_key: 'private-camera', upload_id: 'upload', status: 'complete' as const,
    measured_duration_seconds: 7.638 };

describe('hosted live segment delivery', () => {
    beforeEach(() => {
        ACCESS.authenticate.mockReset();
        ACCESS.isAuthenticated.mockReset().mockReturnValue(true);
        ACCESS.revision.mockReset();
        ACCESS.membership.mockReset().mockResolvedValue({ membership: null, errorMessage: null });
        STORAGE.getObject.mockReset().mockImplementation(async (_key: string, range: string) => {
            const match = range.match(/^bytes=(\d+)-(\d+)$/)!;
            const start = Number(match[1]);
            const end = Number(match[2]);
            const bytes = FIXTURE.subarray(start, end + 1);
            return { ContentLength: bytes.byteLength, Body: { transformToWebStream: () =>
                new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } }) } };
        });
    });

    it('uses the room membership and recorded workshop phase for live and replay access', async () => {
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date('2026-09-30T10:00:08.000Z'));
            ACCESS.authenticate.mockResolvedValue({ supabase: {}, participant: { email: 'viewer@example.com' },
                workshopRow: { id: 'workshop-one', room_kind: 'workshop', video_source: 'hosted',
                    hosted_recording_revision_id: 'revision-one', starts_at: '2026-09-30T10:00:00.000Z',
                    ends_at: '2026-09-30T10:10:00.000Z' } });
            ACCESS.revision.mockResolvedValue({ id: 'revision-one', status: 'published' });
            const request = new NextRequest('https://ptbk.io/api/workshops/example/hosted-recording/revision-one');
            const freeLive = await authorizeHostedRecording(request, 'example', 'revision-one');
            expect(isAuthorizedHostedRecording(freeLive)).toBe(true);
            if (isAuthorizedHostedRecording(freeLive)) expect(freeLive.isLiveWindowLocked).toBe(true);
            ACCESS.membership.mockResolvedValue({ membership: { status: 'active' }, errorMessage: null });
            const paidLive = await authorizeHostedRecording(request, 'example', 'revision-one');
            expect(isAuthorizedHostedRecording(paidLive)).toBe(true);
            if (isAuthorizedHostedRecording(paidLive)) expect(paidLive.isLiveWindowLocked).toBe(false);
            vi.setSystemTime(new Date('2026-09-30T10:11:00.000Z'));
            ACCESS.membership.mockResolvedValue({ membership: null, errorMessage: null });
            const freeReplay = await authorizeHostedRecording(request, 'example', 'revision-one');
            expect(isAuthorizedHostedRecording(freeReplay)).toBe(false);
            if (!isAuthorizedHostedRecording(freeReplay)) expect(freeReplay.status).toBe(403);
            ACCESS.membership.mockResolvedValue({ membership: { status: 'active' }, errorMessage: null });
            expect(isAuthorizedHostedRecording(await authorizeHostedRecording(request,
                'example', 'revision-one'))).toBe(true);
        } finally { vi.useRealTimers(); }
    });

    it('only authorizes the server-current complete segment', () => {
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date('2026-09-30T10:00:08.000Z'));
            const authorized = { isLiveWindowLocked: true, revision: { player_metadata: {
                durationSeconds: 12, liveStartAt: '2026-09-30T10:00:00.000Z',
            } } } as AuthorizedHostedRecording;
            expect(authorizeHostedRecordingSegment(authorized, 3)).toBeNull();
            expect(authorizeHostedRecordingSegment(authorized, 2)?.status).toBe(403);
            expect(authorizeHostedRecordingSegment(authorized, 4)?.status).toBe(403);
            vi.setSystemTime(new Date('2026-09-30T10:00:07.638Z'));
            const partial = { isLiveWindowLocked: true, revision: { player_metadata: {
                durationSeconds: 7.638, liveStartAt: '2026-09-30T10:00:00.000Z',
            } } } as AuthorizedHostedRecording;
            expect(authorizeHostedRecordingSegment(partial, 2)).toBeNull();
            expect(authorizeHostedRecordingSegment(partial, 3)?.status).toBe(403);
            vi.setSystemTime(new Date('2026-09-30T10:00:08.000Z'));
            expect(authorizeHostedRecordingSegment(partial, 3)).toBeNull();
            vi.setSystemTime(new Date('2026-09-30T10:00:09.638Z'));
            expect(authorizeHostedRecordingSegment(partial, 3)?.status).toBe(403);
        } finally { vi.useRealTimers(); }
    });

    it('remuxes a bounded independent segment and limits byte ranges to that segment', async () => {
        const request = new NextRequest('https://ptbk.io/live/camera?segment=1',
            { headers: { Range: 'bytes=0-99' } });
        const response = await createHostedRecordingLiveSegmentResponse(request, ASSET, 1,
            { startSeconds: 2, endSeconds: 4 });
        expect(response.status).toBe(206);
        expect(response.headers.get('content-length')).toBe('100');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect((await response.arrayBuffer()).byteLength).toBe(100);
        const fullResponse = await createHostedRecordingLiveSegmentResponse(
            new NextRequest('https://ptbk.io/live/camera?segment=1'), ASSET, 1,
            { startSeconds: 2, endSeconds: 4 });
        expect(fullResponse.status).toBe(200);
        const segment = await fullResponse.arrayBuffer();
        expect(segment.byteLength).toBeLessThan(FIXTURE.byteLength);
        const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(new Blob([segment])) });
        try { expect(await input.getDurationFromMetadata()).toBeLessThanOrEqual(2.01); }
        finally { input.dispose(); }
        const outsideRange = await createHostedRecordingLiveSegmentResponse(
            new NextRequest('https://ptbk.io/live/camera?segment=1',
                { headers: { Range: `bytes=${segment.byteLength}-` } }), ASSET, 1,
            { startSeconds: 2, endSeconds: 4 });
        expect(outsideRange.status).toBe(416);
        const tail = await createHostedRecordingLiveSegmentResponse(
            new NextRequest('https://ptbk.io/live/camera?segment=3'), ASSET, 3,
            { startSeconds: 6, endSeconds: 7.638 });
        expect(tail.status).toBe(200);
    });
});
