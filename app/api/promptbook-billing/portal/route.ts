import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { getBillingOrigin, getBillingSetting, PROMPTBOOK_MEMBER_PATH } from '@/lib/promptbook-billing/config';
import {
    loadAuthorizedBillingOrders,
    memberResponse,
    rejectCrossSiteMemberRequest,
} from '@/lib/promptbook-billing/memberAccess';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) {
        return rejected;
    }
    const parsed = requestSchema.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) {
        return memberResponse({ error: 'Vyberte předplatné.' }, 400);
    }

    const gateway = getStripeGatewayOrNull();
    const configuration = getBillingSetting('PROMPTBOOK_BILLING_PORTAL_CONFIGURATION_ID');
    if (!gateway || !configuration) {
        return memberResponse({ error: 'Správa platby teď není dostupná.' }, 503);
    }

    try {
        const order = (await loadAuthorizedBillingOrders(request)).find(({ id }) => id === parsed.data.id);
        if (!order?.stripe_customer_id || order.status === 'pending') {
            return memberResponse({ error: 'Předplatné jsme nenašli.' }, 404);
        }

        const portal = await gateway.stripe.billingPortal.sessions.create({
            customer: order.stripe_customer_id,
            configuration,
            return_url: new URL(PROMPTBOOK_MEMBER_PATH, getBillingOrigin(request)).href,
        });
        return memberResponse({ url: portal.url });
    } catch {
        return memberResponse({ error: 'Správu platby se nepodařilo otevřít. Zkuste to za chvíli.' }, 502);
    }
}
