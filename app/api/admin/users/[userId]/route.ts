import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { adminUserErrorResponse, adminUserResponse } from '@/lib/admin/adminUserApi';
import { getAdminUserDatabase, mapAdminUser, throwAdminUserDatabaseError } from '@/lib/admin/adminUserDatabase';
import { hashAdminUserPassword } from '@/lib/admin/adminUserPassword';
import { ADMIN_USER_PUBLIC_COLUMNS, ADMIN_USER_TABLE_NAME, adminUserUpdateSchema } from '@/lib/admin/adminUserSchemas';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest } from 'next/server';
import { z } from 'zod';

type UserContext = { readonly params: Promise<{ readonly userId: string }> };

export async function PATCH(request: NextRequest, context: UserContext) {
    const refused = await getUnauthorizedResponseOrNull(request);
    if (refused) return refused;
    const { userId } = await context.params;
    if (!z.string().uuid().safeParse(userId).success) return adminUserResponse({ error: 'Neplatný účet.' }, 400);
    const parsed = adminUserUpdateSchema.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return adminUserResponse({ error: parsed.error.issues[0]?.message ?? 'Neplatný účet.' }, 400);
    try {
        const values: Record<string, unknown> = {};
        if (parsed.data.username !== undefined) values.username = parsed.data.username;
        if (parsed.data.permissions !== undefined) values.permissions = parsed.data.permissions;
        if (parsed.data.isEnabled !== undefined) values.is_enabled = parsed.data.isEnabled;
        if (parsed.data.password !== undefined) values.password_hash = await hashAdminUserPassword(parsed.data.password);
        const { data, error } = await getAdminUserDatabase().from(ADMIN_USER_TABLE_NAME).update(values)
            .eq('id', userId).select(ADMIN_USER_PUBLIC_COLUMNS).maybeSingle();
        throwAdminUserDatabaseError(error);
        return data ? adminUserResponse({ user: mapAdminUser(data) }) : adminUserResponse({ error: 'Účet nebyl nalezen.' }, 404);
    } catch (error) { return adminUserErrorResponse(error); }
}

export async function DELETE(request: NextRequest, context: UserContext) {
    const refused = await getUnauthorizedResponseOrNull(request);
    if (refused) return refused;
    const { userId } = await context.params;
    if (!z.string().uuid().safeParse(userId).success) return adminUserResponse({ error: 'Neplatný účet.' }, 400);
    try {
        const { data, error } = await getAdminUserDatabase().from(ADMIN_USER_TABLE_NAME).delete()
            .eq('id', userId).select('id').maybeSingle();
        throwAdminUserDatabaseError(error);
        return data ? adminUserResponse({ isDeleted: true }) : adminUserResponse({ error: 'Účet nebyl nalezen.' }, 404);
    } catch (error) { return adminUserErrorResponse(error); }
}
