'use client';

import { WorkshopRepositoryCommitCard } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitCard';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { GithubRepository } from '@/lib/github/githubRepository';
import type { WorkshopRepositoryBranch } from '@/lib/workshops/workshopRepositoryProgress';
import { createWorkshopRepositoryGraphRows } from '@/lib/workshops/workshopRepositoryGraph';
import { isCommitInWorkshopRepositoryRange, type WorkshopRepositoryCommitRange } from '@/lib/workshops/workshopRepositoryCommitRange';
import { cn } from '@/lib/utils';

const GRAPH_ROW_HEIGHT_PIXELS = 76;
const GRAPH_LANE_WIDTH_PIXELS = 20;
const GRAPH_LEFT_PADDING_PIXELS = 14;
const GRAPH_MINIMAL_WIDTH_PIXELS = 42;
const GRAPH_NODE_RADIUS_PIXELS = 5;
const GRAPH_COLORS = [
    'rgb(var(--room-accent))',
    'rgb(var(--room-upcoming))',
    'rgb(var(--room-warning))',
    'rgb(var(--room-success))',
    'rgb(var(--room-danger))',
    'rgb(var(--room-graph-pink))',
] as const;

type WorkshopRepositoryGraphProps = {
    readonly repository: GithubRepository;
    readonly commits: readonly GithubCommit[];
    readonly branches: readonly WorkshopRepositoryBranch[];
    readonly newCommitShas: ReadonlySet<string>;
    readonly range?: WorkshopRepositoryCommitRange;
};

function getGraphLaneX(laneIndex: number): number {
    return GRAPH_LEFT_PADDING_PIXELS + laneIndex * GRAPH_LANE_WIDTH_PIXELS;
}

function getGraphColor(laneIndex: number): string {
    return GRAPH_COLORS[laneIndex % GRAPH_COLORS.length];
}

function createGraphBranchHeadShas(
    branches: readonly WorkshopRepositoryBranch[],
    commits: readonly GithubCommit[],
): readonly string[] {
    return branches.flatMap((branch, branchIndex) => {
        if (branch.headSha !== null) {
            return [branch.headSha];
        }

        const namedCommit = commits.find((commit) => commit.branchNames?.includes(branch.name));
        return namedCommit === undefined ? (commits[branchIndex] === undefined ? [] : [commits[branchIndex]!.sha]) : [namedCommit.sha];
    });
}

function createGraphEdgePath(
    fromLaneIndex: number,
    toLaneIndex: number,
    rowIndex: number,
): string {
    const fromX = getGraphLaneX(fromLaneIndex);
    const toX = getGraphLaneX(toLaneIndex);
    const fromY = rowIndex * GRAPH_ROW_HEIGHT_PIXELS + GRAPH_ROW_HEIGHT_PIXELS / 2;
    const toY = (rowIndex + 1) * GRAPH_ROW_HEIGHT_PIXELS + GRAPH_ROW_HEIGHT_PIXELS / 2;
    const controlPointDistance = GRAPH_ROW_HEIGHT_PIXELS / 3;

    return `M ${fromX} ${fromY} C ${fromX} ${fromY + controlPointDistance}, ${toX} ${toY - controlPointDistance}, ${toX} ${toY}`;
}

/**
 * Shows a compact Git-style history for several branch tips. Commit cards stay the same as in the one-branch view;
 * only the lane drawing is added beside them.
 */
export function WorkshopRepositoryGraph({
    repository,
    commits,
    branches,
    newCommitShas,
    range,
}: WorkshopRepositoryGraphProps) {
    const graphRows = createWorkshopRepositoryGraphRows(commits, createGraphBranchHeadShas(branches, commits));
    const maximalLaneCount = Math.max(...graphRows.map((row) => row.laneCount), 1);
    const graphWidth = Math.max(
        GRAPH_MINIMAL_WIDTH_PIXELS,
        GRAPH_LEFT_PADDING_PIXELS + maximalLaneCount * GRAPH_LANE_WIDTH_PIXELS,
    );
    const graphHeight = graphRows.length * GRAPH_ROW_HEIGHT_PIXELS;
    const highlightedCommitShas = new Set(commits.filter((commit) => range !== undefined
        && isCommitInWorkshopRepositoryRange(commit, range)).map((commit) => commit.sha));

    return (
        <div aria-label="Graf commitů vybraných větví" className="space-y-3">
            {branches.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-room-text" aria-label="Vybrané větve">
                    {branches.map((branch, branchIndex) => (
                        <span key={branch.name} className="inline-flex items-center gap-1.5">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: getGraphColor(branchIndex) }}
                                aria-hidden="true"
                            />
                            <span className="font-mono">{branch.name}</span>
                        </span>
                    ))}
                </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-room-border/[0.08] bg-room-inset/20">
                <div className="relative min-w-[30rem]" style={{ minHeight: graphHeight }}>
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0"
                        width={graphWidth}
                        height={graphHeight}
                        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                    >
                        {graphRows.flatMap((row, rowIndex) =>
                            row.connectionsToNext.map((connection, connectionIndex) => (
                                <path
                                    key={`${row.commit.sha}-${rowIndex}-${connectionIndex}`}
                                    d={createGraphEdgePath(
                                        connection.fromLaneIndex,
                                        connection.toLaneIndex,
                                        rowIndex,
                                    )}
                                    fill="none"
                                    stroke={getGraphColor(connection.fromLaneIndex)}
                                    strokeLinecap="round"
                                    strokeWidth={connection.kind === 'parent' ? 2.5 : 2}
                                    opacity={connection.kind === 'parent' ? 0.95 : 0.65}
                                />
                            )),
                        )}
                        {graphRows.map((row, rowIndex) => (
                            <circle
                                key={`${row.commit.sha}-node`}
                                cx={getGraphLaneX(row.laneIndex)}
                                cy={rowIndex * GRAPH_ROW_HEIGHT_PIXELS + GRAPH_ROW_HEIGHT_PIXELS / 2}
                                r={GRAPH_NODE_RADIUS_PIXELS}
                                fill={getGraphColor(row.laneIndex)}
                                stroke="rgb(var(--room-surface))"
                                strokeWidth="3"
                            />
                        ))}
                    </svg>
                    <ol className="relative m-0 list-none p-0">
                        {graphRows.map((row, rowIndex) => {
                            const isInRange = highlightedCommitShas.has(row.commit.sha);
                            const isRangeTop = isInRange && !highlightedCommitShas.has(graphRows[rowIndex - 1]?.commit.sha ?? '');
                            const isRangeBottom = isInRange && !highlightedCommitShas.has(graphRows[rowIndex + 1]?.commit.sha ?? '');
                            return (
                            <li
                                key={row.commit.sha}
                                className={cn('flex items-center',
                                    isInRange && 'border-x-2 border-room-accent/50 bg-room-accent/[0.08]',
                                    isRangeTop && 'rounded-t-lg border-t-2', isRangeBottom && 'rounded-b-lg border-b-2')}
                                style={{ height: GRAPH_ROW_HEIGHT_PIXELS, paddingLeft: graphWidth + 8 }}
                            >
                                <WorkshopRepositoryCommitCard
                                    repository={repository}
                                    commit={row.commit}
                                    isNew={newCommitShas.has(row.commit.sha)}
                                    isInRange={isInRange}
                                    isBranchGraph
                                    className="my-1 mr-3 w-full"
                                />
                            </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </div>
    );
}
