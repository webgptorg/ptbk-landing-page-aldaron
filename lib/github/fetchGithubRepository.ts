import { parseGithubCommitFeed, type GithubCommit } from '@/lib/github/githubCommitFeed';
import { createGithubCommitFeedUrl, type GithubRepository } from '@/lib/github/githubRepository';
import { ATOM_FEED_MEDIA_TYPES } from '@/lib/network/feedMediaTypes';
import { fetchCachedText } from '@/lib/network/fetchCachedText';

/**
 * Note: The API of GitHub refuses a request which does not name the client which made it, so every request this
 *       application makes to GitHub says who it is.
 */
const GITHUB_USER_AGENT = 'Promptbook Workshop Repository/1.0';

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
