import { writeOrderAccessCookie } from '@/lib/promptbook-billing/billingAccess';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as listMemberships } from '../membership/route';
import { GET as returnFromCheckout } from '../return/route';
import { POST } from './route';

const { loadOrdersById, createPortal } = vi.hoisted(() => ({
    loadOrdersById: vi.fn(),
    createPortal: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: () => ({
        from: () => ({ select: () => ({ eq: () => ({ in: loadOrdersById }) }) }),
    }),
}));
vi.mock('@/lib/payments/stripeGateway', () => ({
    getStripeGatewayOrNull: () => ({ stripe: { billingPortal: { sessions: { create: createPortal } } } }),
}));

const authorizedId = 'cf8a7c33-4e99-4b98-8e9e-3301743231d0';
const anotherId = '0dc8b7db-e045-42b1-b850-50faf3bc7f9b';
const stripeSessionId = 'cs_live_Licence';
const publicOrigin = 'https://www.ptbk.io';

function accessCookie() {
    const response = new NextResponse();
    writeOrderAccessCookie(response, authorizedId);
    return response.cookies.toString();
}

function portalRequest(id: string, cookie: string) {
    return new NextRequest(`${publicOrigin}/api/promptbook-billing/portal`, {
        method: 'POST',
        headers: { cookie, origin: publicOrigin, 'sec-fetch-site': 'same-origin' },
        body: JSON.stringify({ id }),
    });
}

describe('Promptbook subscription order access', () => {
    beforeEach(() => {
        vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_example');
        vi.stubEnv('PROMPTBOOK_BILLING_ACCESS_SECRET', 'a'.repeat(32));
        vi.stubEnv('PROMPTBOOK_BILLING_PORTAL_CONFIGURATION_ID', 'bpc_promptbook');
        createPortal.mockReset().mockResolvedValue({ url: 'https://billing.stripe.com/p/session/Example' });
        loadOrdersById.mockReset().mockResolvedValue({
            data: [{
                id: authorizedId,
                stripe_session_id: stripeSessionId,
                stripe_customer_id: 'cus_promptbook',
                email: 'customer@example.com',
                company_name: 'Test company',
                engine_version: '0.115.0-5',
                support_email: 'support@example.com',
                status: 'active',
            }],
            error: null,
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('opens the scoped portal only for a matching signed browser order', async () => {
        const response = await POST(portalRequest(authorizedId, accessCookie()));

        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(await response.json()).toEqual({ url: 'https://billing.stripe.com/p/session/Example' });
        expect(loadOrdersById).toHaveBeenCalledWith('id', [authorizedId]);
        expect(createPortal).toHaveBeenCalledWith({
            customer: 'cus_promptbook',
            configuration: 'bpc_promptbook',
            return_url: `${publicOrigin}/cs/pricing/predplatne`,
        });
    });

    it('refuses to create a portal session for another order or for a forged cookie', async () => {
        const unrelatedOrder = await POST(portalRequest(anotherId, accessCookie()));
        const forgedCookie = await POST(portalRequest(authorizedId, `ptbk_order_${authorizedId}=${'b'.repeat(64)}`));

        expect(unrelatedOrder.status).toBe(404);
        expect(forgedCookie.status).toBe(404);
        expect(createPortal).not.toHaveBeenCalled();
    });

    it('does not use a Checkout session link as proof of order access', async () => {
        const response = await returnFromCheckout(new NextRequest(
            `${publicOrigin}/api/promptbook-billing/return?session_id=${stripeSessionId}`,
        ));

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe(`${publicOrigin}/cs/pricing/predplatne`);
        expect(loadOrdersById).not.toHaveBeenCalled();
    });

    it('keeps customer and billing data out of the membership projection', async () => {
        const response = await listMemberships(new NextRequest(
            `${publicOrigin}/api/promptbook-billing/membership`, { headers: { cookie: accessCookie() } },
        ));

        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.memberships[0]).toMatchObject({ id: authorizedId, supportedVersion: '0.115.0-5' });
        expect(JSON.stringify(result)).not.toMatch(/cus_promptbook|customer@example\.com|Test company|cs_live_Licence/);
    });
});
