import { createHash, randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { memberResponse, rejectCrossSiteMemberRequest } from '@/lib/promptbook-billing/memberAccess';
import { licenseDatabase, verifiedLicenseAccount } from '@/lib/promptbook-licensing/accounts';
const schema = z.object({ challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict();
export async function POST(request: NextRequest) {
    const rejected = rejectCrossSiteMemberRequest(request);
    if (rejected) return rejected;
    if (!process.env.PROMPTBOOK_APP_LICENSE_SECRET)
        return memberResponse({ error: 'Vzdálenou appku připravujeme.' }, 503);
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return memberResponse({ error: 'Invalid challenge' }, 400);
    try {
        const account = await verifiedLicenseAccount(request);
        if (!account || account.is_test) return memberResponse({ error: 'Nejdříve ověřte svůj e-mail.' }, 401);
        const code = randomBytes(32).toString('base64url');
        const result = await licenseDatabase()
            .from('promptbook_app_tickets')
            .insert({
                token_hash: createHash('sha256').update(code).digest('hex'),
                account_id: account.id,
                challenge: parsed.data.challenge,
                expires_at: new Date(Date.now() + 60_000).toISOString(),
            });
        if (result.error) throw new Error('Ticket unavailable');
        return memberResponse({ url: `https://app.ptbk.io/api/website-access/return?code=${code}` });
    } catch {
        return memberResponse({ error: 'Přechod do appky se nepodařil.' }, 503);
    }
}
