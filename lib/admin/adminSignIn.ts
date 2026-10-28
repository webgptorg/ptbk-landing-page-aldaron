import { isAdminSignInAllowed, getConfiguredAdminTokenOrNull } from './adminCredentials';
import { ADMIN_USERNAME } from './adminConstants';
import { createAdminSessionValueOrNull, createAdminUserSessionValueOrNull } from './adminSession';
import { SUPER_ADMIN_IDENTITY } from './adminIdentity';
import type { AdminIdentity } from './adminPermissions';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { ADMIN_USER_TABLE_NAME, ADMIN_USER_MAXIMUM_PASSWORD_LENGTH } from './adminUserSchemas';
import { throwAdminUserDatabaseError, type AdminUserRow } from './adminUserDatabase';
import { verifyAdminUserPassword } from './adminUserPassword';

type AdminSignIn = { readonly sessionValue: string; readonly identity: AdminIdentity };

export async function signInAdmin(username: string | null, password: string | null): Promise<AdminSignIn | null> {
    if (!username || !password || username.length > 64 || getConfiguredAdminTokenOrNull() === null) return null;
    if (isAdminSignInAllowed(username, password)) {
        const sessionValue = createAdminSessionValueOrNull();
        return sessionValue ? { sessionValue, identity: SUPER_ADMIN_IDENTITY } : null;
    }
    if (password.length > ADMIN_USER_MAXIMUM_PASSWORD_LENGTH) return null;
    const normalizedUsername = username.trim().toLowerCase();
    // No database row can replace, shadow or elevate to the environment-backed account.
    if (normalizedUsername === ADMIN_USERNAME) return null;
    const database = createSupabaseServiceRoleClient();
    if (!database) return null;
    const { data, error } = await database.from(ADMIN_USER_TABLE_NAME)
        .select('id,username,permissions,is_enabled,session_version,password_hash')
        .eq('username', normalizedUsername).maybeSingle();
    throwAdminUserDatabaseError(error);
    const user = data as (AdminUserRow & { readonly password_hash: string }) | null;
    const isPasswordValid = await verifyAdminUserPassword(password, user?.password_hash ?? null);
    if (!user || !isPasswordValid || !user.is_enabled) return null;
    const sessionValue = createAdminUserSessionValueOrNull({ userId: user.id, sessionVersion: user.session_version });
    return sessionValue ? { sessionValue, identity: {
        id: user.id, username: user.username, permissions: user.permissions, isSuperAdmin: false,
    } } : null;
}
