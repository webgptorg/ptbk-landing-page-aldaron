'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import {
    isDiscountCodeValidForAllPlaces,
    type DiscountCode,
    type DiscountCodeValues,
} from '@/lib/discounts/discountCode';
import {
    MAXIMAL_DISCOUNT_CODE_USE_COUNT,
    MAXIMAL_DISCOUNT_PERCENT,
    MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT,
} from '@/lib/discounts/discountCodeConstants';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, DISCOUNT_PLACES } from '@/lib/discounts/discountPlaces';
import { Save, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const DEFAULT_DISCOUNT_PERCENT = 10;
const DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS = 24 * 60 * 60 * 1000;
const DEFAULT_MAXIMAL_USE_COUNT = 10;
const DEFAULT_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT = 3;

type DiscountCodeFormProps = {
    readonly discountCode: DiscountCode | null;
    readonly onSave: (values: DiscountCodeValues) => Promise<boolean>;
    readonly onCancelEditing: () => void;
};

function createNewDiscountCodeValues(): DiscountCodeValues {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + DEFAULT_DISCOUNT_VALIDITY_MILLISECONDS);

    return {
        code: '',
        percent: DEFAULT_DISCOUNT_PERCENT,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        isEnabled: true,
        placeIds: [],
        maximumUseCount: null,
        subscriptionDiscountDurationMonths: null,
    };
}

function createDiscountCodeValues(discountCode: DiscountCode | null): DiscountCodeValues {
    if (discountCode === null) {
        return createNewDiscountCodeValues();
    }

    return {
        code: discountCode.code,
        percent: discountCode.percent,
        startsAt: discountCode.startsAt,
        endsAt: discountCode.endsAt,
        isEnabled: discountCode.isEnabled,
        placeIds: discountCode.placeIds,
        maximumUseCount: discountCode.maximumUseCount,
        subscriptionDiscountDurationMonths: discountCode.subscriptionDiscountDurationMonths,
    };
}

function toggleDiscountPlaceId(
    placeIds: readonly string[],
    discountPlaceId: string,
    isSelected: boolean,
): readonly string[] {
    if (isSelected) {
        return placeIds.includes(discountPlaceId) ? [...placeIds] : [...placeIds, discountPlaceId];
    }

    return placeIds.filter((selectedPlaceId) => selectedPlaceId !== discountPlaceId);
}

/**
 * Edits the complete shared discount-code configuration, including its places and use limit.
 */
