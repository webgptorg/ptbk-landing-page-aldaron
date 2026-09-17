'use client';

import { WorkshopFeedback } from '@/businesses/online-workshop/participant/WorkshopFeedback';
import { WorkshopWrapUpMembershipOffer } from '@/businesses/online-workshop/participant/WorkshopWrapUpMembershipOffer';
import { WorkshopWrapUpPdfDownload } from '@/businesses/online-workshop/participant/WorkshopWrapUpPdfDownload';
import type { WorkshopFeedbackValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import type {
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopFeedback as WorkshopFeedbackValue,
    WorkshopPaidMembersVideo,
} from '@/lib/workshops/workshopTypes';
import { ArrowDown, BookOpenText, PartyPopper, Play } from 'lucide-react';
import type { ReactNode } from 'react';

type WorkshopWrapUpProps = {
    readonly workshop: Pick<
        WorkshopDetails,
        'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'presentationUrl'
    >;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly feedback: WorkshopFeedbackValue | null;
    readonly followUpContentBlock: WorkshopContentBlock | null;
    readonly onSaveFeedback: (values: WorkshopFeedbackValues) => Promise<boolean>;

    /**
     * The recording which the membership of this member has not unlocked, or `null` while nothing of it is withheld
     *
     * Note: Exactly one of these two is ever given: a member who may play the recording is offered the button which
     *       plays it, and a member who may not is offered the teaser of it and the membership which unlocks it.
     */
    readonly paidMembersOnlyVideo?: WorkshopPaidMembersVideo | null;

    /**
     * Offered only to the members whose membership unlocks the video of the ended workshop, so the wrap-up stays the
     * same screen for everybody and only gains the button which plays the video again.
     */
    readonly onRewatchVideo?: () => void;
    readonly navigation?: ReactNode;
};

/**
 * The third stage of a workshop. The follow-up is still rendered by the shared material list below; this screen links
 * directly to that same record so the stage does not invent a second material model or a second tracking path.
 */
export function WorkshopWrapUp({
    workshop,
    contentBlocks,
    feedback,
    followUpContentBlock,
    paidMembersOnlyVideo = null,
    onSaveFeedback,
    onRewatchVideo,
    navigation,
}: WorkshopWrapUpProps) {
    return (
        <div className="relative px-5 py-7 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-2 text-cyan-200">
                    <PartyPopper className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">Workshop je u konce</span>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Děkujeme, že jste byli u toho!
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Budeme rádi za krátkou zpětnou vazbu. Zabere jen chvilku a pomůže nám připravit další setkání ještě
                    lépe.
                </p>

                {onRewatchVideo !== undefined && (
                    <button
                        type="button"
                        onClick={onRewatchVideo}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-300/10 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081a24]"
                    >
                        <Play className="h-4 w-4" aria-hidden="true" /> Přehrát video znovu
                    </button>
                )}

                <WorkshopWrapUpMembershipOffer paidMembersOnlyVideo={paidMembersOnlyVideo} />

                {navigation}

                <WorkshopWrapUpPdfDownload workshop={workshop} contentBlocks={contentBlocks} />

                <div className="mt-6">
                    <WorkshopFeedback feedback={feedback} onSave={onSaveFeedback} />
                </div>

                {followUpContentBlock !== null && (
                    <a
                        href={`#workshop-material-${followUpContentBlock.id}`}
                        className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200/25 bg-amber-300/[0.08] p-4 text-left transition hover:border-amber-200/60 hover:bg-amber-300/[0.13]"
                    >
                        <BookOpenText className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                                Navazující materiál
                            </span>
                            <span className="mt-1 block text-sm font-bold text-white">
                                {followUpContentBlock.title || 'Otevřít doporučený materiál z workshopu'}
                            </span>
                        </span>
                        <ArrowDown className="mt-2 h-4 w-4 shrink-0 text-amber-100" aria-hidden="true" />
                    </a>
                )}
            </div>
        </div>
    );
}
