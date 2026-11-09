import { MAXIMAL_DISCOUNT_CODE_LENGTH, MAXIMAL_DISCOUNT_PERCENT } from '@/lib/discounts/discountCodeConstants';
import { isPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';

/**
 * How long a discount survives after it has opened a subscription. `null` deliberately means the
 * discount is permanent, which preserves the behaviour of discount codes created before this
 * setting existed.
 */
export type SubscriptionDiscountDuration = {
    readonly subscriptionDiscountDurationMonths: number | null;
};

/**
 * What a visitor may see about a code which is active in the place they are viewing.
 */
export type ActiveDiscount = SubscriptionDiscountDuration & {
    /** The exact code or wildcard rule which granted this discount. */
    readonly code: string;
    readonly percent: number;
    readonly remainingUseCount: number | null;
};

export type ActiveDiscountByPlaceId = Readonly<Record<string, ActiveDiscount | null>>;

export type DiscountCodeValues = SubscriptionDiscountDuration & {
    /** An exact code, or a glob rule in which each `*` matches zero or more code characters. */
    readonly code: string;
    readonly percent: number;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly isEnabled: boolean;

    /** Empty includes all places that do not require explicit selection. */
    readonly placeIds: readonly string[];

    /** Shows an exact code as an offer on the selected Promptbook checkout pages. */
    readonly isPromoted?: boolean;

    /** Null means unlimited use. */
    readonly maximumUseCount: number | null;
};

export type DiscountCode = DiscountCodeValues & {
    readonly id: string;
    readonly useCount: number;
    readonly createdAt: string;
    readonly updatedAt: string;
};

const NORMALIZED_DISCOUNT_CODE_PATTERN = /^[A-Z0-9*]+(?:_[A-Z0-9*]+)*$/;

export function normalizeDiscountCode(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9*]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
}

/**
 * Validates the normalized representation stored in the database. Keeping this rule next to
 * normalization makes the admin input and public lookup agree.
 */
export function isDiscountCodeNormalized(value: string): boolean {
    return value.length <= MAXIMAL_DISCOUNT_CODE_LENGTH && NORMALIZED_DISCOUNT_CODE_PATTERN.test(value);
}

export function isDiscountCodeActive(
    discountCode: Pick<DiscountCodeValues, 'startsAt' | 'endsAt' | 'isEnabled'>,
    currentDate: Date,
): boolean {
    if (!discountCode.isEnabled) {
        return false;
    }

    const startsAtMilliseconds = Date.parse(discountCode.startsAt);
    const endsAtMilliseconds = Date.parse(discountCode.endsAt);
    const currentMilliseconds = currentDate.getTime();

    return currentMilliseconds >= startsAtMilliseconds && currentMilliseconds <= endsAtMilliseconds;
}

export function isDiscountCodeValidForAllPlaces(discountCode: Pick<DiscountCodeValues, 'placeIds'>): boolean {
    return discountCode.placeIds.length === 0;
}

export function isDiscountCodeValidInPlace(
    discountCode: Pick<DiscountCodeValues, 'placeIds'>,
    discountPlaceId: string,
): boolean {
    return (
        discountCode.placeIds.includes(discountPlaceId) ||
        (isDiscountCodeValidForAllPlaces(discountCode) && !isPromptbookDiscountPlaceId(discountPlaceId))
    );
}

export function getRemainingDiscountCodeUseCount(
    discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>,
): number | null {
    return discountCode.maximumUseCount === null
        ? null
        : Math.max(discountCode.maximumUseCount - discountCode.useCount, 0);
}

export function isDiscountCodeExhausted(discountCode: Pick<DiscountCode, 'maximumUseCount' | 'useCount'>): boolean {
    return getRemainingDiscountCodeUseCount(discountCode) === 0;
}

export function isSubscriptionDiscountPermanent(discount: SubscriptionDiscountDuration): boolean {
    return discount.subscriptionDiscountDurationMonths === null;
}

/**
 * Whether a discount takes the whole price for as long as the subscription lasts, which is what turns a code into a
 * voucher rather than a discount: such a subscription is never charged for anything, so no card is needed for it.
 *
 * Note: A code which takes the whole price for a limited number of months is deliberately not one of these. Its price
 *       returns to normal once those months are over, which is exactly when the card would be charged.
 * Note: No discount at all covers nothing, so the absence of one is answered rather than refused. Every offer holds
 *       either a discount or none, and each of them asks this same question.
 */
export function isSubscriptionDiscountFullAndPermanent(
    discount: (SubscriptionDiscountDuration & Pick<ActiveDiscount, 'percent'>) | null,
): boolean {
    return (
        discount !== null &&
        discount.percent >= MAXIMAL_DISCOUNT_PERCENT &&
        isSubscriptionDiscountPermanent(discount)
    );
}

/**
 * Uses the Czech forms of "month" so the same duration reads naturally in the administrator and
 * in a member's price summary.
 */
export function formatSubscriptionDiscountDurationMonthCount(monthCount: number): string {
    const finalTwoDigits = monthCount % 100;
    const finalDigit = monthCount % 10;
    const isSingular = finalDigit === 1 && finalTwoDigits !== 11;
    const isFew = finalDigit >= 2 && finalDigit <= 4 && (finalTwoDigits < 12 || finalTwoDigits > 14);
    const monthLabel = isSingular ? 'měsíc' : isFew ? 'měsíce' : 'měsíců';

    return `${monthCount} ${monthLabel}`;
}

/**
 * The one shared answer used by previews and registration-time consumption.
 */
export function isDiscountCodeUsableInPlace(
    discountCode: DiscountCode,
    discountPlaceId: string,
    currentDate: Date,
): boolean {
    return (
        isDiscountCodeActive(discountCode, currentDate) &&
        isDiscountCodeValidInPlace(discountCode, discountPlaceId) &&
        !isDiscountCodeExhausted(discountCode)
    );
}

export function createActiveDiscount(discountCode: DiscountCode): ActiveDiscount {
    return {
        code: discountCode.code,
        percent: discountCode.percent,
        remainingUseCount: getRemainingDiscountCodeUseCount(discountCode),
        subscriptionDiscountDurationMonths: discountCode.subscriptionDiscountDurationMonths,
    };
}
