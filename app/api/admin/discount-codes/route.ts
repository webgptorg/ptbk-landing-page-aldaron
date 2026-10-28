import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { DISCOUNT_CODE_TABLE_NAME } from '@/lib/discounts/discountCodeConstants';
import {
    createDiscountCodeDatabaseUnavailableResponse,
    createDiscountCodeDatabaseValues,
    createDiscountCodeMutationErrorResponse,
    getDiscountCodeDatabaseOrNull,
    loadDiscountCodes,
    mapDiscountCodeRow,
    type DiscountCodeRow,
} from '@/lib/discounts/discountCodeDatabase';
import { discountCodeValuesSchema } from '@/lib/discounts/discountCodeSchema';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Neplatný slevový kód.';

export async function GET(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createDiscountCodeDatabaseUnavailableResponse();
    }

    const { discountCodes, errorMessage } = await loadDiscountCodes(supabase);
    return discountCodes === null
        ? NextResponse.json({ error: errorMessage }, { status: 500 })
        : NextResponse.json({ discountCodes }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = discountCodeValuesSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? INVALID_DISCOUNT_CODE_ERROR_MESSAGE },
            { status: 400 },
        );
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .insert(createDiscountCodeDatabaseValues(parsedResult.data))
        .select('*')
        .single();
    if (error !== null) {
        return createDiscountCodeMutationErrorResponse(error);
    }

    return NextResponse.json({ discountCode: mapDiscountCodeRow(data as DiscountCodeRow) }, { status: 201 });
}
