'use client';

import { WorkshopRepositoryCommitCard } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitCard';
import { WorkshopRepositoryGraph } from '@/businesses/online-workshop/participant/WorkshopRepositoryGraph';
import { useWorkshopProjectPreview } from '@/businesses/online-workshop/participant/useWorkshopProjectPreview';
import { WorkshopProjectPreviewCard } from '@/components/workshops/WorkshopProjectPreviewCard';
import type { WorkshopRepositoryProgressController } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
import {
    createGithubCommitsUrlForBranchSelection,
    createGithubRepositoryUrl,
    formatGithubRepositoryName,
    getGithubBranchSelectionPatterns,
    isGithubMultipleBranchesSelection,
} from '@/lib/github/githubRepository';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { formatWorkshopDeploymentName } from '@/lib/workshops/workshopDeployments';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopRepositoryBranch } from '@/lib/workshops/workshopRepositoryProgress';
import { ExternalLink, Github, RefreshCw, Rocket } from 'lucide-react';
import { isCommitInWorkshopRepositoryRange } from '@/lib/workshops/workshopRepositoryCommitRange';
import { formatGithubCommitDate } from '@/lib/github/formatGithubCommitDate';

type WorkshopRepositoryPanelProps = {
    readonly workshopSlug: string;
    /**
     * The project this workshop is about, as its administration connected it
     */
    readonly repository: WorkshopRepository;
    readonly progressController: Pick<
        WorkshopRepositoryProgressController,
        'progress' | 'isProgressRead' | 'newCommitShas'
    > & Partial<Pick<WorkshopRepositoryProgressController,
        'isExpanded' | 'toggleExpanded' | 'loadMore' | 'isLoadingHistory' | 'historyError' | 'isMoreHistoryAvailable'>>;
};

/**
 * Names the commits which arrived while this participant watched the workshop
 */
function formatNewCommitCount(commitCount: number): string {
    return formatCzechCountedNoun(commitCount, ['nový commit', 'nové commity', 'nových commitů']);
}

/**
 * Names the button which opens one running deployment of the project
 *
 * Note: A project which runs in one place is simply its live application, exactly as it always was. Several of them
 *       are named by their own addresses instead, because one repeated name would say nothing about which of them a
 *       participant is opening.
 */
function formatWorkshopDeploymentLabel(deploymentUrl: string, deploymentCount: number): string {
    return deploymentCount === 1 ? 'Živá aplikace' : formatWorkshopDeploymentName(deploymentUrl);
}

/**
 * The project one workshop is about, together with what is being committed in it while the workshop runs
 *
 * Note: The connection itself comes with the state of the room, while the commits are read from GitHub on their own,
 *       see `useWorkshopRepositoryProgress`. That is why the repository and its links are shown even when GitHub
 *       cannot be reached.
 */
