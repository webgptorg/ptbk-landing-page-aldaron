import { BILLING_ORDER_ID_PATTERN } from '@/lib/promptbook-billing/billingAccess';
import { createPromptbookOrderConfirmation } from '@/lib/promptbook-billing/billingConfirmation';
import {
    loadAuthorizedBillingOrders,
    MEMBER_RESPONSE_HEADERS,
    memberResponse,
    rejectCrossSiteMemberRequest,
} from '@/lib/promptbook-billing/memberAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) return rejected;
    const id = request.nextUrl.searchParams.get('id');
    if (!id || !BILLING_ORDER_ID_PATTERN.test(id)) {
        return memberResponse({ error: 'Potvrzení objednávky jsme nenašli.' }, 404);
    }
    try {
        const order = (await loadAuthorizedBillingOrders(request)).find((entry) => entry.id === id);
        if (!order) return memberResponse({ error: 'Potvrzení objednávky jsme nenašli.' }, 404);
        const html = createPromptbookOrderConfirmation(order);
        if (!html) return memberResponse({ error: 'Potvrzení objednávky jsme nenašli.' }, 404);
        return new NextResponse(html, {
            headers: {
                ...MEMBER_RESPONSE_HEADERS,
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="promptbook-objednavka-${order.id}.html"`,
                'X-Content-Type-Options': 'nosniff',
                'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; sandbox",
            },
        });
    } catch {
        return memberResponse({ error: 'Potvrzení teď nelze stáhnout. Zkuste to za chvíli.' }, 503);
    }
}
