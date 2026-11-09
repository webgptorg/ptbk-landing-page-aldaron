import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { getBillingSetting, getBillingOrigin } from './config';

const ORDER_COOKIE_PREFIX = 'ptbk_order_';
export const BILLING_ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function orderAccessSignature(id: string): string | null {
    const secret = getBillingSetting('PROMPTBOOK_BILLING_ACCESS_SECRET');
    if (secret.length < 32) return null;
    return createHmac('sha256', secret).update(`promptbook-order:${id}`).digest('hex');
}

export function getAuthorizedOrderIds(request: NextRequest): string[] {
    return request.cookies.getAll().flatMap(({ name, value }) => {
        if (!name.startsWith(ORDER_COOKIE_PREFIX)) return [];
        const id = name.slice(ORDER_COOKIE_PREFIX.length);
        const signature = BILLING_ORDER_ID_PATTERN.test(id) && orderAccessSignature(id);
        return signature && /^[a-f0-9]{64}$/.test(value) &&
            timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(value, 'hex')) ? [id] : [];
    }).slice(0, 30);
}

export function writeOrderAccessCookie(response: NextResponse, id: string, request?: Request): void {
    const signature = orderAccessSignature(id);
    if (!signature) return;
    response.cookies.set(`${ORDER_COOKIE_PREFIX}${id}`, signature, {
        httpOnly: true,
        secure: request ? getBillingOrigin(request).startsWith('https:') : process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/promptbook-billing',
        maxAge: 365 * 24 * 60 * 60,
    });
}
