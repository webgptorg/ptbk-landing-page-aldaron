import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { GithubRepositoryDetails } from '@/lib/github/githubRepositoryDetails';

/**
 * How far the project of a workshop has come, as its published commits tell it
 *
 * Note: This is read from GitHub rather than from the database of the room, so it is `null` for a room whose
 *       repository could not be read at all and the room says so instead of claiming that nothing was committed.
 */
export type WorkshopRepositoryProgress = {
    /**
     * What GitHub says about the repository itself, `null` when it said nothing about it
     */
    readonly details: GithubRepositoryDetails | null;

    /**
     * The newest commits of the followed branch, newest first
     */
    readonly commits: readonly GithubCommit[];

    /**
     * How many of them were made since the workshop began, which is the work the participants watched happen
     */
    readonly commitCountSinceStart: number;

    /**
     * Whether that number is the whole truth, or the read commits all happened after the workshop began and there may
     * be more of them than were read
     *
     * Note: Only the newest handful of commits is published in the feed, so a very busy repository is counted from
     *       what it published rather than pretending to have counted every commit of it.
     */
    readonly isCommitCountSinceStartComplete: boolean;
};

/**
 * Counts the commits which were made since one moment, and says whether that count is exact
 */
export function summarizeWorkshopRepositoryCommits(
    commits: readonly GithubCommit[],
    startsAt: string,
): Pick<WorkshopRepositoryProgress, 'commitCountSinceStart' | 'isCommitCountSinceStartComplete'> {
    const startsAtMilliseconds = Date.parse(startsAt);
    if (Number.isNaN(startsAtMilliseconds)) {
        return { commitCountSinceStart: 0, isCommitCountSinceStartComplete: false };
    }

    const commitCountSinceStart = commits.filter(
        (commit) => Date.parse(commit.committedAt) >= startsAtMilliseconds,
    ).length;

    return {
        commitCountSinceStart,
        isCommitCountSinceStartComplete: commitCountSinceStart < commits.length,
    };
}

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
