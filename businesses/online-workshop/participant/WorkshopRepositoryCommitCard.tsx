'use client';

import { cn } from '@/lib/utils';
import { createGithubCommitUrl, type GithubRepository } from '@/lib/github/githubRepository';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { formatGithubCommitDate } from '@/lib/github/formatGithubCommitDate';
import { ExternalLink, GitCommitHorizontal } from 'lucide-react';

/** How much of a commit identifier is enough to recognise it, which is how Git itself writes one short */
const SHORT_COMMIT_SHA_LENGTH = 7;

type WorkshopRepositoryCommitCardProps = {
    readonly repository: GithubRepository;
    readonly commit: GithubCommit;
    readonly isNew: boolean;
    readonly isBranchGraph?: boolean;
    readonly isInRange?: boolean;
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
    isInRange = false,
    className,
}: WorkshopRepositoryCommitCardProps) {
    return (
        <a
            href={createGithubCommitUrl(repository, commit.sha)}
            target="_blank"
            rel="noopener noreferrer"
            data-workshop-repository-commit={commit.sha}
            data-workshop-commit-in-range={isInRange || undefined}
            title={`${commit.message} · ${commit.authorName ?? 'Neznámý autor'} · ${formatGithubCommitDate(commit.committedAt)}`}
            className={cn(
                'flex min-w-0 items-start gap-3 rounded-xl border px-3.5 py-2.5 transition',
                isNew
                    ? 'border-room-warning/40 bg-room-warning/[0.08] hover:border-room-warning/70'
                    : isInRange ? 'border-room-accent/40 bg-room-accent/10 hover:border-room-accent/70'
                    : 'border-room-border/[0.08] bg-room-inset/30 hover:border-room-accent/35 hover:bg-room-overlay/[0.05]',
                className,
            )}
        >
            <GitCommitHorizontal
                className={`mt-0.5 h-4 w-4 shrink-0 ${isNew ? 'text-room-warning' : 'text-room-accent'}`}
                aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
                <span className={cn('block text-sm font-medium leading-5 text-room-heading', isBranchGraph ? 'truncate' : 'break-words')}>{commit.message}</span>
                <span className={cn('mt-1 block text-xs text-room-muted', isBranchGraph && 'truncate')}>
                    <span className="font-mono">{commit.sha.slice(0, SHORT_COMMIT_SHA_LENGTH)}</span>
                    {commit.authorName !== null && ` · ${commit.authorName}`} ·{' '}
                    <time dateTime={commit.committedAt}>{formatGithubCommitDate(commit.committedAt)}</time>
                    {isBranchGraph && commit.branchNames !== undefined && commit.branchNames.length > 0 && (
                        <span className="text-room-accent/80"> · {commit.branchNames.join(', ')}</span>
                    )}
                </span>
            </span>
            {isNew && (
                <span className="shrink-0 rounded-full bg-room-warning px-2 py-0.5 text-[11px] font-bold text-room-action-foreground">
                    Nový
                </span>
            )}
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-room-subtle" aria-hidden="true" />
        </a>
    );
}
