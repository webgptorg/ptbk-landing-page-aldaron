import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    convertWorkshopCommentToMaterialMock,
    getAdminWorkshopDataOrResponseMock,
    getUnauthorizedResponseOrNullMock,
} = vi.hoisted(() => ({
    convertWorkshopCommentToMaterialMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({
    getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock,
}));
vi.mock('@/lib/workshops/workshopCommentMaterial', () => ({
    convertWorkshopCommentToMaterial: convertWorkshopCommentToMaterialMock,
}));

import { POST } from './route';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const COMMENT_ID = '496eb667-8f66-4e21-8245-494a6c35d8e8';
const SUPABASE = {};
const WORKSHOP_ROW = { id: WORKSHOP_ID, room_kind: 'workshop', slug: 'online-workshop-2026-09-16' };
const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'content-id',
    title: 'Komentář od Jana Nováková',
    bodyMarkdown: 'Jak nasadit agenta?',
    unlockAt: '2026-09-16T10:00:00.000Z',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: false,
    isPaidMembersOnly: false,
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-09-16T10:00:00.000Z',
    linkClickCount: 0,
};
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: WORKSHOP_ID, commentId: COMMENT_ID }) };

function createRequest(): NextRequest {
    return new NextRequest(
        `https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}/comments/${COMMENT_ID}/material`,
        { method: 'POST' },
    );
}

describe('admin workshop comment material endpoint', () => {
    beforeEach(() => {
        convertWorkshopCommentToMaterialMock.mockReset();
        getAdminWorkshopDataOrResponseMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();

        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: WORKSHOP_ROW });
        convertWorkshopCommentToMaterialMock.mockResolvedValue({ kind: 'created', contentBlock: CONTENT_BLOCK });
    });

    it('lets an administrator preserve a comment and create its material in the same workshop', async () => {
        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ contentBlock: CONTENT_BLOCK });
        expect(convertWorkshopCommentToMaterialMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, COMMENT_ID);
    });

    it('refuses an unauthenticated request before it can convert a comment', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(getAdminWorkshopDataOrResponseMock).not.toHaveBeenCalled();
        expect(convertWorkshopCommentToMaterialMock).not.toHaveBeenCalled();
    });
});
