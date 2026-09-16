import { formatCzechRelativeDayPrefix, getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
import { describe, expect, it } from 'vitest';

/**
 * A Tuesday, from which the whole week around it is read
 */
const TUESDAY_DAY_KEY = '2026-09-15';

describe('Czech relative day', () => {
    it('tells today and tomorrow apart from the rest of the week they are in', () => {
        expect(getRelativeCalendarDay('2026-09-15', TUESDAY_DAY_KEY)).toBe('today');
        expect(getRelativeCalendarDay('2026-09-16', TUESDAY_DAY_KEY)).toBe('tomorrow');
        expect(getRelativeCalendarDay('2026-09-17', TUESDAY_DAY_KEY)).toBe('this-week');
        expect(getRelativeCalendarDay('2026-09-14', TUESDAY_DAY_KEY)).toBe('this-week');
    });

    it('counts a week from Monday to Sunday, as the Czech Republic does', () => {
        expect(getRelativeCalendarDay('2026-09-20', TUESDAY_DAY_KEY)).toBe('this-week');
        expect(getRelativeCalendarDay('2026-09-21', TUESDAY_DAY_KEY)).toBe('other');
        expect(getRelativeCalendarDay('2026-09-13', TUESDAY_DAY_KEY)).toBe('other');
    });

    it('names tomorrow as tomorrow even where it falls into the following week', () => {
        expect(getRelativeCalendarDay('2026-09-21', '2026-09-20')).toBe('tomorrow');
    });

    it('holds a week together over the turn of a year', () => {
        expect(getRelativeCalendarDay('2027-01-02', '2026-12-31')).toBe('this-week');
        expect(getRelativeCalendarDay('2027-01-04', '2026-12-31')).toBe('other');
    });

    it('says today and tomorrow by their name, in front of the date they stand for', () => {
        expect(formatCzechRelativeDayPrefix('2026-09-15', TUESDAY_DAY_KEY)).toBe('dnes, ');
        expect(formatCzechRelativeDayPrefix('2026-09-16', TUESDAY_DAY_KEY)).toBe('zítra, ');
    });

    it('says a day of this week in the gender the name of that day has', () => {
        expect(formatCzechRelativeDayPrefix('2026-09-14', TUESDAY_DAY_KEY)).toBe('toto ');
        expect(formatCzechRelativeDayPrefix('2026-09-17', TUESDAY_DAY_KEY)).toBe('tento ');
        expect(formatCzechRelativeDayPrefix('2026-09-18', TUESDAY_DAY_KEY)).toBe('tento ');
        expect(formatCzechRelativeDayPrefix('2026-09-19', TUESDAY_DAY_KEY)).toBe('tato ');
        expect(formatCzechRelativeDayPrefix('2026-09-20', TUESDAY_DAY_KEY)).toBe('tato ');
    });

    it('leaves a day further away than this week to be named by its date alone', () => {
        expect(formatCzechRelativeDayPrefix('2026-09-21', TUESDAY_DAY_KEY)).toBe('');
        expect(formatCzechRelativeDayPrefix('2026-10-15', TUESDAY_DAY_KEY)).toBe('');
        expect(formatCzechRelativeDayPrefix('2026-09-08', TUESDAY_DAY_KEY)).toBe('');
    });
});
