import { normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';

export const COMMUNITY_VERIFIED_EMAIL_COOKIE = 'community_verified_email';
const VERIFIED_EMAIL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function isCommunityEmailVerificationEnabled(): boolean {
    return process.env.COMMUNITY_EMAIL_VERIFICATION_ENABLED === 'true';
}

export function createCommunityEmailVerificationClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && anonKey
        ? createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
        : null;
}

function signVerifiedEmail(payload: string): string | null {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return key ? createHmac('sha256', key).update('promptbook:community-email:v1:').update(payload).digest('hex') : null;
}

export function writeVerifiedCommunityEmailCookie(response: NextResponse, email: string): boolean {
    const expiry = Date.now() + VERIFIED_EMAIL_MAX_AGE_SECONDS * 1000;
    const payload = Buffer.from(JSON.stringify([normalizeCommunityMemberEmail(email), expiry]), 'utf8').toString('base64url');
    const signature = signVerifiedEmail(payload);
    if (signature === null) {
        return false;
    }

    response.cookies.set(COMMUNITY_VERIFIED_EMAIL_COOKIE, `${payload}.${signature}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: VERIFIED_EMAIL_MAX_AGE_SECONDS,
    });
    return true;
}

export function readVerifiedCommunityEmail(value: string | undefined): string | null {
    if (!value || value.length > 1024) {
        return null;
    }
    const [payload, signature, extra] = value.split('.');
    if (extra !== undefined || !payload || !signature || !/^[a-f0-9]{64}$/.test(signature)) {
        return null;
    }
    const expected = signVerifiedEmail(payload);
    if (expected === null || !timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
        return null;
    }

    try {
        const [email, expiry] = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as [string, number];
        return typeof email === 'string' && Number.isSafeInteger(expiry) && expiry > Date.now() ? email : null;
    } catch {
        return null;
    }
}

export function isCommunityEmailVerificationRequired(
    request: { readonly cookies: { get(name: string): { value: string } | undefined } },
    email: string,
): boolean {
    return isCommunityEmailVerificationEnabled() &&
        readVerifiedCommunityEmail(request.cookies.get(COMMUNITY_VERIFIED_EMAIL_COOKIE)?.value) !== normalizeCommunityMemberEmail(email);
}
