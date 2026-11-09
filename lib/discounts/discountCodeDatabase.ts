import {
    createActiveDiscount,
    isDiscountCodeNormalized,
    isDiscountCodeUsableInPlace,
    normalizeDiscountCode,
    type ActiveDiscount,
    type ActiveDiscountByPlaceId,
    type DiscountCode,
    type DiscountCodeValues,
} from '@/lib/discounts/discountCode';
import {
    CONSUME_DISCOUNT_CODE_FUNCTION_NAME,
    DISCOUNT_CODE_TABLE_NAME,
    RESOLVE_DISCOUNT_CODE_FUNCTION_NAME,
} from '@/lib/discounts/discountCodeConstants';
import { isPromptbookDiscountPlaceId, PROMPTBOOK_DISCOUNT_PLACE_IDS } from '@/lib/discounts/discountPlaces';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE = 'Database not configured';
const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE = 'Slevový kód již existuje.';

export type DiscountCodeRow = {
    readonly id: string;
    readonly code: string;
    readonly percent: number;
    readonly starts_at: string;
    readonly ends_at: string;
    readonly is_enabled: boolean;
    readonly is_promoted?: boolean;
    readonly place_ids: readonly string[] | null;
    readonly maximum_use_count: number | null;
    readonly subscription_discount_duration_months: number | null;
    readonly use_count: number;
    readonly created_at: string;
    readonly updated_at: string;
};

type DiscountCodeConsumptionRow = {
    readonly status: string;
    readonly code: string;
    readonly percent: number | null;
    readonly remaining_use_count: number | null;
    readonly subscription_discount_duration_months: number | null;
};

export type ActiveDiscountLoadResult = {
    readonly activeDiscount: ActiveDiscount | null;
    readonly errorMessage: string | null;
};

export type ActiveDiscountsByPlaceLoadResult = {
    readonly activeDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly errorMessage: string | null;
};

export type DiscountCodeConsumptionStatus = 'applied' | 'exhausted' | 'unusable';

export type DiscountCodeConsumptionResult = {
    readonly status: DiscountCodeConsumptionStatus;
    readonly activeDiscount: ActiveDiscount | null;
    readonly errorMessage: string | null;
};

export type DiscountCodeLoadResult = {
    readonly discountCodes: readonly DiscountCode[] | null;
    readonly errorMessage: string | null;
};

/**
 * Reaches the private discount table only through the server service role.
 */
