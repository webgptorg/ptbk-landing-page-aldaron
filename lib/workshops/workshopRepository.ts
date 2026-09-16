import {
    extractGithubBranchSelection,
    extractGithubRepository,
    type GithubBranchSelection,
    type GithubRepository,
} from '@/lib/github/githubRepository';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * The project one workshop is about
 *
 * Note: A term either is about a project or is about none, so the branch selection and the addresses the project runs
 *       at belong to the repository rather than standing beside it. That is what lets the administration set, change,
 *       and unset the whole connection at once, and what keeps a room from following a branch of a repository nobody
 *       connected.
 */
export type WorkshopRepository = GithubRepository & {
    /**
     * The branch selection the workshop follows. `null` is the repository default branch; strings may be literal
     * branch names or patterns such as `client-*`, `feature/*`, and `*`.
     */
    readonly branch: GithubBranchSelection;

    /** Where the project of the workshop runs, in the administrator's displayed order. */
    readonly deploymentUrls: readonly string[];
};

/**
 * Reads deployment addresses defensively, keeping every valid canonical address once.
 *
 * Note: Database writes already validate these addresses. This second pass protects participant browsers from an old
 * or manually altered row, while preserving the order in which an administrator chose the deployments.
 */
function normalizeWorkshopDeploymentUrls(deploymentUrls: readonly string[]): readonly string[] {
    const normalizedDeploymentUrls = new Set<string>();

    deploymentUrls.forEach((deploymentUrl) => {
        const normalizedDeploymentUrl = normalizePublicWebPageUrl(deploymentUrl);
        if (normalizedDeploymentUrl !== null) {
            normalizedDeploymentUrls.add(normalizedDeploymentUrl);
        }
    });

    return [...normalizedDeploymentUrls];
}

/**
 * The stored connection of one room to a project, as far as it can be trusted
 *
 * Note: A repository which the application cannot read as a repository is deliberately read as no connection at all,
 *       rather than as a made-up one, so a room never links to a project which does not exist. The branch and the
 *       deployments are the same: what cannot be read is left out of the connection instead of taking it down.
 */
export function createWorkshopRepositoryOrNull(values: {
    readonly repository: string | null;
    readonly branch: string | readonly string[] | null;
    readonly deploymentUrls: readonly string[];
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
        branch: extractGithubBranchSelection(values.branch),
        deploymentUrls: normalizeWorkshopDeploymentUrls(values.deploymentUrls),
    };
}
