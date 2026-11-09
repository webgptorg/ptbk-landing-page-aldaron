'use client';

import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import type { CommunityPreview, CommunityPreviewDiscussion } from '@/lib/community/communityPreviewTypes';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { cn } from '@/lib/utils';
import { formatCzechWorkshopDayAndMonth } from '@/lib/workshops/workshopDate';
import { useReducedMotion } from 'framer-motion';
import { Code2, ShieldCheck, Users } from 'lucide-react';
import { useEffect } from 'react';

const REACTION_INTERVAL_MILLISECONDS = 1_050;

/**
 * The reactions the preview flies while it does not know which ones the rooms really celebrate
 */
const DEFAULT_PREVIEW_REACTIONS = ['</>', '💡', '🔥', '👏', '✨'] as const;

/**
 * The conversation the preview shows while the community cannot be read
 *
 * Note: A hero which renders an empty window would look broken, so an unreachable database is answered with a scene
 *       rather than with nothing. Every reachable community replaces this with what its members really wrote.
 */
const FALLBACK_PREVIEW_DISCUSSIONS: readonly CommunityPreviewDiscussion[] = [
    {
        id: 'fallback-member-question',
        authorName: 'Andrea',
        isAuthorModerator: false,
        body: 'Zkouším AI na nabídky. Kam mám dát výjimky, aby je model nepřehlédl?',
        createdAt: '',
    },
    {
        id: 'fallback-moderator-answer',
        authorName: 'Pavol',
        isAuthorModerator: true,
        body: 'Dejte je do kontextu hned na začátek. Na webináři ukážu i verzi, která selhala.',
        createdAt: '',
    },
];

type CommunityMembershipLivePreviewProps = {
    readonly preview: CommunityPreview;
};

/**
 * One line of the window which is only written when there is something to say
 */
function createTotalsLabel(preview: CommunityPreview): string | null {
    const totalsLabels = [
        preview.totals.messageCount === 0
            ? null
            : formatCzechCountedNoun(preview.totals.messageCount, ['zpráva', 'zprávy', 'zpráv']),
        preview.totals.reactionCount === 0
            ? null
            : formatCzechCountedNoun(preview.totals.reactionCount, ['reakce', 'reakce', 'reakcí']),
    ].filter((label): label is string => label !== null);

    return totalsLabels.length === 0 ? null : totalsLabels.join(' · ');
}

function CommunityPreviewMessage({ discussion }: { discussion: CommunityPreviewDiscussion }) {
    return (
        <article
            className={cn(
                'rounded-2xl p-4 ring-1',
                discussion.isAuthorModerator
                    ? 'ml-6 rounded-tr-md bg-cyan-300/10 ring-cyan-200/20'
                    : 'mr-6 rounded-tl-md bg-white/[0.07] ring-white/10',
            )}
        >
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-200">
                {discussion.isAuthorModerator ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-300/10 px-2 py-0.5 text-violet-200">
                        <ShieldCheck className="h-3 w-3" /> Moderátor
                    </span>
                ) : (
                    <span className="h-2 w-2 rounded-full bg-cyan-300" aria-hidden="true" />
                )}
                {discussion.authorName}
                {discussion.createdAt !== '' && (
                    <time className="font-normal text-cyan-100/45" dateTime={discussion.createdAt}>
                        {formatCzechWorkshopDayAndMonth(discussion.createdAt)}
                    </time>
                )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{discussion.body}</p>
        </article>
    );
}

/**
 * The window into the real community which the membership page opens with
 *
 * Note: Everything written in it comes from the community itself — its members, their approved messages and the
 *       totals of what they have really done. Only the flight of the reactions is made up, because nobody is
 *       reacting while a landing page is being read; which reactions fly is still read from the rooms.
 * Note: The reactions use the exact animation registry and renderer of the workshops rather than a landing-page
 *       imitation which could drift away from the product.
 */
export function CommunityMembershipLivePreview({ preview }: CommunityMembershipLivePreviewProps) {
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();
    const isReducedMotionPreferred = useReducedMotion() === true;
    const previewReactions =
        preview.popularReactions.length === 0 ? DEFAULT_PREVIEW_REACTIONS : preview.popularReactions;
    const discussions = preview.discussions.length === 0 ? FALLBACK_PREVIEW_DISCUSSIONS : preview.discussions;
    const totalsLabel = createTotalsLabel(preview);

    useEffect(() => {
        if (isReducedMotionPreferred) {
            return;
        }

        let reactionIndex = 0;
        const launchNextReaction = () => {
            const reactionText = previewReactions[reactionIndex % previewReactions.length]!;
            launchReaction({
                flightId: `community-membership-${reactionIndex}-${Date.now()}`,
                reactionText,
            });
            reactionIndex += 1;
        };

        launchNextReaction();
        const intervalId = window.setInterval(launchNextReaction, REACTION_INTERVAL_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, [isReducedMotionPreferred, launchReaction, previewReactions]);

    return (
        <figure
            className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071b27] p-3 shadow-2xl shadow-cyan-950/30 sm:p-5"
            aria-label="Ukázka diskuze a reakcí v komunitě Vývojáři"
        >
            <div className="relative flex min-h-[410px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#0d2a37] to-[#071923] p-4 sm:min-h-[450px] sm:p-6">
                <WorkshopReactionStream reactions={flyingReactions} className="z-20" />

                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-200/20">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Vývojáři</p>
                            <p className="text-xs text-cyan-100/55">vývoj a práce s AI</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-200/20">
                        <Users className="h-3.5 w-3.5" />
                        {preview.totals.memberCount === 0
                            ? 'pro členy'
                            : formatCzechCountedNoun(preview.totals.memberCount, ['člen', 'členové', 'členů'])}
                    </div>
                </div>

                <div className="mt-5 flex-1 space-y-4">
                    {discussions.map((discussion) => (
                        <CommunityPreviewMessage key={discussion.id} discussion={discussion} />
                    ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#0a202b]/90 p-3 backdrop-blur">
                    {totalsLabel !== null && (
                        <p className="mb-2.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-cyan-100/50">
                            {totalsLabel}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {previewReactions.map((reaction) => (
                            <span
                                key={reaction}
                                className="flex h-9 min-w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 text-base text-white"
                            >
                                {reaction}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </figure>
    );
}
