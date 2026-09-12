import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { GithubBranch } from '@/lib/github/githubRepository';

export type WorkshopRepositoryBranch = GithubBranch;

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

    /** The branches whose histories were merged, present when more than the default branch was requested. */
    readonly branches?: readonly WorkshopRepositoryBranch[];
};

export type WorkshopRepositoryBranchHistory = {
    readonly branch: WorkshopRepositoryBranch;
    readonly commits: readonly GithubCommit[];
};

function mergeUniqueStrings(firstValues: readonly string[] = [], secondValues: readonly string[] = []): readonly string[] {
    return Array.from(new Set([...firstValues, ...secondValues]));
}

function mergeGithubCommits(firstCommit: GithubCommit, secondCommit: GithubCommit): GithubCommit {
    return {
        ...firstCommit,
        parentShas: mergeUniqueStrings(firstCommit.parentShas, secondCommit.parentShas),
        branchNames: mergeUniqueStrings(firstCommit.branchNames, secondCommit.branchNames),
    };
}

/**
 * Joins the histories of selected branches, keeping one commit node when branches share it and retaining every parent
 * and branch label needed by the graph.
 */
export function mergeWorkshopRepositoryBranchHistories(
    histories: readonly WorkshopRepositoryBranchHistory[],
): { readonly commits: readonly GithubCommit[]; readonly branches: readonly WorkshopRepositoryBranch[] } {
    const commitBySha = new Map<string, GithubCommit>();

    histories.forEach((history) => {
        history.commits.forEach((commit) => {
            const knownCommit = commitBySha.get(commit.sha);
            commitBySha.set(commit.sha, knownCommit === undefined ? commit : mergeGithubCommits(knownCommit, commit));
        });
    });

    const commits = Array.from(commitBySha.values())
        .sort((firstCommit, secondCommit) => {
            const committedAtComparison = secondCommit.committedAt.localeCompare(firstCommit.committedAt);
            return committedAtComparison === 0 ? firstCommit.sha.localeCompare(secondCommit.sha) : committedAtComparison;
        });

    return {
        commits,
        branches: histories.map((history) => history.branch),
    };
}

/**
 * Converts public API branch tips into the compact branch information the room sends to its graph
 */
export function createWorkshopRepositoryBranch(
    branch: GithubBranch,
    headSha: string | null = branch.headSha,
): WorkshopRepositoryBranch {
    return { name: branch.name, headSha };
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
