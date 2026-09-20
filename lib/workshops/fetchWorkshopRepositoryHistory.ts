import { fetchGithubRepositoryCommitPage } from '@/lib/github/fetchGithubRepository';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { fetchWorkshopRepositoryCommitRange } from '@/lib/workshops/fetchWorkshopRepositoryCommitRange';
import { resolveWorkshopRepositoryBranches } from '@/lib/workshops/resolveWorkshopRepositoryBranches';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { createWorkshopRepositoryCommitDateFilter, isCommitInWorkshopRepositoryRange } from '@/lib/workshops/workshopRepositoryCommitRange';
import { mergeWorkshopRepositoryBranchHistories, type WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';

export type WorkshopRepositoryHistoryOptions = { readonly page: number; readonly isExpanded: boolean };

/** Every page starts from selected branch tips, even when the time window is expanded. */
export async function fetchWorkshopRepositoryHistory(
    repository: WorkshopRepository,
    options: WorkshopRepositoryHistoryOptions,
): Promise<WorkshopRepositoryProgress | null> {
    const branches = await resolveWorkshopRepositoryBranches(repository);
    if (branches.length === 0) return null;
    const range = await fetchWorkshopRepositoryCommitRange(repository, branches);
    const histories = [];
    let isMoreAvailable = false;
    // Keep the API traffic bounded in concurrency, including wildcard selections.
    for (const branch of branches) {
        const result = await fetchGithubRepositoryCommitPage({
            repository, branch: branch.name, page: options.page,
            revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
            ...(!options.isExpanded && range.start !== null ? createWorkshopRepositoryCommitDateFilter('start', range.start.committedAt) : {}),
            ...(!options.isExpanded && range.end !== null ? createWorkshopRepositoryCommitDateFilter('end', range.end.committedAt) : {}),
        });
        if (result === null) return null;
        isMoreAvailable ||= result.isMoreAvailable;
        histories.push({
            branch,
            commits: options.isExpanded ? result.commits
                : result.commits.filter((commit) => isCommitInWorkshopRepositoryRange(commit, range)),
        });
    }
    return {
        ...mergeWorkshopRepositoryBranchHistories(histories),
        range,
        nextPage: isMoreAvailable ? options.page + 1 : null,
    };
}
