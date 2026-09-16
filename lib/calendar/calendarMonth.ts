/**
 * One calendar day, written as `2026-09-04`
 *
 * Note: A day is deliberately a plain calendar date rather than a moment. Two terms are on the same day when the
 *       country the calendar is drawn for says they are, which is what places a late evening term on the day its
 *       visitors live in instead of the day the server happens to be in.
 */
export type CalendarDayKey = string;

/**
 * One calendar month, written as `2026-09`
 */
export type CalendarMonthKey = string;

const CALENDAR_DAYS_PER_WEEK = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Day the week starts on, counted the way `Date` counts days from Sunday
 *
 * Note: The Czech Republic starts its week on Monday, as the whole ISO-8601 world does.
 */
const CALENDAR_FIRST_WEEK_DAY_INDEX = 1;

/**
 * A Monday, from which the names of the days of one whole week are read
 */
const CALENDAR_WEEK_DAY_LABEL_REFERENCE = Date.UTC(2024, 0, 1);

const CALENDAR_DAY_KEY_LENGTH = 'YYYY-MM-DD'.length;
const CALENDAR_MONTH_KEY_LENGTH = 'YYYY-MM'.length;

/**
 * The calendar day a moment falls on in one time zone
 *
 * @param isoDateTime moment, as an ISO 8601 string
 * @param timeZone time zone the calendar is drawn for, for example `Europe/Prague`
 */
export function createCalendarDayKey(isoDateTime: string, timeZone: string): CalendarDayKey {
    const dateParts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone,
    }).formatToParts(new Date(isoDateTime));

    const readDatePart = (partType: Intl.DateTimeFormatPartTypes): string =>
        dateParts.find((datePart) => datePart.type === partType)?.value ?? '';

    return `${readDatePart('year')}-${readDatePart('month')}-${readDatePart('day')}`;
}

/**
 * The month one day belongs to
 */
export function getCalendarMonthKey(dayKey: CalendarDayKey): CalendarMonthKey {
    return dayKey.slice(0, CALENDAR_MONTH_KEY_LENGTH);
}

/**
 * The number a day is written with in its month, for example `4`
 */
export function getCalendarDayNumber(dayKey: CalendarDayKey): number {
    return Number(dayKey.slice(CALENDAR_MONTH_KEY_LENGTH + 1, CALENDAR_DAY_KEY_LENGTH));
}

/**
 * The first day of one month, which is the moment every label of that month is formatted from
 *
 * Note: A month is placed in UTC on purpose. Nothing here is a moment in a time zone - it is the grid of a calendar,
 *       which the same days make up wherever it is read.
 */
function createMonthStartDate(monthKey: CalendarMonthKey): Date {
    const year = Number(monthKey.slice(0, 4));
    const monthNumber = Number(monthKey.slice(5, CALENDAR_MONTH_KEY_LENGTH));

    return new Date(Date.UTC(year, monthNumber - 1, 1));
}

function createDayKeyOfDate(date: Date): CalendarDayKey {
    return date.toISOString().slice(0, CALENDAR_DAY_KEY_LENGTH);
}

/**
 * The moment one day of the grid is counted and named from
 *
 * Note: A day is placed in UTC on purpose, for the same reason a month is: it is a day of a calendar rather than a
 *       moment in a time zone, and it has already been dated for the country its calendar is drawn for.
 */
function createDayKeyDate(dayKey: CalendarDayKey): Date {
    return new Date(`${dayKey}T00:00:00Z`);
}

/**
 * The day one many days away from another, for example the day after the one a visitor is reading on
 */
export function shiftCalendarDayKey(dayKey: CalendarDayKey, dayOffset: number): CalendarDayKey {
    return createDayKeyOfDate(new Date(createDayKeyDate(dayKey).getTime() + dayOffset * MILLISECONDS_PER_DAY));
}

/**
 * Which day of the week one day falls on, counted the way `Date` counts days from Sunday
 */
