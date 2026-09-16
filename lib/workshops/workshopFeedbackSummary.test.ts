import { createWorkshopFeedbackSummary } from '@/lib/workshops/workshopFeedbackSummary';
import { describe, expect, it } from 'vitest';

describe('workshop feedback summary', () => {
    it('calculates one anonymous average and count from valid star ratings', () => {
        expect(createWorkshopFeedbackSummary([5, 4, 4])).toEqual({ averageRating: 13 / 3, ratingCount: 3 });
    });

    it('leaves malformed values out instead of putting an invalid public score on a card', () => {
        expect(createWorkshopFeedbackSummary([5, 0, 6, Number.NaN, Number.POSITIVE_INFINITY])).toEqual({
            averageRating: 5,
            ratingCount: 1,
        });
        expect(createWorkshopFeedbackSummary([0, 6, Number.NaN])).toBeNull();
    });
});
