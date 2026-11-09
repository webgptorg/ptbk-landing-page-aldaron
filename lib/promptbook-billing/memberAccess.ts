import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { createCommunityEmailVerificationClient } from '@/lib/community-membership/communityMembershipIdentity';
import { getStripeConfigurationOrNull } from '@/lib/payments/stripeConfiguration';
import { getAuthorizedOrderIds } from '@/lib/promptbook-billing/billingAccess';
import { getBillingDatabase, PROMPTBOOK_ORDERS_TABLE, type PromptbookOrder } from '@/lib/promptbook-billing/billingOrders';
import { getBillingOrigin, getBillingSetting } from '@/lib/promptbook-billing/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const MEMBERSHIP_EMAIL_COOKIE = 'promptbook_billing_email';
const MEMBERSHIP_EMAIL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const MEMBER_RESPONSE_HEADERS = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };

export function memberResponse(data: object, status = 200): NextResponse {
    return NextResponse.json(data, { status, headers: MEMBER_RESPONSE_HEADERS });
}

export function rejectCrossSiteMemberRequest(request: NextRequest): NextResponse | null {
    return getCrossSiteResponseOrNull(request) ? memberResponse({ error: 'Požadavek z jiné stránky byl odmítnut.' }, 403) : null;
}

export function getMemberEmailAuth() {
    if (getBillingSetting('PROMPTBOOK_BILLING_EMAIL_VERIFICATION_ENABLED') !== 'true' || !emailAccessSecret()) {
        return null;
    }

    return createCommunityEmailVerificationClient()?.auth ?? null;
}

function emailAccessSecret(): string | null {
    const secret = getBillingSetting('PROMPTBOOK_BILLING_ACCESS_SECRET');
    return secret.length >= 32 ? secret : null;
}

function signMemberEmail(payload: string): Buffer | null {
    const secret = emailAccessSecret();
    return secret ? createHmac('sha256', secret).update('promptbook:billing-email:v1:').update(payload).digest() : null;
}

export function writeMemberEmailCookie(request: NextRequest, response: NextResponse, email: string): boolean {
    const expiresAt = Date.now() + MEMBERSHIP_EMAIL_COOKIE_MAX_AGE_SECONDS * 1000;
    const payload = Buffer.from(JSON.stringify({ email, expiresAt }), 'utf8').toString('base64url');
    const signature = signMemberEmail(payload);
    if (signature === null) {
        return false;
    }

    response.cookies.set(MEMBERSHIP_EMAIL_COOKIE, `${payload}.${signature.toString('hex')}`, {
        httpOnly: true,
        secure: getBillingOrigin(request).startsWith('https:'),
        sameSite: 'lax',
        path: '/api/promptbook-billing',
        maxAge: MEMBERSHIP_EMAIL_COOKIE_MAX_AGE_SECONDS,
    });
    return true;
}

function readMemberEmailCookie(request: NextRequest): string | null {
    const value = request.cookies.get(MEMBERSHIP_EMAIL_COOKIE)?.value;
    if (!value || value.length > 512 || !getMemberEmailAuth()) {
        return null;
    }

    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra !== undefined || !/^[a-f0-9]{64}$/.test(signature)) {
        return null;
    }

    const expected = signMemberEmail(payload);
    if (!expected || !timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
        return null;
    }

    try {
        const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!decoded || typeof decoded !== 'object' || !('email' in decoded) || !('expiresAt' in decoded)) {
            return null;
        }
        const { email, expiresAt } = decoded;
        return typeof email === 'string' && typeof expiresAt === 'number' && Number.isSafeInteger(expiresAt) &&
            expiresAt > Date.now() ? email : null;
    } catch {
        return null;
    }
}

export function getMemberBillingContext() {
    const database = getBillingDatabase();
    const stripe = getStripeConfigurationOrNull();
    return database && stripe ? { database, isTest: stripe.isTestMode } : null;
}

/** Checked independently so cookies for one browser purchase cannot expose other orders with the same e-mail. */
export async function loadAuthorizedBillingOrders(request: NextRequest): Promise<PromptbookOrder[]> {
    const orderIds = getAuthorizedOrderIds(request);
    const verifiedEmail = readMemberEmailCookie(request);
    if (orderIds.length === 0 && !verifiedEmail) {
        return [];
    }

    const context = getMemberBillingContext();
    if (!context) {
        throw new Error('Promptbook billing storage is unavailable');
    }

    const { database, isTest } = context;
    const purchaseOrders = orderIds.length > 0
        ? database.from(PROMPTBOOK_ORDERS_TABLE).select('*').eq('is_test', isTest).in('id', orderIds)
        : Promise.resolve({ data: [], error: null });
    const emailOrders = verifiedEmail
        ? database.from(PROMPTBOOK_ORDERS_TABLE).select('*').eq('is_test', isTest).eq('email', verifiedEmail)
            .not('stripe_customer_id', 'is', null).neq('status', 'pending').order('created_at', { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null });
    const [purchases, recovered] = await Promise.all([purchaseOrders, emailOrders]);
    if (purchases.error || recovered.error) {
        throw new Error('Promptbook billing orders could not be read');
    }

    const orders = new Map<string, PromptbookOrder>();
    for (const order of [...(purchases.data ?? []), ...(recovered.data ?? [])] as PromptbookOrder[]) {
        if (order.stripe_session_id) {
            orders.set(order.id, order);
        }
    }
    return Array.from(orders.values()).sort((left, right) => right.created_at.localeCompare(left.created_at));
}
