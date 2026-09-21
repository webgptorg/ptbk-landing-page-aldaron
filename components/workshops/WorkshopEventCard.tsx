import { Button } from '@/components/ui/button';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { WorkshopProjectPreviewCard } from '@/components/workshops/WorkshopProjectPreviewCard';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import type { EventListing } from '@/lib/events/eventListing';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { formatMediaDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { ArrowUpRight, CalendarDays, CirclePlay, ExternalLink } from 'lucide-react';
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
 * The length somebody can replay, after the start of a recorded stream has been skipped.
 */
function WorkshopEventCardRecordingDuration({
    recordingDurationSeconds,
}: {
    readonly recordingDurationSeconds: number;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-room-accent/10 px-2.5 py-1 text-xs font-medium tabular-nums text-room-accent">
            <CirclePlay className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Záznam {formatMediaDuration(recordingDurationSeconds)}
        </span>
    );
}

/**
 * One listed term as a card leading to it, which says when it is held, what it is, and where it stands in time
 *
 * Note: The list of cards and the day of a calendar show a term with this very same card, so a member reads the same
 *       thing about a term however they came to it.
 */
export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
    const { workshop, event, link, phase } = listing;
    const eventCardDetails = workshop.eventCardDetails;
    const project = eventCardDetails?.project ?? null;
    const recordingDurationSeconds = eventCardDetails?.recordingDurationSeconds ?? null;
    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;

    // Note: A term held by somebody else leads out of this application, so it opens beside the room a member is
    //       reading rather than taking them out of it, and says so with its own icon.
    const isEventHeldExternally = isExternalEventType(event.type);
    const EventLinkIcon = isEventHeldExternally ? ExternalLink : ArrowUpRight;

    return (
        <Button
            asChild
            variant="outline"
            className="group h-full w-full items-start whitespace-normal rounded-xl border-room-border/10 bg-room-overlay/[0.035] p-4 text-left text-room-heading hover:border-room-accent/50 hover:bg-room-accent/10 hover:text-room-heading focus-visible:ring-room-accent"
        >
            <Link href={link} {...(isEventHeldExternally ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 break-words font-semibold leading-6">{workshop.title}</span>
                        <EventLinkIcon className="mt-1 h-4 w-4 shrink-0 text-room-accent" aria-hidden="true" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <WorkshopPhaseBadge phase={phase} tone="room" />
                        {isRecordingDurationShown && (
                            <WorkshopEventCardRecordingDuration recordingDurationSeconds={recordingDurationSeconds} />
                        )}
                    </div>
                    <span className="mt-3 flex items-center gap-1.5 text-xs font-normal text-room-muted">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
                    </span>
                    <span className="mt-1 block break-words text-xs font-normal leading-5 text-room-muted">
                        {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                        {formatEventPrice(event.priceCzk)}
                    </span>
                    {project !== null && (
                        <div className="mt-4"><WorkshopProjectPreviewCard project={project} /></div>
                    )}
                </div>
            </Link>
        </Button>
    );
}
