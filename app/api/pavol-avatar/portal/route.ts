import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { assertAvatarRequest, getAvatarOrigin, getAvatarAvailability, readAvatarJson } from '@/lib/pavol-avatar/config';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { getAvatarPortalConfiguration } from '@/lib/pavol-avatar/billing';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
export async function POST(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal) return NextResponse.json({ error: 'Nejdřív ověřte svůj e-mail.' }, { status: 401, headers });
        const parsed = z.object({ id: z.string().uuid() }).strict().safeParse(await readAvatarJson(request, 1024));
        if (!parsed.success) return NextResponse.json({ error: 'Vyberte předplatné avatara.' }, { status: 400, headers });
        const gateway = getStripeGatewayOrNull();
        if (!gateway) return NextResponse.json({ error: 'Správa předplatného není dostupná.' }, { status: 503, headers });
        const result = await getAvatarDatabase().from('avatar_orders').select('stripe_customer_id,stripe_subscription_id')
            .eq('id', parsed.data.id).eq('principal_id', principal.id).eq('is_test', getAvatarAvailability().isTest)
            .not('stripe_customer_id', 'is', null).maybeSingle();
        if (result.error) throw new Error('Order lookup failed');
        if (!result.data?.stripe_customer_id) return NextResponse.json({ error: 'Předplatné avatara jsme nenašli.' }, { status: 404, headers });
        const configuration = await getAvatarPortalConfiguration(getAvatarDatabase(), gateway.stripe, getAvatarAvailability().isTest);
        const portal = await gateway.stripe.billingPortal.sessions.create({ customer: result.data.stripe_customer_id, configuration, return_url: getAvatarOrigin(request) + '/avatar' });
        return NextResponse.json({ url: portal.url }, { headers });
    } catch (error) {
        const status = error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' ? error.status : 503;
        return NextResponse.json({ error: 'Správu předplatného se nepodařilo otevřít.' }, { status, headers });
    }
}
