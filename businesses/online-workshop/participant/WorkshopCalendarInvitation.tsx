'use client';

import { AddToCalendarButtons, type CalendarKind } from '@/components/calendar/AddToCalendarButtons';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import {
    createWorkshopCalendarEvent,
    createWorkshopCalendarFileName,
    isWorkshopUpcoming,
} from '@/lib/workshops/workshopCalendar';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { CalendarPlus } from 'lucide-react';

type WorkshopCalendarInvitationProps = {
    /**
     * Workshop as it is right now, so that a changed date or title reaches the calendar of every participant
     */
    readonly workshop: WorkshopDetails;

    /**
     * Moment the server is at, which decides whether the workshop is still ahead
     */
    readonly serverTime: string;

    /**
     * Full name of the person who leads the workshop
     */
    readonly hostFullname: string;

    /**
     * Site-relative path of this participant room
     */
    readonly participantPath: string;

    /**
     * Details of the connected participant, used to name the event and to prefill the link back into the room
     */
    readonly participantIdentity: WorkshopParticipantIdentity;
};

/**
 * Invitation to keep the workshop in the calendar of the participant, offered while the workshop is still ahead
 */
export function WorkshopCalendarInvitation({
    workshop,
    serverTime,
    hostFullname,
    participantPath,
    participantIdentity,
}: WorkshopCalendarInvitationProps) {
    if (!isWorkshopUpcoming(workshop.startsAt, serverTime)) {
        return null;
    }

    const calendarEvent = createWorkshopCalendarEvent({
        occurrence: workshop,
        hostFullname,
        participantIdentity,
        participantPath,
    });

    const handleAddToCalendar = (calendarKind: CalendarKind) => {
        trackGoogleAnalyticsEvent('workshop_calendar_added', {
            workshop_slug: workshop.slug,
            calendar_kind: calendarKind,
        });
    };

    return (
        <section className="mt-4 rounded-2xl border border-room-border/10 bg-room-overlay/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-room-accent/10 text-room-accent">
                        <CalendarPlus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-room-heading">Ať vám workshop neuteče</h2>
                        <p className="mt-1 text-xs leading-5 text-room-muted">
                            Uložte si termín do kalendáře. V události najdete i odkaz zpět do této místnosti.
                        </p>
                    </div>
                </div>
                <AddToCalendarButtons
                    event={calendarEvent}
                    downloadFileName={createWorkshopCalendarFileName(workshop.slug)}
                    tone="dark"
                    className="shrink-0"
                    onAddToCalendar={handleAddToCalendar}
                />
            </div>
        </section>
    );
}
