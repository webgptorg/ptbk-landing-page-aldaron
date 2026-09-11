import type { GithubCommit } from '@/lib/github/githubCommitFeed';

/**
 * The commits of the project of a workshop, as its public feed publishes them
 *
 * Note: This is read from GitHub rather than from the database of the room, so it is `null` for a room whose
 *       repository feed could not be read at all and the room says so instead of claiming that nothing was committed.
 */
export type WorkshopRepositoryProgress = {
    /**
     * The newest commits of the followed branch, newest first
     */
    readonly commits: readonly GithubCommit[];
};

/**
 * The commits which arrived since the room last read the repository
 *
 * Note: A room marks exactly these, so somebody watching a workshop sees which commit appeared while they watched
 *       rather than being told that everything ever committed is new.
 */
export function selectNewWorkshopRepositoryCommitShas(
    knownCommitShas: ReadonlySet<string>,
    commits: readonly GithubCommit[],
): readonly string[] {
    return commits.map((commit) => commit.sha).filter((commitSha) => !knownCommitShas.has(commitSha));
}
