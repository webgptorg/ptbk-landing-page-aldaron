import {
    createCalendarDayKey,
    getCalendarMonthKey,
    type CalendarDayKey,
    type CalendarMonthKey,
} from '@/lib/calendar/calendarMonth';
import type { EventDetails } from '@/lib/events/event';
import { createEventLinkOrNull } from '@/lib/events/eventLinks';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { getWorkshopPhase, sortWorkshopsByPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * One listed term, together with everything both a card and a calendar day say about it
 *
 * Note: Where a term leads, where it stands in time and which day it falls on is worked out once here, so that the
 *       two views of the same terms can never disagree about any of it.
 */
export type EventListing = {
    readonly workshop: WorkshopSummary;
    readonly event: EventDetails;

    /**
     * Where this term leads the member reading the list
     */
    readonly link: string;

    /**
     * Whether this term is running right now, only just over, starts within the next week, is further ahead, or is
     * already history
     */
    readonly phase: WorkshopPhase;

    /**
     * The day this term is held on in the country the list is drawn for
     */
    readonly dayKey: CalendarDayKey;
};

type EventListingOptions = {
    readonly workshops: readonly WorkshopSummary[];

    /**
     * Details of the member reading the list, which every link carries on into the room it opens
     */
    readonly participantIdentity: WorkshopParticipantIdentity;

    /**
     * Moment which decides the phases, so that one whole list is placed against the same instant
     */
    readonly currentTimeMilliseconds: number;

    /**
     * Time zone the terms are dated in, for example `Europe/Prague`
     */
    readonly timeZone: string;
};

/**
 * The terms a room lists, ordered by what matters most to a member: what runs now, what has just ended, what starts
 * within a week, what comes later, then the history.
 *
 * Note: A term the application cannot lead anywhere is deliberately left out instead of being offered as a link which
 *       would open a different event.
 */
export function createEventListings({
    workshops,
    participantIdentity,
    currentTimeMilliseconds,
    timeZone,
}: EventListingOptions): readonly EventListing[] {
    return sortWorkshopsByPhase(workshops, currentTimeMilliseconds).flatMap((workshop) => {
        const link = createEventLinkOrNull(workshop, participantIdentity);

        return link === null || workshop.event === null
            ? []
            : [
                  {
                      workshop,
                      event: workshop.event,
                      link,
                      phase: getWorkshopPhase(workshop, currentTimeMilliseconds),
                      dayKey: createCalendarDayKey(workshop.startsAt, timeZone),
                  },
              ];
    });
}

/**
 * The listed terms of every day which has any, so that a calendar reads the terms of one day without searching all of
 * them again for every day it draws
 */
export function groupEventListingsByDayKey(
    listings: readonly EventListing[],
): ReadonlyMap<CalendarDayKey, readonly EventListing[]> {
    const listingsByDayKey = new Map<CalendarDayKey, EventListing[]>();

    for (const listing of listings) {
        const dayListings = listingsByDayKey.get(listing.dayKey);
        if (dayListings === undefined) {
            listingsByDayKey.set(listing.dayKey, [listing]);
        } else {
            dayListings.push(listing);
        }
    }

    return listingsByDayKey;
}

/**
 * The month a calendar of these terms opens on
 *
 * Note: A calendar opens on the month a member is in, because that is the month they are looking for. Only when
 *       nothing at all is listed in it does it open on the month of the most relevant term instead, so that a member
 *       is never met by an empty grid while terms are waiting one page away.
 */
export function selectInitialCalendarMonthKey(
    listings: readonly EventListing[],
    todayDayKey: CalendarDayKey,
): CalendarMonthKey {
    const currentMonthKey = getCalendarMonthKey(todayDayKey);
    const isAnyListingInCurrentMonth = listings.some(
        (listing) => getCalendarMonthKey(listing.dayKey) === currentMonthKey,
    );

    if (isAnyListingInCurrentMonth || listings.length === 0) {
        return currentMonthKey;
    }

    return getCalendarMonthKey(listings[0].dayKey);
}