export function DiscountCodeForm({ discountCode, onSave, onCancelEditing }: DiscountCodeFormProps) {
    const [values, setValues] = useState<DiscountCodeValues>(() => createDiscountCodeValues(discountCode));
    const [startsAtText, setStartsAtText] = useState(() => toDateTimeLocalValue(values.startsAt));
    const [endsAtText, setEndsAtText] = useState(() => toDateTimeLocalValue(values.endsAt));
    const [isValidForAllPlaces, setIsValidForAllPlaces] = useState(() =>
        isDiscountCodeValidForAllPlaces(createDiscountCodeValues(discountCode)),
    );
    const [isCreating, setIsCreating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const isEditing = discountCode !== null;
    const isUseCountLimited = values.maximumUseCount !== null;
    const isSubscriptionDiscountDurationLimited = values.subscriptionDiscountDurationMonths !== null;
    const isCommunityMembershipSelected =
        isValidForAllPlaces || values.placeIds.includes(COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);

    const updateValue = <TField extends keyof DiscountCodeValues>(field: TField, value: DiscountCodeValues[TField]) => {
        setValues((currentValues) => ({ ...currentValues, [field]: value }));
    };

    const saveValues = async () => {
        const startsAt = fromDateTimeLocalValue(startsAtText);
        const endsAt = fromDateTimeLocalValue(endsAtText);
        if (startsAt === null || endsAt === null || !values.code.trim()) {
            setValidationError('Vyplňte kód a obě data platnosti.');
            return false;
        }
        if (Date.parse(endsAt) < Date.parse(startsAt)) {
            setValidationError('Konec platnosti musí být po začátku platnosti.');
            return false;
        }
        if (!isValidForAllPlaces && values.placeIds.length === 0) {
            setValidationError('Vyberte alespoň jedno místo, kde kód platí, nebo zvolte všechna místa.');
            return false;
        }
        if (
            values.subscriptionDiscountDurationMonths !== null &&
            (!Number.isInteger(values.subscriptionDiscountDurationMonths) ||
                values.subscriptionDiscountDurationMonths < 1 ||
                values.subscriptionDiscountDurationMonths > MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT)
        ) {
            setValidationError(
                `Dočasná sleva předplatného musí trvat 1 až ${MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT} měsíců.`,
            );
            return false;
        }

        setValidationError(null);
        const isSaved = await onSave({
            ...values,
            startsAt,
            endsAt,
            placeIds: isValidForAllPlaces ? [] : values.placeIds,
        });

        if (isSaved && !isEditing) {
            const newValues = createNewDiscountCodeValues();
            setValues(newValues);
            setStartsAtText(toDateTimeLocalValue(newValues.startsAt));
            setEndsAtText(toDateTimeLocalValue(newValues.endsAt));
            setIsValidForAllPlaces(true);
        }
        return isSaved;
    };

    const autosave = useAdminAutosave({ value: { values, startsAtText, endsAtText, isValidForAllPlaces }, onSave: saveValues, isEnabled: isEditing });
    const isSaving = isCreating || autosave.isSaving;
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isEditing) {
            await autosave.saveNow();
            return;
        }
        setIsCreating(true);
        try { await saveValues(); } finally { setIsCreating(false); }
    };

    return (
        <form ref={autosave.formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Kód se při uložení sjednotí na velká písmena a podtržítka. Každá hvězdička zastoupí libovolně
                        dlouhou, i prázdnou část kódu: <code>SUMMER*</code> najde začátky, <code>*SUMMER</code> konce a
                        {' '}<code>*SUMMER*2026</code> kódy se slovem SUMMER končící na 2026. Platnost je včetně
                        okamžiku začátku i konce.
                    </p>
                </div>
                {isEditing && (
                    <Button type="button" variant="outline" size="sm" onClick={() => void runAfterAdminSaves(onCancelEditing)} disabled={isSaving}>
                        <X className="mr-2 h-4 w-4" /> Zavřít úpravy
                    </Button>
                )}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                    Slevový kód
                    <Input
                        value={values.code}
                        onChange={(event) => updateValue('code', event.target.value)}
                        className="mt-2 uppercase"
                        placeholder="WEBINAR_2026_09_04"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Sleva v procentech
                    <Input
                        type="number"
                        min={1}
                        max={MAXIMAL_DISCOUNT_PERCENT}
                        value={values.percent}
                        onChange={(event) => updateValue('percent', Number(event.target.value))}
                        className="mt-2"
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Začátek platnosti
                    <Input
                        type="datetime-local"
                        value={startsAtText}
                        onChange={(event) => setStartsAtText(event.target.value)}
                        className="mt-2"
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Konec platnosti
                    <Input
                        type="datetime-local"
                        value={endsAtText}
                        onChange={(event) => setEndsAtText(event.target.value)}
                        className="mt-2"
                        required
                    />
                </label>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={values.isEnabled}
                        onChange={(event) => updateValue('isEnabled', event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Kód je zapnutý</strong>
                        Vypnutý kód se nikdy neuplatní, i kdyby byl v období platnosti.
                    </span>
                </label>
            </div>

            <fieldset className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <legend className="px-1 text-sm font-semibold text-slate-950">Kde kód platí</legend>
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isValidForAllPlaces}
                        onChange={(event) => {
                            const nextIsValidForAllPlaces = event.target.checked;
                            setIsValidForAllPlaces(nextIsValidForAllPlaces);

                            // Moving from the implicit "all places" representation to selected
                            // places should start with every currently known place selected. This
                            // keeps an accidental empty selection from being serialized as "all".
                            if (!nextIsValidForAllPlaces && values.placeIds.length === 0) {
                                updateValue(
                                    'placeIds',
                                    DISCOUNT_PLACES.map((discountPlace) => discountPlace.id),
                                );
                            }
                        }}
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Všechna místa</strong>
                        Kód platí všude, kde se slevové kódy zadávají, i v místech přidaných později.
                    </span>
                </label>

                {!isValidForAllPlaces && (
                    <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                        {DISCOUNT_PLACES.map((discountPlace) => (
                            <label key={discountPlace.id} className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={values.placeIds.includes(discountPlace.id)}
                                    onChange={(event) =>
                                        updateValue(
                                            'placeIds',
                                            toggleDiscountPlaceId(
                                                values.placeIds,
                                                discountPlace.id,
                                                event.target.checked,
                                            ),
                                        )
                                    }
                                    className="mt-0.5 h-4 w-4 rounded"
                                />
                                <span>
                                    <strong className="block text-slate-950">{discountPlace.label}</strong>
                                    {discountPlace.description}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </fieldset>

            {isCommunityMembershipSelected && (
                <fieldset className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <legend className="px-1 text-sm font-semibold text-slate-950">Sleva v předplatném</legend>
                    <p className="mb-4 leading-5 text-slate-600">
                        Toto nastavení se použije pouze pro placené členství komunity. Platnost kódu určuje, dokdy lze
                        slevu získat; zde určujete, jak dlouho pak sleva zůstane v již založeném předplatném.
                    </p>

                    <label className="flex items-start gap-3">
                        <input
                            type="radio"
                            name="subscription-discount-duration"
                            checked={!isSubscriptionDiscountDurationLimited}
                            onChange={() => updateValue('subscriptionDiscountDurationMonths', null)}
                            className="mt-0.5 h-4 w-4"
                        />
                        <span>
                            <strong className="block text-slate-950">Trvalá sleva</strong>
                            Sleva zůstane součástí všech dalších měsíčních plateb tohoto předplatného.
                        </span>
                    </label>

                    <label className="mt-4 flex items-start gap-3 border-t border-slate-200 pt-4">
                        <input
                            type="radio"
                            name="subscription-discount-duration"
                            checked={isSubscriptionDiscountDurationLimited}
                            onChange={() =>
                                updateValue(
                                    'subscriptionDiscountDurationMonths',
                                    discountCode?.subscriptionDiscountDurationMonths ??
                                        DEFAULT_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT,
                                )
                            }
                            className="mt-0.5 h-4 w-4"
                        />
                        <span>
                            <strong className="block text-slate-950">Dočasná sleva</strong>
                            Sleva skončí po vybraném počtu měsíčních plateb a předplatné pak bude pokračovat za běžnou
                            cenu.
                        </span>
                    </label>

                    {isSubscriptionDiscountDurationLimited && (
                        <label className="mt-4 block border-t border-slate-200 pt-4 text-sm font-medium text-slate-700">
                            Počet zlevněných měsíců
                            <Input
                                type="number"
                                min={1}
                                max={MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT}
                                value={
                                    values.subscriptionDiscountDurationMonths ??
                                    DEFAULT_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT
                                }
                                onChange={(event) =>
                                    updateValue('subscriptionDiscountDurationMonths', Number(event.target.value))
                                }
                                className="mt-2 max-w-xs"
                                required
                            />
                            <span className="mt-2 block text-xs font-normal text-slate-500">
                                Nejvýše {MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT} měsíců.
                            </span>
                        </label>
                    )}
                </fieldset>
            )}

            <fieldset className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <legend className="px-1 text-sm font-semibold text-slate-950">Počet použití</legend>
                <label className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isUseCountLimited}
                        onChange={(event) =>
                            updateValue(
                                'maximumUseCount',
                                event.target.checked
                                    ? (discountCode?.maximumUseCount ?? DEFAULT_MAXIMAL_USE_COUNT)
                                    : null,
                            )
                        }
                        className="mt-0.5 h-4 w-4 rounded"
                    />
                    <span>
                        <strong className="block text-slate-950">Omezit maximální počet použití</strong>
                        Bez omezení může kód použít libovolný počet registrací.
                    </span>
                </label>

                {isUseCountLimited && (
                    <label className="mt-4 block border-t border-slate-200 pt-4 text-sm font-medium text-slate-700">
                        Maximální počet použití
                        <Input
                            type="number"
                            min={1}
                            max={MAXIMAL_DISCOUNT_CODE_USE_COUNT}
                            value={values.maximumUseCount ?? DEFAULT_MAXIMAL_USE_COUNT}
                            onChange={(event) => updateValue('maximumUseCount', Number(event.target.value))}
                            className="mt-2 max-w-xs"
                            required
                        />
                        <span className="mt-2 block text-xs font-normal text-slate-500">
                            {isEditing
                                ? `Zatím použito ${discountCode.useCount}×. Zbývající použití vidí zájemce přímo v registračním formuláři.`
                                : 'Zbývající použití vidí zájemce přímo v registračním formuláři.'}
                        </span>
                    </label>
                )}
            </fieldset>

            {validationError !== null && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {isEditing && <AdminAutosaveStatus {...autosave} />}
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Ukládám…' : isEditing ? 'Uložit změny' : 'Vytvořit slevový kód'}
                </Button>
            </div>
        </form>
    );
}
