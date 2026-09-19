'use client';

import type { CommunityProjectVote } from '@/lib/community-projects/communityProjectTypes';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';

type CommunityProjectVotingProps = {
    readonly upvoteCount: number;
    readonly downvoteCount: number;
    readonly voteByParticipant: CommunityProjectVote | null;
    readonly isVoting: boolean;
    readonly isVotingOffered: boolean;
    readonly onVote: (vote: CommunityProjectVote) => Promise<void>;
};

/**
 * A compact two-direction vote control. The server remains the authority: another click on an already selected arrow
 * removes that vote, and the opposite arrow replaces it without ever creating a second vote row.
 */
export function CommunityProjectVoting({
    upvoteCount,
    downvoteCount,
    voteByParticipant,
    isVoting,
    isVotingOffered,
    onVote,
}: CommunityProjectVotingProps) {
    return (
        <div className="inline-flex items-center rounded-lg border border-room-border/10 bg-room-inset/60 p-0.5 text-xs">
            <button
                type="button"
                aria-label="Dát projektu kladný hlas"
                aria-pressed={voteByParticipant === 'up'}
                disabled={isVoting || !isVotingOffered}
                onClick={() => void onVote('up')}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 font-bold transition disabled:cursor-wait disabled:opacity-50 ${
                    voteByParticipant === 'up'
                        ? 'bg-room-success/20 text-room-success'
                        : 'text-room-text hover:bg-room-overlay/10 hover:text-room-heading'
                }`}
            >
                <ArrowBigUp className="h-4 w-4" aria-hidden="true" />
                <span>{upvoteCount}</span>
            </button>
            <span className="h-5 w-px bg-room-overlay/10" aria-hidden="true" />
            <button
                type="button"
                aria-label="Dát projektu záporný hlas"
                aria-pressed={voteByParticipant === 'down'}
                disabled={isVoting || !isVotingOffered}
                onClick={() => void onVote('down')}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 font-bold transition disabled:cursor-wait disabled:opacity-50 ${
                    voteByParticipant === 'down'
                        ? 'bg-room-danger/20 text-room-danger'
                        : 'text-room-text hover:bg-room-overlay/10 hover:text-room-heading'
                }`}
            >
                <ArrowBigDown className="h-4 w-4" aria-hidden="true" />
                <span>{downvoteCount}</span>
            </button>
        </div>
    );
}
