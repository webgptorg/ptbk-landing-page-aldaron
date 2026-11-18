'use client';

import { FORM_SURFACE_CLASS_NAMES, type FormSurfaceAppearance } from '@/components/forms/formSurfaceAppearance';
import { Input } from '@/components/ui/input';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { getDiscountCodeMessage } from '@/lib/discounts/discountCodeMessages';
import type { DiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { cn } from '@/lib/utils';
import { BadgePercent } from 'lucide-react';

type DiscountCodeFieldProps = {
    readonly inputId: string;
    readonly validation: DiscountCodeValidation;
    readonly appearance?: FormSurfaceAppearance;
    readonly language?: 'cs' | 'en';
};

/**
 * The one discount-code field shared by every paid registration form, on a light page and inside a dark room alike.
 */
export function DiscountCodeField({ inputId, validation, appearance = 'light', language = 'cs' }: DiscountCodeFieldProps) {
    const { discountCode, setDiscountCode, activeDiscount, isValidationPending, validationError } = validation;
    const surfaceClassNames = FORM_SURFACE_CLASS_NAMES[appearance];

    return (
        <div>
            <label htmlFor={inputId} className={cn('text-sm font-semibold', surfaceClassNames.label)}>
                {language === 'cs' ? 'Slevový kód' : 'Discount code'}
            </label>
            <div className="relative mt-2">
                <BadgePercent className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                    id={inputId}
                    name={inputId}
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value)}
                    maxLength={MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH}
                    className={cn('h-11 pl-10 uppercase', surfaceClassNames.input)}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-describedby={`${inputId}-status`}
                    aria-invalid={discountCode.trim() !== '' && !isValidationPending && (validationError !== null || activeDiscount === null)}
                />
            </div>
            <p id={`${inputId}-status`} role="status" className={cn('mt-1 text-xs', surfaceClassNames.hint)}>
                {getDiscountCodeMessage({ discountCode, activeDiscount, isValidationPending, validationError, language })}
            </p>
        </div>
    );
}
