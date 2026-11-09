import {
    activateCommunityMembershipFromCheckoutSession,
    applyCommunityMembershipSubscriptionChange,
} from '@/lib/community-membership/communityMembershipActivation';
import { cancelFailedCommunityMembershipCheckout, getCommunityMembershipDatabaseOrNull } from '@/lib/community-membership/communityMembershipDatabase';
import { applyPromptbookBillingEvent, getPromptbookBillingEvent } from '@/lib/promptbook-billing/billingEvents';
import { getStripeGatewayOrNull, type StripeGateway } from '@/lib/payments/stripeGateway';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

const STRIPE_SIGNATURE_HEADER_NAME = 'stripe-signature';

/**
 * What the gate tells this application about, which is a finished checkout and every later decision about the
 * subscription that checkout created. Everything else the gate may be configured to send is acknowledged and ignored.
 */
const HANDLED_STRIPE_EVENT_TYPES = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
] as const;

async function handleStripeEvent(
    gateway: StripeGateway,
    supabase: SupabaseClient,
    event: Stripe.Event,
): Promise<{ readonly errorMessage: string | null }> {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const { errorMessage } = await activateCommunityMembershipFromCheckoutSession(
            gateway,
            supabase,
            event.data.object,
        );
        return { errorMessage };
    }

    if (event.type === 'checkout.session.async_payment_failed') {
        return cancelFailedCommunityMembershipCheckout(supabase, event.data.object.id);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        return applyCommunityMembershipSubscriptionChange(supabase, event.data.object);
    }

    return { errorMessage: null };
}

/**
 * The one address the payment gate reports to.
 *
 * Note: A webhook is believed only because it is signed with the secret of this gate, never because it reached this
 *       address. An event which fails that check is refused without being read at all.
 *
 * Note: A refused event is answered with a failure on purpose, because the gate then delivers it again. Acknowledging
 *       an event this server could not record would lose a payment which was really made.
 */
export async function POST(request: NextRequest) {
    const gateway = getStripeGatewayOrNull();
    if (gateway === null || gateway.configuration.webhookSigningSecret === null) {
        console.error('A Stripe webhook arrived without STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SIGNING_SECRET being set.');
        return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
    }

    const signature = request.headers.get(STRIPE_SIGNATURE_HEADER_NAME);
    if (signature === null) {
        return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = await gateway.stripe.webhooks.constructEventAsync(
            await request.text(),
            signature,
            gateway.configuration.webhookSigningSecret,
        );
    } catch (error) {
        console.error('Refused a Stripe webhook with an invalid signature:', error);
        return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
    }

    try {
        const promptbookEvent = await getPromptbookBillingEvent(gateway.stripe, event);
        if (promptbookEvent) {
            const database = getCommunityMembershipDatabaseOrNull();
            if (!database) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
            await applyPromptbookBillingEvent(database, gateway.stripe, promptbookEvent, event);
            return NextResponse.json({ isReceived: true });
        }
    } catch (error) {
        console.error(`Failed to record the Promptbook Stripe event ${event.type}:`, error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ error: 'Stripe event could not be recorded' }, { status: 500 });
    }

    if (!HANDLED_STRIPE_EVENT_TYPES.includes(event.type as (typeof HANDLED_STRIPE_EVENT_TYPES)[number])) {
        return NextResponse.json({ isReceived: true });
    }

    const supabase = getCommunityMembershipDatabaseOrNull();
    if (supabase === null) {
        console.error('A Stripe webhook could not be recorded, because the database needs SUPABASE_SERVICE_ROLE_KEY.');
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { errorMessage } = await handleStripeEvent(gateway, supabase, event);
    if (errorMessage !== null) {
        console.error(`Failed to record the Stripe event ${event.type}: ${errorMessage}`);
        return NextResponse.json({ error: 'Stripe event could not be recorded' }, { status: 500 });
    }

    return NextResponse.json({ isReceived: true });
}
