import { NextRequest } from 'next/server';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { isLicenseAppRequest } from '@/lib/promptbook-licensing/appAuthentication';
import { licenseDatabase, licenseSnapshot, type LicenseAccount } from '@/lib/promptbook-licensing/accounts';
import { z } from 'zod';
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
