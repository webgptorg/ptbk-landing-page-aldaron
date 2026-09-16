import { joinDurationParts, splitDurationIntoParts } from '@/lib/durationParts';
import { describe, expect, it } from 'vitest';

describe('duration parts', () => {
    it('reads a length of time as the clock somebody writes it on', () => {
        expect(splitDurationIntoParts(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
        expect(splitDurationIntoParts(75)).toEqual({ hours: 0, minutes: 1, seconds: 15 });
        expect(splitDurationIntoParts(3_600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
        expect(splitDurationIntoParts(5_425)).toEqual({ hours: 1, minutes: 30, seconds: 25 });
    });

    it('reads anything which is no whole length of time as none at all', () => {
        expect(splitDurationIntoParts(-1)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
        expect(splitDurationIntoParts(7.5)).toEqual({ hours: 0, minutes: 0, seconds: 7 });
        expect(splitDurationIntoParts(Number.NaN)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    it('says back the very same seconds it was given', () => {
        [0, 1, 59, 60, 75, 3_600, 5_425, 2_147_483_647].forEach((durationInSeconds) =>
            expect(joinDurationParts(splitDurationIntoParts(durationInSeconds))).toBe(durationInSeconds),
        );
    });
});
