/**
 * A repository is named by the account which owns it and by its own name, exactly as GitHub writes it in a URL
 *
 * Note: This is the whole identity of a repository. Every address of it — the page, the commits, the feed of them and
 *       the API — is built from these two words, so nothing else ever stores or passes a GitHub address around.
 */
export type GithubRepository = {
    readonly owner: string;
    readonly name: string;
};

/**
 * The branches a workshop follows
 *
 * Note: `null` keeps the original meaning of following the repository's default branch. A non-empty array contains
 * explicitly selected branches, while an empty array is the explicit choice to follow every branch. The three values
 * are deliberately one shape everywhere so a connection cannot grow a second, conflicting branch setting.
 */
export type GithubBranchSelection = string | readonly string[] | null;

export type GithubBranch = {
    readonly name: string;
    readonly headSha: string | null;
};

/**
 * How GitHub itself writes an account name and a repository name
 *
 * Note: An account is letters, digits and hyphens, a repository additionally a dot and an underscore. A repository
 *       named `.` or `..` would be a path rather than a repository, which is why a name has to carry at least one
 *       character which is none of them.
 */
const GITHUB_OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const GITHUB_REPOSITORY_NAME_PATTERN = /^(?=.*[A-Za-z0-9_-])[A-Za-z0-9._-]{1,100}$/;

/**
 * The branches of a repository which may be followed
 *
 * Note: A branch name may carry slashes, which is what makes `feature/repository-panel` one name rather than two, and
 *       must carry neither a space nor a `..`, which Git itself refuses as well.
 */
const GITHUB_BRANCH_PATTERN = /^[A-Za-z0-9._\-/]{1,255}$/;

const GITHUB_HOSTNAMES = new Set(['github.com', 'www.github.com']);
const GITHUB_SSH_PREFIX = 'git@github.com:';
const GITHUB_REPOSITORY_URL_SUFFIX = '.git';
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_API_REPOSITORY_PATH_PREFIX = '/repos';

function createGithubRepositoryOrNull(owner: string | undefined, name: string | undefined): GithubRepository | null {
    // Note: The address `git clone` is given ends with `.git`, which is not a part of the name of the repository.
    const writtenName = name ?? '';
    const normalizedName = writtenName.endsWith(GITHUB_REPOSITORY_URL_SUFFIX)
        ? writtenName.slice(0, -GITHUB_REPOSITORY_URL_SUFFIX.length)
        : writtenName;

    if (
        owner === undefined ||
        !GITHUB_OWNER_PATTERN.test(owner) ||
        !GITHUB_REPOSITORY_NAME_PATTERN.test(normalizedName)
    ) {
        return null;
    }

    return { owner, name: normalizedName };
}

/**
 * Reads the repository an administrator wrote, however they wrote it
 *
 * Note: `owner/name`, the address of the repository page, the address a branch or a file of it is read at, and the
 *       address `git clone` was given all name one and the same repository, so all of them are accepted and read as
 *       that repository. Anything else is refused rather than stored as a repository which does not exist.
 *
 * @returns the repository, `null` when the value names none
 */
export function extractGithubRepository(value: string | null | undefined): GithubRepository | null {
    const trimmedValue = value?.trim() ?? '';
    if (trimmedValue === '') {
        return null;
    }

    const sshPathname = trimmedValue.startsWith(GITHUB_SSH_PREFIX)
        ? trimmedValue.slice(GITHUB_SSH_PREFIX.length)
        : null;
    if (sshPathname !== null) {
        const [owner, name] = sshPathname.split('/');
        return createGithubRepositoryOrNull(owner, name);
    }

    if (!trimmedValue.includes('://')) {
        const [owner, name, ...remainingSegments] = trimmedValue.split('/');
        return remainingSegments.length > 0 ? null : createGithubRepositoryOrNull(owner, name);
    }

    let url: URL;
    try {
        url = new URL(trimmedValue);
    } catch {
        return null;
    }

    if (!GITHUB_HOSTNAMES.has(url.hostname.toLowerCase())) {
        return null;
    }

    // Note: Whatever leads deeper into the repository — a branch, a file, an issue — still names this very repository,
    //       so it is read as the repository rather than refused.
    const [owner, name] = url.pathname.split('/').filter(Boolean);
    return createGithubRepositoryOrNull(owner, name);
}

/**
 * Reads the branch an administrator wrote, `null` when they wrote none or wrote something which is no branch name
 */
export function extractGithubBranchName(value: string | null | undefined): string | null {
    const trimmedValue = value?.trim() ?? '';

    if (
        trimmedValue === '' ||
        trimmedValue.includes('..') ||
        trimmedValue.startsWith('/') ||
        trimmedValue.endsWith('/') ||
        !GITHUB_BRANCH_PATTERN.test(trimmedValue)
    ) {
        return null;
    }

    return trimmedValue;
}

/**
 * Reads the branch selection stored for a workshop, leaving an invalid database value at the safe default branch
 * rather than constructing a URL from it.
 */
