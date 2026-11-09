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
export const PROMPTBOOK_START_DISCOUNT_PLACE_ID = 'promptbook-start';
export const PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID = 'promptbook-business';
export const PROMPTBOOK_DISCOUNT_PLACE_IDS = [
    PROMPTBOOK_START_DISCOUNT_PLACE_ID,
    PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID,
] as const;

type PromptbookDiscountPlaceId = (typeof PROMPTBOOK_DISCOUNT_PLACE_IDS)[number];

export function getPromptbookDiscountPlaceId(planId: 'start' | 'business'): PromptbookDiscountPlaceId {
    return planId === 'start' ? PROMPTBOOK_START_DISCOUNT_PLACE_ID : PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID;
}

export function isPromptbookDiscountPlaceId(discountPlaceId: string): discountPlaceId is PromptbookDiscountPlaceId {
    return PROMPTBOOK_DISCOUNT_PLACE_IDS.some((placeId) => placeId === discountPlaceId);
}

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
    {
        id: PROMPTBOOK_START_DISCOUNT_PLACE_ID,
        label: 'Promptbook Start',
        description: 'Měsíční předplatné Start',
        pagePath: '/cs/pricing/objednat/start',
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
    {
        id: PROMPTBOOK_BUSINESS_DISCOUNT_PLACE_ID,
        label: 'Promptbook Business',
        description: 'Měsíční předplatné Business',
        pagePath: '/cs/pricing/objednat/business',
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
 * Promptbook plans require explicit opt-in. Other places retain the existing all-places scope.
 */
export function getDiscountCodePlaces(placeIds: readonly string[]): readonly DiscountPlace[] {
    return placeIds.length === 0
        ? DISCOUNT_PLACES.filter(({ id }) => !isPromptbookDiscountPlaceId(id))
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
