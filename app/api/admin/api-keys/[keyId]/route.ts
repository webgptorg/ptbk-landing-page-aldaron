import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getAdminIdentityForSession } from '@/lib/admin/adminIdentity';
import { hasAdminPermission } from '@/lib/admin/adminPermissions';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { memberResponse } from '@/lib/promptbook-billing/memberAccess';
import { revokeApiKey } from '@/lib/ecosystem-api/keys';

export async function DELETE(request: NextRequest, context: { params: Promise<{ keyId: string }> }) {
    const rejected = await getUnauthorizedResponseOrNull(request);
    if (rejected) return rejected;
    const id = z.string().uuid().safeParse((await context.params).keyId);
    if (!id.success) return memberResponse({ error: 'Neplatný klíč.' }, 400);
    try {
        const identity = await getAdminIdentityForSession(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value);
        if (!identity || !hasAdminPermission(identity, 'api-keys')) return memberResponse({ error: 'Forbidden' }, 403);
        return await revokeApiKey(id.data, identity.username)
            ? memberResponse({ revoked: true }) : memberResponse({ error: 'Klíč nebyl nalezen.' }, 404);
    } catch { return memberResponse({ error: 'API klíč nelze zneplatnit.' }, 503); }
}
