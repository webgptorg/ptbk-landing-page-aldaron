import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { autoApproveMock, authenticateMock, createProjectMock, loadProjectMock, scrapePreviewMock } = vi.hoisted(() => ({
    autoApproveMock: vi.fn(), authenticateMock: vi.fn(), createProjectMock: vi.fn(), loadProjectMock: vi.fn(), scrapePreviewMock: vi.fn(),
}));
vi.mock('@/lib/workshops/workshopAutoApproval', () => ({ autoApproveWorkshopSubmission: autoApproveMock }));
vi.mock('@/lib/community/communityRequest', () => ({
    getAuthenticatedCommunityRequest: authenticateMock,
    isAuthenticatedCommunityRequest: (value: unknown) => !(value instanceof NextResponse),
}));
vi.mock('@/lib/community-projects/communityProjectService', () => ({ createCommunityProject: createProjectMock }));
vi.mock('@/lib/community-projects/communityProjectDatabase', () => ({ loadCommunityProjectById: loadProjectMock, loadCommunityProjects: vi.fn() }));
vi.mock('@/lib/community-projects/communityProjectPreview', () => ({ scrapeCommunityProjectPreview: scrapePreviewMock }));

import { POST } from './route';

const PARTICIPANT = { id: 'participant-id', isTrusted: false, isModerator: false, isInteractionBanned: false };
const PROJECT = { id: 'project-id', url: 'https://example.com/project', title: 'Uložený projekt', description: 'Uložený popis', previewImageUrl: 'https://example.com/preview.png', status: 'pending' };
const SUPABASE = {};

function createRequest(): NextRequest {
    return new NextRequest('https://example.com/api/workshops/komunita/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com', title: 'Nový projekt', description: 'Popis projektu', status: 'approved' }),
    });
}

describe('automatic approval when sharing community projects', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authenticateMock.mockResolvedValue({ supabase: SUPABASE, participant: PARTICIPANT });
        scrapePreviewMock.mockResolvedValue({ url: PROJECT.url, previewImageUrl: PROJECT.previewImageUrl });
        createProjectMock.mockResolvedValue({ projectId: PROJECT.id, errorMessage: null });
        loadProjectMock.mockResolvedValue({ project: PROJECT, errorMessage: null });
        autoApproveMock.mockResolvedValue(false);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });
    afterEach(() => vi.restoreAllMocks());

    it.each([true, false])('reviews only the saved card after the creation transaction (approval: %s)', async (isApproved) => {
        autoApproveMock.mockImplementation(async () => {
            expect(createProjectMock).toHaveBeenCalledTimes(1);
            expect(loadProjectMock).toHaveBeenCalledTimes(1);
            return isApproved;
        });

        const response = await POST(createRequest());

        expect(response.status).toBe(201);
        expect(autoApproveMock).toHaveBeenCalledWith(SUPABASE, PARTICIPANT, {
            kind: 'project', id: PROJECT.id, status: 'pending',
            content: { url: PROJECT.url, title: PROJECT.title, description: PROJECT.description, previewImageUrl: PROJECT.previewImageUrl },
        });
        expect(await response.json()).toEqual({ project: { ...PROJECT, status: isApproved ? 'approved' : 'pending' } });
        expect(createProjectMock.mock.calls[0]![0]).not.toHaveProperty('status');
    });

    it('does not call AI for a failed project transaction', async () => {
        createProjectMock.mockResolvedValue({ projectId: null, errorMessage: 'database unavailable' });
        expect((await POST(createRequest())).status).toBe(500);
        expect(autoApproveMock).not.toHaveBeenCalled();
    });

    it('does not call AI without a community session', async () => {
        authenticateMock.mockResolvedValue(NextResponse.json({ error: 'Sign in' }, { status: 401 }));
        expect((await POST(createRequest())).status).toBe(401);
        expect(scrapePreviewMock).not.toHaveBeenCalled();
        expect(autoApproveMock).not.toHaveBeenCalled();
    });
});
