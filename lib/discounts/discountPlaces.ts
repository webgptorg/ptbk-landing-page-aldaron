import { COMMUNITY_PATH } from '@/businesses/community/config';
import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';

/**
 * One place is one paid offer of the application. The administration, registration forms and
 * generated links all use this same registry, so adding a paid offer means adding one place here
 * and assigning its id to that offer.
 */
export type DiscountPlace = {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly pagePath: string;
    readonly registrationSectionId: string;
};

export const AI_SUPERVIZE_MINI_PATH = '/ai-supervize-mini';
export const COMMUNITY_MEMBERSHIP_PATH = `${COMMUNITY_PATH}/clenstvi`;

export const AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-onsite';
export const AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-online';
export const COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID = 'community-membership';

export const DISCOUNT_PLACES: readonly DiscountPlace[] = [
    {
        id: AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
        label: 'AI Supervize Mini – prezenčně',
        description: 'Celodenní workshop v Praze',
        pagePath: AI_SUPERVIZE_MINI_PATH,
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
    {
        id: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
        label: 'AI Supervize Mini – online',
        description: 'Odpolední online varianta workshopu',
        pagePath: AI_SUPERVIZE_MINI_PATH,
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
    {
        id: COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
        label: 'Vývojáři – placené členství',
        description: 'Záznamy, materiály a další obsah komunity Vývojáři',
        pagePath: COMMUNITY_MEMBERSHIP_PATH,
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
];

export function getDiscountPlaceById(discountPlaceId: string): DiscountPlace | null {
    return DISCOUNT_PLACES.find((discountPlace) => discountPlace.id === discountPlaceId) ?? null;
}

/**
 * A previously stored place remains readable in administration even if the offer is later removed
 * from the application.
 */
export function getDiscountPlaceLabel(discountPlaceId: string): string {
    return getDiscountPlaceById(discountPlaceId)?.label ?? discountPlaceId;
}

export function isKnownDiscountPlaceId(discountPlaceId: string): boolean {
    return getDiscountPlaceById(discountPlaceId) !== null;
}

/**
 * An empty place list means every place, including places added later.
 */
export function getDiscountCodePlaces(placeIds: readonly string[]): readonly DiscountPlace[] {
    return placeIds.length === 0
        ? DISCOUNT_PLACES
        : placeIds
              .map(getDiscountPlaceById)
              .filter((discountPlace): discountPlace is DiscountPlace => discountPlace !== null);
}

/**
 * Builds the common `?code=...` link which pre-fills a registration and points at its form.
 */
export function createDiscountCodePrefillPath(
    pagePath: string,
    registrationSectionId: string,
    discountCode: string,
): string {
    return `${pagePath}?${DISCOUNT_CODE_QUERY_PARAMETER}=${encodeURIComponent(discountCode)}#${registrationSectionId}`;
}

export function createDiscountCodeUrl(discountPlace: DiscountPlace, discountCode: string): string {
    return createDiscountCodePrefillPath(discountPlace.pagePath, discountPlace.registrationSectionId, discountCode);
}
