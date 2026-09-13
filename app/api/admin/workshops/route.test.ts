import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    copyWorkshopPollAttachmentsMock,
    createWorkshopDatabaseUnavailableResponseMock,
    findWorkshopByIdMock,
    getWorkshopDatabaseOrNullMock,
    loadWorkshopAdminSummariesMock,
    mapWorkshopRowMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    copyWorkshopPollAttachmentsMock: vi.fn(),
    createWorkshopDatabaseUnavailableResponseMock: vi.fn(),
    findWorkshopByIdMock: vi.fn(),
    getWorkshopDatabaseOrNullMock: vi.fn(),
    loadWorkshopAdminSummariesMock: vi.fn(),
    mapWorkshopRowMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    copyWorkshopPollAttachments: copyWorkshopPollAttachmentsMock,
    createWorkshopDatabaseUnavailableResponse: createWorkshopDatabaseUnavailableResponseMock,
    findWorkshopById: findWorkshopByIdMock,
    getWorkshopDatabaseOrNull: getWorkshopDatabaseOrNullMock,
    loadWorkshopAdminSummaries: loadWorkshopAdminSummariesMock,
    mapWorkshopRow: mapWorkshopRowMock,
}));

import { POST } from './route';

const SOURCE_WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const CREATED_WORKSHOP_ID = 'a1000000-0000-4000-8000-000000000001';
const CREATED_WORKSHOP_ROW = { id: CREATED_WORKSHOP_ID };
const CREATED_WORKSHOP = { id: CREATED_WORKSHOP_ID, slug: 'production-ai-workshop-copy' };
const DATABASE_INSERT_MOCK = vi.fn();

function createDuplicateWorkshopRequest(isUsingLegacyPollSourceField = false): NextRequest {
    const pollSourceValues = isUsingLegacyPollSourceField
        ? { duplicateAttachedPollsFromWorkshopId: SOURCE_WORKSHOP_ID }
        : { attachedPollsSourceWorkshopId: SOURCE_WORKSHOP_ID };

    return new NextRequest('https://promptbook.studio/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            slug: 'production-ai-workshop-copy',
            title: 'Produkční kód s AI agenty',
            description: '',
            startsAt: '2026-09-13T08:00:00.000Z',
            endsAt: '2026-09-13T15:00:00.000Z',
            eventType: 'online-workshop',
            locationKind: 'online',
            ...pollSourceValues,
        }),
    });
}

describe('admin workshop creation', () => {
    beforeEach(() => {
        getUnauthorizedResponseOrNullMock.mockReset();
        copyWorkshopPollAttachmentsMock.mockReset();
        createWorkshopDatabaseUnavailableResponseMock.mockReset();
        findWorkshopByIdMock.mockReset();
        getWorkshopDatabaseOrNullMock.mockReset();
        loadWorkshopAdminSummariesMock.mockReset();
        mapWorkshopRowMock.mockReset();
        DATABASE_INSERT_MOCK.mockReset();

        const single = vi.fn().mockResolvedValue({ data: CREATED_WORKSHOP_ROW, error: null });
        const select = vi.fn(() => ({ single }));
        DATABASE_INSERT_MOCK.mockReturnValue({ select });
        const database = { from: vi.fn(() => ({ insert: DATABASE_INSERT_MOCK })) };

        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getWorkshopDatabaseOrNullMock.mockReturnValue(database);
        findWorkshopByIdMock.mockResolvedValue({ room_kind: 'workshop' });
        copyWorkshopPollAttachmentsMock.mockResolvedValue(null);
        mapWorkshopRowMock.mockReturnValue(CREATED_WORKSHOP);
    });

    it('copies the source workshop’s existing poll connections after creating the duplicate', async () => {
        const response = await POST(createDuplicateWorkshopRequest());

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ workshop: CREATED_WORKSHOP });
        expect(copyWorkshopPollAttachmentsMock).toHaveBeenCalledWith(
            expect.anything(),
            SOURCE_WORKSHOP_ID,
            CREATED_WORKSHOP_ID,
        );
        const writtenWorkshopValues = DATABASE_INSERT_MOCK.mock.calls[0]?.[0];
        expect(writtenWorkshopValues).not.toHaveProperty('attachedPollsSourceWorkshopId');
        expect(writtenWorkshopValues).not.toHaveProperty('duplicateAttachedPollsFromWorkshopId');
    });

    it('keeps an already-open duplicate form attaching its source polls during a deployment', async () => {
        const response = await POST(createDuplicateWorkshopRequest(true));

        expect(response.status).toBe(201);
        expect(copyWorkshopPollAttachmentsMock).toHaveBeenCalledWith(
            expect.anything(),
            SOURCE_WORKSHOP_ID,
            CREATED_WORKSHOP_ID,
        );
    });
});
