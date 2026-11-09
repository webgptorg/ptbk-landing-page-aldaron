import { isDiscountCodeNormalized, normalizeDiscountCode } from '@/lib/discounts/discountCode';
import {
    MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH,
    MAXIMAL_DISCOUNT_CODE_LENGTH,
    MAXIMAL_DISCOUNT_CODE_USE_COUNT,
    MAXIMAL_DISCOUNT_PERCENT,
    MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT,
} from '@/lib/discounts/discountCodeConstants';
import { isKnownDiscountPlaceId, isPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { z } from 'zod';

const discountCodeSchema = z
    .string()
    .trim()
    .min(1, 'Zadejte slevový kód.')
    .max(MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH, 'Slevový kód je příliš dlouhý.')
    .transform(normalizeDiscountCode)
    .refine(isDiscountCodeNormalized, {
        message: `Slevový kód musí po normalizaci obsahovat nejvýše ${MAXIMAL_DISCOUNT_CODE_LENGTH} znaků; hvězdička může být kdekoli jako zástupný znak.`,
    });

const discountPlaceIdsSchema = z
    .array(z.string().refine(isKnownDiscountPlaceId, { message: 'Neznámé místo platnosti slevového kódu.' }))
    .transform((discountPlaceIds) => Array.from(new Set(discountPlaceIds)));

const maximumUseCountSchema = z
    .number()
    .int('Maximální počet použití musí být celé číslo.')
    .min(1, 'Maximální počet použití musí být alespoň 1.')
    .max(
        MAXIMAL_DISCOUNT_CODE_USE_COUNT,
        `Maximální počet použití může být nejvýše ${MAXIMAL_DISCOUNT_CODE_USE_COUNT}.`,
    )
    .nullable();

const subscriptionDiscountDurationMonthsSchema = z
    .number()
    .int('Délka slevy předplatného musí být celé číslo měsíců.')
    .min(1, 'Dočasná sleva předplatného musí trvat alespoň 1 měsíc.')
    .max(
        MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT,
        `Dočasná sleva předplatného může trvat nejvýše ${MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT} měsíců.`,
    )
    .nullable()
    .default(null);

/**
 * One complete discount-code write. Creation and editing deliberately use the same shape.
 */
export const discountCodeValuesSchema = z
    .object({
        code: discountCodeSchema,
        percent: z
            .number()
            .int('Sleva musí být celé procento.')
            .min(1, 'Sleva musí být alespoň 1 %.')
            .max(MAXIMAL_DISCOUNT_PERCENT, `Sleva může být nejvýše ${MAXIMAL_DISCOUNT_PERCENT} %.`),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: z.string().datetime({ offset: true }),
        isEnabled: z.boolean(),
        isPromoted: z.boolean().default(false),
        placeIds: discountPlaceIdsSchema,
        maximumUseCount: maximumUseCountSchema,
        subscriptionDiscountDurationMonths: subscriptionDiscountDurationMonthsSchema,
    })
    .refine((discountCode) => Date.parse(discountCode.endsAt) >= Date.parse(discountCode.startsAt), {
        message: 'Konec platnosti musí být po začátku platnosti.',
        path: ['endsAt'],
    })
    .refine((discountCode) => !discountCode.isPromoted || (
        !discountCode.code.includes('*') && discountCode.placeIds.some(isPromptbookDiscountPlaceId)
    ), {
        message: 'Zveřejnit lze přesný kód s výslovně vybraným tarifem Promptbooku.',
        path: ['isPromoted'],
    });
