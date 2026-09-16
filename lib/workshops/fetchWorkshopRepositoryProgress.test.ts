import type { GithubBranch } from '@/lib/github/githubRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { fetchWorkshopRepositoryProgress } from '@/lib/workshops/fetchWorkshopRepositoryProgress';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    fetchGithubRepositoryBranchesMock,
    fetchGithubRepositoryBranchHistoriesMock,
    fetchGithubRepositoryCommitsMock,
} = vi.hoisted(() => ({
    fetchGithubRepositoryBranchesMock: vi.fn(),
    fetchGithubRepositoryBranchHistoriesMock: vi.fn(),
    fetchGithubRepositoryCommitsMock: vi.fn(),
}));

vi.mock('@/lib/github/fetchGithubRepository', () => ({
    fetchGithubRepositoryBranches: fetchGithubRepositoryBranchesMock,
    fetchGithubRepositoryBranchHistories: fetchGithubRepositoryBranchHistoriesMock,
    fetchGithubRepositoryCommits: fetchGithubRepositoryCommitsMock,
}));

const AVAILABLE_BRANCHES: readonly GithubBranch[] = [
    { name: 'main', headSha: 'main-sha' },
    { name: 'client-dashboard', headSha: 'client-dashboard-sha' },
    { name: 'client-mobile', headSha: 'client-mobile-sha' },
    { name: 'feature/room', headSha: 'feature-room-sha' },
];

function createCommit(branchName: string): GithubCommit {
    return {
        sha: `${branchName}-commit`,
        message: `Commit on ${branchName}`,
        authorName: 'Pavol Hejný',
        committedAt: '2026-09-14T12:00:00.000Z',
        parentShas: [],
        branchNames: [branchName],
    };
}

function createRepository(branch: WorkshopRepository['branch']): WorkshopRepository {
    return { owner: 'hejny', name: 'promptbook', branch, deploymentUrls: [] };
}

describe('workshop repository progress branch patterns', () => {
    beforeEach(() => {
        fetchGithubRepositoryBranchesMock.mockReset();
        fetchGithubRepositoryBranchHistoriesMock.mockReset();
        fetchGithubRepositoryCommitsMock.mockReset();
        fetchGithubRepositoryBranchesMock.mockResolvedValue(AVAILABLE_BRANCHES);
        fetchGithubRepositoryBranchHistoriesMock.mockImplementation(
            async ({ branches }: { readonly branches: readonly GithubBranch[] }) =>
                branches.map((branch) => ({ branch, commits: [createCommit(branch.name)] })),
        );
    });

    it('expands literal names and wildcard patterns before fetching the history graph', async () => {
        const progress = await fetchWorkshopRepositoryProgress(createRepository(['main', 'client-*', 'feature/*']));

        expect(fetchGithubRepositoryBranchesMock).toHaveBeenCalledOnce();
        expect(fetchGithubRepositoryBranchHistoriesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                branches: [
                    { name: 'main', headSha: 'main-sha' },
                    { name: 'client-dashboard', headSha: 'client-dashboard-sha' },
                    { name: 'client-mobile', headSha: 'client-mobile-sha' },
                    { name: 'feature/room', headSha: 'feature-room-sha' },
                ],
            }),
        );
        expect(progress?.branches?.map((branch) => branch.name)).toEqual([
            'main',
            'client-dashboard',
            'client-mobile',
            'feature/room',
        ]);
    });

    it('treats a single asterisk as a pattern that resolves every branch', async () => {
        await fetchWorkshopRepositoryProgress(createRepository('*'));

        expect(fetchGithubRepositoryBranchHistoriesMock).toHaveBeenCalledWith(
            expect.objectContaining({ branches: AVAILABLE_BRANCHES }),
        );
        expect(fetchGithubRepositoryCommitsMock).not.toHaveBeenCalled();
    });
});
