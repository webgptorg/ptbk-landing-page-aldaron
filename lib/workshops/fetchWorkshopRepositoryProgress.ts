import { fetchGithubRepositoryCommits } from '@/lib/github/fetchGithubRepository';
import {
    MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT,
    WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';

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
    const allCommits = await fetchGithubRepositoryCommits({
        repository,
        branch: repository.branch,
        revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
    });

    if (allCommits.length === 0) {
        return null;
    }

    return {
        commits: allCommits.slice(0, MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT),
    };
}
