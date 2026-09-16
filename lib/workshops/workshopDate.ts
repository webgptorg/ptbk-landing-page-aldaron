import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import { DEFAULT_WORKSHOP_DURATION_MINUTES } from '@/lib/workshops/workshopConstants';
import { getWorkshopExpectedEndsAtMilliseconds } from '@/lib/workshops/workshopPhase';

const CZECH_LOCALE = 'cs-CZ';
const PRAGUE_TIME_ZONE = 'Europe/Prague';
const MILLISECONDS_PER_MINUTE = 60 * 1000;

const CZECH_WORKSHOP_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

const CZECH_WORKSHOP_TIME_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Formats an occurrence date in the timezone in which Czech workshops take place, independently of the server's
 * timezone.
 */
export function formatCzechWorkshopDate(startsAt: string): string {
    return CZECH_WORKSHOP_DATE_FORMAT.format(new Date(startsAt));
}

/**
 * The exact moment one occurrence begins at, for example `čtvrtek 20. 8. 2026 19:00`
 *
 * Note: This is how a term is named where it has to be told apart from another term held on the very same day, which
 *       is what identifies a term a registration was written for before the terms had addresses of their own.
 */
export function formatCzechWorkshopMoment(startsAt: string): string {
    return `${formatCzechWorkshopDate(startsAt)} ${formatCzechWorkshopTime(startsAt)}`;
}

const CZECH_WORKSHOP_SHORT_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    dateStyle: 'short',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Names an occurrence date as shortly as a label beside a title can, in the same Prague time as its full date.
 */
export function formatCzechWorkshopShortDate(startsAt: string): string {
    return CZECH_WORKSHOP_SHORT_DATE_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on, for example `4. 9. 2026`
 *
 * Note: This is how a term a visitor has to put in their calendar is named, so it says its year in full rather than
 *       shortening it the way a compact label beside a title does.
 */
export function formatCzechWorkshopDay(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on without its year, for example `4. 9.`
 *
 * Note: This is how a term is named where several terms are listed beside each other and the year they share would
 *       only be repeated.
 */
export function formatCzechWorkshopDayAndMonth(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT.format(new Date(startsAt));
}

const PRAGUE_CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The calendar day one occurrence falls on in Prague, written as `2026-09-04`
 *
 * Note: This is the machine-readable day of a term rather than a label for a visitor, which is what identifies a term
 *       by the day it is held on.
 */
export function formatPragueCalendarDate(startsAt: string): CalendarDayKey {
    return PRAGUE_CALENDAR_DATE_FORMAT.format(new Date(startsAt));
}

/**
 * How near one occurrence is to the day a visitor is reading about it on, as the words standing in front of its date
 */
function formatCzechWorkshopDayPrefix(startsAt: string, currentTime: string): string {
    return formatCzechRelativeDayPrefix(formatPragueCalendarDate(startsAt), formatPragueCalendarDate(currentTime));
}

/**
 * When one occurrence is held, said from the day a visitor reads it on, for example `dnes, úterý 15. 9. 2026`,
 * `zítra, středa 16. 9. 2026`, `tento čtvrtek 17. 9. 2026`, or `pátek 2. 10. 2026` once it is further away than that
 *
 * Note: This is how a term near enough to be looked forward to is named, so a participant reads that a workshop is
 *       today rather than working that out from its date.
 */
export function formatCzechWorkshopRelativeDate(startsAt: string, currentTime: string): string {
    return `${formatCzechWorkshopDayPrefix(startsAt, currentTime)}${formatCzechWorkshopDate(startsAt)}`;
}

/**
 * The day one occurrence falls on, said from the day a visitor reads it on, for example `dnes, úterý 15. 9. 2026`,
 * `tento čtvrtek 17. 9. 2026`, or `2. 10. 2026` once it is further away than this week
 *
 * Note: A near day is named rather than merely dated, which is why it takes the name of its weekday with it. A day
 *       nothing can be said about beyond its date stays the plain date it already was, so a list of far-away terms
 *       does not grow a weekday it never showed.
 */
export function formatCzechWorkshopRelativeDay(startsAt: string, currentTime: string): string {
    const dayPrefix = formatCzechWorkshopDayPrefix(startsAt, currentTime);

    return dayPrefix === '' ? formatCzechWorkshopDay(startsAt) : `${dayPrefix}${formatCzechWorkshopDate(startsAt)}`;
}

/**
 * The time span one occurrence runs for in Prague time, for example `10:00–16:00`
 */
export function formatCzechWorkshopTimeRange(startsAt: string, endsAt: string | null): string {
    const startTime = formatCzechWorkshopTime(startsAt);
    return endsAt === null ? startTime : `${startTime}–${formatCzechWorkshopTime(endsAt)}`;
}

/**
 * Formats the start time of a Czech workshop in Prague time.
 */
export function formatCzechWorkshopTime(startsAt: string): string {
    return CZECH_WORKSHOP_TIME_FORMAT.format(new Date(startsAt));
}

/**
 * Describes how long a workshop is expected to take. A workshop whose end is still left open is announced with the
 * same usual length as its calendar invitation, because a visitor is told how long to set aside before anybody can
 * know when the workshop will really be ended.
 */
export function formatCzechWorkshopDuration(startsAt: string, endsAt: string | null): string {
    const startsAtMilliseconds = Date.parse(startsAt);
    const durationMinutes = Number.isFinite(startsAtMilliseconds)
        ? Math.round(
              (getWorkshopExpectedEndsAtMilliseconds({ startsAt, endsAt }) - startsAtMilliseconds) /
                  MILLISECONDS_PER_MINUTE,
          )
        : DEFAULT_WORKSHOP_DURATION_MINUTES;

    return `${durationMinutes} minut`;
}
