import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { PROMPTBOOK_ORDERS_TABLE } from '@/lib/promptbook-billing/billingOrders';
import {
    getMemberBillingContext,
    getMemberEmailAuth,
    memberResponse,
    rejectCrossSiteMemberRequest,
    writeMemberEmailCookie,
} from '@/lib/promptbook-billing/memberAccess';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().max(254).refine(isEmailAddressValid);
const accessSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('send'), email: emailSchema }),
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
        const { database, isTest } = context;
        const { data, error } = await database.from(PROMPTBOOK_ORDERS_TABLE).select('id')
            .eq('is_test', isTest).eq('email', email).not('stripe_customer_id', 'is', null)
            .neq('status', 'pending').limit(1);
        if (error) {
            return memberResponse({ error: 'Kód teď nelze odeslat. Zkuste to za chvíli.' }, 503);
        }
        if (data?.length) {
            // Same public response for known and unknown addresses. Provider limits still apply to sending.
            await auth.signInWithOtp({ email }).catch(() => undefined);
        }
        return memberResponse({ isCodeSent: true });
    }

    const { data, error } = await auth.verifyOtp({ email, token: parsed.data.code, type: 'email' });
    if (error || !data.user?.email_confirmed_at || data.user.email?.trim().toLowerCase() !== email) {
        return memberResponse({ error: 'Kód je neplatný nebo jeho platnost vypršela.' }, error?.status === 429 ? 429 : 403);
    }

    const response = memberResponse({ isVerified: true });
    return writeMemberEmailCookie(request, response, email)
        ? response
        : memberResponse({ error: 'Přihlášení se nepodařilo uložit.' }, 503);
}
