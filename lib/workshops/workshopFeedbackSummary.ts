import type { WorkshopFeedbackSummary } from '@/lib/workshops/workshopTypes';

const MINIMAL_WORKSHOP_FEEDBACK_RATING = 1;
const MAXIMAL_WORKSHOP_FEEDBACK_RATING = 5;

/**
 * Reduces the anonymous ratings of one workshop into the only feedback information a public event card needs.
 *
 * Note: Written answers stay in the private feedback record. A public list can describe the reception of a workshop
 *       without publishing somebody's words or identity.
 */
export function createWorkshopFeedbackSummary(ratings: readonly number[]): WorkshopFeedbackSummary | null {
    const validRatings = ratings.filter(
        (rating) =>
            Number.isFinite(rating) &&
            rating >= MINIMAL_WORKSHOP_FEEDBACK_RATING &&
            rating <= MAXIMAL_WORKSHOP_FEEDBACK_RATING,
    );
    if (validRatings.length === 0) {
        return null;
    }

    const ratingTotal = validRatings.reduce((total, rating) => total + rating, 0);

    return {
        averageRating: ratingTotal / validRatings.length,
        ratingCount: validRatings.length,
    };
}