export function WorkshopRepositoryPanel({ workshopSlug, repository, progressController }: WorkshopRepositoryPanelProps) {
    const projectPreview = useWorkshopProjectPreview(workshopSlug, repository);
    const { progress, isProgressRead, newCommitShas } = progressController;
    const repositoryName = formatGithubRepositoryName(repository);
    const isMultipleBranchSelection = isGithubMultipleBranchesSelection(repository.branch);
    const range = progress?.range;
    const isRangeConfigured = range !== undefined && (range.start !== null || range.end !== null);
    const visibleCommits = progress?.commits.filter((commit) => !isRangeConfigured || progressController.isExpanded
        || isCommitInWorkshopRepositoryRange(commit, range)) ?? [];
    const graphBranches: readonly WorkshopRepositoryBranch[] =
        progress?.branches ??
        getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));

    return (
        <article
            aria-label="Projekt workshopu"
            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-room-border/10 bg-room-surface shadow-lg"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-room-border/[0.08] px-5 py-4">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-room-accent">
                        <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                    </p>
                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-room-heading">
                        {repositoryName}
                    </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {newCommitShas.size > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-room-warning/40 bg-room-warning/10 px-2.5 py-1 text-xs font-bold text-room-warning">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-room-warning" aria-hidden="true" />
                            {formatNewCommitCount(newCommitShas.size)}
                        </span>
                    )}
                    <a
                        href={createGithubRepositoryUrl(repository)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-room-border/15 bg-room-inset/40 px-3 py-1.5 text-xs font-semibold text-room-text transition hover:border-room-accent/70 hover:bg-room-hover"
                    >
                        <Github className="h-3.5 w-3.5" aria-hidden="true" /> Repozitář
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {repository.deploymentUrls.map((deploymentUrl) => (
                        <a
                            key={deploymentUrl}
                            href={deploymentUrl}
                            title={deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-room-action px-3 py-1.5 text-xs font-bold text-room-action-foreground transition hover:bg-room-action-hover"
                        >
                            <Rocket className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">
                                {formatWorkshopDeploymentLabel(deploymentUrl, repository.deploymentUrls.length)}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                    ))}
                </div>
            </div>

            {projectPreview.deploymentUrl !== null && (
                <a
                    href={projectPreview.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Otevřít aplikaci ${projectPreview.title}`}
                    className="group mx-5 mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                >
                    <WorkshopProjectPreviewCard project={projectPreview} />
                </a>
            )}

            <div className="space-y-3 px-5 py-4">
                {!isProgressRead ? (
                    <p className="flex items-center gap-2 text-sm text-room-muted">
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> Načítám commity…
                    </p>
                ) : progress === null ? (
                    <p className="text-sm leading-6 text-room-muted">
                        Commity repozitáře se teď nepodařilo načíst. Odkaz na projekt funguje dál a commity se objeví,
                        jakmile bude repozitář znovu dostupný.
                    </p>
                ) : (
                    <>
                        {isRangeConfigured && (
                            <div className="rounded-xl border border-room-accent/40 bg-room-accent/10 p-3" aria-label="Rozsah commitů workshopu">
                                <h4 className="text-sm font-bold text-room-accent">Commity workshopu</h4>
                                <p className="mt-1 text-xs text-room-muted">
                                    {range.start === null ? 'Bez omezení začátku' : `Od ${range.start.sha.slice(0, 7)} · ${formatGithubCommitDate(range.start.committedAt)}`}
                                    {' — '}
                                    {range.end === null ? 'bez omezení konce' : `do ${range.end.sha.slice(0, 7)} · ${formatGithubCommitDate(range.end.committedAt)}`}
                                </p>
                            </div>
                        )}
                        {visibleCommits.length > 0 ? (
                            isMultipleBranchSelection || isRangeConfigured ? (
                                <WorkshopRepositoryGraph
                                    repository={repository}
                                    commits={visibleCommits}
                                    branches={graphBranches}
                                    newCommitShas={newCommitShas}
                                    range={isRangeConfigured ? range : undefined}
                                />
                            ) : (
                                <ol className="space-y-2">
                                    {visibleCommits.map((commit) => (
                                        <li key={commit.sha}>
                                            <WorkshopRepositoryCommitCard
                                                repository={repository}
                                                commit={commit}
                                                isNew={newCommitShas.has(commit.sha)}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            )
                        ) : <p className="text-sm text-room-muted">V tomto rozsahu nejsou žádné commity vybraných větví.</p>}
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-room-accent">
                            {isRangeConfigured && progressController.toggleExpanded !== undefined && (
                                <button type="button" onClick={progressController.toggleExpanded}
                                    aria-expanded={progressController.isExpanded ?? false}
                                    disabled={progressController.isLoadingHistory}
                                    className="rounded-lg border border-room-accent/30 px-3 py-2 disabled:opacity-50">
                                    {progressController.isExpanded ? 'Zobrazit jen rozsah workshopu' : 'Rozbalit graf mimo rozsah workshopu'}
                                </button>
                            )}
                            {progressController.isMoreHistoryAvailable && (
                                <button type="button" onClick={progressController.loadMore} disabled={progressController.isLoadingHistory}
                                    className="rounded-lg border border-room-border/20 px-3 py-2 disabled:opacity-50">
                                    {progressController.isLoadingHistory ? 'Načítám historii…' : 'Načíst další commity'}
                                </button>
                            )}
                        </div>
                        {progressController.historyError && <p role="alert" className="text-sm text-room-danger">{progressController.historyError}</p>}
                        <a
                            href={createGithubCommitsUrlForBranchSelection(repository, repository.branch)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-room-accent underline underline-offset-4 hover:text-room-accent"
                        >
                            Všechny commity na GitHubu <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    </>
                )}
            </div>
        </article>
    );
}
