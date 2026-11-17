import 'server-only';
import type Stripe from 'stripe';
import { AvatarError } from './config';

export const AVATAR_REQUIRED_STRIPE_EVENTS = [
    'checkout.session.completed', 'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed', 'checkout.session.expired',
    'customer.subscription.updated', 'customer.subscription.deleted',
    'invoice.paid', 'invoice.payment_failed', 'charge.refunded',
] as const;
const TRUSTED_HOSTS = new Set(['ptbk.io','www.ptbk.io','pavolhejny.cz','www.pavolhejny.cz','pavolhejny.com','www.pavolhejny.com']);
function trustedWebhook(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && TRUSTED_HOSTS.has(parsed.hostname) &&
            parsed.pathname === '/api/stripe/webhook' && !parsed.username && !parsed.password &&
            !parsed.search && !parsed.hash && (!parsed.port || parsed.port === '443');
    } catch { return false; }
}
function suitable(endpoint: Stripe.WebhookEndpoint, isTest: boolean): boolean {
    return endpoint.status === 'enabled' && endpoint.livemode === !isTest && trustedWebhook(endpoint.url);
}
const complete = (events: readonly string[]) => events.includes('*') || AVATAR_REQUIRED_STRIPE_EVENTS.every(event => events.includes(event));
/**
 * Verify the already configured shared signed endpoint before creating any chargeable checkout.
 * Only append events to one unambiguous existing endpoint; never create an endpoint, rotate its
 * signing secret, change its URL/status, or modify an unrelated endpoint.
 */
export async function ensureAvatarStripeWebhook(stripe: Stripe, isTest: boolean): Promise<void> {
    const failure = () => new AvatarError('Nastavení plateb avatara se nepodařilo bezpečně ověřit. Zkuste to později nebo kontaktujte podporu.', 503);
    try {
        const explicit = process.env.PAVOL_AVATAR_STRIPE_WEBHOOK_URL?.trim();
        if (explicit && !trustedWebhook(explicit)) throw failure();
        const candidates: Stripe.WebhookEndpoint[] = [];
        let after: string | undefined;
        for (let page = 0; page < 20; page++) {
            const result = await stripe.webhookEndpoints.list({ limit: 100, ...(after ? { starting_after: after } : {}) });
            candidates.push(...result.data.filter(endpoint => suitable(endpoint, isTest) && (!explicit || endpoint.url === explicit)));
            if (!result.has_more) break;
            if (!result.data.length || page === 19) throw failure();
            after = result.data[result.data.length - 1].id;
        }
        if (candidates.length !== 1) throw failure();
        let endpoint = candidates[0];
        if (complete(endpoint.enabled_events)) return;
        // Refresh immediately before the additive update so another product's recent additions survive.
        endpoint = await stripe.webhookEndpoints.retrieve(endpoint.id);
        if (!suitable(endpoint, isTest) || endpoint.url !== candidates[0].url) throw failure();
        if (complete(endpoint.enabled_events)) return;
        const retained = [...endpoint.enabled_events];
        const enabled = Array.from(new Set([...retained, ...AVATAR_REQUIRED_STRIPE_EVENTS]));
        const updated = await stripe.webhookEndpoints.update(endpoint.id, {
            enabled_events: enabled as Stripe.WebhookEndpointUpdateParams.EnabledEvent[],
        });
        if (!suitable(updated, isTest) || updated.url !== endpoint.url || !complete(updated.enabled_events) ||
            !retained.every(event => updated.enabled_events.includes(event))) throw failure();
    } catch { throw failure(); }
}
