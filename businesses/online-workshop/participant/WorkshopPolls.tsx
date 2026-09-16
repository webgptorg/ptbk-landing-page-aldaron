'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getWorkshopPollOptionVotePercentage, getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll, WorkshopPollVoteValues } from '@/lib/workshops/workshopTypes';
import { Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopPollsProps = {
    /**
     * Where the room which shows these polls put them, which is the one thing about them that room decides
     */
    readonly className?: string;
    readonly polls: readonly WorkshopPoll[];
    readonly isInteractionBanned: boolean;
    /**
     * Records the one e-mail-owned vote shared by the community and every workshop occurrence the poll is attached to.
     */
    readonly onVote?: (pollId: string, voteValues: WorkshopPollVoteValues) => Promise<boolean>;
};

/**
 * The member-facing side of a room poll. It accepts only the aggregated poll state, therefore it cannot accidentally
 * reveal who voted for an option; a member knows solely whether the highlighted choice is their own, whichever room
 * they used to make it.
 */
export function WorkshopPolls({
    className,
    polls,
    isInteractionBanned,
    onVote,
}: WorkshopPollsProps) {
    const [votingPollId, setVotingPollId] = useState<string | null>(null);
    const [otherOptionLabels, setOtherOptionLabels] = useState<Readonly<Record<string, string>>>({});

    if (polls.length === 0) {
        return null;
    }

    const handleVote = async (pollId: string, voteValues: WorkshopPollVoteValues): Promise<boolean> => {
        if (onVote === undefined) {
            return false;
        }

        setVotingPollId(pollId);
        try {
            return await onVote(pollId, voteValues);
        } finally {
            setVotingPollId((currentPollId) => (currentPollId === pollId ? null : currentPollId));
        }
    };

    const handleOtherOptionSubmit = async (
        event: FormEvent<HTMLFormElement>,
        pollId: string,
        isVoteAvailable: boolean,
    ) => {
        event.preventDefault();
        const otherOptionLabel = (otherOptionLabels[pollId] ?? '').trim();
        if (!isVoteAvailable || otherOptionLabel === '') {
            return;
        }

        const isVoteSaved = await handleVote(pollId, { otherOptionLabel });
        if (isVoteSaved) {
            setOtherOptionLabels((currentLabels) => ({ ...currentLabels, [pollId]: '' }));
        }
    };

    return (
        <section aria-label="Ankety komunity" className={cn('space-y-4', className)}>
            {polls.map((poll) => {
                const totalVoteCount = getWorkshopPollVoteCount(poll);
                const isVoting = votingPollId === poll.id;
                const isVotingInCurrentRoomEnabled = onVote !== undefined;
                const isVoteAvailable = isVotingInCurrentRoomEnabled && !poll.isClosed && !isInteractionBanned;
                const otherOptionLabel = otherOptionLabels[poll.id] ?? '';
                const isOtherOptionLabelWritten = otherOptionLabel.trim() !== '';
                const interactionAvailabilityMessage = !isVotingInCurrentRoomEnabled
                    ? 'Hlasování v této místnosti není dostupné.'
                    : isInteractionBanned
                      ? 'Pro tento účet nejsou interakce dostupné.'
                      : null;

                return (
                    <article
                        key={poll.id}
                        className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.10] to-slate-950/20 shadow-lg shadow-cyan-950/10"
                    >
                        <div className="border-b border-white/[0.08] px-5 py-4">
                            <h2 className="text-lg font-bold leading-6 text-white">{poll.question}</h2>
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
                                        onClick={() => void handleVote(poll.id, { optionId: option.id })}
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

                            {poll.isOtherOptionEnabled && (
                                <form
                                    className="mt-3 rounded-xl border border-dashed border-cyan-300/35 bg-slate-950/20 p-3"
                                    onSubmit={(event) => void handleOtherOptionSubmit(event, poll.id, isVoteAvailable)}
                                >
                                    <label
                                        className="block text-sm font-medium text-slate-100"
                                        htmlFor={`poll-${poll.id}-other-option`}
                                    >
                                        Jiná odpověď
                                    </label>
                                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            id={`poll-${poll.id}-other-option`}
                                            value={otherOptionLabel}
                                            onChange={(event) =>
                                                setOtherOptionLabels((currentLabels) => ({
                                                    ...currentLabels,
                                                    [poll.id]: event.target.value,
                                                }))
                                            }
                                            disabled={!isVoteAvailable || isVoting}
                                            maxLength={200}
                                            placeholder="Napište vlastní odpověď"
                                            className="border-white/[0.14] bg-slate-950/40 text-white placeholder:text-slate-400"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!isVoteAvailable || isVoting || !isOtherOptionLabelWritten}
                                            className="shrink-0"
                                        >
                                            Přidat a hlasovat
                                        </Button>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Vaše odpověď se přidá mezi možnosti a zároveň pro ni odevzdáte svůj hlas.
                                    </p>
                                </form>
                            )}
                        </div>

                        {!poll.isClosed && interactionAvailabilityMessage !== null && (
                            <p className="px-5 pb-4 text-xs leading-5 text-slate-400">{interactionAvailabilityMessage}</p>
                        )}
                    </article>
                );
            })}
        </section>
    );
}
