import {
    fetchGithubRepositoryBranches,
    fetchGithubRepositoryBranchHistories,
    fetchGithubRepositoryCommits,
} from '@/lib/github/fetchGithubRepository';
import {
    doesGithubBranchNameMatchSelection,
    doesGithubBranchSelectionUseWildcard,
    getGithubBranchSelectionPatterns,
    isGithubMultipleBranchesSelection,
} from '@/lib/github/githubRepository';
import {
    MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT,
    WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import {
    createWorkshopRepositoryBranch,
    mergeWorkshopRepositoryBranchHistories,
    type WorkshopRepositoryBranch,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';

/**
 * Reads the newest commits of the project of one workshop
 *
 * Note: A repository which publishes no readable commits produces no answer, so the room can say that the commit feed
 *       was unavailable instead of claiming there was no work.
 *
 * @returns the newest commits, `null` when GitHub could not be read at all
 */
export async function fetchWorkshopRepositoryProgress(
    repository: WorkshopRepository,
): Promise<WorkshopRepositoryProgress | null> {
    if (isGithubMultipleBranchesSelection(repository.branch)) {
        return fetchMultipleWorkshopRepositoryBranchProgress(repository);
    }

    const allCommits = await fetchGithubRepositoryCommits({
        repository,
        branch: getGithubBranchSelectionPatterns(repository.branch)[0] ?? null,
        revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    });

    if (allCommits.length === 0) {
        return null;
    }

    return {
        commits: allCommits.slice(0, MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT),
    };
}

async function fetchMultipleWorkshopRepositoryBranchProgress(
    repository: WorkshopRepository,
): Promise<WorkshopRepositoryProgress | null> {
    const branches = await resolveWorkshopRepositoryBranches(repository);

    if (branches.length === 0) {
        return null;
    }

    const branchHistories = await fetchGithubRepositoryBranchHistories({
        repository,
        branches,
        revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    });
    const progress = mergeWorkshopRepositoryBranchHistories(
        branchHistories.map((history) => ({
            branch: {
                ...history.branch,
                headSha: history.branch.headSha ?? history.commits[0]?.sha ?? null,
            },
            commits: history.commits,
        })),
    );

    return progress.commits.length === 0 ? null : progress;
}

/**
 * Resolves a workshop's literal branch names directly and expands wildcard patterns from GitHub's current branch list.
 */
async function resolveWorkshopRepositoryBranches(
    repository: WorkshopRepository,
): Promise<readonly WorkshopRepositoryBranch[]> {
    const branchPatterns = getGithubBranchSelectionPatterns(repository.branch);

    if (!doesGithubBranchSelectionUseWildcard(repository.branch)) {
        return branchPatterns.map((branchName) => createWorkshopRepositoryBranch({ name: branchName, headSha: null }));
    }

    const availableBranches = await fetchGithubRepositoryBranches({
        repository,
        revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    });
    return availableBranches
        .filter((branch) => doesGithubBranchNameMatchSelection(branch.name, repository.branch))
        .map((branch) => createWorkshopRepositoryBranch(branch));
}
