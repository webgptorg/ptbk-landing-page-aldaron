import { Button } from '@/components/ui/button';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import type { EventListing } from '@/lib/events/eventListing';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { ArrowUpRight, CalendarDays, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type WorkshopEventCardProps = {
    readonly listing: EventListing;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country this card is drawn for, which makes its term today, tomorrow, or one of the
     * days of this week
     */
    readonly todayDayKey: CalendarDayKey;
};

/**
 * When one term is held, as a member reads it, for example `dnes, pátek 4. 9. 2026 · 19:00`
 *
 * Note: The term has already been dated for the country this list is drawn for, so how near its day is is read from
 *       that day rather than dated a second time.
 */
function formatEventListingDateTime(
    listing: EventListing,
    todayDayKey: CalendarDayKey,
    locale: string,
    timeZone: string,
): string {
    const startsAtDate = new Date(listing.workshop.startsAt);
    const dateLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
    }).format(startsAtDate);
    const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(
        startsAtDate,
    );

    return `${formatCzechRelativeDayPrefix(listing.dayKey, todayDayKey)}${dateLabel} · ${timeLabel}`;
}

/**
 * One listed term as a card leading to it, which says when it is held, what it is, and where it stands in time
 *
 * Note: The list of cards and the day of a calendar show a term with this very same card, so a member reads the same
 *       thing about a term however they came to it.
 */
export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
    const { workshop, event, link, phase } = listing;

    // Note: A term held by somebody else leads out of this application, so it opens beside the room a member is
    //       reading rather than taking them out of it, and says so with its own icon.
    const isEventHeldExternally = isExternalEventType(event.type);
    const EventLinkIcon = isEventHeldExternally ? ExternalLink : ArrowUpRight;

    return (
        <Button
            asChild
            variant="outline"
            className="h-auto w-full justify-between whitespace-normal border-white/10 bg-white/[0.035] p-4 text-left text-slate-100 hover:border-cyan-200/50 hover:bg-cyan-300/10 hover:text-white"
        >
            <Link href={link} {...(isEventHeldExternally ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="break-words font-semibold">{workshop.title}</span>
                        <WorkshopPhaseBadge phase={phase} tone="dark" />
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
                    </span>
                    <span className="mt-1 block break-words text-xs font-normal text-slate-500">
                        {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                        {formatEventPrice(event.priceCzk)}
                    </span>
                </span>
                <EventLinkIcon className="ml-3 h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
            </Link>
        </Button>
    );
}
