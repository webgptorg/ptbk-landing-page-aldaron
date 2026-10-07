import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createStudioAssetRouteTestDatabase as createDatabase } from './studioAssetRouteTestUtilities';

const ROUTE_MOCKS = vi.hoisted(() => ({
    guard: vi.fn(),
    database: vi.fn(),
    begin: vi.fn(),
    parts: vi.fn(),
    complete: vi.fn(),
    abort: vi.fn(),
    verify: vi.fn(),
    signPart: vi.fn(),
    signRead: vi.fn(),
    storage: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: ROUTE_MOCKS.guard }));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ getWorkshopDatabaseOrNull: ROUTE_MOCKS.database }));
vi.mock('@/lib/workshops/hostedRecording/hostedRecordingStorage', () => ({
    beginHostedRecordingUpload: ROUTE_MOCKS.begin,
    listHostedRecordingParts: ROUTE_MOCKS.parts,
    completeHostedRecordingUpload: ROUTE_MOCKS.complete,
    abortHostedRecordingUpload: ROUTE_MOCKS.abort,
    getHostedRecordingStorage: ROUTE_MOCKS.storage,
}));
vi.mock('./studioAssetS3', () => ({
    verifyStudioStoredAsset: ROUTE_MOCKS.verify,
    signStudioUploadPart: ROUTE_MOCKS.signPart,
    signStudioAssetRead: ROUTE_MOCKS.signRead,
}));

import { GET as getConfiguration, POST as registerAsset } from '@/app/api/admin/studio/assets/route';
import {
    GET as getAsset,
    POST as completeAsset,
    DELETE as cancelAsset,
} from '@/app/api/admin/studio/assets/[assetId]/route';
import { POST as signPart } from '@/app/api/admin/studio/assets/[assetId]/parts/[partNumber]/route';
import { GET as readAsset } from '@/app/api/admin/studio/assets/[assetId]/read/route';
import { PUT as setReferences } from '@/app/api/admin/studio/projects/[projectId]/references/route';

const ASSET_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ID = '22222222-2222-4222-8222-222222222222';
const PART_CHECKSUM = createHash('sha256').update('test media').digest('base64');
const REGISTRATION = {
    id: ASSET_ID,
    clientAssetId: ASSET_ID,
    projectId: PROJECT_ID,
    filename: 'private.webm',
    contentType: 'video/webm',
    byteLength: 10,
    partChecksums: [PART_CHECKSUM],
    sourceFingerprint: createHash('sha256')
        .update(JSON.stringify({ byteLength: 10, partChecksums: [PART_CHECKSUM] }))
        .digest('hex'),
    bounds: {
        firstTimestampSeconds: 0,
        availableStartTimestampSeconds: 0,
        endTimestampSeconds: 5,
        components: [{ kind: 'video', firstTimestampSeconds: 0, endTimestampSeconds: 5 }],
    },
};
const ROUTE = { params: Promise.resolve({ assetId: ASSET_ID }) };
const PART_ROUTE = { params: Promise.resolve({ assetId: ASSET_ID, partNumber: '1' }) };
function request(method = 'POST', body?: unknown) {
    return new NextRequest('https://ptbk.io/api/admin/studio/assets', {
        method,
        ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
    });
}

