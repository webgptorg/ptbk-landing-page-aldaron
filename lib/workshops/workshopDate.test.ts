import { formatCzechWorkshopRelativeDate, formatCzechWorkshopRelativeDay } from '@/lib/workshops/workshopDate';
import { describe, expect, it } from 'vitest';

/**
 * A Tuesday morning in Prague, from which the terms of the week around it are read
 */
const CURRENT_TIME = '2026-09-15T09:00:00+02:00';

describe('Czech workshop date', () => {
    it('names a term which is today, tomorrow, or one of the days of this week', () => {
        expect(formatCzechWorkshopRelativeDate('2026-09-15T11:11:00+02:00', CURRENT_TIME)).toBe(
            'dnes, úterý 15. 9. 2026',
        );
        expect(formatCzechWorkshopRelativeDate('2026-09-16T11:11:00+02:00', CURRENT_TIME)).toBe(
            'zítra, středa 16. 9. 2026',
        );
        expect(formatCzechWorkshopRelativeDate('2026-09-17T11:11:00+02:00', CURRENT_TIME)).toBe(
            'tento čtvrtek 17. 9. 2026',
        );
    });

    it('leaves a term further away than this week dated the way it always was', () => {
        expect(formatCzechWorkshopRelativeDate('2026-10-02T11:11:00+02:00', CURRENT_TIME)).toBe('pátek 2. 10. 2026');
        expect(formatCzechWorkshopRelativeDay('2026-10-02T11:11:00+02:00', CURRENT_TIME)).toBe('2. 10. 2026');
    });

    it('lets a near term take the name of its weekday even where a far one is only dated', () => {
        expect(formatCzechWorkshopRelativeDay('2026-09-15T11:11:00+02:00', CURRENT_TIME)).toBe(
            'dnes, úterý 15. 9. 2026',
        );
        expect(formatCzechWorkshopRelativeDay('2026-09-17T11:11:00+02:00', CURRENT_TIME)).toBe(
            'tento čtvrtek 17. 9. 2026',
        );
    });

    it('reads how near a term is from the day both it and the reader are in in Prague', () => {
        // Note: Late in the evening in Prague it is already the next day in UTC, which is what would move a term held
        //       today into yesterday if the day of either of them were read anywhere but in Prague.
        expect(formatCzechWorkshopRelativeDate('2026-09-15T22:30:00Z', '2026-09-15T21:00:00Z')).toBe(
            'zítra, středa 16. 9. 2026',
        );
        expect(formatCzechWorkshopRelativeDate('2026-09-15T19:00:00Z', '2026-09-15T21:00:00Z')).toBe(
            'dnes, úterý 15. 9. 2026',
        );
    });
});
