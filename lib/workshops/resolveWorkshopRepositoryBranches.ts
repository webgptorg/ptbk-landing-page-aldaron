import { fetchGithubRepositoryBranches, fetchGithubRepositoryDefaultBranch } from '@/lib/github/fetchGithubRepository';
import {
    doesGithubBranchNameMatchSelection,
    doesGithubBranchSelectionUseWildcard,
    getGithubBranchSelectionPatterns,
} from '@/lib/github/githubRepository';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { createWorkshopRepositoryBranch, type WorkshopRepositoryBranch } from '@/lib/workshops/workshopRepositoryProgress';

/** One branch selection for the live graph, historical ranges, manual IDs, and date autofill. */
export async function resolveWorkshopRepositoryBranches(
    repository: WorkshopRepository,
): Promise<readonly WorkshopRepositoryBranch[]> {
    const options = { repository, revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS };
    if (repository.branch === null) {
        const name = await fetchGithubRepositoryDefaultBranch(options);
        return name === null ? [] : [{ name, headSha: null }];
    }
    if (!doesGithubBranchSelectionUseWildcard(repository.branch)) {
        return getGithubBranchSelectionPatterns(repository.branch)
            .map((name) => createWorkshopRepositoryBranch({ name, headSha: null }));
    }
    const branches = await fetchGithubRepositoryBranches(options);
    return branches.filter((branch) => doesGithubBranchNameMatchSelection(branch.name, repository.branch));
}
