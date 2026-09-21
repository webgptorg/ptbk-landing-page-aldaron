import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import type { WorkshopWrapUpExport } from '@/lib/workshops/workshopWrapUpExport';

const MOCKS = vi.hoisted(() => ({
    authenticate: vi.fn(), mapWorkshop: vi.fn(), loadState: vi.fn(), createShortLink: vi.fn(),
    loadHistory: vi.fn(), loadPreview: vi.fn(), loadImage: vi.fn(),
}));
vi.mock('@/lib/workshops/workshopRequest', () => ({
    getAuthenticatedWorkshopRequest: MOCKS.authenticate,
    isAuthenticatedWorkshopRequest: (value: unknown) => !(value instanceof NextResponse),
}));
vi.mock('@/lib/workshops/workshopDatabase', () => ({ mapWorkshopRow: MOCKS.mapWorkshop, loadWorkshopPublicState: MOCKS.loadState }));
vi.mock('@/lib/shortener/shortcodeLinkAdHoc', () => ({ createAdHocShortcodeLink: MOCKS.createShortLink }));
vi.mock('@/lib/workshops/fetchWorkshopRepositoryHistory', () => ({ fetchWorkshopRepositoryHistory: MOCKS.loadHistory }));
vi.mock('@/lib/workshops/workshopEventCardDetails', () => ({ createWorkshopProjectPreview: MOCKS.loadPreview }));
vi.mock('@/lib/network/publicWebPagePreviewImage', () => ({ loadPublicWebPagePreviewImage: MOCKS.loadImage }));

const WORKSHOP = {
    slug: 'test-workshop', kind: 'workshop', title: 'Tvorba aplikace', description: 'S AI agenty.',
    isPublished: true, startsAt: '2026-09-19T10:00:00Z', endsAt: '2026-09-19T11:00:00Z', presentationUrl: null,
    repository: { owner: 'example', name: 'demo', branch: ['main', 'agent-*'], deploymentUrls: ['https://example.com'] },
    youtubeVideoId: 'PRIVATE_RECORDING',
};
const SUPABASE = {};
const WORKSHOP_ROW = { id: 'workshop-id' };
const PARTICIPANT = { email: 'private@example.com' };
const MATERIALS = [{ title: 'Přístupný materiál', bodyMarkdown: 'SERVER-APPROVED BODY', isFollowUp: true }];
const STATE = {
    workshop: WORKSHOP, contentBlocks: MATERIALS, serverTime: '2026-09-19T12:00:00Z',
    participant: PARTICIPANT, comments: [{ body: 'PRIVATE CHAT' }], feedback: { note: 'PRIVATE FEEDBACK' },
    paidMembersOnlyContentPreviews: [{ title: 'PRIVATE OFFER' }],
};
const CONTEXT = { params: Promise.resolve({ workshopSlug: WORKSHOP.slug }) };
function createRequest(headers?: HeadersInit) {
    return new NextRequest(`https://ptbk.io/api/workshops/${WORKSHOP.slug}/wrap-up`, { method: 'POST', headers });
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-20T12:00:00Z'));
    MOCKS.authenticate.mockResolvedValue({ supabase: SUPABASE, workshopRow: WORKSHOP_ROW, participant: PARTICIPANT });
    MOCKS.mapWorkshop.mockReturnValue(WORKSHOP);
    MOCKS.loadState.mockResolvedValue({ state: STATE });
    MOCKS.createShortLink.mockResolvedValue({ shortcodeLink: { shortcode: 'pdf123' }, errorMessage: null });
    MOCKS.loadHistory.mockResolvedValue({ commits: [], nextPage: null });
    MOCKS.loadPreview.mockResolvedValue({ title: 'Demo', previewImageUrl: 'https://example.com/card.webp' });
    MOCKS.loadImage.mockResolvedValue('data:image/jpeg;base64,cHJldmlldw==');
});
afterEach(() => vi.useRealTimers());

describe('authenticated workshop recap preparation', () => {
    it('creates a canonical ad hoc link, shares the selected history and exports only permitted recap fields', async () => {
        const response = await POST(createRequest(), CONTEXT);
        const result = await response.json() as WorkshopWrapUpExport;
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(MOCKS.loadState).toHaveBeenCalledWith(SUPABASE, WORKSHOP_ROW, PARTICIPANT, 'recent');
        expect(result.source.contentBlocks).toEqual(MATERIALS);
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
        expect(JSON.stringify(result)).not.toContain('private@example.com');
        expect(MOCKS.createShortLink).toHaveBeenCalledWith(SUPABASE, {
            urls: ['https://ptbk.io/cs/online-workshop/participant?workshop=test-workshop'],
            note: 'Shrnutí workshopu: test-workshop', sourceApp: 'online-workshop',
        });
        expect(result.shortUrl).toBe('https://ptbk.io/pdf123');
        expect(result.projectPreviewImage).toMatch(/^data:image\/jpeg/);
        expect(MOCKS.loadHistory).toHaveBeenCalledWith(WORKSHOP.repository, { page: 1, isExpanded: false });
    });

    it.each([401, 404])('does no export work when authentication/publication returns %s', async (status) => {
        MOCKS.authenticate.mockResolvedValue(NextResponse.json({ error: 'Unavailable' }, { status }));
        expect((await POST(createRequest(), CONTEXT)).status).toBe(status);
        expect(MOCKS.loadState).not.toHaveBeenCalled();
        expect(MOCKS.createShortLink).not.toHaveBeenCalled();
    });

    it.each([
        { endsAt: null }, { endsAt: '2026-09-21T11:00:00Z' }, { kind: 'community' }, { isPublished: false },
    ])('refuses an unavailable workshop before creating a short link', async (change) => {
        MOCKS.mapWorkshop.mockReturnValue({ ...WORKSHOP, ...change });
        expect((await POST(createRequest(), CONTEXT)).status).toBe(409);
        expect(MOCKS.createShortLink).not.toHaveBeenCalled();
    });

    it('rejects cross-site requests before authentication or writes', async () => {
        expect((await POST(createRequest({ origin: 'https://foreign.example', 'sec-fetch-site': 'cross-site' }), CONTEXT)).status).toBe(403);
        expect(MOCKS.authenticate).not.toHaveBeenCalled();
        expect(MOCKS.createShortLink).not.toHaveBeenCalled();
    });

    it('retains the recap when optional external history or images are unavailable', async () => {
        MOCKS.loadHistory.mockRejectedValue(new Error('GitHub unavailable'));
        MOCKS.loadImage.mockResolvedValue(null);
        const result = await (await POST(createRequest(), CONTEXT)).json() as WorkshopWrapUpExport;
        expect(result.source.contentBlocks).toEqual(MATERIALS);
        expect(result.repositoryProgress).toBeNull();
        expect(result.projectPreviewImage).toBeNull();
    });

    it('reports a shortener failure instead of silently encoding the long URL', async () => {
        MOCKS.createShortLink.mockResolvedValue({ shortcodeLink: null, errorMessage: 'Database unavailable' });
        expect((await POST(createRequest(), CONTEXT)).status).toBe(503);
        expect(MOCKS.loadHistory).not.toHaveBeenCalled();
    });
});
