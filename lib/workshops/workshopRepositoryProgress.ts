import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { GithubBranch } from '@/lib/github/githubRepository';
import type { WorkshopRepositoryCommitRange } from '@/lib/workshops/workshopRepositoryCommitRange';

export type WorkshopRepositoryCommitListener = (commit: GithubCommit) => void;

/**
 * Asks to hear about commits which appeared in an open room and answers with the way to stop listening
 */
export type SubscribeToWorkshopRepositoryCommits = (listener: WorkshopRepositoryCommitListener) => () => void;

export type WorkshopRepositoryBranch = GithubBranch;

/**
 * The commits of the project of a workshop, as its public feed publishes them
 *
 * Note: This is read from GitHub rather than from the database of the room, so it is `null` for a room whose
 *       repository feed could not be read at all and the room says so instead of claiming that nothing was committed.
 */
export type WorkshopRepositoryProgress = {
    readonly range?: WorkshopRepositoryCommitRange;
    /** An explicit null means the selected history has been exhausted. */
    readonly nextPage?: number | null;
    /**
     * The newest commits of the followed branch, newest first
     */
    readonly commits: readonly GithubCommit[];

    /** The branches whose histories were merged, present when more than the default branch was requested. */
    readonly branches?: readonly WorkshopRepositoryBranch[];
};

/** Combines fetched pages without losing shared branch labels or duplicating commits. */
export function mergeWorkshopRepositoryProgress(
    first: WorkshopRepositoryProgress | null,
    second: WorkshopRepositoryProgress | null,
): WorkshopRepositoryProgress | null {
    if (first === null) return second;
    if (second === null) return first;
    const branches = new Map([...(first.branches ?? []), ...(second.branches ?? [])].map((branch) => [branch.name, branch]));
    return {
        ...first, ...second,
        commits: mergeWorkshopRepositoryCommitLists([first.commits, second.commits]),
        branches: Array.from(branches.values()),
    };
}

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
    return {
        commits: mergeWorkshopRepositoryCommitLists(histories.map((history) => history.commits)),
        branches: histories.map((history) => history.branch),
    };
}

/** Both branch histories and successive pages share the same commit identity and ordering rules. */
function mergeWorkshopRepositoryCommitLists(commitLists: readonly (readonly GithubCommit[])[]): readonly GithubCommit[] {
    const commitBySha = new Map<string, GithubCommit>();

    commitLists.forEach((commits) => {
        commits.forEach((commit) => {
            const knownCommit = commitBySha.get(commit.sha);
            commitBySha.set(commit.sha, knownCommit === undefined ? commit : mergeGithubCommits(knownCommit, commit));
        });
    });

    return Array.from(commitBySha.values())
        .sort((firstCommit, secondCommit) => {
            const committedAtComparison = secondCommit.committedAt.localeCompare(firstCommit.committedAt);
            return committedAtComparison === 0 ? firstCommit.sha.localeCompare(secondCommit.sha) : committedAtComparison;
        });

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
    return selectNewWorkshopRepositoryCommits(knownCommitShas, commits).map((commit) => commit.sha);
}

/**
 * Selects the complete commits which were not in the room's previous repository answer
 */
export function selectNewWorkshopRepositoryCommits(
    knownCommitShas: ReadonlySet<string>,
    commits: readonly GithubCommit[],
): readonly GithubCommit[] {
    return commits.filter((commit) => !knownCommitShas.has(commit.sha));
}
