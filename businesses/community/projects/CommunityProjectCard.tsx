'use client';

import { createCommunityProjectPath } from '@/businesses/community/config';
import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import { CommunityProjectVoting } from '@/businesses/community/projects/CommunityProjectVoting';
import type {
    CommunityProject,
    CommunityProjectModerationStatus,
    CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { Check, Clock3, ExternalLink, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';

type CommunityProjectCardProps = {
    readonly project: CommunityProject;
    readonly isVoting: boolean;
    readonly isModerating: boolean;
    readonly isModerationOffered: boolean;
    readonly onVote: (projectId: string, vote: CommunityProjectVote) => Promise<void>;
    readonly onModerate: (projectId: string, status: CommunityProjectModerationStatus) => Promise<void>;
};

function getProjectHost(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

/**
 * A pending project remains inspectable by its author or a moderator, but has no public detail link, discussion, or
 * vote controls until the moderation decision approves it.
 */
export function CommunityProjectCard({
    project,
    isVoting,
    isModerating,
    isModerationOffered,
    onVote,
    onModerate,
}: CommunityProjectCardProps) {
    const isApproved = project.status === 'approved';

    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-room-border/10 bg-room-surface shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-room-accent/35 hover:shadow-cyan-950/30">
            {isApproved ? (
                <Link
                    href={createCommunityProjectPath(project.id)}
                    className="block aspect-[16/9] overflow-hidden bg-room-hover"
                >
                    <CommunityProjectPreviewImage
                        imageUrl={project.previewImageUrl}
                        title={project.title}
                        className="transition duration-300 group-hover:scale-[1.03]"
                    />
                </Link>
            ) : (
                <div className="aspect-[16/9] overflow-hidden bg-room-hover">
                    <CommunityProjectPreviewImage imageUrl={project.previewImageUrl} title={project.title} />
                </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col p-4">
                <p className="truncate text-xs font-medium text-room-accent/80">{getProjectHost(project.url)}</p>
                {isApproved ? (
                    <Link
                        href={createCommunityProjectPath(project.id)}
                        className="mt-1.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-room-accent"
                    >
                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-room-heading transition group-hover:text-room-accent">
                            {project.title}
                        </h3>
                    </Link>
                ) : (
                    <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-room-heading">{project.title}</h3>
                )}
                {project.status === 'pending' && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-room-warning">
                        <Clock3 className="h-3.5 w-3.5" /> Čeká na schválení
                    </p>
                )}
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-room-muted">
                    {project.description || 'Autor zatím nepřidal popis projektu.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-room-border/10 pt-3">
                    <CommunityProjectVoting
                        upvoteCount={project.upvoteCount}
                        downvoteCount={project.downvoteCount}
                        voteByParticipant={project.voteByParticipant}
                        isVoting={isVoting}
                        isVotingOffered={isApproved}
                        onVote={(vote) => onVote(project.id, vote)}
                    />
                    <div className="flex items-center gap-2 text-xs text-room-muted">
                        {isApproved && (
                            <Link
                                href={createCommunityProjectPath(project.id)}
                                className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-room-text hover:text-room-accent"
                            >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Diskuze
                            </Link>
                        )}
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-room-text hover:text-room-accent"
                        >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Otevřít
                        </a>
                    </div>
                </div>
                <p className="mt-3 text-xs text-room-subtle">Sdílí {project.authorName}</p>
                {isModerationOffered && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-room-border/10 pt-3">
                        {project.status !== 'approved' && (
                            <button
                                type="button"
                                disabled={isModerating}
                                onClick={() => void onModerate(project.id, 'approved')}
                                className="inline-flex items-center gap-1 rounded-full border border-room-success/30 px-2.5 py-1 text-xs font-semibold text-room-success transition hover:bg-room-success/10 disabled:opacity-50"
                            >
                                <Check className="h-3.5 w-3.5" /> Schválit
                            </button>
                        )}
                        {project.status !== 'rejected' && (
                            <button
                                type="button"
                                disabled={isModerating}
                                onClick={() => void onModerate(project.id, 'rejected')}
                                className="inline-flex items-center gap-1 rounded-full border border-room-danger/30 px-2.5 py-1 text-xs font-semibold text-room-danger transition hover:bg-room-danger/10 disabled:opacity-50"
                            >
                                <X className="h-3.5 w-3.5" /> Zamítnout
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
