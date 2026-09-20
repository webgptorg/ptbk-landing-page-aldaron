import { requestAdminJson as requestJson } from '@/lib/admin/requestAdminJson';
import type { DiscountCode, DiscountCodeValues } from '@/lib/discounts/discountCode';
import { ADMIN_DISCOUNT_CODES_API_PATH } from '@/lib/discounts/discountCodeConstants';

const DISCOUNT_CODE_REQUEST_FAILURE_MESSAGE = 'Discount-code administration request failed';
const MISSING_DISCOUNT_CODE_ERROR_MESSAGE = 'Discount-code administration returned no discount code';

type DiscountCodeResponse = {
    readonly discountCode?: DiscountCode;
};

type DiscountCodeListResponse = {
    readonly discountCodes?: readonly DiscountCode[];
};

function buildDiscountCodeAdminApiUrl(discountCodeId?: string): string {
    return discountCodeId === undefined
        ? ADMIN_DISCOUNT_CODES_API_PATH
        : `${ADMIN_DISCOUNT_CODES_API_PATH}/${encodeURIComponent(discountCodeId)}`;
}

function createDiscountCodeMutation(method: 'POST' | 'PATCH', values: DiscountCodeValues): RequestInit {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    };
}

async function requestOneDiscountCode(url: string, requestOptions: RequestInit): Promise<DiscountCode> {
    const response = await requestJson<DiscountCodeResponse>(url, requestOptions, DISCOUNT_CODE_REQUEST_FAILURE_MESSAGE);
    if (response.discountCode === undefined) {
        throw new Error(MISSING_DISCOUNT_CODE_ERROR_MESSAGE);
    }

    return response.discountCode;
}

export async function fetchAdminDiscountCodes(): Promise<readonly DiscountCode[]> {
    const response = await requestJson<DiscountCodeListResponse>(
        buildDiscountCodeAdminApiUrl(),
        undefined,
        DISCOUNT_CODE_REQUEST_FAILURE_MESSAGE,
    );

    return response.discountCodes ?? [];
}

export async function createAdminDiscountCode(values: DiscountCodeValues): Promise<DiscountCode> {
    return requestOneDiscountCode(buildDiscountCodeAdminApiUrl(), createDiscountCodeMutation('POST', values));
}

export async function updateAdminDiscountCode(
    discountCodeId: string,
    values: DiscountCodeValues,
): Promise<DiscountCode> {
    return requestOneDiscountCode(
        buildDiscountCodeAdminApiUrl(discountCodeId),
        createDiscountCodeMutation('PATCH', values),
    );
}

export async function deleteAdminDiscountCode(discountCodeId: string): Promise<void> {
    await requestJson(
        buildDiscountCodeAdminApiUrl(discountCodeId),
        { method: 'DELETE' },
        DISCOUNT_CODE_REQUEST_FAILURE_MESSAGE,
    );
}
