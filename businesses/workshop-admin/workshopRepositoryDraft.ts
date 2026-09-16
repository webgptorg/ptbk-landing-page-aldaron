import type { WorkshopRepositoryWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import {
    createGithubRepositoryUrl,
    getGithubBranchSelectionPatterns,
} from '@/lib/github/githubRepository';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';

/**
 * The project of one term as an administrator writes it, which is three lines of text until it is saved
 *
 * Note: The form keeps written text rather than a read repository, so an address which is still being typed stays
 *       exactly as it was typed instead of disappearing the moment it cannot be read yet.
 */
export type WorkshopRepositoryDraft = {
    readonly repositoryUrl: string;
    /** Branch patterns separated by lines or commas; an empty value follows the repository default branch. */
    readonly branch: string;
    /** One address of a deployment per line; an empty value means the project is published nowhere. */
    readonly deploymentUrls: string;
};

export const EMPTY_WORKSHOP_REPOSITORY_DRAFT: WorkshopRepositoryDraft = {
    repositoryUrl: '',
    branch: '',
    deploymentUrls: '',
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
        branch: getGithubBranchSelectionPatterns(repository.branch).join('\n'),
        deploymentUrls: repository.deploymentUrls.join('\n'),
    };
}

/**
 * Reads the values an administrator listed in one field, whichever of its separators they reached for
 */
function readWrittenValues(writtenValue: string, separatorPattern: RegExp): readonly string[] {
    return writtenValue
        .split(separatorPattern)
        .map((value) => value.trim())
        .filter((value) => value !== '');
}

/** A branch name carries neither a comma nor a line break, so either of them separates two of them. */
const BRANCH_SEPARATOR_PATTERN = /[,\r\n]/;

/**
 * An address carries no whitespace at all, which is what separates two of them. A comma is deliberately not a
 * separator here, because it is a legitimate character of a query string.
 */
const DEPLOYMENT_URL_SEPARATOR_PATTERN = /\s+/;

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

    const branches = readWrittenValues(draft.branch, BRANCH_SEPARATOR_PATTERN);

    return {
        url: repositoryUrl,
        branch: branches.length === 0 ? null : branches.length === 1 ? branches[0] : branches,
        deploymentUrls: readWrittenValues(draft.deploymentUrls, DEPLOYMENT_URL_SEPARATOR_PATTERN),
    };
}
