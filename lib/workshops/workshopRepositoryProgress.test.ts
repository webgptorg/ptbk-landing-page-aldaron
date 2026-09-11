import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { selectNewWorkshopRepositoryCommitShas } from '@/lib/workshops/workshopRepositoryProgress';
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
