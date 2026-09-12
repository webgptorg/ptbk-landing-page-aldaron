'use client';

import { cn } from '@/lib/utils';
import { createGithubCommitUrl, type GithubRepository } from '@/lib/github/githubRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { ExternalLink, GitCommitHorizontal } from 'lucide-react';

const CZECH_COMMIT_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/** How much of a commit identifier is enough to recognise it, which is how Git itself writes one short */
const SHORT_COMMIT_SHA_LENGTH = 7;

type WorkshopRepositoryCommitCardProps = {
    readonly repository: GithubRepository;
    readonly commit: GithubCommit;
    readonly isNew: boolean;
    readonly isBranchGraph?: boolean;
    readonly className?: string;
};

/**
 * The shared readable part of a repository commit, used by both the flat and graph views
 */
export function WorkshopRepositoryCommitCard({
    repository,
    commit,
    isNew,
    isBranchGraph = false,
    className,
}: WorkshopRepositoryCommitCardProps) {
    return (
        <a
            href={createGithubCommitUrl(repository, commit.sha)}
            target="_blank"
            rel="noopener noreferrer"
            data-workshop-repository-commit={commit.sha}
            className={cn(
                'flex min-w-0 items-start gap-3 rounded-xl border px-3.5 py-2.5 transition',
                isNew
                    ? 'border-amber-300/40 bg-amber-300/[0.08] hover:border-amber-200/70'
                    : 'border-white/[0.08] bg-slate-950/30 hover:border-cyan-300/35 hover:bg-white/[0.05]',
                className,
            )}
        >
            <GitCommitHorizontal
                className={`mt-0.5 h-4 w-4 shrink-0 ${isNew ? 'text-amber-300' : 'text-cyan-300'}`}
                aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-medium leading-5 text-slate-100">{commit.message}</span>
                <span className="mt-1 block text-xs text-slate-400">
                    <span className="font-mono">{commit.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)}</span>
                    {commit.authorName !== null && ` · ${commit.authorName}`} ·{' '}
                    {CZECH_COMMIT_TIME_FORMAT.format(new Date(commit.committedAt))}
                    {isBranchGraph && commit.branchNames !== undefined && commit.branchNames.length > 0 && (
                        <span className="text-cyan-200/80"> · {commit.branchNames.join(', ')}</span>
                    )}
                </span>
            </span>
            {isNew && (
                <span className="shrink-0 rounded-full bg-amber-300 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                    Nový
                </span>
            )}
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
        </a>
    );
}
