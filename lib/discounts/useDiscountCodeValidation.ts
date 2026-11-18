'use client';
import { calculateDiscountedAmount } from './discountPricing';

import { normalizeDiscountCode, type ActiveDiscount, type ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { validateDiscountCode } from '@/lib/discounts/discountCodeApi';
import { useEffect, useState } from 'react';

const DISCOUNT_CODE_VALIDATION_DELAY_MILLISECONDS = 300;
const DISCOUNT_CODE_NOT_VALIDATED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit.';

type DiscountCodeValidationOptions = {
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly discountPlaceId: string;
    readonly baseAmount?: number;
};

export type DiscountCodeValidation = {
    readonly discountCode: string;
    readonly setDiscountCode: (discountCode: string) => void;
    readonly activeDiscount: ActiveDiscount | null;
    readonly isValidationPending: boolean;
    readonly validationError: string | null;
    readonly finalAmount?: number;
};

/**
 * Whether a paid form may be submitted as far as its discount code is concerned, which every such form asks.
 *
 * Note: An empty field is ready, because a discount code is never required. A field which was typed into is only ready
 *       once the server has answered that the code really is active here, so nothing is submitted at a price the
 *       server is about to refuse.
 */
export function isDiscountCodeReadyForSubmission(validation: DiscountCodeValidation): boolean {
    if (validation.discountCode.trim() === '') {
        return true;
    }

    return (
        normalizeDiscountCode(validation.discountCode) !== '' &&
        !validation.isValidationPending &&
        validation.validationError === null &&
        validation.activeDiscount !== null
    );
}

type ValidatedDiscount = {
    readonly discountCode: string;
    readonly discountPlaceId: string;
    readonly activeDiscount: ActiveDiscount | null;
};

/**
 * Shared client behavior for every discount-code field: debounce typed values, discard stale
 * answers, and use the server-resolved answer for an initial `?code=` link.
 */
export function useDiscountCodeValidation({
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    discountPlaceId,
    baseAmount,
}: DiscountCodeValidationOptions): DiscountCodeValidation {
    const [discountCode, setDiscountCode] = useState(initialDiscountCode);
    const [validatedDiscount, setValidatedDiscount] = useState<ValidatedDiscount | null>(() => ({
        discountCode: normalizeDiscountCode(initialDiscountCode),
        discountPlaceId,
        activeDiscount: initialActiveDiscountByPlaceId[discountPlaceId] ?? null,
    }));
    const [isValidationPending, setIsValidationPending] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const normalizedDiscountCode = normalizeDiscountCode(discountCode);

    useEffect(() => {
        setDiscountCode(initialDiscountCode);
    }, [initialDiscountCode]);

    useEffect(() => {
        if (!normalizedDiscountCode) {
            setValidatedDiscount(null);
            setIsValidationPending(false);
            setValidationError(null);
            return;
        }

        const isInitialAnswerCurrent =
            normalizedDiscountCode === normalizeDiscountCode(initialDiscountCode) &&
            Object.prototype.hasOwnProperty.call(initialActiveDiscountByPlaceId, discountPlaceId);
        if (isInitialAnswerCurrent) {
            setValidatedDiscount({
                discountCode: normalizedDiscountCode,
                discountPlaceId,
                activeDiscount: initialActiveDiscountByPlaceId[discountPlaceId] ?? null,
            });
            setIsValidationPending(false);
            setValidationError(null);
            return;
        }

        let isValidationCurrent = true;
        setIsValidationPending(true);
        setValidationError(null);
        const validationTimeoutId = window.setTimeout(() => {
            void validateDiscountCode(discountCode, discountPlaceId)
                .then((loadedActiveDiscount) => {
                    if (isValidationCurrent) {
                        setValidatedDiscount({
                            discountCode: normalizedDiscountCode,
                            discountPlaceId,
                            activeDiscount: loadedActiveDiscount,
                        });
                    }
                })
                .catch((error: unknown) => {
                    if (!isValidationCurrent) {
                        return;
                    }

                    setValidatedDiscount(null);
                    setValidationError(
                        error instanceof Error ? error.message : DISCOUNT_CODE_NOT_VALIDATED_ERROR_MESSAGE,
                    );
                })
                .finally(() => {
                    if (isValidationCurrent) {
                        setIsValidationPending(false);
                    }
                });
        }, DISCOUNT_CODE_VALIDATION_DELAY_MILLISECONDS);

        return () => {
            isValidationCurrent = false;
            window.clearTimeout(validationTimeoutId);
        };
    }, [
        discountCode,
        discountPlaceId,
        initialActiveDiscountByPlaceId,
        initialDiscountCode,
        normalizedDiscountCode,
    ]);

    let activeDiscount = validatedDiscount !== null &&
        validatedDiscount.discountCode === normalizedDiscountCode && validatedDiscount.discountPlaceId === discountPlaceId
        ? validatedDiscount.activeDiscount : null;
    let calculationError: string | null = null;
    if (activeDiscount && baseAmount !== undefined) {
        try { calculateDiscountedAmount(baseAmount, activeDiscount); }
        catch { activeDiscount = null; calculationError = 'Slevu pro tuto cenu nelze vypočítat. Ověřte jiný kód nebo pole vymažte.'; }
    }
    return { discountCode, setDiscountCode, activeDiscount, isValidationPending, validationError: calculationError ?? validationError,
        ...(activeDiscount && baseAmount !== undefined ? { finalAmount: calculateDiscountedAmount(baseAmount, activeDiscount) } : {}) };
}
