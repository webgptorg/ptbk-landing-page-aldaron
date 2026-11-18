import { NextRequest } from 'next/server';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { isLicenseAppRequest } from '@/lib/promptbook-licensing/appAuthentication';
import { licenseDatabase, licenseSnapshot, type LicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { z } from 'zod';
import { readBoundedJson } from '@/lib/api/readBoundedJson';
import { allowPublicChatRequest } from '@/lib/messages/publicChatRateLimit';
import { LicenseAccountBackfillRequired, lookupLicenseByEmail } from '@/lib/promptbook-licensing/lookup';
import { licenseLookupRequestSchema } from '@/lib/promptbook-licensing/lookupContract';
export async function GET(request: NextRequest) {
    if (!isLicenseAppRequest(request)) return memberResponse({ error: 'Unauthorized' }, 401);
    const subject = z.string().uuid().safeParse(request.nextUrl.searchParams.get('subject'));
    if (!subject.success) return memberResponse({ error: 'Invalid subject' }, 400);
    try {
        const result = await licenseDatabase()
            .from('promptbook_license_accounts')
            .select('*')
            .eq('id', subject.data)
            .eq('is_test', false)
            .maybeSingle<LicenseAccount>();
        if (result.error) throw new Error('Lookup failed');
        if (!result.data) return memberResponse({ error: 'Not found' }, 404);
        return memberResponse(await licenseSnapshot(result.data));
    } catch {
        return memberResponse({ error: 'Temporarily unavailable' }, 503);
    }
}

/** V0 badge lookup for a verified App identity. The original GET snapshot contract stays intact. */
export async function POST(request: NextRequest) {
    if (!isLicenseAppRequest(request)) return memberResponse({ error: 'Unauthorized' }, 401);
    // Reuse the existing bounded per-instance limiter; no email, token or user content is retained as a key.
    if (!allowPublicChatRequest('promptbook-app-license-lookup', 3000)) {
        const response = memberResponse({ error: 'Too many requests' }, 429);
        response.headers.set('Retry-After', '300');
        return response;
    }
    if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
        return memberResponse({ error: 'Invalid request' }, 400);
    }
    const input = licenseLookupRequestSchema.safeParse(await readBoundedJson(request, 2048));
    if (!input.success) return memberResponse({ error: 'Invalid request' }, 400);
    try {
        return memberResponse(await lookupLicenseByEmail(input.data.email));
    } catch (error) {
        return memberResponse(error instanceof LicenseAccountBackfillRequired
            ? { error: 'Temporarily unavailable', code: 'license_account_backfill_required' }
            : { error: 'Temporarily unavailable' }, 503);
    }
}
