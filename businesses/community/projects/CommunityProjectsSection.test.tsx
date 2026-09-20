/** @vitest-environment jsdom */
import { CommunityProjectsSection } from './CommunityProjectsSection';
import { WORKSHOP_ROOM_REFRESH_CONTEXT } from '@/components/workshops/WorkshopRoomRefreshContext';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { FETCH_PROJECTS } = vi.hoisted(() => ({ FETCH_PROJECTS: vi.fn() }));
vi.mock('./communityProjectsApi', async (importOriginal) => ({
    ...await importOriginal<typeof import('./communityProjectsApi')>(),
    fetchCommunityProjects: FETCH_PROJECTS,
}));

const PROJECT: CommunityProject = {
    id: 'project', title: 'Čekající projekt', url: 'https://example.com', description: 'Ukázka',
    previewImageUrl: null, status: 'pending', authorName: 'Jana', upvoteCount: 0, downvoteCount: 0,
    voteByParticipant: null, discussionWorkshopSlug: 'project-discussion', createdAt: '2026-09-20T10:00:00Z',
};

function roomProjects(refreshTime: string) {
    return (
        <WORKSHOP_ROOM_REFRESH_CONTEXT.Provider value={refreshTime}>
            <CommunityProjectsSection isLimited />
        </WORKSHOP_ROOM_REFRESH_CONTEXT.Provider>
    );
}

describe('project gallery following room moderation', () => {
    afterEach(() => { cleanup(); vi.resetAllMocks(); });

    it('refreshes approval after the room refreshes without hiding cards or clearing a project draft', async () => {
        FETCH_PROJECTS.mockResolvedValueOnce({ projects: [PROJECT], isModerationOffered: true });
        const { rerender } = render(roomProjects('before-promotion'));
        await screen.findByText('Čeká na schválení');
        fireEvent.click(screen.getByRole('button', { name: 'Sdílet projekt' }));
        const draft = screen.getByRole('textbox', { name: 'URL projektu' });
        fireEvent.change(draft, { target: { value: 'https://example.com/draft' } });

        let resolveProjects!: (value: unknown) => void;
        FETCH_PROJECTS.mockImplementationOnce(() => new Promise((resolve) => { resolveProjects = resolve; }));
        rerender(roomProjects('after-promotion'));
        expect(screen.queryByText('Načítám projekty…')).toBeNull();
        expect(screen.getByText(PROJECT.title)).not.toBeNull();
        await act(async () => resolveProjects({ projects: [{ ...PROJECT, status: 'approved' }], isModerationOffered: true }));

        await waitFor(() => expect(screen.queryByText('Čeká na schválení')).toBeNull());
        expect(draft).toHaveProperty('value', 'https://example.com/draft');
        expect(FETCH_PROJECTS).toHaveBeenCalledTimes(2);
    });

    it('ignores an older response that arrives after a more recent room refresh', async () => {
        let resolveOlderProjects!: (value: unknown) => void;
        FETCH_PROJECTS.mockImplementationOnce(() => new Promise((resolve) => { resolveOlderProjects = resolve; }));
        const { rerender } = render(roomProjects('before-promotion'));
        FETCH_PROJECTS.mockResolvedValueOnce({ projects: [{ ...PROJECT, status: 'approved' }], isModerationOffered: true });
        rerender(roomProjects('after-promotion'));
        await screen.findByText(PROJECT.title);
        await act(async () => resolveOlderProjects({ projects: [PROJECT], isModerationOffered: true }));
        expect(screen.queryByText('Čeká na schválení')).toBeNull();
    });
});
