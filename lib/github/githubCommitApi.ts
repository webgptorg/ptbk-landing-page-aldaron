import { extractGithubBranchName, type GithubBranch } from '@/lib/github/githubRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';

const GITHUB_COMMIT_SHA_PATTERN = /^[0-9a-f]{7,40}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
    return typeof value === 'string' && value !== '' ? value : null;
}

function readGithubCommitSha(value: unknown): string | null {
    const sha = readString(value);
    return sha !== null && GITHUB_COMMIT_SHA_PATTERN.test(sha) ? sha.toLowerCase() : null;
}

function readGithubCommitDate(value: unknown): string {
    const date = new Date(readString(value) ?? '');
    return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function readGithubCommitAuthorName(commitPayload: Record<string, unknown>): string | null {
    const commitDetails = isRecord(commitPayload.commit) ? commitPayload.commit : null;
    const commitAuthor = commitDetails !== null && isRecord(commitDetails.author) ? commitDetails.author : null;
    const commitCommitter = commitDetails !== null && isRecord(commitDetails.committer) ? commitDetails.committer : null;
    const githubAuthor = isRecord(commitPayload.author) ? commitPayload.author : null;

    return (
        readString(commitAuthor?.name) ??
        readString(githubAuthor?.login) ??
        readString(commitCommitter?.name) ??
        readString(commitPayload.committer && isRecord(commitPayload.committer) ? commitPayload.committer.login : null)
    );
}

function readGithubCommitMessage(commitPayload: Record<string, unknown>): string | null {
    const commitDetails = isRecord(commitPayload.commit) ? commitPayload.commit : null;
    const message = readString(commitDetails?.message);
    if (message === null) {
        return null;
    }

    const firstLine = message.split(/\r?\n/)[0]?.trim() ?? '';
    return firstLine === '' ? null : firstLine;
}

function readGithubCommitParentShas(commitPayload: Record<string, unknown>): readonly string[] {
    if (!Array.isArray(commitPayload.parents)) {
        return [];
    }

    return commitPayload.parents
        .map((parent) => (isRecord(parent) ? readGithubCommitSha(parent.sha) : null))
        .filter((parentSha): parentSha is string => parentSha !== null);
}

/**
 * Reads the small part of one GitHub REST commit response which the participant room can safely show
 */
export function parseGithubApiCommit(value: unknown, branchName: string): GithubCommit | null {
    if (!isRecord(value)) {
        return null;
    }

    const sha = readGithubCommitSha(value.sha);
    const message = readGithubCommitMessage(value);
    if (sha === null || message === null) {
        return null;
    }

    const commitDetails = isRecord(value.commit) ? value.commit : null;
    const commitAuthor = commitDetails !== null && isRecord(commitDetails.author) ? commitDetails.author : null;
    const commitCommitter = commitDetails !== null && isRecord(commitDetails.committer) ? commitDetails.committer : null;

    return {
        sha,
        message,
        authorName: readGithubCommitAuthorName(value),
        committedAt: readGithubCommitDate(commitAuthor?.date ?? commitCommitter?.date),
        parentShas: readGithubCommitParentShas(value),
        branchNames: [branchName],
    };
}

/**
 * Reads a page of GitHub REST commits, newest first
 */
export function parseGithubApiCommitList(value: unknown, branchName: string): readonly GithubCommit[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((commitPayload) => parseGithubApiCommit(commitPayload, branchName))
        .filter((commit): commit is GithubCommit => commit !== null)
        .sort((firstCommit, secondCommit) => secondCommit.committedAt.localeCompare(firstCommit.committedAt));
}

/**
 * Reads branch names and their tips from a GitHub REST response
 */
export function parseGithubBranchList(value: unknown): readonly GithubBranch[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((branchPayload) => {
        if (!isRecord(branchPayload)) {
            return [];
        }

        const name = extractGithubBranchName(readString(branchPayload.name));
        const commit = isRecord(branchPayload.commit) ? branchPayload.commit : null;
        const headSha = readGithubCommitSha(commit?.sha);
        return name === null || headSha === null ? [] : [{ name, headSha }];
    });
}
