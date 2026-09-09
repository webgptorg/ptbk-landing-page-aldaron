import { fetchGithubRepositoryCommits, fetchGithubRepositoryDetails } from '@/lib/github/fetchGithubRepository';
import {
    MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT,
    WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    WORKSHOP_REPOSITORY_DETAILS_REVALIDATE_SECONDS,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import {
    summarizeWorkshopRepositoryCommits,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';

/**
 * Reads how far the project of one workshop has come
 *
 * Note: What the repository says about itself and what was committed in it are read at once and independently, so a
 *       repository which publishes no readable commits is still described and one which GitHub describes no longer is
 *       still followed.
 *
 * @param startsAt the moment the workshop begins at, which the commits made during it are counted from
 * @returns the progress of the repository, `null` when GitHub could not be read at all
 */
export async function fetchWorkshopRepositoryProgress(
    repository: WorkshopRepository,
    startsAt: string,
): Promise<WorkshopRepositoryProgress | null> {
    const [details, allCommits] = await Promise.all([
        fetchGithubRepositoryDetails({
            repository,
            revalidateSeconds: WORKSHOP_REPOSITORY_DETAILS_REVALIDATE_SECONDS,
        }),
        fetchGithubRepositoryCommits({
            repository,
            branch: repository.branch,
            revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
        }),
    ]);

    if (details === null && allCommits.length === 0) {
        return null;
    }

    return {
        details,
        commits: allCommits.slice(0, MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT),
        ...summarizeWorkshopRepositoryCommits(allCommits, startsAt),
    };
}
