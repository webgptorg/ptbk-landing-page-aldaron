import {
    getCalendarWeekDayIndex,
    getCalendarWeekStartDayKey,
    shiftCalendarDayKey,
    type CalendarDayKey,
} from '@/lib/calendar/calendarMonth';

/**
 * How near one day is to the day it is read on
 *
 * Note: A day of the current week is one of them whether it has already been or is still to come, because `tato středa`
 *       names the Wednesday of this week just as truthfully on Friday as on Monday. Only `today` and `tomorrow` are
 *       nearer than that, and they are named before it.
 */
export const RELATIVE_CALENDAR_DAYS = ['today', 'tomorrow', 'this-week', 'other'] as const;

export type RelativeCalendarDay = (typeof RELATIVE_CALENDAR_DAYS)[number];

/**
 * How near one day is to the day a visitor is reading it on
 *
 * @param dayKey the day being named
 * @param todayDayKey the day it is today, in the very same country the named day was dated for
 */
export function getRelativeCalendarDay(dayKey: CalendarDayKey, todayDayKey: CalendarDayKey): RelativeCalendarDay {
    if (dayKey === todayDayKey) {
        return 'today';
    }

    if (dayKey === shiftCalendarDayKey(todayDayKey, 1)) {
        return 'tomorrow';
    }

    if (getCalendarWeekStartDayKey(dayKey) === getCalendarWeekStartDayKey(todayDayKey)) {
        return 'this-week';
    }

    return 'other';
}

const CZECH_TODAY_PREFIX = 'dnes, ';
const CZECH_TOMORROW_PREFIX = 'zítra, ';

/**
 * `tento` in the gender the name of each day of the week has in Czech, in the order `Date` counts the days from Sunday
 *
 * Note: `neděle`, `středa` and `sobota` are feminine, `pondělí` and `úterý` are neuter, and `čtvrtek` and `pátek` are
 *       masculine, so the one word standing in front of them is not one word at all.
 */
const CZECH_WEEK_DAY_DEMONSTRATIVES = ['tato', 'toto', 'toto', 'tato', 'tento', 'tento', 'tato'] as const;

/**
 * The words which say how near one day is, written in front of the date of that day, for example `dnes, ` or `tento `
 *
 * A day further away than this week is named by its date alone, which is what the empty prefix leaves it as.
 *
 * Note: The date which follows this prefix has to name the day of the week it falls on, because a day of this week is
 *       said by that very name — `tento ` and `čtvrtek 17. 9. 2026` are one sentence rather than two.
 *
 * @param dayKey the day being named
 * @param todayDayKey the day it is today, in the very same country the named day was dated for
 */
export function formatCzechRelativeDayPrefix(dayKey: CalendarDayKey, todayDayKey: CalendarDayKey): string {
    switch (getRelativeCalendarDay(dayKey, todayDayKey)) {
        case 'today':
            return CZECH_TODAY_PREFIX;
        case 'tomorrow':
            return CZECH_TOMORROW_PREFIX;
        case 'this-week':
            return `${CZECH_WEEK_DAY_DEMONSTRATIVES[getCalendarWeekDayIndex(dayKey)]} `;
        default:
            return '';
    }
}
