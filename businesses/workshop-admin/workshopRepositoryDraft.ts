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
    readonly branch: string;
    readonly deploymentUrl: string;
};

export const EMPTY_WORKSHOP_REPOSITORY_DRAFT: WorkshopRepositoryDraft = {
    repositoryUrl: '',
    branch: '',
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
        branch: repository.branch ?? '',
        deploymentUrl: repository.deploymentUrl ?? '',
    };
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

    return {
        url: repositoryUrl,
        branch: draft.branch.trim() || null,
        deploymentUrl: draft.deploymentUrl.trim() || null,
    };
}
