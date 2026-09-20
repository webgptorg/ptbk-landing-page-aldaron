import type { WorkshopRepositoryWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { WorkshopRepositoryCommitBoundary } from '@/lib/workshops/workshopRepositoryCommitRange';

export type WorkshopRepositoryCommitLookup =
    | { readonly kind: 'id'; readonly commitId: string }
    | { readonly kind: 'date'; readonly boundary: WorkshopRepositoryCommitBoundary; readonly date: string };

export async function fetchAdminWorkshopRepositoryCommit(
    repository: WorkshopRepositoryWriteValues,
    lookup: WorkshopRepositoryCommitLookup,
    signal?: AbortSignal,
): Promise<GithubCommit> {
    const response = await fetch('/api/admin/workshops/repository/commit', {
        method: 'POST', credentials: 'same-origin', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository: { url: repository.url, branch: repository.branch }, lookup }),
    });
    const result = await response.json() as { readonly commit?: GithubCommit; readonly error?: string };
    if (!response.ok || result.commit === undefined) throw new Error(result.error ?? 'Commit se nepodařilo načíst.');
    return result.commit;
}
