import {
    fetchGithubRepositoryCommit,
    fetchGithubRepositoryCommitPage,
    isGithubCommitOnBranch,
} from '@/lib/github/fetchGithubRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { normalizeGithubCommitSha } from '@/lib/github/githubCommitSha';
import type { GithubBranch } from '@/lib/github/githubRepository';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import { resolveWorkshopRepositoryBranches } from '@/lib/workshops/resolveWorkshopRepositoryBranches';
import {
    selectWorkshopRepositoryBoundaryCommit,
    createWorkshopRepositoryCommitDateFilter,
    type WorkshopRepositoryCommitBoundary,
    type WorkshopRepositoryCommitRange,
} from '@/lib/workshops/workshopRepositoryCommitRange';

export class WorkshopRepositoryCommitError extends Error {}

/** Resolves an abbreviated or full ID and refuses commits belonging only to unselected branches. */
export async function resolveWorkshopRepositoryCommit(
    repository: WorkshopRepository,
    commitId: string,
    branches?: readonly GithubBranch[],
): Promise<GithubCommit> {
    const normalizedCommitId = normalizeGithubCommitSha(commitId);
    if (normalizedCommitId === null) {
        throw new WorkshopRepositoryCommitError('Zadejte ID commitu (7 až 40 hexadecimálních znaků).');
    }
    const options = { repository, revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS };
    const commit = await fetchGithubRepositoryCommit({ ...options, commitId: normalizedCommitId });
    if (commit === null || !commit.sha.startsWith(normalizedCommitId)) {
        throw new WorkshopRepositoryCommitError('Commit se nepodařilo načíst. Ověřte ID a dostupnost GitHubu.');
    }
    const selectedBranches = branches ?? await resolveWorkshopRepositoryBranches(repository);
    for (const branch of selectedBranches) {
        if (branch.headSha === commit.sha || await isGithubCommitOnBranch({ ...options, branch: branch.name, commitId: commit.sha })) {
            return commit;
        }
    }
    throw new WorkshopRepositoryCommitError('Commit není dostupný v žádné z vybraných větví. Ověřte výběr větví a dostupnost GitHubu.');
}

export async function fetchWorkshopRepositoryCommitRange(
    repository: WorkshopRepository,
    branches?: readonly GithubBranch[],
): Promise<WorkshopRepositoryCommitRange> {
    const selectedBranches = branches ?? await resolveWorkshopRepositoryBranches(repository);
    const [start, end] = await Promise.all([
        repository.startCommit === undefined ? null : resolveWorkshopRepositoryCommit(repository, repository.startCommit, selectedBranches),
        repository.endCommit === undefined ? null : resolveWorkshopRepositoryCommit(repository, repository.endCommit, selectedBranches),
    ]);
    if (start !== null && end !== null && Date.parse(start.committedAt) > Date.parse(end.committedAt)) {
        throw new WorkshopRepositoryCommitError('Počáteční commit nesmí být pozdější než koncový commit.');
    }
    return { start, end };
}

/** Autofills just one boundary, searching the selected histories beyond their latest page. */
export async function findWorkshopRepositoryCommitByDate(
    repository: WorkshopRepository,
    boundary: WorkshopRepositoryCommitBoundary,
    date: string,
): Promise<GithubCommit> {
    const branches = await resolveWorkshopRepositoryBranches(repository);
    const candidates: GithubCommit[] = [];
    for (const branch of branches) {
        for (let page = 1; ; page += 1) {
            const result = await fetchGithubRepositoryCommitPage({
                repository, branch: branch.name, page,
                revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS,
                ...createWorkshopRepositoryCommitDateFilter(boundary, date),
            });
            if (result === null) throw new WorkshopRepositoryCommitError('Historii vybraných větví se nepodařilo načíst. Zkuste to znovu.');
            const candidate = selectWorkshopRepositoryBoundaryCommit(result.commits, boundary, date);
            if (candidate !== null) candidates.push(candidate);
            if (!result.isMoreAvailable || (boundary === 'end' && candidate !== null)) break;
        }
    }
    const commit = selectWorkshopRepositoryBoundaryCommit(candidates, boundary, date);
    if (commit === null) throw new WorkshopRepositoryCommitError('Ve vybraných větvích není commit odpovídající tomuto datu.');
    return commit;
}

/** Canonical IDs are saved; omitted boundaries stay independent and never become branch names. */
export async function resolveWorkshopRepositoryCommitBounds(repository: WorkshopRepository): Promise<WorkshopRepository> {
    if (repository.startCommit === undefined && repository.endCommit === undefined) return repository;
    const range = await fetchWorkshopRepositoryCommitRange(repository);
    return {
        ...repository,
        ...(range.start === null ? {} : { startCommit: range.start.sha }),
        ...(range.end === null ? {} : { endCommit: range.end.sha }),
    };
}
