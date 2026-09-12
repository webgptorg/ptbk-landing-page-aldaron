import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { createWorkshopRepositoryGraphRows } from '@/lib/workshops/workshopRepositoryGraph';
import { describe, expect, it } from 'vitest';

function createGraphCommit(
    sha: string,
    committedAt: string,
    parentShas: readonly string[] = [],
): GithubCommit {
    return {
        sha,
        message: sha,
        authorName: 'Pavol Hejný',
        committedAt,
        parentShas,
    };
}

describe('the workshop repository commit graph', () => {
    it('keeps two branch lanes apart until they join at their shared parent', () => {
        const rows = createWorkshopRepositoryGraphRows(
            [
                createGraphCommit('feature', '2026-09-12T12:00:00.000Z', ['base']),
                createGraphCommit('main', '2026-09-12T11:00:00.000Z', ['base']),
                createGraphCommit('base', '2026-09-12T10:00:00.000Z'),
            ],
            ['feature', 'main'],
        );

        expect(rows.map((row) => [row.commit.sha, row.laneIndex])).toEqual([
            ['feature', 0],
            ['main', 1],
            ['base', 0],
        ]);
        expect(rows[0]?.connectionsToNext).toContainEqual({
            fromLaneIndex: 0,
            toLaneIndex: 0,
            kind: 'parent',
        });
        expect(rows[1]?.connectionsToNext).toContainEqual({
            fromLaneIndex: 1,
            toLaneIndex: 0,
            kind: 'parent',
        });
    });

    it('draws both parents of a merge commit when they are visible', () => {
        const rows = createWorkshopRepositoryGraphRows(
            [
                createGraphCommit('merge', '2026-09-12T12:00:00.000Z', ['main', 'feature']),
                createGraphCommit('main', '2026-09-12T11:00:00.000Z', ['base']),
                createGraphCommit('feature', '2026-09-12T10:00:00.000Z', ['base']),
                createGraphCommit('base', '2026-09-12T09:00:00.000Z'),
            ],
            ['merge'],
        );

        expect(rows[0]?.connectionsToNext).toEqual([
            { fromLaneIndex: 0, toLaneIndex: 0, kind: 'parent' },
            { fromLaneIndex: 0, toLaneIndex: 1, kind: 'parent' },
        ]);
    });
});
