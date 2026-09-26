import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    broadcastWorkshopEventMock,
    getAdminWorkshopDataOrResponseMock,
    getUnauthorizedResponseOrNullMock,
    rpcMock,
} = vi.hoisted(() => ({
    broadcastWorkshopEventMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
    rpcMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock }));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({ getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock }));
vi.mock('@/lib/workshops/workshopRealtime', () => ({ broadcastWorkshopEvent: broadcastWorkshopEventMock }));

import { PATCH } from './route';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const CONTENT_IDS = [
    '1a3277c7-4853-41b2-bf0f-73bd0a092b82',
    '32328e68-10a5-4a22-bd56-503e3ef3a58a',
];
const WORKSHOP_ROW = { id: WORKSHOP_ID, slug: 'workshop', room_kind: 'workshop' };
const SUPABASE = { rpc: rpcMock };
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: WORKSHOP_ID }) };

function createRequest(contentIds: readonly string[]): NextRequest {
    return new NextRequest(`https://ptbk.io/api/admin/workshops/${WORKSHOP_ID}/content/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentIds }),
    });
}

describe('admin workshop material order route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: WORKSHOP_ROW });
        rpcMock.mockResolvedValue({
            data: [{ outcome: 'ok', material_ids: CONTENT_IDS, is_changed: true, was_reconciled: false }],
            error: null,
        });
    });

    it('calls the atomic workshop-scoped order operation and refreshes the room once after success', async () => {
        const response = await PATCH(createRequest(CONTENT_IDS), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ contentIds: CONTENT_IDS, wasReconciled: false });
        expect(rpcMock).toHaveBeenCalledWith('reorder_workshop_content_blocks', {
            target_workshop_id: WORKSHOP_ID,
            ordered_content_ids: CONTENT_IDS,
        });
        expect(broadcastWorkshopEventMock).toHaveBeenCalledOnce();
    });

    it('does not write or broadcast an unchanged order', async () => {
        rpcMock.mockResolvedValue({
            data: [{ outcome: 'ok', material_ids: CONTENT_IDS, is_changed: false, was_reconciled: false }],
            error: null,
        });

        const response = await PATCH(createRequest(CONTENT_IDS), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });

    it('rejects duplicate or malformed IDs before reaching the database', async () => {
        const duplicateResponse = await PATCH(createRequest([CONTENT_IDS[0], CONTENT_IDS[0]]), ROUTE_CONTEXT);
        const malformedResponse = await PATCH(createRequest(['invalid']), ROUTE_CONTEXT);

        expect(duplicateResponse.status).toBe(400);
        expect(malformedResponse.status).toBe(400);
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('requires an administrator before loading or mutating a workshop', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await PATCH(createRequest(CONTENT_IDS), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(getAdminWorkshopDataOrResponseMock).not.toHaveBeenCalled();
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('returns database validation failures without broadcasting', async () => {
        rpcMock.mockResolvedValue({
            data: [{ outcome: 'invalid_material', material_ids: CONTENT_IDS, is_changed: false, was_reconciled: false }],
            error: null,
        });

        const response = await PATCH(createRequest(CONTENT_IDS), ROUTE_CONTEXT);

        expect(response.status).toBe(400);
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });
});
