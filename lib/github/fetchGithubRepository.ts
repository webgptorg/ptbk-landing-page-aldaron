import { parseGithubCommitFeed, type GithubCommit } from '@/lib/github/githubCommitFeed';
import { parseGithubApiCommit, parseGithubApiCommitList, parseGithubBranchList } from '@/lib/github/githubCommitApi';
import {
    createGithubApiBranchesUrl,
    createGithubApiCommitsUrl,
    createGithubCommitFeedUrl,
    createGithubApiRepositoryUrl,
    extractGithubBranchName,
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
export const GITHUB_COMMIT_HISTORY_PAGE_SIZE = 100;

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
 * histories themselves are fetched in small batches, so wildcard branch selections remain polite to GitHub.
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
        if (!Array.isArray(branchPayload)) {
            // A wildcard cannot safely mean only the pages which happened to load.
            return [];
        }

        const pageBranches = parseGithubBranchList(branchPayload);
        pageBranches.forEach((branch) => {
            if (!branches.some((knownBranch) => knownBranch.name === branch.name)) {
                branches.push(branch);
            }
        });

        if (branchPayload.length < GITHUB_API_BRANCH_PAGE_SIZE) {
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
 * Reads several branch histories in small batches, so a wildcard workshop remains polite to GitHub even when a
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

export type GithubCommitPage = {
    readonly commits: readonly GithubCommit[];
    readonly isMoreAvailable: boolean;
};

/** Pages a selected branch, optionally around an old workshop instead of only its current tip. */
export async function fetchGithubRepositoryCommitPage(
    options: FetchGithubBranchCommitsOptions & {
        readonly page: number;
        readonly since?: string;
        readonly until?: string;
    },
): Promise<GithubCommitPage | null> {
    const url = new URL(createGithubApiCommitsUrl(
        options.repository, options.branch, options.page, GITHUB_COMMIT_HISTORY_PAGE_SIZE,
    ));
    if (options.since !== undefined) url.searchParams.set('since', options.since);
    if (options.until !== undefined) url.searchParams.set('until', options.until);
    const payload = await fetchGithubApiJson(url.toString(), options.revalidateSeconds);
    if (!Array.isArray(payload)) return null;
    return {
        commits: parseGithubApiCommitList(payload, options.branch),
        isMoreAvailable: payload.length === GITHUB_COMMIT_HISTORY_PAGE_SIZE,
    };
}

export async function fetchGithubRepositoryCommit(
    options: FetchGithubRepositoryOptions & { readonly commitId: string },
): Promise<GithubCommit | null> {
    const payload = await fetchGithubApiJson(
        `${createGithubApiRepositoryUrl(options.repository)}/commits/${encodeURIComponent(options.commitId)}`,
        options.revalidateSeconds,
    );
    return parseGithubApiCommit(payload);
}

export async function fetchGithubRepositoryDefaultBranch(options: FetchGithubRepositoryOptions): Promise<string | null> {
    const payload = await fetchGithubApiJson(createGithubApiRepositoryUrl(options.repository), options.revalidateSeconds);
    if (typeof payload !== 'object' || payload === null || !('default_branch' in payload)) return null;
    return extractGithubBranchName(typeof payload.default_branch === 'string' ? payload.default_branch : null);
}

/** A commit belongs to a selected branch when it is reachable from that branch's tip, not just when it is the tip. */
export async function isGithubCommitOnBranch(
    options: FetchGithubBranchCommitsOptions & { readonly commitId: string },
): Promise<boolean> {
    const comparison = `${encodeURIComponent(options.commitId)}...${encodeURIComponent(options.branch)}`;
    const payload = await fetchGithubApiJson(
        `${createGithubApiRepositoryUrl(options.repository)}/compare/${comparison}?per_page=1`,
        options.revalidateSeconds,
    );
    return typeof payload === 'object' && payload !== null && 'status' in payload
        && (payload.status === 'ahead' || payload.status === 'identical');
}