describe('private Studio multipart control routes', () => {
    let database: ReturnType<typeof createDatabase>;
    beforeEach(() => {
        vi.resetAllMocks();
        database = createDatabase();
        ROUTE_MOCKS.database.mockReturnValue(database);
        ROUTE_MOCKS.guard.mockReturnValue(null);
        ROUTE_MOCKS.storage.mockReturnValue({});
        ROUTE_MOCKS.begin.mockResolvedValue('immutable-upload');
        ROUTE_MOCKS.abort.mockResolvedValue(undefined);
        ROUTE_MOCKS.parts.mockResolvedValue([{ partNumber: 1, byteLength: 10, checksumSha256: PART_CHECKSUM }]);
        ROUTE_MOCKS.complete.mockResolvedValue(undefined);
        ROUTE_MOCKS.verify.mockResolvedValue(undefined);
        ROUTE_MOCKS.signPart.mockResolvedValue({
            url: 'https://storage.example.test/private?signature=short',
            headers: {},
        });
        ROUTE_MOCKS.signRead.mockResolvedValue({
            url: 'https://storage.example.test/private?signature=short',
            expiresAt: Date.now() + 600_000,
        });
    });
    const createAsset = async () => {
        expect((await registerAsset(request('POST', REGISTRATION))).status).toBe(200);
    };

    it('denies signing, completion, cancellation, private reads and reference writes before any database/storage access', async () => {
        ROUTE_MOCKS.guard.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        const responses = await Promise.all([
            getConfiguration(request('GET')),
            registerAsset(request('POST', REGISTRATION)),
            getAsset(request('GET'), ROUTE),
            completeAsset(request(), ROUTE),
            cancelAsset(request('DELETE'), ROUTE),
            signPart(request(), PART_ROUTE),
            readAsset(request('GET'), ROUTE),
            setReferences(request('PUT', { assetIds: [ASSET_ID] }), {
                params: Promise.resolve({ projectId: PROJECT_ID }),
            }),
        ]);
        expect(responses.every((response) => response.status === 401)).toBe(true);
        expect(ROUTE_MOCKS.database).not.toHaveBeenCalled();
        expect(ROUTE_MOCKS.begin).not.toHaveBeenCalled();
        expect(ROUTE_MOCKS.signPart).not.toHaveBeenCalled();
        expect(ROUTE_MOCKS.signRead).not.toHaveBeenCalled();
    });
    it('allocates once, resumes the same identity and refuses different bytes or oversized video-body control requests', async () => {
        await createAsset();
        await createAsset();
        expect(ROUTE_MOCKS.begin).toHaveBeenCalledTimes(1);
        expect(database.references.has(ASSET_ID)).toBe(true);
        expect(
            (await registerAsset(request('POST', { ...REGISTRATION, sourceFingerprint: 'a'.repeat(64) }))).status,
        ).toBe(400);
        const different = { ...REGISTRATION, byteLength: 11 };
        different.sourceFingerprint = createHash('sha256')
            .update(JSON.stringify({ byteLength: 11, partChecksums: different.partChecksums }))
            .digest('hex');
        expect((await registerAsset(request('POST', different))).status).toBe(409);
        expect(
            (
                await registerAsset(
                    new NextRequest('https://ptbk.io/api/admin/studio/assets', {
                        method: 'POST',
                        headers: { 'Content-Length': '2000000' },
                    }),
                )
            ).status,
        ).toBe(400);
        expect(
            (await signPart(request(), { params: Promise.resolve({ assetId: crypto.randomUUID(), partNumber: '1' }) }))
                .status,
        ).toBe(404);
    });
    it('keeps an uncertain allocation recoverable instead of reporting a validation failure with no side effects', async () => {
        ROUTE_MOCKS.begin.mockRejectedValueOnce(new Error('Connection lost after allocating storage'));
        expect((await registerAsset(request('POST', REGISTRATION))).status).toBe(503);
        expect(database.rows.get(ASSET_ID)?.status).toBe('allocating');
        expect((await registerAsset(request('POST', REGISTRATION))).status).toBe(409);
        database.rows.set(ASSET_ID, {
            ...database.rows.get(ASSET_ID)!,
            operation_started_at: new Date(0).toISOString(),
        });
        await createAsset();
        expect(ROUTE_MOCKS.begin).toHaveBeenCalledTimes(2);
        expect(database.rows.get(ASSET_ID)?.status).toBe('uploading');
    });
    it('never converts a failed or wrong-length/checksum completion to a verified object', async () => {
        await createAsset();
        ROUTE_MOCKS.verify.mockRejectedValue(new Error('checksum/timing mismatch'));
        expect((await completeAsset(request(), ROUTE)).status).toBe(422);
        expect(database.rows.get(ASSET_ID)?.status).toBe('uploading');
        expect((await readAsset(request('GET'), ROUTE)).status).toBe(409);
        ROUTE_MOCKS.complete.mockClear();
        ROUTE_MOCKS.parts.mockResolvedValue([{ partNumber: 1, byteLength: 9, checksumSha256: PART_CHECKSUM }]);
        expect((await completeAsset(request(), ROUTE)).status).toBe(422);
        expect(ROUTE_MOCKS.complete).not.toHaveBeenCalled();
    });
    it('serializes completion and cancellation, makes verification idempotent and signs only private verified reads', async () => {
        await createAsset();
        let finish!: () => void;
        ROUTE_MOCKS.complete.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    finish = resolve;
                }),
        );
        const first = completeAsset(request(), ROUTE);
        await vi.waitFor(() => expect(ROUTE_MOCKS.complete).toHaveBeenCalledTimes(1));
        expect((await completeAsset(request(), ROUTE)).status).toBe(409);
        expect((await cancelAsset(request('DELETE'), ROUTE)).status).toBe(409);
        finish();
        expect((await first).status).toBe(200);
        expect((await completeAsset(request(), ROUTE)).status).toBe(200);
        expect(ROUTE_MOCKS.complete).toHaveBeenCalledTimes(1);
        const read = await readAsset(request('GET'), ROUTE);
        expect(read.status).toBe(200);
        expect(read.headers.get('cache-control')).toBe('private, no-store');
        expect(database.rows.get(ASSET_ID)).not.toHaveProperty('url');
        expect((await signPart(request(), PART_ROUTE)).status).toBe(409);
    });
    it('rejects a late completion token and keeps the other operation authoritative', async () => {
        await createAsset();
        ROUTE_MOCKS.complete.mockImplementation(async () => {
            database.rows.set(ASSET_ID, { ...database.rows.get(ASSET_ID)!, operation_token: crypto.randomUUID() });
        });
        expect((await completeAsset(request(), ROUTE)).status).toBe(409);
        expect(database.rows.get(ASSET_ID)?.status).toBe('completing');
    });
    it('cancels registered multipart storage and pending references without deleting or publishing a workshop', async () => {
        await createAsset();
        expect((await cancelAsset(request('DELETE'), ROUTE)).status).toBe(200);
        expect(database.references.size).toBe(0);
        expect(database.rows.get(ASSET_ID)?.status).toBe('cancelled');
        expect(ROUTE_MOCKS.abort).toHaveBeenCalledWith(`studio-assets/${ASSET_ID}`, 'immutable-upload');
        expect((await completeAsset(request(), ROUTE)).status).toBe(409);
        expect((await registerAsset(request('POST', REGISTRATION))).status).toBe(409);
    });
});
