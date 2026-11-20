import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { getUnauthorizedLicenseAppResponse } from '@/lib/promptbook-licensing/appAuthentication';
import { licenseDatabase, type LicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { licenseExchangeRequestSchema, licenseExchangeResponseSchema } from '@/lib/promptbook-licensing/exchangeContract';
export async function POST(request: NextRequest) {
    const rejected = await getUnauthorizedLicenseAppResponse(request, 'identity:exchange');
    if (rejected) return rejected;
    const parsed = licenseExchangeRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return memberResponse({ error: 'Invalid ticket' }, 400);
    try {
        const database = licenseDatabase();
        const claimed = await database
            .from('promptbook_app_tickets')
            .update({ consumed_at: new Date().toISOString() })
            .eq('token_hash', createHash('sha256').update(parsed.data.code).digest('hex'))
            .eq('challenge', parsed.data.challenge)
            .is('consumed_at', null)
            .gt('expires_at', new Date().toISOString())
            .select('account_id')
            .maybeSingle();
        if (claimed.error) throw new Error('Claim unavailable');
        if (!claimed.data) return memberResponse({ error: 'Invalid ticket' }, 403);
        const account = await database
            .from('promptbook_license_accounts')
            .select('*')
            .eq('id', claimed.data.account_id)
            .eq('is_test', false)
            .single<LicenseAccount>();
        if (account.error) throw new Error('Account unavailable');
        // Mailbox ownership was verified by the website, not asserted by a purchase form.
        return memberResponse(licenseExchangeResponseSchema.parse({ version: 1, subject: account.data.id, email: account.data.email, emailVerified: true }));
    } catch {
        return memberResponse({ error: 'Temporarily unavailable' }, 503);
    }
}
