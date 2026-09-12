import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import {
    mergeWorkshopRepositoryBranchHistories,
    selectNewWorkshopRepositoryCommitShas,
} from '@/lib/workshops/workshopRepositoryProgress';
import { describe, expect, it } from 'vitest';

function createCommit(sha: string, committedAt: string): GithubCommit {
    return { sha, message: `Commit ${sha}`, authorName: 'Pavol Hejný', committedAt };
}

const COMMITS = [
    createCommit('c3', '2026-09-09T18:20:00.000Z'),
    createCommit('c2', '2026-09-09T17:05:00.000Z'),
    createCommit('c1', '2026-09-09T09:00:00.000Z'),
];

describe('the commits which arrived while somebody watched', () => {
    it('are the ones the room had not read before', () => {
        expect(selectNewWorkshopRepositoryCommitShas(new Set(['c1', 'c2']), COMMITS)).toEqual(['c3']);
    });

    it('are none of them when the room already knew every one of them', () => {
        expect(selectNewWorkshopRepositoryCommitShas(new Set(['c1', 'c2', 'c3']), COMMITS)).toEqual([]);
    });
});

describe('the histories selected for a multi-branch workshop', () => {
    it('merges shared commits once, keeps every branch label, and does not hide one branch behind another', () => {
        const sharedCommit: GithubCommit = {
            sha: 'shared',
            message: 'Shared base',
            authorName: 'Pavol Hejný',
            committedAt: '2026-09-09T09:00:00.000Z',
            parentShas: [],
            branchNames: ['main'],
        };
        const mainCommit: GithubCommit = {
            sha: 'main-commit',
            message: 'Main work',
            authorName: 'Pavol Hejný',
            committedAt: '2026-09-09T10:00:00.000Z',
            parentShas: ['shared'],
            branchNames: ['main'],
        };
        const featureCommit: GithubCommit = {
            sha: 'feature-commit',
            message: 'Feature work',
            authorName: 'Pavol Hejný',
            committedAt: '2026-09-09T11:00:00.000Z',
            parentShas: ['shared'],
            branchNames: ['feature/rooms'],
        };
        const sharedFeatureCommit: GithubCommit = { ...sharedCommit, branchNames: ['feature/rooms'] };

        const progress = mergeWorkshopRepositoryBranchHistories([
            {
                branch: { name: 'main', headSha: 'main-commit' },
                commits: [mainCommit, sharedCommit],
            },
            {
                branch: { name: 'feature/rooms', headSha: 'feature-commit' },
                commits: [featureCommit, sharedFeatureCommit],
            },
        ]);

        expect(progress.commits.map((commit) => commit.sha)).toEqual(['feature-commit', 'main-commit', 'shared']);
        expect(progress.commits.find((commit) => commit.sha === 'shared')?.branchNames).toEqual(['main', 'feature/rooms']);
        expect(progress.branches).toEqual([
            { name: 'main', headSha: 'main-commit' },
            { name: 'feature/rooms', headSha: 'feature-commit' },
        ]);
    });
});
