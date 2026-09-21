import { formatGithubCommitDate } from '@/lib/github/formatGithubCommitDate';
import { createGithubCommitUrl, type GithubRepository } from '@/lib/github/githubRepository';
import { isCommitInWorkshopRepositoryRange } from '@/lib/workshops/workshopRepositoryCommitRange';
import {
    createWorkshopRepositoryGraphBranchHeadShas, createWorkshopRepositoryGraphRows,
    type WorkshopRepositoryGraphConnection, type WorkshopRepositoryGraphRow,
} from '@/lib/workshops/workshopRepositoryGraph';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import { WORKSHOP_PDF_COLORS, shortenWorkshopPdfLabel } from '@/lib/workshops/workshopPdfBrand';
import type { Content, TableCell } from 'pdfmake/interfaces';

const GRAPH_ROW_HEIGHT = 80;
const GRAPH_PADDING = 12;
const GRAPH_MAXIMAL_WIDTH = 125;
const GRAPH_LANE_WIDTH = 16;
const SHORT_COMMIT_SHA_LENGTH = 7;

function getGraphColor(laneIndex: number): string {
    return WORKSHOP_PDF_COLORS.branches[laneIndex % WORKSHOP_PDF_COLORS.branches.length];
}

function createEdge(connection: WorkshopRepositoryGraphConnection, startY: number, laneWidth: number): string {
    const fromX = GRAPH_PADDING + connection.fromLaneIndex * laneWidth;
    const toX = GRAPH_PADDING + connection.toLaneIndex * laneWidth;
    const endY = startY + GRAPH_ROW_HEIGHT;
    const controlDistance = GRAPH_ROW_HEIGHT / 3;
    return `<path d="M ${fromX} ${startY} C ${fromX} ${startY + controlDistance}, ${toX} ${endY - controlDistance}, ${toX} ${endY}" fill="none" stroke="${getGraphColor(connection.fromLaneIndex)}" stroke-width="1.6"/>`;
}

