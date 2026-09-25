import { PublicWebPagePreviewError } from '@/lib/network/publicWebPagePreview';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    getAdminWorkshopDataOrResponseMock,
    scrapePublicWebPagePreviewMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    scrapePublicWebPagePreviewMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock }));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({ getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock }));
vi.mock('@/lib/network/publicWebPagePreview', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/network/publicWebPagePreview')>()),
    scrapePublicWebPagePreview: scrapePublicWebPagePreviewMock,
}));

import { GET } from './route';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const ROUTE_CONTEXT = { params: Promise.resolve({ workshopId: WORKSHOP_ID }) };
const DESTINATION = 'https://example.com/guide?part=2#chapter';
const MATERIALS = [{ body_markdown: `[Prior guide](<${DESTINATION}>)` }];
const SUPABASE = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(async () => ({ data: MATERIALS, error: null })),
        })),
    })),
};

function createRequest(destination: string): NextRequest {
    const searchParameters = new URLSearchParams({ url: destination });
    return new NextRequest(`https://ptbk.io/api/admin/workshops/${WORKSHOP_ID}/content/link-preview?${searchParameters}`);
}

describe('admin workshop quick-link preview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: { id: WORKSHOP_ID } });
        scrapePublicWebPagePreviewMock.mockResolvedValue({
            url: 'https://example.com/guide?part=2', title: 'A useful guide', description: '', previewImageUrl: null,
        });
    });

    it('uses the shared scraper and warns about a destination already in ordinary materials', async () => {
        const response = await GET(createRequest(DESTINATION), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(scrapePublicWebPagePreviewMock).toHaveBeenCalledOnce();
        expect(scrapePublicWebPagePreviewMock).toHaveBeenCalledWith(DESTINATION);
        expect(await response.json()).toEqual({ title: 'A useful guide', state: 'ready', message: null, isExisting: true });
    });

    it('falls back to the submitted hostname when a public page is unreachable', async () => {
        scrapePublicWebPagePreviewMock.mockRejectedValue(new PublicWebPagePreviewError('Page could not be loaded'));

        const response = await GET(createRequest(DESTINATION), ROUTE_CONTEXT);

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ title: 'example.com', state: 'fallback', isExisting: true });
    });

    it('rejects invalid and disallowed targets instead of turning them into fallback links', async () => {
        const invalidResponse = await GET(createRequest('file:///private'), ROUTE_CONTEXT);
        expect(invalidResponse.status).toBe(400);
        expect(scrapePublicWebPagePreviewMock).not.toHaveBeenCalled();

        scrapePublicWebPagePreviewMock.mockRejectedValue(new PublicWebPagePreviewError('private address', 'disallowed'));
        const disallowedResponse = await GET(createRequest('http://127.0.0.1/private'), ROUTE_CONTEXT);
        expect(disallowedResponse.status).toBe(422);
    });

    it('requires an admin session before reading materials or scraping', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

        const response = await GET(createRequest(DESTINATION), ROUTE_CONTEXT);

        expect(response.status).toBe(401);
        expect(SUPABASE.from).not.toHaveBeenCalled();
        expect(scrapePublicWebPagePreviewMock).not.toHaveBeenCalled();
    });
});
