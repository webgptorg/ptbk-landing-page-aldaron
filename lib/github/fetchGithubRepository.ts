import { parseGithubCommitFeed, type GithubCommit } from '@/lib/github/githubCommitFeed';
import { parseGithubApiCommitList, parseGithubBranchList } from '@/lib/github/githubCommitApi';
import {
    createGithubApiBranchesUrl,
    createGithubApiCommitsUrl,
    createGithubCommitFeedUrl,
    type GithubBranch,
    type GithubRepository,
} from '@/lib/github/githubRepository';
import { ATOM_FEED_MEDIA_TYPES } from '@/lib/network/feedMediaTypes';
import { fetchCachedText } from '@/lib/network/fetchCachedText';
import { MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT } from '@/lib/workshops/workshopConstants';

/**
 * Note: The API of GitHub refuses a request which does not name the client which made it, so every request this
 *       application makes to GitHub says who it is.
 */
const GITHUB_USER_AGENT = 'Promptbook Workshop Repository/1.0';
const GITHUB_API_ACCEPTED_MEDIA_TYPES = 'application/vnd.github+json, application/json;q=0.9';
const GITHUB_API_BRANCH_PAGE_SIZE = 100;
const GITHUB_API_BRANCH_REQUEST_BATCH_SIZE = 6;

export type FetchGithubRepositoryOptions = {
    readonly repository: GithubRepository;

    /**
     * How long a fetched answer may be reused before GitHub is asked again
     */
    readonly revalidateSeconds: number;
};

export type FetchGithubCommitsOptions = FetchGithubRepositoryOptions & {
    /**
     * The branch whose commits are read, `null` for the branch the repository is read at by default
     */
    readonly branch: string | null;
};

export type FetchGithubBranchCommitsOptions = FetchGithubRepositoryOptions & {
    /** The branch whose commit history is read through the REST API */
    readonly branch: string;
};

async function fetchGithubApiJson(url: string, revalidateSeconds: number): Promise<unknown | null> {
    const responseText = await fetchCachedText({
        url,
        revalidateSeconds,
        acceptedMediaTypes: GITHUB_API_ACCEPTED_MEDIA_TYPES,
        userAgent: GITHUB_USER_AGENT,
    });

    if (responseText === null) {
        return null;
    }

    try {
        return JSON.parse(responseText) as unknown;
    } catch (parseError) {
        console.error(`${url} answered with invalid JSON`, parseError);
        return null;
    }
}

/**
 * Reads the newest commits of a repository from the feed GitHub publishes them in
 *
 * Note: The feed is read rather than the API, because it needs no key of any kind and because it is exactly the
 *       handful of newest commits which say how a project is advancing.
 *
 * @returns commits of the repository, newest first, an empty list when the feed could not be read
 */
export async function fetchGithubRepositoryCommits(
    options: FetchGithubCommitsOptions,
): Promise<readonly GithubCommit[]> {
    const feedXml = await fetchCachedText({
        url: createGithubCommitFeedUrl(options.repository, options.branch),
        revalidateSeconds: options.revalidateSeconds,
        acceptedMediaTypes: ATOM_FEED_MEDIA_TYPES,
        userAgent: GITHUB_USER_AGENT,
    });

    return feedXml === null ? [] : parseGithubCommitFeed(feedXml);
}

/**
 * Reads every branch of a repository through the keyless public API, keeping each page cached independently. The
 * histories themselves are fetched in small batches, so the explicit all-branches setting remains polite to GitHub.
 */
export async function fetchGithubRepositoryBranches(
    options: FetchGithubRepositoryOptions,
): Promise<readonly GithubBranch[]> {
    const branches: GithubBranch[] = [];

    for (let page = 1; ; page += 1) {
        const branchPayload = await fetchGithubApiJson(
            createGithubApiBranchesUrl(options.repository, page, GITHUB_API_BRANCH_PAGE_SIZE),
            options.revalidateSeconds,
        );
        if (branchPayload === null) {
            break;
        }

        const pageBranches = parseGithubBranchList(branchPayload);
        pageBranches.forEach((branch) => {
            if (!branches.some((knownBranch) => knownBranch.name === branch.name)) {
                branches.push(branch);
            }
        });

        if (pageBranches.length < GITHUB_API_BRANCH_PAGE_SIZE) {
            break;
        }
    }

    return branches;
}

/**
 * Reads the newest commits of one branch with their parents, which is the information needed for a graph
 */
export async function fetchGithubRepositoryBranchCommits(
    options: FetchGithubBranchCommitsOptions,
): Promise<readonly GithubCommit[]> {
    const commitPayload = await fetchGithubApiJson(
        createGithubApiCommitsUrl(
            options.repository,
            options.branch,
            1,
            MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT,
        ),
        options.revalidateSeconds,
    );

    return commitPayload === null ? [] : parseGithubApiCommitList(commitPayload, options.branch);
}

/**
 * Reads several branch histories in small batches, so an all-branches workshop remains polite to GitHub even when a
 * repository has many active branches. Each URL is still cached by `fetchCachedText`, so participants do not multiply
 * the public API traffic.
 */
export async function fetchGithubRepositoryBranchHistories(
    options: FetchGithubRepositoryOptions & { readonly branches: readonly GithubBranch[] },
): Promise<
    readonly {
        readonly branch: GithubBranch;
        readonly commits: readonly GithubCommit[];
    }[]
> {
    const histories: {
        readonly branch: GithubBranch;
        readonly commits: readonly GithubCommit[];
    }[] = [];

    for (let fromIndex = 0; fromIndex < options.branches.length; fromIndex += GITHUB_API_BRANCH_REQUEST_BATCH_SIZE) {
        const branchBatch = options.branches.slice(fromIndex, fromIndex + GITHUB_API_BRANCH_REQUEST_BATCH_SIZE);
        const batchHistories = await Promise.all(
            branchBatch.map(async (branch) => ({
                branch,
                commits: await fetchGithubRepositoryBranchCommits({
                    repository: options.repository,
                    branch: branch.name,
                    revalidateSeconds: options.revalidateSeconds,
                }),
            })),
        );
        histories.push(...batchHistories);
    }

    return histories;
}
