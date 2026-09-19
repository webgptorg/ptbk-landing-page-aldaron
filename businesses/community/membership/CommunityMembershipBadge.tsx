'use client';

import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { ArrowUpRight, CalendarClock, Crown, Sparkles } from 'lucide-react';

const FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-room-accent/20 bg-room-accent/[0.08] px-3 py-1.5 text-room-accent transition hover:border-room-accent/40 hover:bg-room-accent/[0.14] hover:text-room-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-header';

const PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-room-warning/25 bg-room-warning/[0.1] px-3 py-1.5 text-room-warning transition hover:border-room-warning/45 hover:bg-room-warning/[0.15] hover:text-room-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-warning focus-visible:ring-offset-2 focus-visible:ring-offset-room-header';

const CANCELLATION_SCHEDULED_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-room-danger/25 bg-room-danger/[0.1] px-3 py-1.5 text-room-danger transition hover:border-room-danger/45 hover:bg-room-danger/[0.15] hover:text-room-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-danger focus-visible:ring-offset-2 focus-visible:ring-offset-room-header';

function createCancellationScheduledMembershipLabel(currentPeriodEndsAt: string | null): string {
    return currentPeriodEndsAt === null
        ? 'Placené členství končí'
        : `Placené členství končí ${formatCzechWorkshopDay(currentPeriodEndsAt)}`;
}

/**
 * Says which membership the connected member has and opens its details in the very same room.
 *
 * Note: Nothing is claimed while the membership is unknown, and nothing is offered where it cannot be bought, so a
 *       server without a payment gate simply shows no badge instead of promising a purchase it cannot finish.
 */
export function CommunityMembershipBadge() {
    const membershipRoom = useCommunityMembershipRoom();
    const membership = membershipRoom?.membership ?? null;
    if (membership === null) {
        return null;
    }

    if (isPaidCommunityMembershipStatus(membership.status)) {
        const membershipLabel = membership.isCancellationScheduled
            ? createCancellationScheduledMembershipLabel(membership.currentPeriodEndsAt)
            : 'Placené členství';

        return (
            <button
                type="button"
                onClick={membershipRoom?.openMembershipModal}
                className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${
                    membership.isCancellationScheduled
                        ? CANCELLATION_SCHEDULED_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME
                        : PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME
                }`}
                aria-label={`${membershipLabel}. Otevřít stav členství`}
                title={`${membershipLabel} – otevřít stav členství`}
            >
                {membership.isCancellationScheduled ? (
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                    <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>{membershipLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </button>
        );
    }

    if (!membership.isPurchaseOffered) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={membershipRoom?.openMembershipModal}
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME}`}
            aria-label="Free členství. Otevřít možnosti členství"
            title="Free členství – otevřít možnosti členství"
        >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Free členství</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
    );
}
