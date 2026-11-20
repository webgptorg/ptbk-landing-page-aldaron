import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminIdentityForSession } from '@/lib/admin/adminIdentity';
import { hasAdminPermission } from '@/lib/admin/adminPermissions';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { readBoundedJson } from '@/lib/api/readBoundedJson';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { apiKeyCreateSchema } from '@/lib/ecosystem-api/contract';
import { createApiKey, listApiKeys } from '@/lib/ecosystem-api/keys';

export async function GET(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    const offset = z.coerce.number().int().min(0).max(1_000_000).safeParse(request.nextUrl.searchParams.get('offset') ?? 0);
    if (!offset.success) return memberResponse({ error: 'Neplatná stránka.' }, 400);
    try {
        return memberResponse({ ...await listApiKeys(offset.data), legacyConfigured: (process.env.PROMPTBOOK_APP_LICENSE_SECRET?.trim().length ?? 0) >= 32 });
    } catch { return memberResponse({ error: 'API klíče nejsou dostupné.' }, 503); }
}

export async function POST(request: NextRequest) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    const input = apiKeyCreateSchema.safeParse(await readBoundedJson(request, 4096).catch(() => null));
    if (!input.success) return memberResponse({ error: 'Vyplňte název, oprávnění a platné datum expirace.' }, 400);
    try {
        const identity = await getAdminIdentityForSession(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value);
        if (!identity || !hasAdminPermission(identity, 'api-keys')) return memberResponse({ error: 'Forbidden' }, 403);
        return memberResponse(await createApiKey(input.data, identity.username), 201);
    } catch { return memberResponse({ error: 'API klíč nelze vytvořit.' }, 503); }
}