export function extractGithubBranchSelection(
    value: string | readonly string[] | null | undefined,
): GithubBranchSelection {
    if (typeof value !== 'string' && value !== null && value !== undefined) {
        const branches = value.map((branch) => extractGithubBranchName(branch));
        if (branches.some((branch) => branch === null) || new Set(branches).size !== branches.length) {
            return null;
        }

        const validBranches = branches.filter((branch): branch is string => branch !== null);
        return validBranches.length === 1 ? validBranches[0] : validBranches;
    }

    return extractGithubBranchName(value);
}

/**
 * Turns the one branch selection into the database array representation. `[]` is the explicit all-branches choice;
 * `null` is the legacy/default-branch choice.
 */
export function serializeGithubBranchSelection(selection: GithubBranchSelection): readonly string[] | null {
    if (selection === null) {
        return null;
    }

    return typeof selection === 'string' ? [selection] : selection;
}

export function isGithubAllBranchesSelection(selection: GithubBranchSelection): boolean {
    return typeof selection !== 'string' && selection !== null && selection.length === 0;
}

export function isGithubMultipleBranchesSelection(selection: GithubBranchSelection): boolean {
    return typeof selection !== 'string' && selection !== null && (selection.length === 0 || selection.length > 1);
}

/**
 * The branch names explicitly named by a selection, leaving the default branch unnamed because GitHub chooses it.
 */
export function getGithubSelectedBranchNames(selection: GithubBranchSelection): readonly string[] {
    if (selection === null) {
        return [];
    }

    return typeof selection === 'string' ? [selection] : selection;
}

/**
 * Gives an administrator-facing compact value for the branch selection, while leaving the default choice empty
 */
export function formatGithubBranchSelection(selection: GithubBranchSelection): string | null {
    if (selection === null) {
        return null;
    }

    return isGithubAllBranchesSelection(selection) ? 'Všechny větve' : getGithubSelectedBranchNames(selection).join(', ');
}

/**
 * Writes a repository the way GitHub names it, for example `hejny/promptbook`
 */
export function formatGithubRepositoryName({ owner, name }: GithubRepository): string {
    return `${owner}/${name}`;
}

/**
 * Note: A branch is written into an address segment by segment, so a branch named `feature/x` keeps being one branch
 *       rather than becoming two segments of a path which leads nowhere.
 */
function encodeGithubBranchName(branch: string): string {
    return branch.split('/').map(encodeURIComponent).join('/');
}

export function createGithubRepositoryUrl(repository: GithubRepository): string {
    return `https://github.com/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`;
}

/**
 * The page listing the commits of a repository, of one branch of it when a branch is followed
 */
export function createGithubCommitsUrl(repository: GithubRepository, branch: string | null): string {
    const commitsUrl = `${createGithubRepositoryUrl(repository)}/commits`;
    return branch === null ? commitsUrl : `${commitsUrl}/${encodeGithubBranchName(branch)}`;
}

/**
 * The published feed of those very commits, which GitHub serves to anybody without an API key
 */
export function createGithubCommitFeedUrl(repository: GithubRepository, branch: string | null): string {
    return `${createGithubCommitsUrl(repository, branch)}.atom`;
}

function createGithubApiRepositoryUrl(repository: GithubRepository): string {
    return `${GITHUB_API_URL}${GITHUB_API_REPOSITORY_PATH_PREFIX}/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`;
}

/**
 * The keyless GitHub API address which lists the branches of a repository
 */
export function createGithubApiBranchesUrl(repository: GithubRepository, page: number, pageSize: number): string {
    const url = new URL(`${createGithubApiRepositoryUrl(repository)}/branches`);
    url.searchParams.set('per_page', String(pageSize));
    url.searchParams.set('page', String(page));
    return url.toString();
}

/**
 * The keyless GitHub API address which reads a branch's commits, including their parents for the graph
 */
export function createGithubApiCommitsUrl(
    repository: GithubRepository,
    branch: string,
    page: number,
    pageSize: number,
): string {
    const url = new URL(`${createGithubApiRepositoryUrl(repository)}/commits`);
    url.searchParams.set('sha', branch);
    url.searchParams.set('per_page', String(pageSize));
    url.searchParams.set('page', String(page));
    return url.toString();
}

/**
 * Links to the commits selected by a workshop, with a repository-wide page for more than one branch
 */
export function createGithubCommitsUrlForBranchSelection(
    repository: GithubRepository,
    selection: GithubBranchSelection,
): string {
    const selectedBranchNames = getGithubSelectedBranchNames(selection);
    return createGithubCommitsUrl(repository, selectedBranchNames.length === 1 ? selectedBranchNames[0]! : null);
}

export function createGithubCommitUrl(repository: GithubRepository, commitSha: string): string {
    return `${createGithubRepositoryUrl(repository)}/commit/${encodeURIComponent(commitSha)}`;
}
