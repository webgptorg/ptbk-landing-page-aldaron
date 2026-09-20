/** Full or unambiguous abbreviated Git commit IDs; branch names are deliberately not accepted. */
export const GITHUB_COMMIT_SHA_PATTERN = /^[0-9a-f]{7,40}$/i;

export function normalizeGithubCommitSha(value: string | null | undefined): string | null {
    const commitSha = value?.trim() ?? '';
    return GITHUB_COMMIT_SHA_PATTERN.test(commitSha) ? commitSha.toLowerCase() : null;
}
