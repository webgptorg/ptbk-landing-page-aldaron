'use client';

import { WorkshopPollOptionModeration } from '@/businesses/online-workshop/participant/WorkshopPollOptionModeration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { WorkshopPollOptionModerationValues } from '@/lib/workshops/workshopPollOptionModeration';
import { getWorkshopPollOptionVotePercentage, getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll, WorkshopPollVoteValues } from '@/lib/workshops/workshopTypes';
import { Check, Clock3 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopPollsProps = {
    /**
     * Where the room which shows these polls put them, which is the one thing about them that room decides
     */
    readonly className?: string;
    readonly polls: readonly WorkshopPoll[];
    readonly isInteractionBanned: boolean;

    /**
     * Whether an answer this member writes waits for a moderator before the rest of the room can read it
     */
    readonly isOwnOtherOptionApprovalRequired?: boolean;

    /**
     * Records the one e-mail-owned vote shared by the community and every workshop occurrence the poll is attached to.
     */
    readonly onVote?: (pollId: string, voteValues: WorkshopPollVoteValues) => Promise<boolean>;

    /**
     * Decides about one answer waiting for moderation, which only a moderator of the room owning the poll is offered
     */
    readonly onModerateOption?: (
        pollId: string,
        optionId: string,
        values: WorkshopPollOptionModerationValues,
    ) => Promise<boolean>;
};

/**
 * The member-facing side of a room poll. It accepts only the aggregated poll state, therefore it cannot accidentally
 * reveal who voted for an option; a member knows solely whether the highlighted choice is their own, whichever room
 * they used to make it.
 *
 * Note: An answer which still waits for moderation only ever reaches the member who wrote it and the moderators of the
 *       room, so it is marked as waiting rather than quietly counted among the public results.
 */
export function WorkshopPolls({
    className,
    polls,
    isInteractionBanned,
    isOwnOtherOptionApprovalRequired = false,
    onVote,
    onModerateOption,
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
                        className="overflow-hidden rounded-2xl border border-room-accent/20 bg-gradient-to-br from-room-accent/[0.10] to-room-inset/20 shadow-lg shadow-cyan-950/10"
                    >
                        <div className="border-b border-room-border/[0.08] px-5 py-4">
                            <h2 className="text-lg font-bold leading-6 text-room-heading">{poll.question}</h2>
                        </div>

                        <div className="space-y-2.5 p-4">
                            {poll.options.map((option) => {
                                const percentage = getWorkshopPollOptionVotePercentage(option, totalVoteCount);
                                const isSelected = option.isVotedByParticipant;
                                const isWaitingForApproval = option.status === 'pending';

                                return (
                                    <div key={option.id}>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            disabled={!isVoteAvailable || isVoting}
                                            aria-pressed={isSelected}
                                            onClick={() => void handleVote(poll.id, { optionId: option.id })}
                                            className={`relative flex h-auto w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                                                isSelected
                                                    ? 'border-room-accent/80 bg-room-accent/[0.17] text-room-heading hover:bg-room-accent/[0.20]'
                                                    : 'border-room-border/[0.10] bg-room-inset/30 text-room-heading hover:border-room-accent/35 hover:bg-room-overlay/[0.07]'
                                            }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`absolute inset-y-0 left-0 bg-room-accent/[0.10] transition-[width] ${
                                                    isSelected ? 'bg-room-accent/[0.20]' : ''
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                            <span className="relative flex min-w-0 flex-1 items-center gap-3">
                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                        isSelected
                                                            ? 'border-room-accent bg-room-action text-room-action-foreground'
                                                            : 'border-room-muted text-transparent'
                                                    }`}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                                <span className="min-w-0 flex-1 break-words font-medium">
                                                    {option.label}
                                                </span>
                                                {/* Note: An answer which the room does not see yet is marked for the
                                                          one who wrote it and for the moderator who decides about it.
                                                          Nobody else ever receives it. */}
                                                {isWaitingForApproval && (
                                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-room-warning/10 px-2 py-0.5 text-[11px] font-semibold text-room-warning">
                                                        <Clock3 className="h-3 w-3" /> Čeká na schválení
                                                    </span>
                                                )}
                                                <span className="shrink-0 text-xs font-semibold tabular-nums text-room-text">
                                                    {option.voteCount} · {percentage} %
                                                </span>
                                            </span>
                                        </Button>
                                        {onModerateOption !== undefined && option.isCreatedByParticipant && (
                                            <WorkshopPollOptionModeration
                                                option={option}
                                                onModerateOption={(optionId, values) =>
                                                    onModerateOption(poll.id, optionId, values)
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            {poll.isOtherOptionEnabled && (
                                <form
                                    className="mt-3 rounded-xl border border-dashed border-room-accent/35 bg-room-inset/20 p-3"
                                    onSubmit={(event) => void handleOtherOptionSubmit(event, poll.id, isVoteAvailable)}
                                >
                                    <label
                                        className="block text-sm font-medium text-room-heading"
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
                                            className="border-room-border/[0.14] bg-room-inset/40 text-room-heading placeholder:text-room-muted"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!isVoteAvailable || isVoting || !isOtherOptionLabelWritten}
                                            className="shrink-0"
                                        >
                                            Přidat a hlasovat
                                        </Button>
                                    </div>
                                    {isOwnOtherOptionApprovalRequired && (
                                        <p className="mt-2 text-xs leading-5 text-room-muted">
                                            Váš hlas se započítá hned, ostatní uvidí vaši odpověď až po schválení.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>

                        {!poll.isClosed && interactionAvailabilityMessage !== null && (
                            <p className="px-5 pb-4 text-xs leading-5 text-room-muted">
                                {interactionAvailabilityMessage}
                            </p>
                        )}
                    </article>
                );
            })}
        </section>
    );
}
