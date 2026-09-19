'use client';

import { WorkshopCalendarDay } from '@/components/workshops/WorkshopCalendarDay';
import { WorkshopEventCardList } from '@/components/workshops/WorkshopEventCardList';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import {
    createCalendarMonthWeeks,
    createCalendarWeekDayLabels,
    formatCalendarDayTitle,
    formatCalendarMonthTitle,
    getCalendarMonthKey,
    isCalendarDayInMonth,
    shiftCalendarMonthKey,
    type CalendarDayKey,
    type CalendarMonthKey,
} from '@/lib/calendar/calendarMonth';
import { classNames } from '@/lib/classNames';
import {
    groupEventListingsByDayKey,
    selectInitialCalendarMonthKey,
    type EventListing,
} from '@/lib/events/eventListing';
import { WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

const CALENDAR_MONTH_COPY = {
    previousMonthLabel: 'Předchozí měsíc',
    nextMonthLabel: 'Další měsíc',
    todayLabel: 'Dnes',
    wholeMonthLabel: 'Celý měsíc',
    emptyMonthMessage: 'V tomto měsíci není žádný termín. Prolistujte kalendář na další měsíce.',
} as const;

type WorkshopCalendarMonthProps = {
    /**
     * Every listed term, of which this calendar draws the ones falling into the month it shows
     */
    readonly listings: readonly EventListing[];
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country this calendar is drawn for
     */
    readonly todayDayKey: CalendarDayKey;
};

/**
 * The colours of the calendar explained, so that a coloured day says the same thing as the badge on a card
 */
function WorkshopCalendarLegend() {
    return (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-room-muted">
            {WORKSHOP_PHASE_VALUES.map((phase) => {
                const { label, markClassName } = getWorkshopPhaseAppearance(phase);

                return (
                    <li key={phase} className="flex items-center gap-1.5">
                        <span className={classNames('h-2 w-2 rounded-full', markClassName)} aria-hidden="true" />
                        {label}
                    </li>
                );
            })}
        </ul>
    );
}

/**
 * The listed terms as the month they are held in, where every day says by its colour whether what is held on it is
 * over, running, or still ahead
 *
 * Note: The grid names a term only as shortly as a day of a month can. What one term really is stays the business of
 *       the very card the list of cards is made of, which is what the terms of the chosen day are shown with below.
 */
export function WorkshopCalendarMonth({ listings, locale, timeZone, todayDayKey }: WorkshopCalendarMonthProps) {
    const [shownMonthKey, setShownMonthKey] = useState(() => selectInitialCalendarMonthKey(listings, todayDayKey));
    const [selectedDayKey, setSelectedDayKey] = useState<CalendarDayKey | null>(null);

    const listingsByDayKey = useMemo(() => groupEventListingsByDayKey(listings), [listings]);
    const weeks = useMemo(() => createCalendarMonthWeeks(shownMonthKey), [shownMonthKey]);
    const weekDayLabels = useMemo(() => createCalendarWeekDayLabels(locale), [locale]);
    const shownMonthListings = useMemo(
        () => listings.filter((listing) => isCalendarDayInMonth(listing.dayKey, shownMonthKey)),
        [listings, shownMonthKey],
    );

    // Note: Paging to another month lets go of the chosen day, because a day of the month which was left is not a day
    //       the member is looking at any more.
    const showMonth = (monthKey: CalendarMonthKey) => {
        setShownMonthKey(monthKey);
        setSelectedDayKey(null);
    };

    const selectDay = (dayKey: CalendarDayKey) => {
        setSelectedDayKey((previousDayKey) => (previousDayKey === dayKey ? null : dayKey));
    };

    const shownListings = selectedDayKey === null ? shownMonthListings : (listingsByDayKey.get(selectedDayKey) ?? []);
    const shownListingsTitle =
        selectedDayKey === null
            ? formatCalendarMonthTitle(shownMonthKey, locale)
            : formatCalendarDayTitle(selectedDayKey, locale);

    return (
        <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    aria-label={CALENDAR_MONTH_COPY.previousMonthLabel}
                    onClick={() => showMonth(shiftCalendarMonthKey(shownMonthKey, -1))}
                    className="rounded-lg border border-room-border/10 bg-room-overlay/5 p-2 text-room-text transition hover:border-room-accent/50 hover:text-room-heading"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex min-w-0 flex-col items-center">
                    <span className="truncate text-sm font-bold capitalize text-room-heading">
                        {formatCalendarMonthTitle(shownMonthKey, locale)}
                    </span>
                    <button
                        type="button"
                        onClick={() => showMonth(getCalendarMonthKey(todayDayKey))}
                        className="text-[11px] font-semibold text-room-accent transition hover:text-room-accent"
                    >
                        {CALENDAR_MONTH_COPY.todayLabel}
                    </button>
                </div>
                <button
                    type="button"
                    aria-label={CALENDAR_MONTH_COPY.nextMonthLabel}
                    onClick={() => showMonth(shiftCalendarMonthKey(shownMonthKey, 1))}
                    className="rounded-lg border border-room-border/10 bg-room-overlay/5 p-2 text-room-text transition hover:border-room-accent/50 hover:text-room-heading"
                >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-room-subtle">
                {weekDayLabels.map((weekDayLabel) => (
                    <span key={weekDayLabel}>{weekDayLabel}</span>
                ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
                {weeks.map((week) =>
                    week.map((dayKey) => (
                        <WorkshopCalendarDay
                            key={dayKey}
                            dayKey={dayKey}
                            listings={listingsByDayKey.get(dayKey) ?? []}
                            isInShownMonth={isCalendarDayInMonth(dayKey, shownMonthKey)}
                            isToday={dayKey === todayDayKey}
                            isSelected={dayKey === selectedDayKey}
                            title={formatCalendarDayTitle(dayKey, locale)}
                            onSelect={selectDay}
                        />
                    )),
                )}
            </div>

            <WorkshopCalendarLegend />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold capitalize text-room-heading">{shownListingsTitle}</h3>
                {selectedDayKey !== null && (
                    <button
                        type="button"
                        onClick={() => setSelectedDayKey(null)}
                        className="text-xs font-semibold text-room-accent transition hover:text-room-accent"
                    >
                        {CALENDAR_MONTH_COPY.wholeMonthLabel}
                    </button>
                )}
            </div>

            {shownListings.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-room-border/15 bg-room-overlay/[0.025] px-4 py-4 text-sm text-room-muted">
                    {CALENDAR_MONTH_COPY.emptyMonthMessage}
                </p>
            ) : (
                <WorkshopEventCardList
                    listings={shownListings}
                    locale={locale}
                    timeZone={timeZone}
                    todayDayKey={todayDayKey}
                    className="mt-2"
                />
            )}
        </div>
    );
}