export function getDiscountCodeDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createDiscountCodeDatabaseUnavailableResponse(): NextResponse {
    console.error(
        `⚠️ The discount codes cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "${DISCOUNT_CODE_TABLE_NAME}" table is closed by row level security`,
    );

    return NextResponse.json({ error: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
}

export function createDiscountCodeMutationErrorResponse(error: {
    readonly code?: string;
    readonly message: string;
}): NextResponse {
    const isDuplicateDiscountCode = error.code === POSTGRES_UNIQUE_VIOLATION_CODE;

    return NextResponse.json(
        { error: isDuplicateDiscountCode ? DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE : error.message },
        { status: isDuplicateDiscountCode ? 409 : 500 },
    );
}

export function mapDiscountCodeRow(discountCodeRow: DiscountCodeRow): DiscountCode {
    return {
        id: discountCodeRow.id,
        code: discountCodeRow.code,
        percent: discountCodeRow.percent,
        startsAt: discountCodeRow.starts_at,
        endsAt: discountCodeRow.ends_at,
        isEnabled: discountCodeRow.is_enabled,
        isPromoted: discountCodeRow.is_promoted ?? false,
        placeIds: discountCodeRow.place_ids ?? [],
        maximumUseCount: discountCodeRow.maximum_use_count,
        subscriptionDiscountDurationMonths: discountCodeRow.subscription_discount_duration_months,
        useCount: discountCodeRow.use_count,
        createdAt: discountCodeRow.created_at,
        updatedAt: discountCodeRow.updated_at,
    };
}

export function createDiscountCodeDatabaseValues(
    discountCode: DiscountCodeValues,
): Readonly<Record<string, string | number | boolean | readonly string[] | null>> {
    return {
        code: discountCode.code,
        percent: discountCode.percent,
        starts_at: discountCode.startsAt,
        ends_at: discountCode.endsAt,
        is_enabled: discountCode.isEnabled,
        is_promoted: discountCode.isPromoted ?? false,
        place_ids: discountCode.placeIds,
        maximum_use_count: discountCode.maximumUseCount,
        subscription_discount_duration_months: discountCode.subscriptionDiscountDurationMonths,
    };
}

export async function loadDiscountCodes(supabase: SupabaseClient): Promise<DiscountCodeLoadResult> {
    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .select('*')
        .order('starts_at', { ascending: false })
        .order('created_at', { ascending: false });

    if (error !== null) {
        return { discountCodes: null, errorMessage: error.message };
    }

    return {
        discountCodes: ((data ?? []) as DiscountCodeRow[]).map(mapDiscountCodeRow),
        errorMessage: null,
    };
}

type SubmittedDiscountCodeLoadResult = {
    readonly discountCode: DiscountCode | null;
    readonly errorMessage: string | null;
};

/**
 * Reads exactly one submitted code without consuming it. The database resolves wildcard rules with
 * the same precedence that its atomic consumption function uses. Public callers never receive the
 * list of codes or a private row; they receive only the active discount for their requested place.
 */
async function loadSubmittedDiscountCode(discountCodeValue: string): Promise<SubmittedDiscountCodeLoadResult> {
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValue);
    if (!isDiscountCodeNormalized(normalizedDiscountCode)) {
        return { discountCode: null, errorMessage: null };
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { discountCode: null, errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { data, error } = await supabase.rpc(RESOLVE_DISCOUNT_CODE_FUNCTION_NAME, {
        submitted_discount_code: normalizedDiscountCode,
    });
    if (error !== null) {
        return { discountCode: null, errorMessage: error.message };
    }

    const discountCodeRow = ((data ?? []) as DiscountCodeRow[])[0] ?? null;

    return {
        discountCode: discountCodeRow === null ? null : mapDiscountCodeRow(discountCodeRow),
        errorMessage: null,
    };
}

export async function loadActiveDiscount(
    discountCodeValue: string,
    discountPlaceId: string,
    currentDate: Date = new Date(),
): Promise<ActiveDiscountLoadResult> {
    const { discountCode, errorMessage } = await loadSubmittedDiscountCode(discountCodeValue);
    if (discountCode === null) {
        return { activeDiscount: null, errorMessage };
    }

    return {
        activeDiscount: isDiscountCodeUsableInPlace(discountCode, discountPlaceId, currentDate)
            ? createActiveDiscount(discountCode)
            : null,
        errorMessage: null,
    };
}

/**
 * Resolves one prefilled code for every offer on a page in one database read. A page can then
 * choose the first offer where the code is valid, while switching offers remains instant.
 */
export async function loadActiveDiscountsByPlace(
    discountCodeValue: string,
    discountPlaceIds: readonly string[],
    currentDate: Date = new Date(),
): Promise<ActiveDiscountsByPlaceLoadResult> {
    const { discountCode, errorMessage } = await loadSubmittedDiscountCode(discountCodeValue);
    const activeDiscount = discountCode === null ? null : createActiveDiscount(discountCode);

    return {
        activeDiscountByPlaceId: Object.fromEntries(
            discountPlaceIds.map((discountPlaceId) => [
                discountPlaceId,
                discountCode !== null && isDiscountCodeUsableInPlace(discountCode, discountPlaceId, currentDate)
                    ? activeDiscount
                    : null,
            ]),
        ),
        errorMessage,
    };
}

/** Picks the latest active public offer for each plan and leaves private codes on the server. */
export async function loadPromotedDiscountsByPlace(
    currentDate: Date = new Date(),
): Promise<ActiveDiscountsByPlaceLoadResult> {
    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { activeDiscountByPlaceId: {}, errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const timestamp = currentDate.toISOString();
    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .select('*')
        .eq('is_promoted', true)
        .eq('is_enabled', true)
        .lte('starts_at', timestamp)
        .gte('ends_at', timestamp)
        .overlaps('place_ids', [...PROMPTBOOK_DISCOUNT_PLACE_IDS])
        .order('starts_at', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id');
    if (error !== null) {
        return { activeDiscountByPlaceId: {}, errorMessage: error.message };
    }

    const discountCodes = ((data ?? []) as DiscountCodeRow[]).map(mapDiscountCodeRow);
    return {
        activeDiscountByPlaceId: Object.fromEntries(PROMPTBOOK_DISCOUNT_PLACE_IDS.map((placeId) => {
            const discountCode = discountCodes.find((code) => isDiscountCodeUsableInPlace(code, placeId, currentDate));
            return [placeId, discountCode ? createActiveDiscount(discountCode) : null];
        })),
        errorMessage: null,
    };
}

function readDiscountCodeConsumptionStatus(status: string): DiscountCodeConsumptionStatus {
    return status === 'applied' || status === 'exhausted' ? status : 'unusable';
}

function createDiscountCodeConsumptionResult(
    consumptionRow: DiscountCodeConsumptionRow,
): DiscountCodeConsumptionResult {
    const status = readDiscountCodeConsumptionStatus(consumptionRow.status);

    return {
        status,
        activeDiscount:
            status === 'applied' && consumptionRow.percent !== null
                ? {
                      code: consumptionRow.code,
                      percent: consumptionRow.percent,
                      remainingUseCount: consumptionRow.remaining_use_count,
                      subscriptionDiscountDurationMonths: consumptionRow.subscription_discount_duration_months,
                  }
                : null,
        errorMessage: null,
    };
}

/**
 * Takes exactly one use of a submitted code. The database function performs the conditional update
 * atomically, so two registrations cannot both take the last available use.
 */
export async function consumeDiscountCode(
    discountCodeValue: string,
    discountPlaceId: string,
): Promise<DiscountCodeConsumptionResult> {
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValue);
    if (!isDiscountCodeNormalized(normalizedDiscountCode)) {
        return { status: 'unusable', activeDiscount: null, errorMessage: null };
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return {
            status: 'unusable',
            activeDiscount: null,
            errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE,
        };
    }

    const { data, error } = await supabase.rpc(CONSUME_DISCOUNT_CODE_FUNCTION_NAME, {
        discount_code: normalizedDiscountCode,
        discount_place_id: discountPlaceId,
    });
    if (error !== null) {
        return { status: 'unusable', activeDiscount: null, errorMessage: error.message };
    }

    const consumptionRow = ((data ?? []) as DiscountCodeConsumptionRow[])[0];

    return consumptionRow === undefined
        ? { status: 'unusable', activeDiscount: null, errorMessage: null }
        : createDiscountCodeConsumptionResult(consumptionRow);
}

/** Reserves one use for a stable Promptbook order and returns the terms frozen for that order. */
export async function reservePromptbookDiscountCode(
    discountCodeValue: string,
    discountPlaceId: string,
    reservationId: string,
): Promise<DiscountCodeConsumptionResult> {
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValue);
    if (!isDiscountCodeNormalized(normalizedDiscountCode) || !isPromptbookDiscountPlaceId(discountPlaceId)) {
        return { status: 'unusable', activeDiscount: null, errorMessage: null };
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { status: 'unusable', activeDiscount: null, errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { data, error } = await supabase.rpc('reserve_promptbook_discount_code', {
        submitted_code: normalizedDiscountCode,
        place_id: discountPlaceId,
        reservation_id: reservationId,
    });
    if (error !== null) {
        return { status: 'unusable', activeDiscount: null, errorMessage: error.message };
    }

    const reservationRow = ((data ?? []) as DiscountCodeConsumptionRow[])[0];
    return reservationRow === undefined
        ? { status: 'unusable', activeDiscount: null, errorMessage: null }
        : createDiscountCodeConsumptionResult(reservationRow);
}

/** Commits a paid reservation or frees it when Stripe confirms that the checkout expired. */
export async function settlePromptbookDiscountReservation(
    reservationId: string,
    isRedeemed: boolean,
): Promise<{ readonly errorMessage: string | null }> {
    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { error } = await supabase.rpc('settle_promptbook_discount_reservation', {
        reservation_id: reservationId,
        is_redeemed: isRedeemed,
    });
    return { errorMessage: error?.message ?? null };
}
