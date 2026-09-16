import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    convertWorkshopCommentToMaterialMock,
    getCrossSiteResponseOrNullMock,
    getModeratingWorkshopRequestMock,
    isAuthenticatedWorkshopRequestMock,
} = vi.hoisted(() => ({
    convertWorkshopCommentToMaterialMock: vi.fn(),
    getCrossSiteResponseOrNullMock: vi.fn(),
    getModeratingWorkshopRequestMock: vi.fn(),
    isAuthenticatedWorkshopRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/getCrossSiteResponseOrNull', () => ({
    getCrossSiteResponseOrNull: getCrossSiteResponseOrNullMock,
}));
vi.mock('@/lib/workshops/workshopCommentMaterial', () => ({
    convertWorkshopCommentToMaterial: convertWorkshopCommentToMaterialMock,
}));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getModeratingWorkshopRequest: getModeratingWorkshopRequestMock,
    isAuthenticatedWorkshopRequest: isAuthenticatedWorkshopRequestMock,
}));

import { POST } from './route';

const WORKSHOP_SLUG = 'online-workshop-2026-09-16';
const COMMENT_ID = '496eb667-8f66-4e21-8245-494a6c35d8e8';
const SUPABASE = {};
const WORKSHOP_ROW = { id: 'workshop-id', room_kind: 'workshop', slug: WORKSHOP_SLUG };
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
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopSlug: WORKSHOP_SLUG, commentId: COMMENT_ID }) };

function createRequest(): NextRequest {
    return new NextRequest(`https://promptbook.studio/api/workshops/${WORKSHOP_SLUG}/comments/${COMMENT_ID}/material`, {
        method: 'POST',
    });
}

describe('workshop comment material endpoint', () => {
    beforeEach(() => {
        convertWorkshopCommentToMaterialMock.mockReset();
        getCrossSiteResponseOrNullMock.mockReset();
        getModeratingWorkshopRequestMock.mockReset();
        isAuthenticatedWorkshopRequestMock.mockReset();

        getCrossSiteResponseOrNullMock.mockReturnValue(null);
        getModeratingWorkshopRequestMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: WORKSHOP_ROW });
        isAuthenticatedWorkshopRequestMock.mockReturnValue(true);
        convertWorkshopCommentToMaterialMock.mockResolvedValue({ kind: 'created', contentBlock: CONTENT_BLOCK });
    });

    it('lets a room moderator preserve a comment as an immediately available material', async () => {
        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ contentBlock: CONTENT_BLOCK });
        expect(getModeratingWorkshopRequestMock).toHaveBeenCalledWith(expect.any(NextRequest), WORKSHOP_SLUG);
        expect(convertWorkshopCommentToMaterialMock).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, COMMENT_ID);
    });

    it('refuses a person who does not moderate the room before a material can be created', async () => {
        isAuthenticatedWorkshopRequestMock.mockReturnValue(false);
        getModeratingWorkshopRequestMock.mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));

        const response = await POST(createRequest(), ROUTE_CONTEXT);

        expect(response.status).toBe(403);
        expect(convertWorkshopCommentToMaterialMock).not.toHaveBeenCalled();
    });
});
