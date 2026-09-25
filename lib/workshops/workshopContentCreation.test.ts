import { beforeEach, describe, expect, it, vi } from 'vitest';

const { ensureWorkshopMaterialShortLinksMock, broadcastWorkshopEventMock, mapWorkshopContentRowMock } = vi.hoisted(() => ({
    ensureWorkshopMaterialShortLinksMock: vi.fn(),
    broadcastWorkshopEventMock: vi.fn(),
    mapWorkshopContentRowMock: vi.fn((row) => ({ id: row.id, title: row.title })),
}));

vi.mock('@/lib/workshops/workshopMaterialLinks', () => ({ ensureWorkshopMaterialShortLinks: ensureWorkshopMaterialShortLinksMock }));
vi.mock('@/lib/workshops/workshopRealtime', () => ({ broadcastWorkshopEvent: broadcastWorkshopEventMock }));
vi.mock('@/lib/workshops/workshopDatabase', () => ({
    mapWorkshopContentRow: mapWorkshopContentRowMock,
    WORKSHOP_CONTENT_COLUMNS: 'id, title, body_markdown',
}));

import { createWorkshopContent } from './workshopContentCreation';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const MATERIAL_ID = '645751a4-93b1-4451-b857-83e6a75b3b22';
const WORKSHOP_ROW = { id: WORKSHOP_ID, slug: 'online-workshop', room_kind: 'workshop' };
const CONTENT_VALUES = {
    idempotencyKey: MATERIAL_ID,
    title: 'Useful guide',
    bodyMarkdown: '[Useful guide](<https://example.com/guide?part=2#chapter>)',
    unlockAt: '2026-09-25T10:00:00.000Z',
    sortOrder: 80,
    isPublished: true,
    isFollowUp: false,
    isPaidMembersOnly: false,
};
const MATERIAL_ROW = { id: MATERIAL_ID, title: CONTENT_VALUES.title, body_markdown: CONTENT_VALUES.bodyMarkdown };

describe('ordinary workshop material creation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        ensureWorkshopMaterialShortLinksMock.mockResolvedValue(null);
        broadcastWorkshopEventMock.mockResolvedValue(undefined);
    });

    it('uses one ordinary insert, short-link preparation and live refresh, including on an idempotent retry', async () => {
        const single = vi.fn()
            .mockResolvedValueOnce({ data: MATERIAL_ROW, error: null })
            .mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'duplicate key' } });
        const maybeSingle = vi.fn().mockResolvedValue({ data: MATERIAL_ROW, error: null });
        const insert = vi.fn(() => ({ select: vi.fn(() => ({ single })) }));
        const select = vi.fn(() => ({
            eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) })),
        }));
        const supabase = { from: vi.fn(() => ({ insert, select })) };

        const firstResult = await createWorkshopContent(supabase as never, WORKSHOP_ROW as never, CONTENT_VALUES);
        const retryResult = await createWorkshopContent(supabase as never, WORKSHOP_ROW as never, CONTENT_VALUES);

        expect(firstResult.contentBlock).toEqual({ id: MATERIAL_ID, title: 'Useful guide' });
        expect(retryResult).toEqual(firstResult);
        expect(insert).toHaveBeenCalledWith(expect.objectContaining({
            id: MATERIAL_ID,
            workshop_id: WORKSHOP_ID,
            body_markdown: CONTENT_VALUES.bodyMarkdown,
            sort_order: 80,
            is_published: true,
            is_paid_members_only: false,
        }));
        expect(maybeSingle).toHaveBeenCalledOnce();
        expect(ensureWorkshopMaterialShortLinksMock).toHaveBeenCalledTimes(2);
        expect(broadcastWorkshopEventMock).toHaveBeenCalledTimes(2);
    });
});
