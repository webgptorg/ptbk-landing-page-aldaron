'use client';

import { SubscribeToCalendarLinks } from '@/components/calendar/SubscribeToCalendarLinks';
import { WorkshopCalendarMonth } from '@/components/workshops/WorkshopCalendarMonth';
import { WorkshopEventCardList } from '@/components/workshops/WorkshopEventCardList';
import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
import { createEventListings } from '@/lib/events/eventListing';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, LayoutGrid } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * The two ways of reading the very same terms
 *
 * Note: The calendar leads, because a member asks when something is happening far more often than they ask what is
 *       listed at all.
 */
const WORKSHOP_LINKS_VIEWS = [
    { id: 'calendar', label: 'Kalendář', icon: CalendarDays },
    { id: 'cards', label: 'Karty', icon: LayoutGrid },
] as const;

type WorkshopLinksView = (typeof WORKSHOP_LINKS_VIEWS)[number]['id'];

const DEFAULT_WORKSHOP_LINKS_VIEW: WorkshopLinksView = 'calendar';

const WORKSHOP_LINKS_PANEL_COPY = {
    viewSwitchLabel: 'Zobrazení termínů',
} as const;

type WorkshopLinksPanelProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * Moment the server is at, which decides which terms are over, running, and still ahead
     *
     * Note: The room refreshes its state while it is open, so this moment moves on its own and a term which starts
     *       while a member is reading the list becomes a running one there.
     */
    readonly serverTime: string;

    /**
     * Absolute url of the published calendar of these terms, or `undefined` for a room which publishes none
     */
    readonly calendarFeedUrl?: string;
};

/**
 * A list of the terms of every kind of event, which preserves the already verified identity of the participant in each
 * link. It is independent of the page which shows it, so another persistent room can offer the same hand-off, and a
 * kind of event added later is listed here without a change of this list.
 *
 * Note: The same terms are offered as a month of a calendar and as a list of cards. Both of them are made of the same
 *       listed terms and say where a term stands in time with the same colours, so the two views can never disagree.
 */
export function WorkshopLinksPanel({
    workshops,
    participantIdentity,
    title,
    description,
    emptyMessage,
    locale,
    timeZone,
    serverTime,
    calendarFeedUrl,
}: WorkshopLinksPanelProps) {
    const [shownView, setShownView] = useState<WorkshopLinksView>(DEFAULT_WORKSHOP_LINKS_VIEW);

    const currentTimeMilliseconds = Date.parse(serverTime);
    const listings = useMemo(
        () => createEventListings({ workshops, participantIdentity, currentTimeMilliseconds, timeZone }),
        [workshops, participantIdentity, currentTimeMilliseconds, timeZone],
    );
    const todayDayKey = createCalendarDayKey(serverTime, timeZone);

    return (
        <section className="mt-4 rounded-2xl border border-room-border/10 bg-room-overlay/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="text-lg font-bold text-room-heading">{title}</h2>
                    <p className="text-sm leading-6 text-room-muted">{description}</p>
                </div>
                {listings.length > 0 && (
                    <div
                        role="group"
                        aria-label={WORKSHOP_LINKS_PANEL_COPY.viewSwitchLabel}
                        className="flex shrink-0 rounded-lg bg-room-overlay/5 p-1 text-xs"
                    >
                        {WORKSHOP_LINKS_VIEWS.map(({ id, label, icon: ViewIcon }) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={shownView === id}
                                onClick={() => setShownView(id)}
                                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 font-semibold transition ${shownView === id ? 'bg-room-overlay/10 text-room-heading' : 'text-room-subtle hover:text-room-text'}`}
                            >
                                <ViewIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {calendarFeedUrl !== undefined && listings.length > 0 && (
                <SubscribeToCalendarLinks calendarFeedUrl={calendarFeedUrl} className="mt-3" />
            )}

            {listings.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-room-border/15 bg-room-overlay/[0.025] px-4 py-5 text-sm text-room-muted">
                    {emptyMessage}
                </p>
            ) : shownView === 'calendar' ? (
                <WorkshopCalendarMonth
                    listings={listings}
                    locale={locale}
                    timeZone={timeZone}
                    todayDayKey={todayDayKey}
                />
            ) : (
                <WorkshopEventCardList
                    listings={listings}
                    locale={locale}
                    timeZone={timeZone}
                    todayDayKey={todayDayKey}
                    className="mt-5"
                />
            )}
        </section>
    );
}
