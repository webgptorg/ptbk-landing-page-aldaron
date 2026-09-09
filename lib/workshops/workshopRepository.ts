import { extractGithubBranchName, extractGithubRepository, type GithubRepository } from '@/lib/github/githubRepository';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * The project one workshop is about
 *
 * Note: A term either is about a project or is about none, so the branch which is followed and the address the project
 *       runs at belong to the repository rather than standing beside it. That is what lets the administration set,
 *       change, and unset the whole connection at once, and what keeps a room from following a branch of a repository
 *       nobody connected.
 */
export type WorkshopRepository = GithubRepository & {
    /**
     * The branch the workshop follows, `null` when it follows the branch the repository is read at by default
     */
    readonly branch: string | null;

    /**
     * Where the project of the workshop runs, `null` when it is published nowhere
     */
    readonly deploymentUrl: string | null;
};

/**
 * The stored connection of one room to a project, as far as it can be trusted
 *
 * Note: A repository which the application cannot read as a repository is deliberately read as no connection at all,
 *       rather than as a made-up one, so a room never links to a project which does not exist. The branch and the
 *       deployment are the same: what cannot be read is left out of the connection instead of taking it down.
 */
export function createWorkshopRepositoryOrNull(values: {
    readonly repository: string | null;
    readonly branch: string | null;
    readonly deploymentUrl: string | null;
}): WorkshopRepository | null {
    const repository = extractGithubRepository(values.repository);
    if (repository === null) {
        if (values.repository !== null && values.repository !== '') {
            console.error(`Unknown GitHub repository "${values.repository}" was read from the database.`);
        }
        return null;
    }

    return {
        ...repository,
        branch: extractGithubBranchName(values.branch),
        deploymentUrl: values.deploymentUrl === null ? null : normalizePublicWebPageUrl(values.deploymentUrl),
    };
}