export function getCalendarWeekDayIndex(dayKey: CalendarDayKey): number {
    return createDayKeyDate(dayKey).getUTCDay();
}

/**
 * The first day of the week one day belongs to
 *
 * Note: This is what tells whether two days fall into the same week, so which day a week starts on is answered here
 *       once rather than by everything asking that question.
 */
export function getCalendarWeekStartDayKey(dayKey: CalendarDayKey): CalendarDayKey {
    const weekDayOffset =
        (getCalendarWeekDayIndex(dayKey) - CALENDAR_FIRST_WEEK_DAY_INDEX + CALENDAR_DAYS_PER_WEEK) %
        CALENDAR_DAYS_PER_WEEK;

    return shiftCalendarDayKey(dayKey, -weekDayOffset);
}

/**
 * The month one many months away from another, for example the month a visitor reaches by paging back
 */
export function shiftCalendarMonthKey(monthKey: CalendarMonthKey, monthOffset: number): CalendarMonthKey {
    const monthStartDate = createMonthStartDate(monthKey);
    monthStartDate.setUTCMonth(monthStartDate.getUTCMonth() + monthOffset);

    return getCalendarMonthKey(createDayKeyOfDate(monthStartDate));
}

/**
 * Every day one month is drawn with, grouped into whole weeks
 *
 * Note: The first and the last week are filled up with the neighbouring days, so that every week of the grid is a
 *       whole week and the days of a month always stand under the day of the week they fall on.
 */
export function createCalendarMonthWeeks(monthKey: CalendarMonthKey): readonly (readonly CalendarDayKey[])[] {
    const monthStartDate = createMonthStartDate(monthKey);
    const leadingDayCount =
        (monthStartDate.getUTCDay() - CALENDAR_FIRST_WEEK_DAY_INDEX + CALENDAR_DAYS_PER_WEEK) %
        CALENDAR_DAYS_PER_WEEK;
    const monthDayCount = new Date(
        Date.UTC(monthStartDate.getUTCFullYear(), monthStartDate.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const weekCount = Math.ceil((leadingDayCount + monthDayCount) / CALENDAR_DAYS_PER_WEEK);

    return Array.from({ length: weekCount }, (_, weekIndex) =>
        Array.from({ length: CALENDAR_DAYS_PER_WEEK }, (__, weekDayIndex) =>
            createDayKeyOfDate(
                new Date(
                    Date.UTC(
                        monthStartDate.getUTCFullYear(),
                        monthStartDate.getUTCMonth(),
                        1 - leadingDayCount + weekIndex * CALENDAR_DAYS_PER_WEEK + weekDayIndex,
                    ),
                ),
            ),
        ),
    );
}

/**
 * Whether one day belongs to the month a calendar is currently showing
 */
export function isCalendarDayInMonth(dayKey: CalendarDayKey, monthKey: CalendarMonthKey): boolean {
    return getCalendarMonthKey(dayKey) === monthKey;
}

/**
 * The heading of one month, for example `září 2026`
 */
export function formatCalendarMonthTitle(monthKey: CalendarMonthKey, locale: string): string {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        createMonthStartDate(monthKey),
    );
}

/**
 * The full name of one day, for example `pátek 4. září 2026`, which names a day of the grid where its number alone
 * would not be enough
 */
export function formatCalendarDayTitle(dayKey: CalendarDayKey, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(createDayKeyDate(dayKey));
}

/**
 * The names of the days of the week, in the order the calendar puts its columns in
 */
export function createCalendarWeekDayLabels(locale: string): readonly string[] {
    const weekDayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

    return Array.from({ length: CALENDAR_DAYS_PER_WEEK }, (_, weekDayIndex) =>
        weekDayFormat.format(new Date(CALENDAR_WEEK_DAY_LABEL_REFERENCE + weekDayIndex * MILLISECONDS_PER_DAY)),
    );
}
