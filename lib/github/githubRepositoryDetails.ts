/**
 * What GitHub itself says about a repository, as much of it as a preview of that repository shows
 *
 * Note: Only the few facts which describe the project are read. Everything a room needs to link somewhere is built
 *       from the identity of the repository instead, so an answer of GitHub can never send a reader elsewhere.
 */
export type GithubRepositoryDetails = {
    /**
     * The sentence the repository describes itself with, `null` when it describes itself with none
     */
    readonly description: string | null;

    /**
     * The branch the repository is read at when no branch is followed, `null` when GitHub named none
     */
    readonly defaultBranch: string | null;

    /**
     * The language most of the repository is written in, `null` when GitHub named none
     */
    readonly primaryLanguage: string | null;
    readonly starCount: number;
};

const MAXIMAL_REPOSITORY_DESCRIPTION_LENGTH = 500;

function readText(value: unknown, maximalLength: number): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? null : trimmedValue.slice(0, maximalLength);
}

function readCount(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/**
 * Reads what GitHub answered about one repository
 *
 * Note: An answer which is not the description of a repository is read as no description at all, so a changed or a
 *       broken answer leaves the room showing the repository it was connected to rather than made-up facts about it.
 *
 * @param json body GitHub answered with
 * @returns what the answer says about the repository, `null` when it says nothing about one
 */
export function parseGithubRepositoryDetails(json: string): GithubRepositoryDetails | null {
    let answer: unknown;
    try {
        answer = JSON.parse(json);
    } catch {
        return null;
    }

    if (typeof answer !== 'object' || answer === null) {
        return null;
    }

    const repositoryAnswer = answer as Readonly<Record<string, unknown>>;
    if (typeof repositoryAnswer.full_name !== 'string') {
        return null;
    }

    return {
        description: readText(repositoryAnswer.description, MAXIMAL_REPOSITORY_DESCRIPTION_LENGTH),
        defaultBranch: readText(repositoryAnswer.default_branch, 255),
        primaryLanguage: readText(repositoryAnswer.language, 100),
        starCount: readCount(repositoryAnswer.stargazers_count),
    };
}
