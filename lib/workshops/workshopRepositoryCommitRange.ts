import type { GithubCommit } from '@/lib/github/githubCommitFeed';

export type WorkshopRepositoryCommitBoundary = 'start' | 'end';

export type WorkshopRepositoryCommitRange = {
    readonly start: GithubCommit | null;
    readonly end: GithubCommit | null;
};

const GIT_TIMESTAMP_PRECISION_MILLISECONDS = 1_000;

/** GitHub describes since/until as exclusive; widen by one Git second and apply our inclusive rule afterward. */
export function createWorkshopRepositoryCommitDateFilter(boundary: WorkshopRepositoryCommitBoundary, date: string) {
    const timestamp = Date.parse(date) + (boundary === 'start' ? -1 : 1) * GIT_TIMESTAMP_PRECISION_MILLISECONDS;
    return boundary === 'start' ? { since: new Date(timestamp).toISOString() } : { until: new Date(timestamp).toISOString() };
}

/** The same inclusive timeline applies across every selected branch, including parallel work. */
export function isCommitInWorkshopRepositoryRange(
    commit: GithubCommit,
    range: WorkshopRepositoryCommitRange,
): boolean {
    const committedAt = Date.parse(commit.committedAt);
    return (range.start === null || committedAt >= Date.parse(range.start.committedAt))
        && (range.end === null || committedAt <= Date.parse(range.end.committedAt));
}

export function selectWorkshopRepositoryBoundaryCommit(
    commits: readonly GithubCommit[],
    boundary: WorkshopRepositoryCommitBoundary,
    date: string,
): GithubCommit | null {
    const timestamp = Date.parse(date);
    const candidates = commits.filter((commit) => boundary === 'start'
        ? Date.parse(commit.committedAt) >= timestamp
        : Date.parse(commit.committedAt) <= timestamp);
    candidates.sort((first, second) => {
        const difference = Date.parse(first.committedAt) - Date.parse(second.committedAt);
        return (boundary === 'start' ? difference : -difference) || first.sha.localeCompare(second.sha);
    });
    return candidates[0] ?? null;
}
