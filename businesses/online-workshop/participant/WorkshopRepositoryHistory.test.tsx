/** @vitest-environment jsdom */
import { useEffect } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import { useWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';

const { fetchProgressMock, notificationMock } = vi.hoisted(() => ({ fetchProgressMock: vi.fn(), notificationMock: vi.fn() }));
vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', () => ({ fetchWorkshopRepositoryProgress: fetchProgressMock }));
const COMMITS: GithubCommit[] = [14, 13, 12, 11].map((hour) => ({
    sha: String(hour).repeat(20), message: `Change at ${hour}`, authorName: 'Alice',
    committedAt: `2026-09-01T${hour}:00:00Z`, branchNames: ['main'],
}));
const RANGE = { start: COMMITS[2]!, end: COMMITS[1]! };
const REPOSITORY: WorkshopRepository = { owner: 'example', name: 'workshop', branch: 'main', deploymentUrls: [], startCommit: RANGE.start.sha, endCommit: RANGE.end.sha };
const PROGRESS: WorkshopRepositoryProgress = { commits: COMMITS.slice(1, 3), range: RANGE, nextPage: null, branches: [{ name: 'main', headSha: COMMITS[0]!.sha }] };

function Panel({ repository = REPOSITORY }: { repository?: WorkshopRepository }) {
    const controller = useWorkshopRepositoryProgress('workshop', true, repository);
    useEffect(() => controller.subscribeToNewCommits(notificationMock), [controller.subscribeToNewCommits]);
    return <WorkshopRepositoryPanel workshopSlug="workshop" repository={repository} progressController={controller} />;
}

beforeEach(() => {
    notificationMock.mockReset();
    fetchProgressMock.mockReset();
    fetchProgressMock.mockImplementation(async (_slug, options) => ({ progress: options === undefined ? PROGRESS : { ...PROGRESS, commits: COMMITS } }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('browsing a workshop commit graph', () => {
    it('starts with the highlighted inclusive range, expands and collapses without announcing historical commits', async () => {
        render(<Panel />);
        await screen.findByText('Change at 13');
        expect(screen.queryByText('Change at 14')).toBeNull();
        expect(screen.queryByText('Change at 11')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Rozbalit graf mimo rozsah workshopu' }));
        await screen.findByText('Change at 14');
        expect(screen.getByText('Change at 11')).not.toBeNull();
        expect(screen.getByText('Change at 13').closest('a')?.getAttribute('data-workshop-commit-in-range')).toBe('true');
        expect(screen.getByText('Change at 14').closest('a')?.hasAttribute('data-workshop-commit-in-range')).toBe(false);
        expect(fetchProgressMock).toHaveBeenLastCalledWith('workshop', { page: 1, isExpanded: true });
        expect(notificationMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Zobrazit jen rozsah workshopu' }));
        expect(screen.queryByText('Change at 14')).toBeNull();
        expect(screen.getByText('Change at 12')).not.toBeNull();
    });

    it.each([
        [{ start: RANGE.start, end: null }, [14, 13, 12]],
        [{ start: null, end: RANGE.end }, [13, 12, 11]],
        [{ start: null, end: null }, [14, 13, 12, 11]],
    ] as const)('shows every commit allowed by each independently open boundary', async (range, visibleHours) => {
        fetchProgressMock.mockResolvedValue({ progress: { ...PROGRESS, range, commits: COMMITS } });
        render(<Panel />);
        await screen.findByText(`Change at ${visibleHours[0]}`);
        for (const hour of [14, 13, 12, 11]) expect(screen.queryByText(`Change at ${hour}`) !== null).toBe(visibleHours.some((visibleHour) => visibleHour === hour));
    });

    it('loads subsequent pages within the range and deduplicates overlapping commits', async () => {
        fetchProgressMock.mockResolvedValueOnce({ progress: { ...PROGRESS, commits: [COMMITS[1]], nextPage: 2 } })
            .mockResolvedValueOnce({ progress: PROGRESS });
        render(<Panel />);
        await screen.findByText('Change at 13');
        fireEvent.click(screen.getByRole('button', { name: 'Načíst další commity' }));
        await screen.findByText('Change at 12');
        expect(screen.getAllByText('Change at 13')).toHaveLength(1);
        expect(fetchProgressMock).toHaveBeenLastCalledWith('workshop', { page: 2, isExpanded: false });
        expect(screen.queryByRole('button', { name: 'Načíst další commity' })).toBeNull();
    });

    it('ignores history from a previously selected repository', async () => {
        let finishHistory!: (value: { progress: WorkshopRepositoryProgress }) => void;
        fetchProgressMock.mockResolvedValueOnce({ progress: PROGRESS })
            .mockImplementationOnce(() => new Promise((resolve) => { finishHistory = resolve; }))
            .mockResolvedValue({ progress: { commits: [], nextPage: null } });
        const view = render(<Panel />);
        await screen.findByText('Change at 13');
        fireEvent.click(screen.getByRole('button', { name: 'Rozbalit graf mimo rozsah workshopu' }));
        view.rerender(<Panel repository={{ ...REPOSITORY, name: 'another-workshop' }} />);
        await waitFor(() => expect(fetchProgressMock).toHaveBeenCalledTimes(3));
        await act(async () => finishHistory({ progress: { ...PROGRESS, commits: COMMITS } }));
        expect(screen.queryByText('Change at 14')).toBeNull();
        expect(screen.queryByText('Change at 13')).toBeNull();
    });

    it('discards an old history request even after returning to the same repository', async () => {
        let finishOldHistory!: (value: { progress: WorkshopRepositoryProgress }) => void;
        fetchProgressMock.mockResolvedValueOnce({ progress: PROGRESS })
            .mockImplementationOnce(() => new Promise((resolve) => { finishOldHistory = resolve; }))
            .mockResolvedValue({ progress: PROGRESS });
        const view = render(<Panel />);
        await screen.findByText('Change at 13');
        fireEvent.click(screen.getByRole('button', { name: 'Rozbalit graf mimo rozsah workshopu' }));
        view.rerender(<Panel repository={{ ...REPOSITORY, branch: 'client-demo' }} />);
        await waitFor(() => expect(fetchProgressMock).toHaveBeenCalledTimes(3));
        view.rerender(<Panel />);
        await waitFor(() => expect(fetchProgressMock).toHaveBeenCalledTimes(4));

        await act(async () => finishOldHistory({ progress: { ...PROGRESS, commits: COMMITS } }));
        fireEvent.click(screen.getByRole('button', { name: 'Rozbalit graf mimo rozsah workshopu' }));

        await waitFor(() => expect(fetchProgressMock).toHaveBeenCalledTimes(5));
        expect(screen.queryByText('Change at 14')).toBeNull();
    });

    it('establishes its notification baseline only after a successful read', async () => {
        vi.useFakeTimers();
        fetchProgressMock.mockResolvedValueOnce({ progress: null }).mockResolvedValue({ progress: PROGRESS });
        render(<Panel />);
        await act(async () => {});

        await act(async () => { await vi.advanceTimersByTimeAsync(WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000); });

        expect(screen.getByText('Change at 13')).not.toBeNull();
        expect(notificationMock).not.toHaveBeenCalled();
    });

    it('keeps the loaded range visible while a refresh is unavailable', async () => {
        vi.useFakeTimers();
        fetchProgressMock.mockResolvedValueOnce({ progress: PROGRESS }).mockResolvedValue({ progress: null });
        render(<Panel />);
        await act(async () => {});
        expect(screen.getByText('Change at 13')).not.toBeNull();

        await act(async () => { await vi.advanceTimersByTimeAsync(WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000); });

        expect(screen.getByText('Change at 13')).not.toBeNull();
        expect(notificationMock).not.toHaveBeenCalled();
    });
});
