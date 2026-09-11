'use client';

import { useWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
import {
    createGithubCommitsUrl,
    createGithubCommitUrl,
    createGithubRepositoryUrl,
    formatGithubRepositoryName,
} from '@/lib/github/githubRepository';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import { ExternalLink, GitCommitHorizontal, Github, RefreshCw, Rocket } from 'lucide-react';

const CZECH_COMMIT_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * How much of a commit identifier is enough to recognise it, which is how Git itself writes one short
 */
const SHORT_COMMIT_SHA_LENGTH = 7;

type WorkshopRepositoryPanelProps = {
    readonly workshopSlug: string;

    /**
     * The project this workshop is about, as its administration connected it
     */
    readonly repository: WorkshopRepository;
};

/**
 * Names the commits which arrived while this participant watched the workshop
 */
function formatNewCommitCount(commitCount: number): string {
    return formatCzechCountedNoun(commitCount, ['nový commit', 'nové commity', 'nových commitů']);
}

/**
 * The project one workshop is about, together with what is being committed in it while the workshop runs
 *
 * Note: The connection itself comes with the state of the room, while the commits are read from GitHub on their own,
 *       see `useWorkshopRepositoryProgress`. That is why the repository and its links are shown even when GitHub
 *       cannot be reached.
 */
export function WorkshopRepositoryPanel({ workshopSlug, repository }: WorkshopRepositoryPanelProps) {
    const { progress, isProgressRead, newCommitShas } = useWorkshopRepositoryProgress(workshopSlug);
    const repositoryName = formatGithubRepositoryName(repository);

    return (
        <section
            aria-label="Projekt workshopu"
            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                        <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                    </p>
                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                        {repositoryName}
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {newCommitShas.size > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" aria-hidden="true" />
                            {formatNewCommitCount(newCommitShas.size)}
                        </span>
                    )}
                    <a
                        href={createGithubRepositoryUrl(repository)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/40 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-200/70 hover:bg-slate-900"
                    >
                        <Github className="h-3.5 w-3.5" aria-hidden="true" /> Repozitář
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {repository.deploymentUrl !== null && (
                        <a
                            href={repository.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200"
                        >
                            <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Živá aplikace
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    )}
                </div>
            </div>

            <div className="space-y-3 px-5 py-4">
                {!isProgressRead ? (
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> Načítám commity…
                    </p>
                ) : progress === null ? (
                    <p className="text-sm leading-6 text-slate-400">
                        Commity repozitáře se teď nepodařilo načíst. Odkaz na projekt funguje dál a commity se objeví,
                        jakmile bude repozitář znovu dostupný.
                    </p>
                ) : (
                    <>
                        {progress.commits.length > 0 && (
                            <ol className="space-y-2">
                                {progress.commits.map((commit) => {
                                    const isCommitNew = newCommitShas.has(commit.sha);

                                    return (
                                        <li key={commit.sha}>
                                            <a
                                                href={createGithubCommitUrl(repository, commit.sha)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                                                    isCommitNew
                                                        ? 'border-amber-300/40 bg-amber-300/[0.08] hover:border-amber-200/70'
                                                        : 'border-white/[0.08] bg-slate-950/30 hover:border-cyan-300/35 hover:bg-white/[0.05]'
                                                }`}
                                            >
                                                <GitCommitHorizontal
                                                    className={`mt-0.5 h-4 w-4 shrink-0 ${isCommitNew ? 'text-amber-300' : 'text-cyan-300'}`}
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block break-words text-sm font-medium leading-5 text-slate-100">
                                                        {commit.message}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-slate-400">
                                                        <span className="font-mono">
                                                            {commit.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)}
                                                        </span>
                                                        {commit.authorName !== null && ` · ${commit.authorName}`} ·{' '}
                                                        {CZECH_COMMIT_TIME_FORMAT.format(new Date(commit.committedAt))}
                                                    </span>
                                                </span>
                                                {isCommitNew && (
                                                    <span className="shrink-0 rounded-full bg-amber-300 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                                                        Nový
                                                    </span>
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                        <a
                            href={createGithubCommitsUrl(repository, repository.branch)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
                        >
                            Všechny commity na GitHubu <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    </>
                )}
            </div>
        </section>
    );
}
