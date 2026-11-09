import { getBillingOrigin, PROMPTBOOK_MEMBER_PATH } from '@/lib/promptbook-billing/config';
import {
    loadAuthorizedBillingOrders,
    MEMBER_RESPONSE_HEADERS,
} from '@/lib/promptbook-billing/memberAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const destination = new URL(PROMPTBOOK_MEMBER_PATH, getBillingOrigin(request));
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (sessionId && /^cs_(?:live|test)_[a-zA-Z0-9]{1,200}$/.test(sessionId)) {
        try {
            const order = (await loadAuthorizedBillingOrders(request)).find(({ stripe_session_id }) => stripe_session_id === sessionId);
            if (order?.status === 'pending') {
                destination.searchParams.set('stav', 'potvrzuji');
            }
        } catch {
            destination.searchParams.set('stav', 'potvrzuji');
        }
    }

    // The redirect only controls the waiting message. Stripe's signed webhook records the payment.
    return NextResponse.redirect(destination, { status: 303, headers: MEMBER_RESPONSE_HEADERS });
}
