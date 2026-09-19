/**
 * How one value of a view is written into the URL and read back from it
 */
export type UrlViewValueCodec<TValue> = {
    /**
     * @returns `null` when the URL holds something which is not a valid value
     */
    readonly parseValue: (parameterValue: string) => TValue | null;

    readonly serializeValue: (value: TValue) => string;

    /**
     * Does this value have the same meaning as another one?
     *
     * Most view values are strings or numbers and can use strict equality. A value which is a list or an object has to
     * compare its contents instead, so that a link never carries a parameter which only looks different.
     */
    readonly areValuesEqual?: (firstValue: TValue, secondValue: TValue) => boolean;
};

/**
 * One value of a view together with the URL query parameter which carries it
 */
export type UrlViewParameter<TViewState, TValue> = UrlViewValueCodec<TValue> & {
    /**
     * Name of the URL query parameter, kept short so that the shared link stays readable
     */
    readonly parameterName: string;

    readonly readValue: (viewState: TViewState) => TValue;
    readonly writeValue: (viewState: TViewState, value: TValue) => TViewState;

    /**
     * Whether the parameter remains in a shared link when its value is the default one.
     *
     * Most view settings can omit their default value and stay readable. A deliberate display choice sometimes needs
     * to say its default explicitly, however, so a recipient can distinguish an intentional setting from an older
     * link which did not carry the setting yet.
     */
    readonly isDefaultValueIncluded?: boolean;
};

/**
 * Describe one parameter of a view with its value type checked, so that all the parameters can live in one list
 *
 * Note: Forgetting the value type is safe here, because a value is only ever written back by the very same parameter
 *       which parsed it
 */
export function defineUrlViewParameter<TViewState, TValue>(
    parameter: UrlViewParameter<TViewState, TValue>,
): UrlViewParameter<TViewState, unknown> {
    return parameter as UrlViewParameter<TViewState, unknown>;
}

/**
 * Carry the parameters of a smaller view state inside a larger one, so that a part of a view describes its own link
 * exactly once however many dashboards embed it
 */
export function liftUrlViewParameters<TOuterViewState, TInnerViewState>(
    parameters: readonly UrlViewParameter<TInnerViewState, unknown>[],
    lens: {
        readonly readInnerViewState: (outerViewState: TOuterViewState) => TInnerViewState;
        readonly writeInnerViewState: (
            outerViewState: TOuterViewState,
            innerViewState: TInnerViewState,
        ) => TOuterViewState;
    },
): readonly UrlViewParameter<TOuterViewState, unknown>[] {
    return parameters.map((parameter) =>
        defineUrlViewParameter<TOuterViewState, unknown>({
            ...parameter,
            readValue: (outerViewState) => parameter.readValue(lens.readInnerViewState(outerViewState)),
            writeValue: (outerViewState, value) =>
                lens.writeInnerViewState(
                    outerViewState,
                    parameter.writeValue(lens.readInnerViewState(outerViewState), value),
                ),
        }),
    );
}

/**
 * Text which the user typed, carried by the URL exactly as it is
 */
export const TEXT_VALUE_CODEC: UrlViewValueCodec<string> = {
    parseValue: (parameterValue) => parameterValue,
    serializeValue: (value) => value,
};

/**
 * Switch which is either on or off, written as `1` so that the shared link stays short
 *
 * Note: A link written by hand may say `true` or `yes` instead, and anything else means off, because a switch has no
 *       third position to fall back to.
 */
export const FLAG_VALUE_CODEC: UrlViewValueCodec<boolean> = {
    parseValue: (parameterValue) => ['1', 'true', 'yes'].includes(parameterValue.trim().toLowerCase()),
    serializeValue: (value) => (value ? '1' : '0'),
};

/**
 * Value which is one of a few known options, understood no matter the letter case, so that a link can also be written
 * by hand
 */
export function createEnumeratedValueCodec<TValue extends string>(
    allowedValues: readonly TValue[],
): UrlViewValueCodec<TValue> {
    return {
        parseValue: (parameterValue) =>
            allowedValues.find((allowedValue) => allowedValue.toLowerCase() === parameterValue.trim().toLowerCase()) ??
            null,
        serializeValue: (value) => value,
    };
}

/**
 * Read a view out of a shared link
 *
 * Note: Every value which is missing or which makes no sense falls back to the default one, so that an old or a hand
 *       written link always opens the dashboard
 */
export function parseUrlViewState<TViewState>(
    parameters: readonly UrlViewParameter<TViewState, unknown>[],
    defaultViewState: TViewState,
    searchParams: URLSearchParams,
): TViewState {
    return parameters.reduce((viewState, parameter) => {
        const parameterValue = searchParams.get(parameter.parameterName);

        if (parameterValue === null) {
            return viewState;
        }

        const value = parameter.parseValue(parameterValue);
        return value === null ? viewState : parameter.writeValue(viewState, value);
    }, defaultViewState);
}

/**
 * Write a view into the query parameters of the link which can be shared
 *
 * Note: The parameters which do not describe the view are kept as they are and default values are ordinarily left
 *       out, so that the shared link stays as short as possible. A parameter can explicitly retain its default when
 *       the shared link needs to record that choice.
 *
 * @returns New query parameters, the given ones are never mutated
 */
export function serializeUrlViewState<TViewState>(
    parameters: readonly UrlViewParameter<TViewState, unknown>[],
    defaultViewState: TViewState,
    viewState: TViewState,
    searchParams: URLSearchParams,
): URLSearchParams {
    const newSearchParams = new URLSearchParams(searchParams);

    for (const parameter of parameters) {
        const value = parameter.readValue(viewState);
        const defaultValue = parameter.readValue(defaultViewState);
        const isDefaultValue = parameter.areValuesEqual?.(value, defaultValue) ?? value === defaultValue;
        const isDefaultValueIncluded = parameter.isDefaultValueIncluded ?? false;

        if (isDefaultValue && !isDefaultValueIncluded) {
            newSearchParams.delete(parameter.parameterName);
        } else {
            newSearchParams.set(parameter.parameterName, parameter.serializeValue(value));
        }
    }

    return newSearchParams;
}
