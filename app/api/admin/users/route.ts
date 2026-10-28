import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { adminUserErrorResponse, adminUserResponse } from '@/lib/admin/adminUserApi';
import { getAdminUserDatabase, loadAdminUsers, mapAdminUser, throwAdminUserDatabaseError } from '@/lib/admin/adminUserDatabase';
import { hashAdminUserPassword } from '@/lib/admin/adminUserPassword';
import { ADMIN_USER_PUBLIC_COLUMNS, ADMIN_USER_TABLE_NAME, adminUserCreateSchema } from '@/lib/admin/adminUserSchemas';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest } from 'next/server';

// This un-delegated API is superadmin-only through the shared guard, even for users with every section enabled.
export async function GET(request: NextRequest) {
    const refused = await getUnauthorizedResponseOrNull(request);
    if (refused) return refused;
    try {
        return adminUserResponse({ users: await loadAdminUsers() });
    } catch (error) { return adminUserErrorResponse(error); }
}

export async function POST(request: NextRequest) {
    const refused = await getUnauthorizedResponseOrNull(request);
    if (refused) return refused;
    const parsed = adminUserCreateSchema.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return adminUserResponse({ error: parsed.error.issues[0]?.message ?? 'Neplatný účet.' }, 400);
    try {
        const { username, password, permissions, isEnabled } = parsed.data;
        const { data, error } = await getAdminUserDatabase().from(ADMIN_USER_TABLE_NAME).insert({
            username, password_hash: await hashAdminUserPassword(password), permissions, is_enabled: isEnabled,
        }).select(ADMIN_USER_PUBLIC_COLUMNS).single();
        throwAdminUserDatabaseError(error);
        if (!data) throw new Error('Missing created account');
        return adminUserResponse({ user: mapAdminUser(data) }, 201);
    } catch (error) { return adminUserErrorResponse(error); }
}
