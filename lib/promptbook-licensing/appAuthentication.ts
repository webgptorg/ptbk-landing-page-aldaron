import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { acceptsApiKey } from '@/lib/ecosystem-api/keys';
import type { ApiScope } from '@/lib/ecosystem-api/contract';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';

/** Managed ecosystem keys, with compatibility for the existing server-to-server integration. */
export async function isLicenseAppRequest(request: Request, scope: ApiScope = 'licenses:read'): Promise<boolean> {
    const expected = process.env.PROMPTBOOK_APP_LICENSE_SECRET?.trim();
    const value = request.headers.get('authorization');
    if (!value?.startsWith('Bearer ')) return false;
    const token = value.slice(7);
    // A managed key can never bypass revocation through the legacy environment variable.
    if (token.startsWith('ptbk_')) return acceptsApiKey(token, scope);
    if (!expected || expected.length < 32) return false;
    const supplied = Buffer.from(value.slice(7));
    const secret = Buffer.from(expected);
    return supplied.length === secret.length && timingSafeEqual(supplied, secret);
}

export async function getUnauthorizedLicenseAppResponse(request: Request, scope: ApiScope = 'licenses:read') {
    try { return await isLicenseAppRequest(request, scope) ? null : memberResponse({ error: 'Unauthorized' }, 401); }
    catch { return memberResponse({ error: 'Temporarily unavailable' }, 503); }
}
