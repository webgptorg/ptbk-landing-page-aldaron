import type { WorkshopRepositoryWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { createGithubRepositoryUrl } from '@/lib/github/githubRepository';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';

/**
 * The project of one term as an administrator writes it, which is three lines of text until it is saved
 *
 * Note: The form keeps written text rather than a read repository, so an address which is still being typed stays
 *       exactly as it was typed instead of disappearing the moment it cannot be read yet.
 */
export type WorkshopRepositoryDraft = {
    readonly repositoryUrl: string;
    /** One branch per line; an empty value follows the repository default branch. */
    readonly branch: string;
    /** An explicit all-branches choice, distinct from the empty default-branch value. */
    readonly isAllBranches: boolean;
    readonly deploymentUrl: string;
};

export const EMPTY_WORKSHOP_REPOSITORY_DRAFT: WorkshopRepositoryDraft = {
    repositoryUrl: '',
    branch: '',
    isAllBranches: false,
    deploymentUrl: '',
};

/**
 * Writes a stored connection back into the form, which is how it is changed and how it is cleared
 */
export function createWorkshopRepositoryDraft(repository: WorkshopRepository | null): WorkshopRepositoryDraft {
    if (repository === null) {
        return EMPTY_WORKSHOP_REPOSITORY_DRAFT;
    }

    return {
        repositoryUrl: createGithubRepositoryUrl(repository),
        branch:
            repository.branch === null
                ? ''
                : typeof repository.branch === 'string'
                  ? repository.branch
                  : repository.branch.join('\n'),
        isAllBranches: repository.branch !== null && typeof repository.branch !== 'string' && repository.branch.length === 0,
        deploymentUrl: repository.deploymentUrl ?? '',
    };
}

function readWrittenBranches(branchValue: string): readonly string[] {
    return branchValue
        .split(/[,\r\n]/)
        .map((branch) => branch.trim())
        .filter((branch) => branch !== '');
}

/**
 * The project of one term as it is saved, or `null` when the form names no repository
 *
 * Note: A branch or a deployment written beside an empty repository is dropped together with it, so clearing the
 *       repository really disconnects the project instead of leaving half of it behind.
 */
export function createWorkshopRepositoryWriteValues(
    draft: WorkshopRepositoryDraft,
): WorkshopRepositoryWriteValues | null {
    const repositoryUrl = draft.repositoryUrl.trim();
    if (repositoryUrl === '') {
        return null;
    }

    if (draft.isAllBranches) {
        return {
            url: repositoryUrl,
            branch: [],
            deploymentUrl: draft.deploymentUrl.trim() || null,
        };
    }

    const branches = readWrittenBranches(draft.branch);

    return {
        url: repositoryUrl,
        branch: branches.length === 0 ? null : branches.length === 1 ? branches[0] : branches,
        deploymentUrl: draft.deploymentUrl.trim() || null,
    };
}
