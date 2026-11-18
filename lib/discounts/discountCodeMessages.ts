import type { ActiveDiscount } from '@/lib/discounts/discountCode';

export const OPTIONAL_DISCOUNT_CODE_MESSAGE = 'Volitelné.';
export const PENDING_DISCOUNT_CODE_MESSAGE = 'Ověřuji slevový kód…';
export const UNCHECKED_DISCOUNT_CODE_MESSAGE = 'Slevový kód se nepodařilo ověřit. Při odeslání jej ověříme znovu.';
export const INACTIVE_DISCOUNT_CODE_MESSAGE = 'Tento kód zde není aktivní.';
export const EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE =
    'Slevový kód byl mezitím vyčerpán. Zkontrolujte prosím cenu a odešlete registraci znovu.';

type DiscountCodeMessageState = {
    readonly discountCode: string;
    readonly activeDiscount: ActiveDiscount | null;
    readonly isValidationPending: boolean;
    readonly validationError: string | null;
    readonly language?: 'cs' | 'en';
};

export function getDiscountCodeMessage({
    discountCode,
    activeDiscount,
    isValidationPending,
    validationError,
    language = 'cs',
}: DiscountCodeMessageState): string {
    if (language === 'en') {
        if (!discountCode.trim()) return 'Optional.';
        if (isValidationPending) return 'Checking discount code…';
        if (validationError !== null) return 'The code could not be checked. Please try again.';
        if (activeDiscount === null) return 'This code is not active for this purchase.';
        const message = `Active discount: ${activeDiscount.percent}%.`;
        return activeDiscount.remainingUseCount === null
            ? message : `${message} Remaining uses: ${activeDiscount.remainingUseCount}.`;
    }
    if (!discountCode.trim()) {
        return OPTIONAL_DISCOUNT_CODE_MESSAGE;
    }

    if (isValidationPending) {
        return PENDING_DISCOUNT_CODE_MESSAGE;
    }

    if (validationError !== null) {
        return UNCHECKED_DISCOUNT_CODE_MESSAGE;
    }

    if (activeDiscount === null) {
        return INACTIVE_DISCOUNT_CODE_MESSAGE;
    }

    const activeDiscountMessage = `Aktivní sleva ${activeDiscount.percent} %.`;

    return activeDiscount.remainingUseCount === null
        ? activeDiscountMessage
        : `${activeDiscountMessage} Zbývající počet použití: ${activeDiscount.remainingUseCount}.`;
}
