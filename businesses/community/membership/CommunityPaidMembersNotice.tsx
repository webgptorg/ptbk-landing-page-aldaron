'use client';

import { Crown, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

const UNLOCK_PAID_MEMBERSHIP_LABEL = 'Koupit placené členství';

type CommunityPaidMembersNoticeProps = {
    readonly title: string;
    readonly description: string;
    readonly onUnlockPaidMembership: () => void;

    /**
     * What is waiting behind the membership, shown under the offer itself
     *
     * Note: A surface which has nothing to tease with leaves the content out, which takes its heading with it, so the
     *       card never announces a teaser it does not carry.
     */
    readonly unlockedLabel?: string;
    readonly unlockedContent?: ReactNode;
};

/**
 * Where something reserved for the paid members is, for the members who cannot see it.
 *
 * Note: Whatever is withheld stays on the server; this card only says that it is there, teases as much of it as may
 *       be seen, and opens the very same membership popup the badge in the header opens. Every surface of a room which
 *       withholds something writes it this one way, so the materials and the recording of a workshop are offered with
 *       one card rather than two which could drift apart.
 */
export function CommunityPaidMembersNotice({
    title,
    description,
    onUnlockPaidMembership,
    unlockedLabel,
    unlockedContent,
}: CommunityPaidMembersNoticeProps) {
    return (
        <div className="rounded-2xl border border-room-warning/30 bg-room-warning/[0.06] p-5 shadow-lg shadow-amber-300/10 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Lock className="mt-1 h-5 w-5 shrink-0 text-room-warning" aria-hidden="true" />
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-room-heading">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-room-text">{description}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onUnlockPaidMembership}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-room-warning px-5 py-2.5 text-sm font-bold text-room-action-foreground shadow-lg shadow-amber-300/10 transition hover:bg-room-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-warning focus-visible:ring-offset-2 focus-visible:ring-offset-room-background"
                >
                    <Crown className="h-4 w-4" aria-hidden="true" /> {UNLOCK_PAID_MEMBERSHIP_LABEL}
                </button>
            </div>
            {unlockedContent !== undefined && (
                <div className="mt-5 border-t border-room-warning/20 pt-4">
                    {unlockedLabel !== undefined && (
                        <p className="text-xs font-bold uppercase tracking-wide text-room-warning/80">{unlockedLabel}</p>
                    )}
                    <div className="mt-2">{unlockedContent}</div>
                </div>
            )}
        </div>
    );
}
