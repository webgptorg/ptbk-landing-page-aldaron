'use client';

import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import { Button } from '@/components/ui/button';
import type {
    CommunityPreview,
    CommunityPreviewPoll,
    CommunityPreviewPollAnswer,
    CommunityPreviewProject,
    CommunityPreviewTotals,
} from '@/lib/community/communityPreviewTypes';
import { formatCzechNumber } from '@/lib/language/czechNumbers';
import { ArrowRight, MessageSquareText, Sparkles, ThumbsUp, Users, Video } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type CommunityMembershipActivitySectionProps = {
    readonly preview: CommunityPreview;

    /**
     * Where somebody who wants to see all of this for themselves is taken, already carrying their identity
     */
    readonly communityHref: string;
};

type CommunityTotalTile = {
    readonly icon: LucideIcon;
    readonly value: number;
    readonly label: string;
};

/**
 * The totals worth showing, which are the ones the community has really reached
 *
 * Note: A total of nothing says nothing, so it is left out rather than presented as a zero which would only make the
 *       community look emptier than it is.
 */
function selectCommunityTotalTiles(totals: CommunityPreviewTotals): readonly CommunityTotalTile[] {
    return [
        { icon: Users, value: totals.memberCount, label: 'členů komunity' },
        { icon: Video, value: totals.heldWebinarCount, label: 'odvysílaných webinářů' },
        { icon: MessageSquareText, value: totals.messageCount, label: 'zpráv v diskuzích' },
        { icon: Sparkles, value: totals.reactionCount, label: 'reakcí na webinářích' },
    ].filter((tile) => tile.value > 0);
}

function CommunityTotalTileCard({ tile }: { tile: CommunityTotalTile }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <tile.icon className="h-5 w-5 text-cyan-700" aria-hidden="true" />
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{formatCzechNumber(tile.value)}</p>
            <p className="mt-1 text-sm text-slate-500">{tile.label}</p>
        </div>
    );
}

function CommunityPollAnswerBar({ answer }: { answer: CommunityPreviewPollAnswer }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800">{answer.label}</span>
                <span className="shrink-0 text-sm font-bold text-cyan-700">{answer.votePercentage} %</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${answer.votePercentage}%` }} />
            </div>
        </div>
    );
}

function CommunityPollCard({ poll }: { poll: CommunityPreviewPoll }) {
    return (
        <article className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-bold leading-snug text-slate-950">{poll.question}</h3>
            <div className="mt-6 flex-1 space-y-4">
                {poll.answers.map((answer) => (
                    <CommunityPollAnswerBar key={answer.label} answer={answer} />
                ))}
            </div>
            <p className="mt-6 text-xs text-slate-500">
                Nejčastější odpovědi z {formatCzechNumber(poll.voteCount)} hlasů členů.
            </p>
        </article>
    );
}

function CommunityProjectCard({ project }: { project: CommunityPreviewProject }) {
    return (
        <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                <CommunityProjectPreviewImage imageUrl={project.previewImageUrl} title={project.title} />
            </div>
            <div className="min-w-0">
                <h4 className="break-words font-bold leading-snug text-slate-950">{project.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{project.description}</p>
                <p className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{project.authorName}</span>
                    <span className="flex items-center gap-1 text-slate-600">
                        <ThumbsUp className="h-3.5 w-3.5" /> {formatCzechNumber(project.upvoteCount)}
                    </span>
                </p>
            </div>
        </article>
    );
}

/**
 * What the community has made and decided, read straight out of the community room
 *
 * Note: The whole section disappears when there is nothing real to put in it, so the page never claims an activity
 *       which did not happen.
 */
export function CommunityMembershipActivitySection({
    preview,
    communityHref,
}: CommunityMembershipActivitySectionProps) {
    const totalTiles = selectCommunityTotalTiles(preview.totals);
    const isSectionOffered = totalTiles.length > 0 || preview.projects.length > 0 || preview.poll !== null;
    if (!isSectionOffered) {
        return null;
    }

    return (
        <section id="komunita" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Uvnitř komunity</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        Co se děje mezi webináři.
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600">
                        Níže najdete čísla, projekty a anketu přímo z komunitní místnosti.
                    </p>
                </div>

                {totalTiles.length > 0 && (
                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {totalTiles.map((tile) => (
                            <CommunityTotalTileCard key={tile.label} tile={tile} />
                        ))}
                    </div>
                )}

                {(preview.projects.length > 0 || preview.poll !== null) && (
                    <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-stretch">
                        {preview.projects.length > 0 && (
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
                                    <Sparkles className="h-4 w-4" /> Projekty členů
                                </p>
                                <h3 className="mt-4 text-lg font-bold text-slate-950">
                                    Co členové postavili a sdíleli
                                </h3>
                                <div className="mt-5 space-y-3">
                                    {preview.projects.map((project) => (
                                        <CommunityProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-5 h-11 rounded-full border-slate-300 text-slate-700"
                                >
                                    <Link href={communityHref}>
                                        Otevřít galerii v komunitě <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        {preview.poll !== null && <CommunityPollCard poll={preview.poll} />}
                    </div>
                )}
            </div>
        </section>
    );
}
