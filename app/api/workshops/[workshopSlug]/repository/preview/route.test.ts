import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const PREVIEW_MOCKS = vi.hoisted(() => ({ authenticate: vi.fn(), mapWorkshop: vi.fn(), loadPreview: vi.fn() }));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: PREVIEW_MOCKS.authenticate,
    isAuthenticatedWorkshopRequest: (value: unknown) => !(value instanceof NextResponse),
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ mapWorkshopRow: PREVIEW_MOCKS.mapWorkshop }));
vi.mock('@/lib/workshops/workshopEventCardDetails', () => ({ createWorkshopProjectPreview: PREVIEW_MOCKS.loadPreview }));

const REPOSITORY = { owner: 'example', name: 'project', branch: null, deploymentUrls: ['https://app.example.com/'] };
const PREVIEW = {
    title: 'Workshop app', description: 'Deployed project', previewImageUrl: 'https://app.example.com/preview.png',
    repositoryName: 'example/project', deploymentUrl: 'https://app.example.com/',
};
const REQUEST = new NextRequest('https://ptbk.io/api/workshops/test-workshop/repository/preview?url=https://ignored.example.com');
const CONTEXT = { params: Promise.resolve({ workshopSlug: 'test-workshop' }) };

beforeEach(() => {
    vi.resetAllMocks();
    PREVIEW_MOCKS.authenticate.mockResolvedValue({ workshopRow: {}, participant: { email: 'private@example.com' } });
    PREVIEW_MOCKS.mapWorkshop.mockReturnValue({ kind: 'workshop', repository: REPOSITORY });
    PREVIEW_MOCKS.loadPreview.mockResolvedValue(PREVIEW);
});

describe('authenticated workshop project previews', () => {
    it('uses the stored deployment and the shared preview service, without exposing participant data', async () => {
        const response = await GET(REQUEST, CONTEXT);
        expect(await response.json()).toEqual({ preview: PREVIEW });
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(PREVIEW_MOCKS.loadPreview).toHaveBeenCalledWith(REPOSITORY);
    });

    it.each([401, 404])('does not fetch external metadata when the room request returns %s', async (status) => {
        PREVIEW_MOCKS.authenticate.mockResolvedValue(NextResponse.json({ error: 'Unavailable' }, { status }));
        expect((await GET(REQUEST, CONTEXT)).status).toBe(status);
        expect(PREVIEW_MOCKS.loadPreview).not.toHaveBeenCalled();
    });

    it.each([
        { kind: 'community', repository: REPOSITORY },
        { kind: 'project', repository: REPOSITORY },
        { kind: 'workshop', repository: null },
    ])('does not preview an unavailable project', async (workshop) => {
        PREVIEW_MOCKS.mapWorkshop.mockReturnValue(workshop);
        expect((await GET(REQUEST, CONTEXT)).status).toBe(404);
        expect(PREVIEW_MOCKS.loadPreview).not.toHaveBeenCalled();
    });
});
