import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { getEmailLoginOrigin, safeEmailReturnPath } from '@/lib/auth/emailLogin';
import { emailLoginDocument } from '@/lib/auth/emailLoginDocument';
import { ensureLicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { getMemberEmailAuth, writeMemberEmailCookie } from '@/lib/promptbook-billing/memberAccess';
import { createCommunityEmailVerificationClient, isCommunityEmailVerificationEnabled, writeVerifiedCommunityEmailCookie } from '@/lib/community-membership/communityMembershipIdentity';
import { assertAvatarRequest, AvatarError } from '@/lib/pavol-avatar/config';
import { allowAvatarAuthAttempt, createAvatarSession, verifyAvatarEmail } from '@/lib/pavol-avatar/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    'X-Content-Type-Options': 'nosniff',
};
const schema = z.object({
    flow: z.enum(['billing', 'avatar', 'community']),
    next: z.string().max(4096),
    tokenHash: z.string().regex(/^[a-zA-Z0-9_-]{20,256}$/),
}).strict();

function reply(body: object, status = 200) {
    return NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
}

/** GET/HEAD never verify or consume the single-use credential. It arrives only in the URL fragment. */
export function GET() {
    const nonce = randomBytes(18).toString('base64');
    return new NextResponse(emailLoginDocument(nonce), { headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; script-src 'nonce-" + nonce +
            "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    } });
}

export async function POST(request: NextRequest) {
    if (getCrossSiteResponseOrNull(request)) return reply({ error: 'Požadavek z jiné stránky byl odmítnut.' }, 403);
    try {
        const origin = getEmailLoginOrigin(request);
        // This endpoint is called only by the callback page, including behind a same-origin reverse proxy.
        if (request.headers.get('origin') !== origin) return reply({ error: 'Požadavek z jiné stránky byl odmítnut.' }, 403);
        const parsed = schema.safeParse(await readJsonObjectOrNull(request));
        if (!parsed.success) return reply({ error: 'Odkaz je neplatný.' }, 400);
        const { flow, tokenHash } = parsed.data;
        const returnTo = safeEmailReturnPath(parsed.data.next, origin);
        if (flow === 'avatar') {
            assertAvatarRequest(request);
            await allowAvatarAuthAttempt(request);
            const email = await verifyAvatarEmail({ tokenHash });
            const response = reply({ isVerified: true, returnTo });
            await createAvatarSession(request, response, email);
            return response;
        }
        if (flow === 'community' && (!isCommunityEmailVerificationEnabled() || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
            return reply({ error: 'Ověření e-mailu teď není dostupné.' }, 503);
        }
        const auth = flow === 'billing' ? getMemberEmailAuth() : createCommunityEmailVerificationClient()?.auth;
        if (!auth) return reply({ error: 'Přihlášení e-mailem teď není dostupné.' }, 503);
        const { data, error } = await auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
        const email = data.user?.email?.trim().toLowerCase();
        if (error || !email || !data.user?.email_confirmed_at) {
            return reply({ error: 'Odkaz je neplatný nebo jeho platnost vypršela.' }, error?.status === 429 ? 429 : 403);
        }
        if (flow === 'billing') await ensureLicenseAccount(email);
        const response = reply({ isVerified: true, returnTo });
        const saved = flow === 'billing' ? writeMemberEmailCookie(request, response, email)
            : writeVerifiedCommunityEmailCookie(response, email);
        return saved ? response : reply({ error: 'Přihlášení se nepodařilo uložit.' }, 503);
    } catch (error) {
        return reply({ error: error instanceof AvatarError ? error.message : 'Přihlášení teď není dostupné.' },
            error instanceof AvatarError ? error.status : 503);
    }
}
