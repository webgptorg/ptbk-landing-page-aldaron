import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import {
    selectNewWorkshopRepositoryCommitShas,
    summarizeWorkshopRepositoryCommits,
} from '@/lib/workshops/workshopRepositoryProgress';
import { describe, expect, it } from 'vitest';

const WORKSHOP_STARTS_AT = '2026-09-09T17:00:00.000Z';

function createCommit(sha: string, committedAt: string): GithubCommit {
    return { sha, message: `Commit ${sha}`, authorName: 'Pavol Hejný', committedAt };
}

/**
 * Two commits which were pushed while the workshop ran, and one which was there before it began
 */
const COMMITS = [
    createCommit('c3', '2026-09-09T18:20:00.000Z'),
    createCommit('c2', '2026-09-09T17:05:00.000Z'),
    createCommit('c1', '2026-09-09T09:00:00.000Z'),
];

describe('how far the project of a workshop has come', () => {
    it('counts what was committed since the workshop began', () => {
        expect(summarizeWorkshopRepositoryCommits(COMMITS, WORKSHOP_STARTS_AT)).toEqual({
            commitCountSinceStart: 2,
            isCommitCountSinceStartComplete: true,
        });
    });

    it('counts a commit made in the very second the workshop began', () => {
        expect(
            summarizeWorkshopRepositoryCommits([createCommit('c0', WORKSHOP_STARTS_AT)], WORKSHOP_STARTS_AT)
                .commitCountSinceStart,
        ).toBe(1);
    });

    it('says the count is not the whole truth when every published commit was made during the workshop', () => {
        expect(
            summarizeWorkshopRepositoryCommits(COMMITS.slice(0, 2), WORKSHOP_STARTS_AT),
        ).toEqual({ commitCountSinceStart: 2, isCommitCountSinceStartComplete: false });
    });

    it('counts nothing of a repository which published nothing, and of a term without a readable start', () => {
        expect(summarizeWorkshopRepositoryCommits([], WORKSHOP_STARTS_AT).commitCountSinceStart).toBe(0);
        expect(summarizeWorkshopRepositoryCommits(COMMITS, 'sometime').commitCountSinceStart).toBe(0);
    });
});

describe('the commits which arrived while somebody watched', () => {
    it('are the ones the room had not read before', () => {
        expect(selectNewWorkshopRepositoryCommitShas(new Set(['c1', 'c2']), COMMITS)).toEqual(['c3']);
    });

    it('are none of them when the room already knew every one of them', () => {
        expect(selectNewWorkshopRepositoryCommitShas(new Set(['c1', 'c2', 'c3']), COMMITS)).toEqual([]);
    });
});
