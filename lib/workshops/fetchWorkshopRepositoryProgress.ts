import {
    fetchGithubRepositoryBranchHistories,
    fetchGithubRepositoryCommits,
} from '@/lib/github/fetchGithubRepository';
import {
    getGithubBranchSelectionPatterns,
    isGithubMultipleBranchesSelection,
} from '@/lib/github/githubRepository';
import {
    MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT,
    WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import {
    mergeWorkshopRepositoryBranchHistories,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';
import { resolveWorkshopRepositoryBranches } from '@/lib/workshops/resolveWorkshopRepositoryBranches';
import { fetchWorkshopRepositoryHistory } from '@/lib/workshops/fetchWorkshopRepositoryHistory';

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
    if (repository.startCommit !== undefined || repository.endCommit !== undefined) {
        return fetchWorkshopRepositoryHistory(repository, { page: 1, isExpanded: false });
    }
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
        nextPage: 1,
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

    return progress.commits.length === 0 ? null : { ...progress, nextPage: 1 };
}
