import { NextResponse } from 'next/server';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { assertAvatarRequest, getAvatarOrigin, getAvatarAvailability } from '@/lib/pavol-avatar/config';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { loadAvatarOrder, refreshAvatarOrder, AVATAR_ORDER_METADATA } from '@/lib/pavol-avatar/billing';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    const finish = (state: string) => { const response = NextResponse.redirect(new URL('/avatar?payment=' + state, getAvatarOrigin(request)), 303); response.headers.set('Cache-Control', 'private, no-store'); response.headers.set('Referrer-Policy', 'no-referrer'); return response; };
    try {
        assertAvatarRequest(request, false);
        const principal = await getAvatarPrincipal(request);
        if (!principal)
            return finish('verify-email');
        const id = new URL(request.url).searchParams.get('session_id') ?? '';
        if (!/^cs_[A-Za-z0-9_]{8,250}$/.test(id))
            return finish('unconfirmed');
        const gateway = getStripeGatewayOrNull();
        if (!gateway)
            return finish('unconfirmed');
        const session = await gateway.stripe.checkout.sessions.retrieve(id);
        const orderId = session.metadata?.[AVATAR_ORDER_METADATA];
        if (!orderId || session.livemode === getAvatarAvailability().isTest)
            return finish('unconfirmed');
        const db = getAvatarDatabase();
        const order = await loadAvatarOrder(db, orderId);
        if (!order || order.principal_id !== principal.id || order.stripe_session_id !== session.id)
            return finish('unconfirmed');
        await refreshAvatarOrder(db, gateway.stripe, order, { session });
        return finish(session.status === 'complete' && ['paid', 'no_payment_required'].includes(session.payment_status) ? 'confirmed' : 'pending');
    }
    catch {
        return finish('unconfirmed');
    }
}
