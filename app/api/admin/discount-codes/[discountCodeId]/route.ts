import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { DISCOUNT_CODE_TABLE_NAME } from '@/lib/discounts/discountCodeConstants';
import {
    createDiscountCodeDatabaseUnavailableResponse,
    createDiscountCodeDatabaseValues,
    createDiscountCodeMutationErrorResponse,
    getDiscountCodeDatabaseOrNull,
    mapDiscountCodeRow,
    type DiscountCodeRow,
} from '@/lib/discounts/discountCodeDatabase';
import { discountCodeValuesSchema } from '@/lib/discounts/discountCodeSchema';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE = 'Slevový kód nebyl nalezen.';
const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Neplatný slevový kód.';

type DiscountCodeRouteContext = {
    readonly params: Promise<{ readonly discountCodeId: string }>;
};

async function readDiscountCodeId(context: DiscountCodeRouteContext): Promise<string | null> {
    const { discountCodeId } = await context.params;

    return z.string().uuid().safeParse(discountCodeId).success ? discountCodeId : null;
}

export async function PATCH(request: NextRequest, context: DiscountCodeRouteContext) {
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

    const discountCodeId = await readDiscountCodeId(context);
    if (discountCodeId === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .update(createDiscountCodeDatabaseValues(parsedResult.data))
        .eq('id', discountCodeId)
        .select('*')
        .maybeSingle();
    if (error !== null) {
        return createDiscountCodeMutationErrorResponse(error);
    }
    if (data === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({ discountCode: mapDiscountCodeRow(data as DiscountCodeRow) });
}

export async function DELETE(request: NextRequest, context: DiscountCodeRouteContext) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const discountCodeId = await readDiscountCodeId(context);
    if (discountCodeId === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .delete()
        .eq('id', discountCodeId)
        .select('id')
        .maybeSingle();
    if (error !== null) {
        return createDiscountCodeMutationErrorResponse(error);
    }

    return data === null
        ? NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 })
        : NextResponse.json({ success: true });
}
