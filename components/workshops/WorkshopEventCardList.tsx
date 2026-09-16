import { WorkshopEventCard } from '@/components/workshops/WorkshopEventCard';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { classNames } from '@/lib/classNames';
import type { EventListing } from '@/lib/events/eventListing';

/**
 * How the list of terms is named to somebody who cannot see that it is a list of them
 */
const WORKSHOP_EVENT_CARD_LIST_LABEL = 'Termíny akcí';

type WorkshopEventCardListProps = {
    readonly listings: readonly EventListing[];
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country these terms are listed for, see `WorkshopEventCard`
     */
    readonly todayDayKey: CalendarDayKey;
    readonly className?: string;
};

/**
 * The listed terms as cards leading to them
 *
 * Note: Both views of the terms end in this one list - the cards show every term with it, and the calendar shows the
 *       terms of the chosen day or month with it - so a term is never described in two different ways.
 */
export function WorkshopEventCardList({
    listings,
    locale,
    timeZone,
    todayDayKey,
    className,
}: WorkshopEventCardListProps) {
    return (
        <ul aria-label={WORKSHOP_EVENT_CARD_LIST_LABEL} className={classNames('grid gap-3 sm:grid-cols-2', className)}>
            {listings.map((listing) => (
                <li key={listing.workshop.id}>
                    <WorkshopEventCard
                        listing={listing}
                        locale={locale}
                        timeZone={timeZone}
                        todayDayKey={todayDayKey}
                    />
                </li>
            ))}
        </ul>
    );
}
