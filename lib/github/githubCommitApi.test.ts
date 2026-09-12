import { parseGithubApiCommit, parseGithubApiCommitList, parseGithubBranchList } from '@/lib/github/githubCommitApi';
import { describe, expect, it } from 'vitest';

const COMMIT_SHA = '0123456789abcdef0123456789abcdef01234567';
const PARENT_SHA = 'fedcba9876543210fedcba9876543210fedcba98';

describe('the public GitHub commit API parser', () => {
    it('keeps the commit identity, author, date, and parents needed by the graph', () => {
        expect(
            parseGithubApiCommit(
                {
                    sha: COMMIT_SHA,
                    commit: {
                        message: 'Add the graph\n\nDetails',
                        author: { name: 'Pavol Hejný', date: '2026-09-12T12:00:00Z' },
                        committer: { name: 'Pavol Hejný', date: '2026-09-12T12:01:00Z' },
                    },
                    author: { login: 'hejny' },
                    parents: [{ sha: PARENT_SHA }],
                },
                'feature/rooms',
            ),
        ).toEqual({
            sha: COMMIT_SHA,
            message: 'Add the graph',
            authorName: 'Pavol Hejný',
            committedAt: '2026-09-12T12:00:00.000Z',
            parentShas: [PARENT_SHA],
            branchNames: ['feature/rooms'],
        });
    });

    it('ignores malformed commits and keeps valid API commits newest first', () => {
        expect(
            parseGithubApiCommitList(
                [
                    { sha: PARENT_SHA, commit: { message: 'Older', author: { date: '2026-09-11T12:00:00Z' } } },
                    { sha: COMMIT_SHA, commit: { message: 'Newer', author: { date: '2026-09-12T12:00:00Z' } } },
                    { sha: 'not-a-commit', commit: { message: 'Ignore me' } },
                ],
                'main',
            ),
        ).toMatchObject([{ sha: COMMIT_SHA }, { sha: PARENT_SHA }]);
    });
});

describe('the public GitHub branch API parser', () => {
    it('reads branch names and their tips', () => {
        expect(
            parseGithubBranchList([
                { name: 'main', commit: { sha: COMMIT_SHA } },
                { name: 'feature/rooms', commit: { sha: PARENT_SHA } },
                { name: 'not a branch', commit: { sha: COMMIT_SHA } },
            ]),
        ).toEqual([
            { name: 'main', headSha: COMMIT_SHA },
            { name: 'feature/rooms', headSha: PARENT_SHA },
        ]);
    });
});
