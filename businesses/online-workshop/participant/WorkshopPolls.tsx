'use client';

import { Button } from '@/components/ui/button';
import { getWorkshopPollOptionVotePercentage, getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll } from '@/lib/workshops/workshopTypes';
import { BarChart3, Check, Lock, Vote } from 'lucide-react';
import { useState } from 'react';

type WorkshopPollsProps = {
    readonly polls: readonly WorkshopPoll[];
    readonly isInteractionBanned: boolean;
    /**
     * Records the one e-mail-owned vote shared by the community and every workshop occurrence the poll is attached to.
     */
    readonly onVote?: (pollId: string, optionId: string) => Promise<boolean>;
};

/**
 * The member-facing side of a room poll. It accepts only the aggregated poll state, therefore it cannot accidentally
 * reveal who voted for an option; a member knows solely whether the highlighted choice is their own, whichever room
 * they used to make it.
 */
export function WorkshopPolls({
    polls,
    isInteractionBanned,
    onVote,
}: WorkshopPollsProps) {
    const [votingPollId, setVotingPollId] = useState<string | null>(null);

    if (polls.length === 0) {
        return null;
    }

    const handleVote = async (pollId: string, optionId: string) => {
        if (onVote === undefined) {
            return;
        }

        setVotingPollId(pollId);
        try {
            await onVote(pollId, optionId);
        } finally {
            setVotingPollId((currentPollId) => (currentPollId === pollId ? null : currentPollId));
        }
    };

    return (
        <section aria-label="Ankety komunity" className="space-y-4">
            {polls.map((poll) => {
                const totalVoteCount = getWorkshopPollVoteCount(poll);
                const isVoting = votingPollId === poll.id;
                const isVotingInCurrentRoomEnabled = onVote !== undefined;
                const isVoteAvailable = isVotingInCurrentRoomEnabled && !poll.isClosed && !isInteractionBanned;

                return (
                    <article
                        key={poll.id}
                        className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.10] to-slate-950/20 shadow-lg shadow-cyan-950/10"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                                    <Vote className="h-4 w-4" /> Anketa komunity
                                </p>
                                <h2 className="mt-2 text-lg font-bold leading-6 text-white">{poll.question}</h2>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/30 px-2.5 py-1 text-xs font-medium text-slate-300">
                                {poll.isClosed ? <Lock className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                                {poll.isClosed ? 'Hlasování skončilo' : `${totalVoteCount} hlasů`}
                            </span>
                        </div>

                        <div className="space-y-2.5 p-4">
                            {poll.options.map((option) => {
                                const percentage = getWorkshopPollOptionVotePercentage(option, totalVoteCount);
                                const isSelected = option.isVotedByParticipant;

                                return (
                                    <Button
                                        key={option.id}
                                        type="button"
                                        variant="ghost"
                                        disabled={!isVoteAvailable || isVoting}
                                        aria-pressed={isSelected}
                                        onClick={() => void handleVote(poll.id, option.id)}
                                        className={`relative flex h-auto w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                                            isSelected
                                                ? 'border-cyan-300/80 bg-cyan-300/[0.17] text-white hover:bg-cyan-300/[0.20]'
                                                : 'border-white/[0.10] bg-slate-950/30 text-slate-100 hover:border-cyan-300/35 hover:bg-white/[0.07]'
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-y-0 left-0 bg-cyan-300/[0.10] transition-[width] ${
                                                isSelected ? 'bg-cyan-300/[0.20]' : ''
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <span className="relative flex min-w-0 flex-1 items-center gap-3">
                                            <span
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                    isSelected
                                                        ? 'border-cyan-200 bg-cyan-300 text-slate-950'
                                                        : 'border-slate-500 text-transparent'
                                                }`}
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="min-w-0 flex-1 break-words font-medium">{option.label}</span>
                                            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-300">
                                                {option.voteCount} · {percentage} %
                                            </span>
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>

                        {!poll.isClosed && (
                            <p className="px-5 pb-4 text-xs leading-5 text-slate-400">
                                {!isVotingInCurrentRoomEnabled
                                    ? 'Hlasování v této místnosti není dostupné.'
                                    : isInteractionBanned
                                    ? 'Pro tento účet nejsou interakce dostupné.'
                                    : 'Vyberte jednu možnost. Stejný hlas uvidíte v komunitě i v připojených workshopech a můžete jej kdykoli změnit.'}
                            </p>
                        )}
                    </article>
                );
            })}
        </section>
    );
}
