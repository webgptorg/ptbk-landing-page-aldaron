import {
    AI_SUPERVIZE_MINI_PATH,
    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    COMMUNITY_MEMBERSHIP_PATH,
    DISCOUNT_PLACES,
    PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID,
    PROMPTBOOK_START_DISCOUNT_PLACE_ID,
    createDiscountCodePrefillPath,
    createDiscountCodeUrl,
    getDiscountCodePlaces,
} from './discountPlaces';
import { describe, expect, it } from 'vitest';

describe('discount-place links', () => {
    it('builds the shared prefill-and-registration URL pattern', () => {
        expect(createDiscountCodeUrl(DISCOUNT_PLACES[0]!, 'WEBINAR 2026')).toBe(
            `${AI_SUPERVIZE_MINI_PATH}?code=WEBINAR%202026#registrace`,
        );
        expect(createDiscountCodePrefillPath('/paid-offer', 'registration', 'SAVE/10')).toBe(
            '/paid-offer?code=SAVE%2F10#registration',
        );
    });

    it('expands all places without opting into either Promptbook plan', () => {
        expect(getDiscountCodePlaces([]).map(({ id }) => id)).toEqual([
            'ai-supervize-mini-onsite',
            'ai-supervize-mini-online',
            COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
        ]);
        expect(getDiscountCodePlaces(['ai-supervize-mini-online', 'unknown-place'])).toEqual([DISCOUNT_PLACES[1]]);
    });

    it('prefills a code on the selected Promptbook plan', () => {
        const [start, business] = getDiscountCodePlaces([
            PROMPTBOOK_START_DISCOUNT_PLACE_ID,
            PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID,
        ]);
        expect(createDiscountCodeUrl(start!, 'UVOD')).toBe('/cs/pricing/objednat/start?code=UVOD#registrace');
        expect(createDiscountCodeUrl(business!, 'UVOD')).toBe('/cs/pricing/objednat/business?code=UVOD#registrace');
    });

    it('offers a registration-prefilled link for community membership', () => {
        const communityMembershipPlace = DISCOUNT_PLACES.find(
            (place) => place.id === COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
        );

        expect(communityMembershipPlace).toBeDefined();
        expect(createDiscountCodeUrl(communityMembershipPlace!, 'COMMUNITY 10')).toBe(
            `${COMMUNITY_MEMBERSHIP_PATH}?code=COMMUNITY%2010#registrace`,
        );
    });
});
