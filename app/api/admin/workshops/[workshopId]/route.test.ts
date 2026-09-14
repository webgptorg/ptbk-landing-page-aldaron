import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    broadcastWorkshopEventMock,
    createWorkshopDatabaseUnavailableResponseMock,
    findWorkshopByIdMock,
    getUnauthorizedResponseOrNullMock,
    getWorkshopDatabaseOrNullMock,
} = vi.hoisted(() => ({
    broadcastWorkshopEventMock: vi.fn(),
    createWorkshopDatabaseUnavailableResponseMock: vi.fn(),
    findWorkshopByIdMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getWorkshopDatabaseOrNullMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    createWorkshopDatabaseUnavailableResponse: createWorkshopDatabaseUnavailableResponseMock,
    findWorkshopById: findWorkshopByIdMock,
    getWorkshopDatabaseOrNull: getWorkshopDatabaseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopRealtime', () => ({
    broadcastWorkshopEvent: broadcastWorkshopEventMock,
}));

import { DELETE } from './route';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const WORKSHOP_ROW = { id: WORKSHOP_ID, room_kind: 'workshop', slug: 'production-ai-workshop-2026-09' };
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: WORKSHOP_ID }) };

function createRequest(): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}`, { method: 'DELETE' });
}

function createSoftDeleteDatabase() {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: WORKSHOP_ID }, error: null });
    const select = vi.fn(() => ({ maybeSingle }));
    const filterByActiveStatus = vi.fn(() => ({ select }));
    const filterByWorkshopId = vi.fn(() => ({ eq: filterByActiveStatus }));
    const update = vi.fn(() => ({ eq: filterByWorkshopId }));
    const from = vi.fn(() => ({ update }));

    return { from, update, filterByWorkshopId, filterByActiveStatus, select, maybeSingle };
}

describe('admin workshop deletion', () => {
    beforeEach(() => {
        broadcastWorkshopEventMock.mockReset();
        createWorkshopDatabaseUnavailableResponseMock.mockReset();
        findWorkshopByIdMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();
        getWorkshopDatabaseOrNullMock.mockReset();

        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        findWorkshopByIdMock.mockResolvedValue(WORKSHOP_ROW);
    });

    it('soft-deletes an event occurrence without touching its shared polls or attachments', async () => {
        const database = createSoftDeleteDatabase();
        getWorkshopDatabaseOrNullMock.mockReturnValue(database);

        const response = await DELETE(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ isDeleted: true });
        expect(findWorkshopByIdMock).toHaveBeenCalledWith(database, WORKSHOP_ID);
        expect(database.from).toHaveBeenCalledTimes(1);
        expect(database.from).toHaveBeenCalledWith('workshops');
        expect(database.update).toHaveBeenCalledWith({ is_deleted: true });
        expect(database.filterByWorkshopId).toHaveBeenCalledWith('id', WORKSHOP_ID);
        expect(database.filterByActiveStatus).toHaveBeenCalledWith('is_deleted', false);
        expect(database.select).toHaveBeenCalledWith('id');
        expect(database.maybeSingle).toHaveBeenCalledOnce();
        expect(broadcastWorkshopEventMock).toHaveBeenCalledWith(database, WORKSHOP_ROW, { kind: 'state-changed' });
    });

    it('does not allow the permanent community room to be deleted from workshop administration', async () => {
        const database = createSoftDeleteDatabase();
        getWorkshopDatabaseOrNullMock.mockReturnValue(database);
        findWorkshopByIdMock.mockResolvedValue({ ...WORKSHOP_ROW, room_kind: 'community' });

        const response = await DELETE(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(400);
        expect(database.from).not.toHaveBeenCalled();
        expect(broadcastWorkshopEventMock).not.toHaveBeenCalled();
    });

    it('does not reach a deleted or absent workshop', async () => {
        const database = createSoftDeleteDatabase();
        getWorkshopDatabaseOrNullMock.mockReturnValue(database);
        findWorkshopByIdMock.mockResolvedValue(null);

        const response = await DELETE(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(404);
        expect(database.from).not.toHaveBeenCalled();
    });

    it('checks administration access before looking up a workshop', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await DELETE(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(getWorkshopDatabaseOrNullMock).not.toHaveBeenCalled();
        expect(findWorkshopByIdMock).not.toHaveBeenCalled();
    });
});