/** Incoming and outgoing half-edges keep every lane continuous across rows and printed page breaks. */
function createGraphRowSvg(row: WorkshopRepositoryGraphRow, previousRow: WorkshopRepositoryGraphRow | undefined, width: number, laneWidth: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${GRAPH_ROW_HEIGHT}" viewBox="0 0 ${width} ${GRAPH_ROW_HEIGHT}">
        <defs><clipPath id="row"><rect width="${width}" height="${GRAPH_ROW_HEIGHT}"/></clipPath></defs>
        <g clip-path="url(#row)">
            ${(previousRow?.connectionsToNext ?? []).map((connection) => createEdge(connection, -GRAPH_ROW_HEIGHT / 2, laneWidth)).join('')}
            ${row.connectionsToNext.map((connection) => createEdge(connection, GRAPH_ROW_HEIGHT / 2, laneWidth)).join('')}
            <circle cx="${GRAPH_PADDING + row.laneIndex * laneWidth}" cy="${GRAPH_ROW_HEIGHT / 2}" r="3.8" fill="${getGraphColor(row.laneIndex)}" stroke="white" stroke-width="1.5"/>
        </g></svg>`;
}

function createCommitCells(row: WorkshopRepositoryGraphRow, previousRow: WorkshopRepositoryGraphRow | undefined, repository: GithubRepository, width: number, laneWidth: number): TableCell[] {
    const { commit } = row;
    const commitUrl = createGithubCommitUrl(repository, commit.sha);
    return [
        { svg: createGraphRowSvg(row, previousRow, width, laneWidth), width, height: GRAPH_ROW_HEIGHT },
        { stack: [
            { text: shortenWorkshopPdfLabel(commit.message, 110), link: commitUrl, bold: true, fontSize: 10, color: WORKSHOP_PDF_COLORS.heading, margin: [0, 0, 0, 4] },
            { text: `${commit.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)} · ${shortenWorkshopPdfLabel(commit.authorName ?? 'Neznámý autor', 35)} · ${formatGithubCommitDate(commit.committedAt)}`, fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, link: commitUrl },
            { text: shortenWorkshopPdfLabel(commit.branchNames?.join(', ') ?? '', 90), fontSize: 8, color: WORKSHOP_PDF_COLORS.accent, margin: [0, 3, 0, 0] },
        ], margin: [10, 10, 8, 6] },
    ];
}

/** Uses the exact lane and inclusive-range decisions of the material's interactive graph. */
export function createWorkshopWrapUpPdfGraph(repository: GithubRepository, progress: WorkshopRepositoryProgress | null, roomUrl: string): Content[] {
    if (progress === null) return [{ text: 'Historii commitů se nepodařilo načíst. Je dostupná v místnosti workshopu.', link: roomUrl, color: WORKSHOP_PDF_COLORS.muted }];
    const { commits, branches = [], range } = progress;
    if (commits.length === 0) return [{ text: 'Ve vybraném rozsahu nejsou žádné commity.', color: WORKSHOP_PDF_COLORS.muted }];
    const rows = createWorkshopRepositoryGraphRows(commits, createWorkshopRepositoryGraphBranchHeadShas(branches, commits));
    const maximalLaneCount = Math.max(...rows.map((row) => row.laneCount), 1);
    const laneWidth = Math.min(GRAPH_LANE_WIDTH, (GRAPH_MAXIMAL_WIDTH - 2 * GRAPH_PADDING) / Math.max(1, maximalLaneCount - 1));
    const width = 2 * GRAPH_PADDING + (maximalLaneCount - 1) * laneWidth;
    const isRangeConfigured = range !== undefined && (range.start !== null || range.end !== null);
    const rangeLabel = isRangeConfigured ? [
        range.start === null ? 'Otevřený začátek' : `Od ${range.start.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)} · ${formatGithubCommitDate(range.start.committedAt)}`,
        range.end === null ? 'otevřený konec' : `do ${range.end.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)} · ${formatGithubCommitDate(range.end.committedAt)}`,
    ].join(' / ') : 'Nejnovější historie vybraných větví';

    return [
        { text: rangeLabel, fontSize: 9, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 0, 0, 8] },
        ...(branches.length === 0 ? [] : [{ text: branches.flatMap((branch, index) => [
            { text: `${index === 0 ? '' : '   /   '}${branch.name}`, color: getGraphColor(index) },
        ]), fontSize: 8, margin: [0, 0, 0, 10] } satisfies Content]),
        {
            table: {
                widths: [width, '*'], headerRows: 1, dontBreakRows: true, keepWithHeaderRows: 1,
                body: [
                    [{ text: 'GIT', fontSize: 8, bold: true, margin: [4, 7, 0, 7] }, { text: 'COMMIT / AUTOR / PRAŽSKÝ ČAS', fontSize: 8, bold: true, margin: [10, 7, 0, 7] }],
                    ...rows.map((row, index) => createCommitCells(row, rows[index - 1], repository, width, laneWidth)),
                ],
            },
            layout: {
                hLineWidth: (index) => index === 1 ? 0.8 : 0,
                vLineWidth: () => 0,
                hLineColor: () => WORKSHOP_PDF_COLORS.rule,
                paddingTop: () => 0, paddingBottom: () => 0, paddingLeft: () => 0, paddingRight: () => 0,
                fillColor: (index) => index === 0 ? WORKSHOP_PDF_COLORS.surface
                    : isRangeConfigured && isCommitInWorkshopRepositoryRange(rows[index - 1].commit, range)
                        ? '#edf7f9' : index % 2 === 0 ? '#f8fafb' : '#ffffff',
            },
        },
        { text: `${commits.length} commitů${progress.nextPage !== null && progress.nextPage !== undefined ? ' · Výběr historie; další commity najdete v místnosti workshopu.' : ' · Konec vybraného rozsahu.'}`, link: roomUrl, fontSize: 8, color: WORKSHOP_PDF_COLORS.muted, margin: [0, 8, 0, 0] },
    ];
}
