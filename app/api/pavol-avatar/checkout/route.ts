import { NextResponse } from 'next/server';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { assertAvatarRequest, readAvatarJson } from '@/lib/pavol-avatar/config';
import { avatarCheckoutSchema, createAvatarCheckout, AvatarBillingError } from '@/lib/pavol-avatar/billing';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
export async function POST(request: Request) {
    try {
        assertAvatarRequest(request, true);
        const principal = await getAvatarPrincipal(request);
        if (!principal)
            return NextResponse.json({ error: 'Nejdřív ověřte svůj e-mail.' }, { status: 401, headers });
        const parsed = avatarCheckoutSchema.safeParse(await readAvatarJson(request));
        if (!parsed.success)
            return NextResponse.json({ error: 'Zkontrolujte fakturační údaje a souhlas s podmínkami avatara.' }, { status: 400, headers });
        return NextResponse.json({ url: await createAvatarCheckout(request, principal, parsed.data) }, { headers });
    }
    catch (error) {
        const status = error instanceof AvatarBillingError ? error.status : (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' ? error.status : 503);
        const message = error instanceof AvatarBillingError || status === 422 ? error instanceof Error ? error.message : 'Zkontrolujte formulář.' : 'Objednávku se nepodařilo otevřít. Zkuste to prosím znovu.';
        return NextResponse.json({ error: message }, { status, headers });
    }
}
