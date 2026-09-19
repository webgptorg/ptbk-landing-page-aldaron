'use client';

import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { formatWorkshopWatchingCountLabel } from '@/businesses/online-workshop/participant/workshopWatchingCountLabel';
import { Eye } from 'lucide-react';

type WorkshopWatchingBadgeProps = {
    /**
     * How many participants have the room open right now, including this one
     */
    readonly watchingParticipantCount: number;
};

/**
 * Shows how many people are watching the workshop together with this participant
 */
export function WorkshopWatchingBadge({ watchingParticipantCount }: WorkshopWatchingBadgeProps) {
    // Note: A room always counts the participant reading it, so an empty count only means that it could not be loaded.
    if (watchingParticipantCount < 1) {
        return null;
    }

    return (
        <div
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} border-room-accent/15 bg-room-accent/[0.06] px-3 py-1.5 text-room-accent`}
        >
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words text-center">
                {formatWorkshopWatchingCountLabel(watchingParticipantCount)}
            </span>
        </div>
    );
}
