import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));
const ACCESS = vi.hoisted(() => ({
    authenticated: vi.fn(), membership: vi.fn(), revision: vi.fn(),
}));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: ACCESS.authenticated,
    isAuthenticatedWorkshopRequest: (value: unknown) => !(value instanceof NextResponse),
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    loadCommunityMembershipByEmail: ACCESS.membership,
}));
vi.mock('@/lib/community-membership/communityMembershipTypes', () => ({
    isPaidCommunityMembershipStatus: (status: string) => status === 'active',
}));
vi.mock('./hostedRecordingRequest', () => ({
    getHostedRecordingRevision: ACCESS.revision,
}));
vi.mock('./hostedRecordingStorage', () => ({
    getHostedRecordingObject: vi.fn(),
}));

import { authorizeHostedRecording, createHostedRecordingRangeResponse, isAuthorizedHostedRecording } from './hostedRecordingDelivery';
import type { HostedRecordingAssetRow } from './hostedRecordingValidation';

const REQUEST = new NextRequest('https://ptbk.io/api/workshops/workshop/hosted-recording/revision-one');
const WORKSHOP = { id: 'workshop-one', room_kind: 'workshop', video_source: 'hosted',
    hosted_recording_revision_id: 'revision-one',
    starts_at: '2026-09-29T10:00:00.000Z', ends_at: '2026-09-29T11:00:00.000Z' };
const MEDIA_ASSET = { byte_length: 12_000_000, content_type: 'video/mp4', object_key: 'private/media' } as HostedRecordingAssetRow;

describe('hosted recording authorization on every metadata and byte request', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        ACCESS.authenticated.mockReset().mockResolvedValue({ workshopRow: WORKSHOP,
            participant: { email: 'participant@example.com' }, supabase: {} });
        ACCESS.membership.mockReset().mockResolvedValue({ membership: null, errorMessage: null });
        ACCESS.revision.mockReset().mockResolvedValue({ id: 'revision-one', status: 'published',
            superseded_at: null, player_metadata: {} });
    });
    afterEach(() => vi.useRealTimers());

    it('allows a free participant during the event and rejects even a guessed revision after it ends', async () => {
        vi.setSystemTime(new Date('2026-09-29T10:30:00.000Z'));
        expect(isAuthorizedHostedRecording(await authorizeHostedRecording(REQUEST, 'workshop', 'revision-one'))).toBe(true);
        vi.setSystemTime(new Date('2026-09-29T11:00:01.000Z'));
        const denied = await authorizeHostedRecording(REQUEST, 'workshop', 'revision-one');
        expect(isAuthorizedHostedRecording(denied)).toBe(false);
        expect((denied as NextResponse).status).toBe(403);
        expect((denied as NextResponse).headers.get('cache-control')).toBe('no-store');
    });

    it('rejects a premature recording request and permits a paid replay', async () => {
        vi.setSystemTime(new Date('2026-09-29T09:59:00.000Z'));
        expect((await authorizeHostedRecording(REQUEST, 'workshop', 'revision-one') as NextResponse).status).toBe(403);
        ACCESS.membership.mockResolvedValue({ membership: { status: 'active' }, errorMessage: null });
        vi.setSystemTime(new Date('2026-09-29T11:30:00.000Z'));
        expect(isAuthorizedHostedRecording(await authorizeHostedRecording(REQUEST, 'workshop', 'revision-one'))).toBe(true);
    });

    it('keeps the previous immutable revision available briefly after replacement', async () => {
        vi.setSystemTime(new Date('2026-09-29T10:45:00.000Z'));
        ACCESS.authenticated.mockResolvedValue({ workshopRow: { ...WORKSHOP,
            hosted_recording_revision_id: 'revision-two' },
            participant: { email: 'participant@example.com' }, supabase: {} });
        ACCESS.revision.mockResolvedValue({ id: 'revision-one', status: 'superseded',
            superseded_at: '2026-09-29T10:40:00.000Z', player_metadata: {} });
        expect(isAuthorizedHostedRecording(await authorizeHostedRecording(REQUEST, 'workshop', 'revision-one'))).toBe(true);
    });
});

describe('hosted media byte ranges', () => {
    it('answers ordinary, suffix and full-object HEAD requests with correct bounds', async () => {
        const ordinary = await createHostedRecordingRangeResponse(new NextRequest(REQUEST.url,
            { headers: { Range: 'bytes=1024-2047' } }), MEDIA_ASSET, true);
        expect(ordinary.status).toBe(206);
        expect(ordinary.headers.get('content-range')).toBe('bytes 1024-2047/12000000');
        const suffix = await createHostedRecordingRangeResponse(new NextRequest(REQUEST.url,
            { headers: { Range: 'bytes=-1024' } }), MEDIA_ASSET, true);
        expect(suffix.status).toBe(206);
        expect(suffix.headers.get('content-range')).toBe('bytes 11998976-11999999/12000000');
        const full = await createHostedRecordingRangeResponse(REQUEST, MEDIA_ASSET, true);
        expect(full.status).toBe(200);
        expect(full.headers.get('content-length')).toBe('12000000');
        expect(full.headers.get('content-range')).toBeNull();
    });

    it('rejects invalid ranges without reading storage', async () => {
        const invalid = await createHostedRecordingRangeResponse(new NextRequest(REQUEST.url,
            { headers: { Range: 'bytes=12000000-' } }), MEDIA_ASSET, true);
        expect(invalid.status).toBe(416);
        expect(invalid.headers.get('content-range')).toBe('bytes */12000000');
    });
});
