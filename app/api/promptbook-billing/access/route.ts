import { createEmailLoginRedirect } from '@/lib/auth/emailLogin';
import { ensureLicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { PROMPTBOOK_ORDERS_TABLE } from '@/lib/promptbook-billing/billingOrders';
import { PROMPTBOOK_MEMBER_PATH } from '@/lib/promptbook-billing/config';
import {
    getMemberBillingContext,
    getMemberEmailAuth,
    memberResponse,
    rejectCrossSiteMemberRequest,
    writeMemberEmailCookie,
    MEMBERSHIP_EMAIL_COOKIE,
} from '@/lib/promptbook-billing/memberAccess';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

/** Clear verified membership and this browser's purchase receipts together. */
export async function DELETE(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) return rejected;
    const response = memberResponse({ signedOut: true });
    response.cookies.set(MEMBERSHIP_EMAIL_COOKIE, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' });
    for (const cookie of request.cookies.getAll()) {
        if (/^ptbk_order_[0-9a-f-]{36}$/i.test(cookie.name)) {
            response.cookies.set(cookie.name, '', { path: '/api/promptbook-billing', maxAge: 0, httpOnly: true, sameSite: 'lax' });
        }
    }
    return response;
}

const emailSchema = z.string().trim().toLowerCase().max(254).refine(isEmailAddressValid);
const accessSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('send'), email: emailSchema, returnTo: z.string().max(4096).optional() }),
    z.object({ action: z.literal('verify'), email: emailSchema, code: z.string().trim().regex(/^\d{6,10}$/) }),
]);

export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) {
        return rejected;
    }

    const parsed = accessSchema.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) {
        return memberResponse({ error: 'Zkontrolujte e-mail nebo ověřovací kód.' }, 400);
    }
    const context = getMemberBillingContext();
    const auth = getMemberEmailAuth();
    if (!context || !auth) {
        return memberResponse({ error: 'Přihlášení e-mailem teď není dostupné.' }, 503);
    }

    const { email, action } = parsed.data;
    if (action === 'send') {
        // The same verified identity serves new trials and purchases; never disclose whether an address is known.
        try {
            // Both the clickable link and numeric code use the same single-use Supabase credential.
            const { error } = await auth.signInWithOtp({
                email,
                options: { emailRedirectTo: createEmailLoginRedirect(request, 'billing', PROMPTBOOK_MEMBER_PATH, parsed.data.returnTo).href },
            });
            if (!error) return memberResponse({ isCodeSent: true });
            return memberResponse({ error: 'Kód se nepodařilo odeslat. Zkuste to prosím později.' }, error.status === 429 ? 429 : 503);
        } catch {
            return memberResponse({ error: 'Kód se nepodařilo odeslat. Zkuste to prosím později.' }, 503);
        }
    }

    let result: Awaited<ReturnType<typeof auth.verifyOtp>>;
    try {
        result = await auth.verifyOtp({ email, token: parsed.data.code, type: 'email' });
    } catch {
        return memberResponse({ error: 'Kód se teď nepodařilo ověřit. Zkuste to prosím znovu.' }, 503);
    }
    const { data, error } = result;
    if (error || !data.user?.email_confirmed_at || data.user.email?.trim().toLowerCase() !== email) {
        return memberResponse({ error: 'Kód je neplatný nebo jeho platnost vypršela.' }, error?.status === 429 ? 429 : 403);
    }

    try { await ensureLicenseAccount(email); } catch { return memberResponse({ error: 'Účet se nepodařilo připravit. Zkuste přihlášení znovu.' }, 503); }
    const response = memberResponse({ isVerified: true });
    return writeMemberEmailCookie(request, response, email)
        ? response
        : memberResponse({ error: 'Přihlášení se nepodařilo uložit.' }, 503);
}
