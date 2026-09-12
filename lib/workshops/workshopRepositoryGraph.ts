import type { GithubCommit } from '@/lib/github/githubCommitFeed';

export type WorkshopRepositoryGraphConnection = {
    readonly fromLaneIndex: number;
    readonly toLaneIndex: number;
    readonly kind: 'parent' | 'continuation';
};

export type WorkshopRepositoryGraphRow = {
    readonly commit: GithubCommit;
    readonly laneIndex: number;
    readonly laneCount: number;
    readonly connectionsToNext: readonly WorkshopRepositoryGraphConnection[];
};

function addLaneIfMissing(lanes: string[], commitSha: string): void {
    if (!lanes.includes(commitSha)) {
        lanes.push(commitSha);
    }
}

function createInitialLaneShas(commits: readonly GithubCommit[], branchHeadShas: readonly string[]): string[] {
    const visibleCommitShas = new Set(commits.map((commit) => commit.sha));
    const lanes: string[] = [];

    branchHeadShas
        .filter((commitSha) => visibleCommitShas.has(commitSha))
        .forEach((commitSha) => addLaneIfMissing(lanes, commitSha));

    if (lanes.length === 0 && commits[0] !== undefined) {
        lanes.push(commits[0].sha);
    }

    return lanes;
}

function createNextLaneShas(
    currentLaneShas: readonly string[],
    commitLaneIndex: number,
    parentShas: readonly string[],
): { readonly laneShas: string[]; readonly parentLaneIndexes: readonly number[] } {
    const nextLaneShas = currentLaneShas.filter((_, laneIndex) => laneIndex !== commitLaneIndex);
    const parentLaneIndexes: number[] = [];
    let nextParentInsertionIndex = Math.min(commitLaneIndex, nextLaneShas.length);

    parentShas.forEach((parentSha) => {
        const existingLaneIndex = nextLaneShas.indexOf(parentSha);
        if (existingLaneIndex >= 0) {
            parentLaneIndexes.push(existingLaneIndex);
            return;
        }

        nextLaneShas.splice(nextParentInsertionIndex, 0, parentSha);
        parentLaneIndexes.push(nextParentInsertionIndex);
        nextParentInsertionIndex += 1;
    });

    return { laneShas: nextLaneShas, parentLaneIndexes };
}

function createConnectionsToNext(
    currentLaneShas: readonly string[],
    nextLaneShas: readonly string[],
    commitLaneIndex: number,
    parentLaneIndexes: readonly number[],
): readonly WorkshopRepositoryGraphConnection[] {
    const continuationConnections = currentLaneShas.flatMap((laneSha, fromLaneIndex) => {
        if (fromLaneIndex === commitLaneIndex) {
            return [];
        }

        const toLaneIndex = nextLaneShas.indexOf(laneSha);
        return toLaneIndex < 0 ? [] : [{ fromLaneIndex, toLaneIndex, kind: 'continuation' as const }];
    });
    const parentConnections = parentLaneIndexes.map((toLaneIndex) => ({
        fromLaneIndex: commitLaneIndex,
        toLaneIndex,
        kind: 'parent' as const,
    }));

    return [...continuationConnections, ...parentConnections];
}

/**
 * Assigns commits to stable lanes and describes the parent/continuation edges between adjacent visible commits.
 *
 * Note: GitHub supplies the parent SHAs, while this function owns only the layout. Keeping that separation makes the
 *       graph deterministic and testable without coupling it to the network or to React.
 */
export function createWorkshopRepositoryGraphRows(
    commits: readonly GithubCommit[],
    branchHeadShas: readonly string[] = [],
): readonly WorkshopRepositoryGraphRow[] {
    const currentLaneShas = createInitialLaneShas(commits, branchHeadShas);

    return commits.map((commit) => {
        let commitLaneIndex = currentLaneShas.indexOf(commit.sha);
        if (commitLaneIndex < 0) {
            addLaneIfMissing(currentLaneShas, commit.sha);
            commitLaneIndex = currentLaneShas.length - 1;
        }

        const parentShas = (commit.parentShas ?? []).filter((parentSha) =>
            commits.some((visibleCommit) => visibleCommit.sha === parentSha),
        );
        const currentLaneSnapshot = [...currentLaneShas];
        const { laneShas: nextLaneShas, parentLaneIndexes } = createNextLaneShas(
            currentLaneSnapshot,
            commitLaneIndex,
            parentShas,
        );
        const connectionsToNext = createConnectionsToNext(
            currentLaneSnapshot,
            nextLaneShas,
            commitLaneIndex,
            parentLaneIndexes,
        );
        currentLaneShas.splice(0, currentLaneShas.length, ...nextLaneShas);

        return {
            commit,
            laneIndex: commitLaneIndex,
            laneCount: Math.max(currentLaneSnapshot.length, nextLaneShas.length, commitLaneIndex + 1),
            connectionsToNext,
        };
    });
}
