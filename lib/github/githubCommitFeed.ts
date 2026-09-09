import { readXmlElements, readXmlTagAttribute, readXmlTagText } from '@/lib/xml/xmlTags';

/**
 * One commit of a repository, as far as the published feed of its commits describes it
 *
 * Note: The address of the commit is deliberately not read from the feed. It is built from the repository and this
 *       identifier instead, so a room can only ever link into the very repository its administrator connected.
 */
export type GithubCommit = {
    /**
     * The identifier Git gave this commit, which is what tells two commits apart
     */
    readonly sha: string;

    /**
     * The first line of the commit message, which is how the feed titles the commit
     */
    readonly message: string;

    /**
     * Who wrote the commit, `null` when the feed credits nobody
     */
    readonly authorName: string | null;

    /**
     * Moment the commit was made, as an ISO 8601 string
     */
    readonly committedAt: string;
};

const COMMIT_SHA_PATTERN = /[0-9a-f]{7,40}/i;

/**
 * Reads the identifier of a commit out of whatever the feed named the entry by
 *
 * Note: The identifier is written both into the identity of the entry and into the address it links to, so the entry
 *       is searched for a Git identifier rather than for one exact shape of either of them.
 */
function parseGithubCommitSha(entryXml: string): string | null {
    const commitReferences = [readXmlTagText(entryXml, 'id'), readXmlTagAttribute(entryXml, 'link', 'href')];

    for (const commitReference of commitReferences) {
        const shaMatch = COMMIT_SHA_PATTERN.exec(commitReference?.split('/').pop() ?? '');
        if (shaMatch !== null) {
            return shaMatch[0].toLowerCase();
        }
    }

    return null;
}

function parseGithubCommitAuthorName(entryXml: string): string | null {
    const [authorXml] = readXmlElements(entryXml, 'author');
    const authorName = authorXml === undefined ? null : readXmlTagText(authorXml, 'name');

    return authorName === null || authorName === '' ? null : authorName;
}

/**
 * Reads one `<entry>` of a commit feed as one commit, `null` when it names no commit
 */
function parseGithubCommit(entryXml: string): GithubCommit | null {
    const sha = parseGithubCommitSha(entryXml);
    const message = readXmlTagText(entryXml, 'title');

    if (sha === null || message === null || message === '') {
        return null;
    }

    const committedAt = new Date(readXmlTagText(entryXml, 'updated') ?? '');

    return {
        sha,
        message,
        authorName: parseGithubCommitAuthorName(entryXml),
        committedAt: (Number.isNaN(committedAt.getTime()) ? new Date(0) : committedAt).toISOString(),
    };
}

/**
 * Reads the commits of a repository out of its published feed
 *
 * @param xml body of the commit feed
 * @returns commits of the repository, newest first
 */
export function parseGithubCommitFeed(xml: string): readonly GithubCommit[] {
    return readXmlElements(xml, 'entry')
        .map(parseGithubCommit)
        .filter((commit): commit is GithubCommit => commit !== null)
        .sort((firstCommit, secondCommit) => secondCommit.committedAt.localeCompare(firstCommit.committedAt));
}
